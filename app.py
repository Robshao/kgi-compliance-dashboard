from flask import Flask, jsonify, request, render_template, abort
import sqlite3
import json
from datetime import datetime
from database import get_db, init_db, evaluate_session

app = Flask(__name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def row_to_dict(row):
    return dict(row) if row else None


def rows_to_list(rows):
    return [dict(r) for r in rows]


# ── Pages ─────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


# ── Stats ─────────────────────────────────────────────────────────────────────

@app.route("/api/stats")
def stats():
    conn = get_db()
    c = conn.cursor()

    total   = c.execute("SELECT COUNT(*) FROM FlaggedSessions").fetchone()[0]
    pending = c.execute("SELECT COUNT(*) FROM FlaggedSessions WHERE resolution_status='pending'").fetchone()[0]

    by_severity = rows_to_list(c.execute("""
        SELECT cr.severity_level, COUNT(*) as count
        FROM FlaggedSessions fs
        JOIN ComplianceRules cr ON fs.rule_violated_id = cr.rule_id
        WHERE fs.resolution_status = 'pending'
        GROUP BY cr.severity_level
    """).fetchall())

    top_agents = rows_to_list(c.execute("""
        SELECT a.agent_name, a.branch, COUNT(*) as flag_count
        FROM FlaggedSessions fs
        JOIN Agents a ON fs.agent_id = a.agent_id
        WHERE fs.resolution_status = 'pending'
        GROUP BY fs.agent_id
        ORDER BY flag_count DESC
        LIMIT 5
    """).fetchall())

    conn.close()
    return jsonify({
        "total_flags": total,
        "pending_flags": pending,
        "by_severity": by_severity,
        "top_agents": top_agents,
    })


# ── Flagged Sessions ──────────────────────────────────────────────────────────

@app.route("/api/flagged-sessions")
def flagged_sessions():
    severity = request.args.get("severity")
    status   = request.args.get("status", "pending")
    search   = request.args.get("search", "").strip()

    conn = get_db()
    c = conn.cursor()

    query = """
        SELECT
            fs.flag_id,
            fs.session_id,
            fs.flag_timestamp,
            fs.resolution_status,
            a.agent_id,
            a.agent_name,
            a.branch,
            a.streak_shield_locked,
            lm.module_name,
            cr.rule_name,
            cr.severity_level,
            cr.rule_type,
            s.completion_time_seconds,
            s.quiz_score,
            s.quiz_completion_time_seconds,
            s.tab_switch_count,
            lm.avg_completion_seconds
        FROM FlaggedSessions fs
        JOIN Agents a         ON fs.agent_id         = a.agent_id
        JOIN Sessions s       ON fs.session_id       = s.session_id
        JOIN LearningModules lm ON s.module_id       = lm.module_id
        JOIN ComplianceRules cr ON fs.rule_violated_id = cr.rule_id
        WHERE 1=1
    """
    params = []

    if status and status != "all":
        query += " AND fs.resolution_status = ?"
        params.append(status)
    if severity:
        query += " AND cr.severity_level = ?"
        params.append(severity)
    if search:
        query += " AND (a.agent_name LIKE ? OR lm.module_name LIKE ? OR cr.rule_name LIKE ?)"
        params += [f"%{search}%", f"%{search}%", f"%{search}%"]

    query += " ORDER BY CASE cr.severity_level WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, fs.flag_timestamp DESC"

    rows = rows_to_list(c.execute(query, params).fetchall())
    conn.close()
    return jsonify(rows)


@app.route("/api/flagged-sessions/<int:flag_id>")
def flagged_session_detail(flag_id):
    conn = get_db()
    c = conn.cursor()

    flag = row_to_dict(c.execute("""
        SELECT
            fs.*,
            a.agent_name, a.branch, a.email, a.leaderboard_points, a.streak_shield_locked,
            lm.module_name, lm.expected_duration_seconds, lm.avg_completion_seconds,
            cr.rule_name, cr.rule_type, cr.severity_level, cr.parameter_json, cr.description,
            s.start_time, s.end_time, s.completion_time_seconds,
            s.quiz_score, s.quiz_completion_time_seconds, s.tab_switch_count, s.telemetry_json
        FROM FlaggedSessions fs
        JOIN Agents a           ON fs.agent_id           = a.agent_id
        JOIN Sessions s         ON fs.session_id         = s.session_id
        JOIN LearningModules lm ON s.module_id           = lm.module_id
        JOIN ComplianceRules cr ON fs.rule_violated_id   = cr.rule_id
        WHERE fs.flag_id = ?
    """, (flag_id,)).fetchone())

    if not flag:
        abort(404)

    # Parse nested JSON fields
    flag["telemetry_json"] = json.loads(flag["telemetry_json"] or "[]")
    flag["parameter_json"] = json.loads(flag["parameter_json"] or "{}")

    # Attach audit history for this flag
    flag["audit_history"] = rows_to_list(c.execute("""
        SELECT cal.*, m.manager_name, m.role
        FROM ComplianceAuditLog cal
        JOIN Managers m ON cal.manager_id = m.manager_id
        WHERE cal.flag_id = ?
        ORDER BY cal.timestamp ASC
    """, (flag_id,)).fetchall())

    conn.close()
    return jsonify(flag)


@app.route("/api/flagged-sessions/<int:flag_id>/resolve", methods=["POST"])
def resolve_flag(flag_id):
    data = request.get_json()
    action = data.get("action")          # 'approve' | 'void' | 'escalate'
    notes  = data.get("notes", "")
    manager_id = data.get("manager_id", 1)

    valid_actions = {"approve", "void", "escalate"}
    if action not in valid_actions:
        return jsonify({"error": "Invalid action"}), 400

    status_map = {"approve": "approved", "void": "voided", "escalate": "escalated"}
    action_label_map = {
        "approve":  "APPROVE (False Alarm)",
        "void":     "VOID SESSION & REQUIRE RETAKE",
        "escalate": "ESCALATE TO HR",
    }

    conn = get_db()
    c = conn.cursor()

    flag = c.execute(
        "SELECT * FROM FlaggedSessions WHERE flag_id=?", (flag_id,)
    ).fetchone()
    if not flag:
        conn.close()
        abort(404)
    if flag["resolution_status"] != "pending":
        conn.close()
        return jsonify({"error": "Flag is already resolved"}), 409

    new_status = status_map[action]
    c.execute(
        "UPDATE FlaggedSessions SET resolution_status=? WHERE flag_id=?",
        (new_status, flag_id)
    )

    # Write to immutable audit log
    c.execute(
        "INSERT INTO ComplianceAuditLog (flag_id, manager_id, action_taken, manager_justification_notes) "
        "VALUES (?,?,?,?)",
        (flag_id, manager_id, action_label_map[action], notes)
    )

    # If voided → unlock streak shield; if escalated → keep locked
    if action == "void":
        # Revoke points is implicit (already locked). Require retake handled by app logic.
        pass
    elif action == "approve":
        # False alarm → restore streak shield if it was this flag that locked it
        c.execute(
            "UPDATE Agents SET streak_shield_locked=0 WHERE agent_id=? "
            "AND streak_shield_locked=1",
            (flag["agent_id"],)
        )

    conn.commit()
    conn.close()
    return jsonify({"success": True, "new_status": new_status})


# ── Rules ─────────────────────────────────────────────────────────────────────

@app.route("/api/rules")
def list_rules():
    conn = get_db()
    rows = rows_to_list(conn.execute("SELECT * FROM ComplianceRules ORDER BY rule_id").fetchall())
    conn.close()
    for r in rows:
        r["parameter_json"] = json.loads(r["parameter_json"])
    return jsonify(rows)


@app.route("/api/rules/<int:rule_id>", methods=["PUT"])
def update_rule(rule_id):
    data = request.get_json()
    conn = get_db()
    c = conn.cursor()

    rule = c.execute("SELECT * FROM ComplianceRules WHERE rule_id=?", (rule_id,)).fetchone()
    if not rule:
        conn.close()
        abort(404)

    rule_name      = data.get("rule_name", rule["rule_name"])
    parameter_json = json.dumps(data["parameter_json"]) if "parameter_json" in data else rule["parameter_json"]
    severity_level = data.get("severity_level", rule["severity_level"])
    is_active      = data.get("is_active", rule["is_active"])
    description    = data.get("description", rule["description"])

    c.execute(
        "UPDATE ComplianceRules SET rule_name=?, parameter_json=?, severity_level=?, is_active=?, description=? "
        "WHERE rule_id=?",
        (rule_name, parameter_json, severity_level, int(is_active), description, rule_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True})


@app.route("/api/rules", methods=["POST"])
def create_rule():
    data = request.get_json()
    required = ["rule_name", "rule_type", "parameter_json", "severity_level"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO ComplianceRules (rule_name, rule_type, parameter_json, severity_level, is_active, description) "
        "VALUES (?,?,?,?,?,?)",
        (
            data["rule_name"],
            data["rule_type"],
            json.dumps(data["parameter_json"]),
            data["severity_level"],
            int(data.get("is_active", 1)),
            data.get("description", ""),
        )
    )
    new_id = c.lastrowid
    conn.commit()
    conn.close()
    return jsonify({"success": True, "rule_id": new_id}), 201


# ── Audit Log ─────────────────────────────────────────────────────────────────

@app.route("/api/audit-log")
def audit_log():
    conn = get_db()
    rows = rows_to_list(conn.execute("""
        SELECT
            cal.audit_id,
            cal.flag_id,
            cal.action_taken,
            cal.manager_justification_notes,
            cal.timestamp,
            m.manager_name,
            m.role,
            a.agent_name,
            lm.module_name,
            cr.rule_name,
            cr.severity_level
        FROM ComplianceAuditLog cal
        JOIN Managers m         ON cal.manager_id        = m.manager_id
        JOIN FlaggedSessions fs ON cal.flag_id           = fs.flag_id
        JOIN Agents a           ON fs.agent_id           = a.agent_id
        JOIN Sessions s         ON fs.session_id         = s.session_id
        JOIN LearningModules lm ON s.module_id           = lm.module_id
        JOIN ComplianceRules cr ON fs.rule_violated_id   = cr.rule_id
        ORDER BY cal.timestamp DESC
    """).fetchall())
    conn.close()
    return jsonify(rows)


# ── Agents ────────────────────────────────────────────────────────────────────

@app.route("/api/agents")
def list_agents():
    conn = get_db()
    rows = rows_to_list(conn.execute("SELECT * FROM Agents ORDER BY agent_id").fetchall())
    conn.close()
    return jsonify(rows)


# ── Managers ──────────────────────────────────────────────────────────────────

@app.route("/api/managers")
def list_managers():
    conn = get_db()
    rows = rows_to_list(conn.execute("SELECT * FROM Managers ORDER BY manager_id").fetchall())
    conn.close()
    return jsonify(rows)


# ── Demo: simulate a new session ─────────────────────────────────────────────

@app.route("/api/sessions/simulate", methods=["POST"])
def simulate_session():
    data = request.get_json()
    agent_id   = data.get("agent_id", 1)
    module_id  = data.get("module_id", 1)
    comp_secs  = int(data.get("completion_time_seconds", 400))
    quiz_score = int(data.get("quiz_score", 80))
    quiz_secs  = int(data.get("quiz_completion_time_seconds", 45))
    tab_sw     = int(data.get("tab_switch_count", 0))

    # Build telemetry
    events = [{"time": 0, "event": "session_start", "detail": "Module opened"}]
    t = 5
    for i in range(tab_sw):
        events.append({"time": t, "event": "tab_switch_away",
                       "detail": f"Switched to external app (event {i+1})"})
        events.append({"time": t + 8, "event": "tab_switch_return",
                       "detail": "Returned to module"})
        t += 20
    events.append({"time": comp_secs - quiz_secs - 5, "event": "reading_complete",
                   "detail": "All flashcards swiped"})
    events.append({"time": comp_secs - quiz_secs, "event": "quiz_start",
                   "detail": "Quiz started"})
    events.append({"time": comp_secs, "event": "quiz_submit",
                   "detail": f"Quiz submitted – score {quiz_score}%"})
    events.sort(key=lambda e: e["time"])

    now = datetime.now()
    start = now
    end   = now

    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO Sessions "
        "(agent_id, module_id, start_time, end_time, completion_time_seconds, "
        "quiz_score, quiz_completion_time_seconds, tab_switch_count, telemetry_json) "
        "VALUES (?,?,?,?,?,?,?,?,?)",
        (agent_id, module_id, start.isoformat(), end.isoformat(),
         comp_secs, quiz_score, quiz_secs, tab_sw, json.dumps(events))
    )
    session_id = c.lastrowid
    conn.commit()
    conn.close()

    evaluate_session(session_id)

    conn2 = get_db()
    flags = rows_to_list(conn2.execute(
        "SELECT fs.flag_id, cr.rule_name, cr.severity_level "
        "FROM FlaggedSessions fs JOIN ComplianceRules cr ON fs.rule_violated_id=cr.rule_id "
        "WHERE fs.session_id=?", (session_id,)
    ).fetchall())
    conn2.close()

    return jsonify({"session_id": session_id, "flags_raised": flags})


# ── Bootstrap ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import os
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)
