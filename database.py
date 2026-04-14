import sqlite3
import json
import os
from datetime import datetime, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(__file__), "compliance.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    c.executescript("""
        CREATE TABLE IF NOT EXISTS Agents (
            agent_id    INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_name  TEXT NOT NULL,
            branch      TEXT NOT NULL,
            email       TEXT,
            leaderboard_points   INTEGER DEFAULT 0,
            streak_shield_locked INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS Managers (
            manager_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            manager_name TEXT NOT NULL,
            role         TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS LearningModules (
            module_id                INTEGER PRIMARY KEY AUTOINCREMENT,
            module_name              TEXT NOT NULL,
            expected_duration_seconds INTEGER NOT NULL,
            avg_completion_seconds   INTEGER
        );

        CREATE TABLE IF NOT EXISTS ComplianceRules (
            rule_id         INTEGER PRIMARY KEY AUTOINCREMENT,
            rule_name       TEXT NOT NULL,
            rule_type       TEXT NOT NULL,
            parameter_json  TEXT NOT NULL,
            severity_level  TEXT NOT NULL CHECK(severity_level IN ('Low','Medium','High')),
            is_active       INTEGER NOT NULL DEFAULT 1,
            description     TEXT,
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Sessions (
            session_id                   INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id                     INTEGER NOT NULL,
            module_id                    INTEGER NOT NULL,
            start_time                   TIMESTAMP NOT NULL,
            end_time                     TIMESTAMP,
            completion_time_seconds      INTEGER,
            quiz_score                   INTEGER,
            quiz_completion_time_seconds INTEGER,
            tab_switch_count             INTEGER DEFAULT 0,
            telemetry_json               TEXT,
            session_status               TEXT DEFAULT 'completed',
            FOREIGN KEY (agent_id)  REFERENCES Agents(agent_id),
            FOREIGN KEY (module_id) REFERENCES LearningModules(module_id)
        );

        CREATE TABLE IF NOT EXISTS FlaggedSessions (
            flag_id           INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id        INTEGER NOT NULL,
            agent_id          INTEGER NOT NULL,
            rule_violated_id  INTEGER NOT NULL,
            flag_timestamp    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolution_status TEXT DEFAULT 'pending'
                CHECK(resolution_status IN ('pending','approved','voided','escalated')),
            FOREIGN KEY (session_id)       REFERENCES Sessions(session_id),
            FOREIGN KEY (agent_id)         REFERENCES Agents(agent_id),
            FOREIGN KEY (rule_violated_id) REFERENCES ComplianceRules(rule_id)
        );

        CREATE TABLE IF NOT EXISTS ComplianceAuditLog (
            audit_id                    INTEGER PRIMARY KEY AUTOINCREMENT,
            flag_id                     INTEGER NOT NULL,
            manager_id                  INTEGER NOT NULL,
            action_taken                TEXT NOT NULL,
            manager_justification_notes TEXT,
            timestamp                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (flag_id)    REFERENCES FlaggedSessions(flag_id),
            FOREIGN KEY (manager_id) REFERENCES Managers(manager_id)
        );
    """)
    conn.commit()

    # Check if already seeded
    row = c.execute("SELECT COUNT(*) as cnt FROM Agents").fetchone()
    if row["cnt"] > 0:
        conn.close()
        return

    _seed(c)
    conn.commit()
    conn.close()


def _seed(c):
    # ── Managers ─────────────────────────────────────────────────────────────
    managers = [
        ("Alice Chen",   "Branch Manager"),
        ("Bob Wang",     "Compliance Officer"),
        ("Carol Liu",    "HR Manager"),
    ]
    c.executemany("INSERT INTO Managers (manager_name, role) VALUES (?,?)", managers)

    # ── Agents ───────────────────────────────────────────────────────────────
    agents = [
        ("David Lin",   "Taipei Branch A", "david.lin@kgi.com",   420, 0),
        ("Emma Huang",  "Taipei Branch B", "emma.huang@kgi.com",  310, 0),
        ("Frank Wu",    "Taichung Branch", "frank.wu@kgi.com",    580, 0),
        ("Grace Chen",  "Kaohsiung Branch","grace.chen@kgi.com",  210, 0),
        ("Henry Tsai",  "Taipei Branch A", "henry.tsai@kgi.com",  150, 1),
        ("Iris Chang",  "Taipei Branch B", "iris.chang@kgi.com",  390, 0),
        ("Jason Ho",    "Taichung Branch", "jason.ho@kgi.com",    500, 1),
        ("Karen Liao",  "Kaohsiung Branch","karen.liao@kgi.com",  270, 0),
    ]
    c.executemany(
        "INSERT INTO Agents (agent_name, branch, email, leaderboard_points, streak_shield_locked) "
        "VALUES (?,?,?,?,?)", agents
    )

    # ── Learning Modules ─────────────────────────────────────────────────────
    modules = [
        ("AML Compliance Fundamentals",         420, 380),
        ("Investment-Linked Products Regulation",540, 490),
        ("FSC Anti-Money Laundering",            480, 430),
        ("Cross-Selling Framework Basics",       360, 330),
        ("Data Privacy & GDPR",                  300, 280),
        ("KYC (Know Your Customer) Procedures",  400, 365),
    ]
    c.executemany(
        "INSERT INTO LearningModules (module_name, expected_duration_seconds, avg_completion_seconds) "
        "VALUES (?,?,?)", modules
    )

    # ── Compliance Rules ──────────────────────────────────────────────────────
    rules = [
        (
            "Impossible Speed Verification",
            "SPEEDING",
            json.dumps({"threshold_pct": 20}),
            "High",
            1,
            "Completion time is less than 20% of the company average for that module. "
            "Indicates the agent clicked through without reading."
        ),
        (
            "Blind Guessing Detection",
            "PATTERN_GUESSING",
            json.dumps({"max_quiz_seconds": 5, "max_score_pct": 0}),
            "High",
            1,
            "Agent finishes the quiz in under 5 seconds with a 0% score — "
            "blindly guessing to skip the material."
        ),
        (
            "Excessive Tab Switching",
            "DISTRACTION",
            json.dumps({"max_tab_switches": 5}),
            "Medium",
            1,
            "Agent switches browser tabs more than 5 times during a 7-minute sprint, "
            "indicating significant distraction."
        ),
        (
            "Suspicious Perfect Score After Speed",
            "SPEED_WITH_PERFECT",
            json.dumps({"threshold_pct": 25, "min_score_pct": 100}),
            "Medium",
            1,
            "Agent completes reading unusually fast yet scores 100% — "
            "may indicate answer memorisation or external assistance."
        ),
        (
            "Repeat Failure Pattern",
            "REPEAT_FAILURE",
            json.dumps({"max_score_pct": 40, "min_attempts": 2}),
            "Low",
            1,
            "Agent scores below 40% on the same module twice — "
            "may indicate disengagement rather than gaming."
        ),
    ]
    c.executemany(
        "INSERT INTO ComplianceRules "
        "(rule_name, rule_type, parameter_json, severity_level, is_active, description) "
        "VALUES (?,?,?,?,?,?)",
        rules
    )

    # ── Sessions + Flags (sample telemetry) ──────────────────────────────────
    base = datetime.now() - timedelta(days=7)

    sample_sessions = [
        # (agent_id, module_id, completion_secs, quiz_score, quiz_secs, tab_switches, delta_hours)
        (5, 1,  45, 90, 30,  2, 0),   # Henry – moderate speed OK
        (5, 3,  38, 75,  4,  1, 2),   # Henry – quiz in 4 s → BLIND GUESS
        (7, 2,  22, 100, 45, 3, 5),   # Jason – 22 s on 490 s avg → SPEED + PERFECT
        (1, 4, 390, 80,  60, 8, 10),  # David – 8 tab switches → DISTRACTION
        (4, 1,  55, 0,   3,  1, 12),  # Grace – quiz 3 s, 0 % → BLIND GUESS
        (2, 3, 350, 70,  50, 2, 15),  # Emma  – normal session
        (3, 5, 290, 60,  40, 3, 18),  # Frank – normal session
        (6, 6, 365, 85,  55, 1, 20),  # Iris  – normal session
        (8, 2,  18, 100, 25, 2, 22),  # Karen – 18 s on 490 s avg → SPEED + PERFECT
        (1, 1,  70, 90,  40, 7, 24),  # David – 7 tab switches → DISTRACTION
        (5, 2,  12, 0,   2,  1, 26),  # Henry – 12 s on 490 s avg → HIGH SPEED + BLIND GUESS
        (7, 4,  28, 95,  20, 2, 30),  # Jason – 28 s on 330 s avg → SPEED + PERFECT
        (4, 6, 200, 35,  45, 3, 33),  # Grace – low score
        (2, 5, 280, 30,  50, 2, 36),  # Emma  – low score (repeat)
        (3, 1, 310, 85,  60, 6, 40),  # Frank – 6 tab switches → DISTRACTION
    ]

    for agent_id, module_id, comp_secs, quiz_score, quiz_secs, tab_sw, delta_h in sample_sessions:
        start = base + timedelta(hours=delta_h, minutes=random.randint(0, 30))
        end   = start + timedelta(seconds=comp_secs)

        # Build a simple forensic telemetry JSON
        events = [{"time": 0, "event": "session_start", "detail": "Module opened"}]
        t = 5
        for i in range(tab_sw):
            events.append({"time": t, "event": "tab_switch_away",
                           "detail": f"Switched to external app (event {i+1})"})
            events.append({"time": t + random.randint(3, 15), "event": "tab_switch_return",
                           "detail": "Returned to module"})
            t += random.randint(10, 40)
        events.append({"time": comp_secs - quiz_secs - 5, "event": "reading_complete",
                       "detail": "All flashcards swiped"})
        events.append({"time": comp_secs - quiz_secs, "event": "quiz_start",
                       "detail": "Quiz started"})
        events.append({"time": comp_secs, "event": "quiz_submit",
                       "detail": f"Quiz submitted – score {quiz_score}%"})
        events.sort(key=lambda e: e["time"])

        c.execute(
            "INSERT INTO Sessions "
            "(agent_id, module_id, start_time, end_time, completion_time_seconds, "
            "quiz_score, quiz_completion_time_seconds, tab_switch_count, telemetry_json) "
            "VALUES (?,?,?,?,?,?,?,?,?)",
            (agent_id, module_id, start.isoformat(), end.isoformat(),
             comp_secs, quiz_score, quiz_secs, tab_sw, json.dumps(events))
        )
        session_id = c.lastrowid

        # Evaluate rules against this session
        _evaluate_and_flag(c, session_id, agent_id, module_id,
                           comp_secs, quiz_score, quiz_secs, tab_sw, start)


def _evaluate_and_flag(c, session_id, agent_id, module_id,
                       comp_secs, quiz_score, quiz_secs, tab_sw, flag_time):
    rules = c.execute(
        "SELECT * FROM ComplianceRules WHERE is_active = 1"
    ).fetchall()
    module = c.execute(
        "SELECT avg_completion_seconds FROM LearningModules WHERE module_id=?",
        (module_id,)
    ).fetchone()
    avg_secs = module["avg_completion_seconds"] if module else 300

    for rule in rules:
        params = json.loads(rule["parameter_json"])
        triggered = False

        if rule["rule_type"] == "SPEEDING":
            threshold = avg_secs * params["threshold_pct"] / 100
            triggered = comp_secs < threshold

        elif rule["rule_type"] == "PATTERN_GUESSING":
            triggered = (quiz_secs <= params["max_quiz_seconds"] and
                         quiz_score <= params["max_score_pct"])

        elif rule["rule_type"] == "DISTRACTION":
            triggered = tab_sw > params["max_tab_switches"]

        elif rule["rule_type"] == "SPEED_WITH_PERFECT":
            threshold = avg_secs * params["threshold_pct"] / 100
            triggered = (comp_secs < threshold and
                         quiz_score >= params["min_score_pct"])

        elif rule["rule_type"] == "REPEAT_FAILURE":
            # Check if this agent already has a low score on same module
            prev = c.execute(
                "SELECT COUNT(*) as cnt FROM Sessions "
                "WHERE agent_id=? AND module_id=? AND quiz_score<=? AND session_id!=?",
                (agent_id, module_id, params["max_score_pct"], session_id)
            ).fetchone()
            triggered = (quiz_score <= params["max_score_pct"] and
                         prev["cnt"] >= params["min_attempts"] - 1)

        if triggered:
            # Avoid duplicate flags for exact same session+rule
            exists = c.execute(
                "SELECT flag_id FROM FlaggedSessions "
                "WHERE session_id=? AND rule_violated_id=?",
                (session_id, rule["rule_id"])
            ).fetchone()
            if not exists:
                c.execute(
                    "INSERT INTO FlaggedSessions "
                    "(session_id, agent_id, rule_violated_id, flag_timestamp) "
                    "VALUES (?,?,?,?)",
                    (session_id, agent_id, rule["rule_id"], flag_time.isoformat())
                )
                # Apply automated penalty for High risk
                if rule["severity_level"] == "High":
                    c.execute(
                        "UPDATE Agents SET streak_shield_locked=1 WHERE agent_id=?",
                        (agent_id,)
                    )


def evaluate_session(session_id: int):
    """Re-evaluate rules for a given session and insert new flags."""
    conn = get_db()
    c = conn.cursor()
    session = c.execute("SELECT * FROM Sessions WHERE session_id=?", (session_id,)).fetchone()
    if session:
        _evaluate_and_flag(
            c,
            session["session_id"],
            session["agent_id"],
            session["module_id"],
            session["completion_time_seconds"],
            session["quiz_score"],
            session["quiz_completion_time_seconds"],
            session["tab_switch_count"],
            datetime.now(),
        )
    conn.commit()
    conn.close()
