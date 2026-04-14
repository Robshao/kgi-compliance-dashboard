/* ── KGI Anti-Gaming Compliance Auditor ─────────────────────────────────── */
const App = (() => {

  // ── State ──────────────────────────────────────────────────────────────────
  let currentFlagId   = null;
  let currentSeverity = "";
  let managers        = [];
  let agents          = [];
  let modules         = [];

  // ── Init ───────────────────────────────────────────────────────────────────
  async function init() {
    setupNav();
    await Promise.all([loadManagers(), loadAgents(), loadModules()]);
    loadDashboard();
  }

  function setupNav() {
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const view = link.dataset.view;
        switchView(view);
      });
    });

    document.getElementById("search-input").addEventListener("input",
      debounce(() => loadFlags(), 300));
    document.getElementById("status-filter").addEventListener("change", loadFlags);

    document.querySelectorAll(".pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        currentSeverity = pill.dataset.severity;
        loadFlags();
      });
    });
  }

  function switchView(name) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    document.getElementById(`view-${name}`).classList.add("active");
    document.querySelector(`[data-view="${name}"]`).classList.add("active");
    if (name === "dashboard") loadDashboard();
    if (name === "rules")     loadRules();
    if (name === "audit")     loadAuditLog();
    if (name === "simulate")  populateSimForm();
  }

  // ── Reference Data ─────────────────────────────────────────────────────────
  async function loadManagers() {
    managers = await fetchJSON("/api/managers");
    const sel = document.getElementById("resolve-manager");
    sel.innerHTML = managers.map(m =>
      `<option value="${m.manager_id}">${m.manager_name} (${m.role})</option>`
    ).join("");
  }

  async function loadAgents() {
    agents = await fetchJSON("/api/agents");
  }

  async function loadModules() {
    const resp = await fetch("/api/flagged-sessions?status=all&severity=");
    // We don't have a /api/modules endpoint – grab from simulate later
    modules = await fetchJSON("/api/rules").then(() =>
      fetch("/api/flagged-sessions?status=all").then(r => r.json()).then(() => [])
    ).catch(() => []);
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  async function loadDashboard() {
    await Promise.all([loadStats(), loadFlags()]);
  }

  async function loadStats() {
    const stats = await fetchJSON("/api/stats");
    const bySev = {};
    (stats.by_severity || []).forEach(s => { bySev[s.severity_level] = s.count; });
    document.getElementById("stat-high").textContent   = bySev["High"]   || 0;
    document.getElementById("stat-medium").textContent = bySev["Medium"] || 0;
    document.getElementById("stat-low").textContent    = bySev["Low"]    || 0;
    document.getElementById("stat-total").textContent  = stats.pending_flags || 0;
  }

  async function loadFlags() {
    const search   = document.getElementById("search-input").value;
    const status   = document.getElementById("status-filter").value;
    const params   = new URLSearchParams({ status });
    if (currentSeverity) params.set("severity", currentSeverity);
    if (search) params.set("search", search);

    const flags = await fetchJSON(`/api/flagged-sessions?${params}`);
    renderFlagsTable(flags);
  }

  function renderFlagsTable(flags) {
    const tbody = document.getElementById("flags-tbody");
    if (!flags.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="loading-cell" style="cursor:default">No flags found</td></tr>`;
      return;
    }
    tbody.innerHTML = flags.map(f => {
      const avg   = f.avg_completion_seconds || 1;
      const pct   = Math.round((f.completion_time_seconds / avg) * 100);
      const shield = f.streak_shield_locked
        ? `<span class="shield-badge">🔒 Shield</span>` : "";
      return `
        <tr onclick="App.openFlagDetail(${f.flag_id})">
          <td><span class="severity-badge sev-${f.severity_level}">${sevIcon(f.severity_level)} ${f.severity_level}</span></td>
          <td><strong>${esc(f.agent_name)}</strong>${shield}</td>
          <td>${esc(f.branch)}</td>
          <td>${esc(f.module_name)}</td>
          <td>${esc(f.rule_name)}</td>
          <td>${formatTime(f.flag_timestamp)}</td>
          <td><span class="status-badge status-${f.resolution_status}">${f.resolution_status}</span></td>
          <td><button class="btn btn-sm btn-outline" onclick="event.stopPropagation();App.openFlagDetail(${f.flag_id})">Review →</button></td>
        </tr>`;
    }).join("");
  }

  function refreshDashboard() { loadDashboard(); }

  // ── Flag Detail Modal ──────────────────────────────────────────────────────
  async function openFlagDetail(flagId) {
    currentFlagId = flagId;
    const f = await fetchJSON(`/api/flagged-sessions/${flagId}`);

    // Header
    document.getElementById("modal-title").textContent = `Flag #${f.flag_id} — ${f.agent_name}`;
    document.getElementById("modal-meta").textContent  =
      `${f.module_name} · ${f.branch} · Flagged ${formatTime(f.flag_timestamp)}`;

    const badge = document.getElementById("modal-severity-badge");
    badge.className = `severity-badge sev-${f.severity_level}`;
    badge.textContent = `${sevIcon(f.severity_level)} ${f.severity_level} Risk`;

    // Overview grid
    const avg   = f.avg_completion_seconds || 1;
    const pct   = Math.round((f.completion_time_seconds / avg) * 100);
    const compClass = pct < 30 ? "val-danger" : pct < 60 ? "val-warning" : "val-ok";

    document.getElementById("modal-overview").innerHTML = `
      ${detailItem("Completion Time",   `${f.completion_time_seconds}s`, compClass)}
      ${detailItem("Module Average",    `${avg}s`, "")}
      ${detailItem("Speed vs Average",  `${pct}%`, compClass)}
      ${detailItem("Quiz Score",        `${f.quiz_score}%`,
          f.quiz_score === 0 ? "val-danger" : f.quiz_score < 50 ? "val-warning" : "val-ok")}
      ${detailItem("Quiz Time",         `${f.quiz_completion_time_seconds}s`,
          f.quiz_completion_time_seconds <= 5 ? "val-danger" : "")}
      ${detailItem("Tab Switches",      `${f.tab_switch_count}`,
          f.tab_switch_count > 5 ? "val-danger" : f.tab_switch_count > 2 ? "val-warning" : "val-ok")}
    `;

    // Rule info
    const params = f.parameter_json || {};
    const paramChips = Object.entries(params)
      .map(([k, v]) => `<span class="rule-param-tag">${k}: ${v}</span>`)
      .join("");
    document.getElementById("modal-rule-info").innerHTML = `
      <strong>${esc(f.rule_name)}</strong> <span class="severity-badge sev-${f.severity_level}" style="margin-left:8px">${f.severity_level}</span>
      <p style="margin-top:8px;color:var(--text-muted)">${esc(f.description || "")}</p>
      <div class="rule-params">${paramChips}</div>
    `;

    // Forensic timeline
    const timeline = document.getElementById("modal-timeline");
    const events   = f.telemetry_json || [];
    if (events.length) {
      timeline.innerHTML = events.map(ev => {
        const cls = eventClass(ev.event);
        return `
          <div class="tl-event ${cls}">
            <div class="tl-time">T+${ev.time}s</div>
            <div class="tl-label">${formatEventLabel(ev.event)}</div>
            <div class="tl-detail">${esc(ev.detail)}</div>
          </div>`;
      }).join("");
    } else {
      timeline.innerHTML = `<p style="color:var(--text-muted);font-size:13px">No telemetry data available.</p>`;
    }

    // Audit history
    const histBlock = document.getElementById("audit-history-block");
    const histDiv   = document.getElementById("modal-audit-history");
    if (f.audit_history && f.audit_history.length) {
      histBlock.style.display = "block";
      histDiv.innerHTML = f.audit_history.map(a => `
        <div class="audit-entry">
          <div class="audit-entry-header">
            <span class="audit-entry-action">${esc(a.action_taken)}</span>
            <span class="audit-entry-time">${formatTime(a.timestamp)}</span>
          </div>
          <div class="audit-entry-by">By: ${esc(a.manager_name)} · ${esc(a.role)}</div>
          ${a.manager_justification_notes
            ? `<div class="audit-entry-notes">"${esc(a.manager_justification_notes)}"</div>`
            : ""}
        </div>`).join("");
    } else {
      histBlock.style.display = "none";
    }

    // Resolution bar
    const resBar    = document.getElementById("resolution-bar");
    const resNotice = document.getElementById("resolved-notice");
    if (f.resolution_status === "pending") {
      resBar.style.display = "flex";
      resNotice.className  = "resolved-notice hidden";
    } else {
      resBar.style.display = "none";
      resNotice.className  = `resolved-notice resolved-${f.resolution_status}`;
      resNotice.textContent = statusMessage(f.resolution_status);
    }

    document.getElementById("resolve-notes").value = "";
    document.getElementById("modal-overlay").classList.remove("hidden");
  }

  function closeModal(event) {
    if (event && event.target !== document.getElementById("modal-overlay")) return;
    document.getElementById("modal-overlay").classList.add("hidden");
    currentFlagId = null;
  }

  // ── Resolve Flag ───────────────────────────────────────────────────────────
  async function resolveFlag(action) {
    if (!currentFlagId) return;
    const managerId = document.getElementById("resolve-manager").value;
    const notes     = document.getElementById("resolve-notes").value.trim();

    if (!notes) {
      alert("Please enter justification notes for the FSC audit trail.");
      return;
    }

    const resp = await fetch(`/api/flagged-sessions/${currentFlagId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes, manager_id: parseInt(managerId) }),
    });

    if (resp.ok) {
      const resBar    = document.getElementById("resolution-bar");
      const resNotice = document.getElementById("resolved-notice");
      const statusMap = { approve: "approved", void: "voided", escalate: "escalated" };
      const status    = statusMap[action];
      resBar.style.display = "none";
      resNotice.className  = `resolved-notice resolved-${status}`;
      resNotice.textContent = statusMessage(status);
      loadStats();
      loadFlags();
    } else {
      const err = await resp.json();
      alert(err.error || "Error resolving flag.");
    }
  }

  // ── Rules View ─────────────────────────────────────────────────────────────
  async function loadRules() {
    const rules = await fetchJSON("/api/rules");
    const tbody = document.getElementById("rules-tbody");
    tbody.innerHTML = rules.map(r => {
      const chips = Object.entries(r.parameter_json)
        .map(([k, v]) => `<span class="param-chip">${k}: ${v}</span>`)
        .join("");
      return `
        <tr>
          <td><strong>${esc(r.rule_name)}</strong><br>
              <span style="color:var(--text-muted);font-size:12px">${esc(r.description || "")}</span></td>
          <td><code style="font-size:12px;color:var(--accent)">${esc(r.rule_type)}</code></td>
          <td><div class="param-chips">${chips}</div></td>
          <td><span class="severity-badge sev-${r.severity_level}">${sevIcon(r.severity_level)} ${r.severity_level}</span></td>
          <td>
            <label class="toggle">
              <input type="checkbox" ${r.is_active ? "checked" : ""}
                onchange="App.toggleRule(${r.rule_id}, this.checked)" />
              <span class="toggle-slider"></span>
            </label>
          </td>
          <td><button class="btn btn-sm btn-outline" onclick="App.openEditRule(${r.rule_id})">Edit</button></td>
        </tr>`;
    }).join("");
  }

  async function toggleRule(ruleId, active) {
    await fetch(`/api/rules/${ruleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: active ? 1 : 0 }),
    });
  }

  function openNewRuleModal() {
    document.getElementById("rule-modal-title").textContent = "New Rule";
    document.getElementById("edit-rule-id").value     = "";
    document.getElementById("edit-rule-name").value   = "";
    document.getElementById("edit-rule-severity").value = "Medium";
    document.getElementById("edit-rule-params").value = "{}";
    document.getElementById("edit-rule-desc").value   = "";
    document.getElementById("edit-rule-active").value = "1";
    document.getElementById("rule-modal-overlay").classList.remove("hidden");
  }

  async function openEditRule(ruleId) {
    const rules = await fetchJSON("/api/rules");
    const rule  = rules.find(r => r.rule_id === ruleId);
    if (!rule) return;
    document.getElementById("rule-modal-title").textContent = "Edit Rule";
    document.getElementById("edit-rule-id").value       = rule.rule_id;
    document.getElementById("edit-rule-name").value     = rule.rule_name;
    document.getElementById("edit-rule-severity").value = rule.severity_level;
    document.getElementById("edit-rule-params").value   = JSON.stringify(rule.parameter_json, null, 2);
    document.getElementById("edit-rule-desc").value     = rule.description || "";
    document.getElementById("edit-rule-active").value   = rule.is_active ? "1" : "0";
    document.getElementById("rule-modal-overlay").classList.remove("hidden");
  }

  async function saveRule() {
    const ruleId   = document.getElementById("edit-rule-id").value;
    const name     = document.getElementById("edit-rule-name").value.trim();
    const severity = document.getElementById("edit-rule-severity").value;
    const active   = document.getElementById("edit-rule-active").value;
    const desc     = document.getElementById("edit-rule-desc").value.trim();
    let params;
    try {
      params = JSON.parse(document.getElementById("edit-rule-params").value);
    } catch {
      alert("Invalid JSON in Parameters field.");
      return;
    }

    const payload = { rule_name: name, severity_level: severity,
                      parameter_json: params, is_active: parseInt(active), description: desc };

    if (ruleId) {
      await fetch(`/api/rules/${ruleId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      payload.rule_type = name.toUpperCase().replace(/\s+/g, "_");
      await fetch("/api/rules", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    closeRuleModal();
    loadRules();
  }

  function closeRuleModal(event) {
    if (event && event.target !== document.getElementById("rule-modal-overlay")) return;
    document.getElementById("rule-modal-overlay").classList.add("hidden");
  }

  // ── Audit Log ──────────────────────────────────────────────────────────────
  async function loadAuditLog() {
    const logs = await fetchJSON("/api/audit-log");
    const tbody = document.getElementById("audit-tbody");
    if (!logs.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="loading-cell">No audit entries yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = logs.map(l => `
      <tr>
        <td>#${l.audit_id}</td>
        <td>#${l.flag_id}</td>
        <td>${esc(l.agent_name)}</td>
        <td>${esc(l.module_name)}</td>
        <td><span class="severity-badge sev-${l.severity_level}">${sevIcon(l.severity_level)} ${l.severity_level}</span></td>
        <td><strong>${esc(l.action_taken)}</strong></td>
        <td>${esc(l.manager_name)}<br><span style="color:var(--text-muted);font-size:11px">${esc(l.role)}</span></td>
        <td><span style="color:var(--text-muted);font-style:italic">${esc(l.manager_justification_notes || "—")}</span></td>
        <td style="white-space:nowrap">${formatTime(l.timestamp)}</td>
      </tr>`).join("");
  }

  // ── Simulate ───────────────────────────────────────────────────────────────
  async function populateSimForm() {
    const agentSel  = document.getElementById("sim-agent");
    const moduleSel = document.getElementById("sim-module");

    if (!agentSel.options.length) {
      const agentData  = await fetchJSON("/api/agents");
      const moduleData = await fetchJSON("/api/flagged-sessions?status=all")
        .then(flags => {
          const seen = {}; const mods = [];
          flags.forEach(f => { if (!seen[f.module_name]) { seen[f.module_name] = true; mods.push(f); }});
          return mods;
        }).catch(() => []);

      agentSel.innerHTML  = agentData.map(a =>
        `<option value="${a.agent_id}">${a.agent_name} (${a.branch})</option>`).join("");

      // Build module list from the flags we loaded (has module_id via session)
      const mResp = await fetch("/api/flagged-sessions?status=all&severity=");
      const mFlags = await mResp.json();
      const mSeen  = {};
      const mOpts  = [];
      for (const f of mFlags) {
        if (!mSeen[f.module_name]) {
          mSeen[f.module_name] = true;
          mOpts.push(`<option value="${f.session_id}">${f.module_name}</option>`);
        }
      }
      // Fallback: just use ids 1-6
      moduleSel.innerHTML = [1,2,3,4,5,6].map(i =>
        `<option value="${i}">Module ${i}</option>`).join("");
    }
  }

  function setPreset(type) {
    const presets = {
      speed:    { comp: 22,  score: 95, qtime: 30, tabs: 1 },
      guess:    { comp: 400, score: 0,  qtime: 3,  tabs: 0 },
      distract: { comp: 420, score: 72, qtime: 50, tabs: 8 },
      normal:   { comp: 410, score: 85, qtime: 55, tabs: 1 },
    };
    const p = presets[type];
    if (!p) return;
    document.getElementById("sim-comp").value  = p.comp;
    document.getElementById("sim-score").value = p.score;
    document.getElementById("sim-qtime").value = p.qtime;
    document.getElementById("sim-tabs").value  = p.tabs;
  }

  async function simulateSession() {
    const agentId  = document.getElementById("sim-agent").value;
    const moduleId = document.getElementById("sim-module").value;
    const comp     = document.getElementById("sim-comp").value;
    const score    = document.getElementById("sim-score").value;
    const qtime    = document.getElementById("sim-qtime").value;
    const tabs     = document.getElementById("sim-tabs").value;

    const resp = await fetch("/api/sessions/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent_id: parseInt(agentId) || 1,
        module_id: parseInt(moduleId) || 1,
        completion_time_seconds: parseInt(comp),
        quiz_score: parseInt(score),
        quiz_completion_time_seconds: parseInt(qtime),
        tab_switch_count: parseInt(tabs),
      }),
    });

    const result  = await resp.json();
    const resDiv  = document.getElementById("sim-result");
    resDiv.classList.remove("hidden", "sim-clean", "sim-flagged");

    if (result.flags_raised && result.flags_raised.length) {
      resDiv.classList.add("sim-flagged");
      const flagList = result.flags_raised.map(f =>
        `<div>⚠ <strong>${esc(f.rule_name)}</strong> — <span class="severity-badge sev-${f.severity_level}" style="font-size:10px">${f.severity_level}</span></div>`
      ).join("");
      resDiv.innerHTML = `<strong>🚨 ${result.flags_raised.length} flag(s) raised for Session #${result.session_id}</strong><div style="margin-top:8px">${flagList}</div>
        <div style="margin-top:10px"><button class="btn btn-sm btn-outline" onclick="App.switchView('dashboard')">View in Risk Inbox →</button></div>`;
    } else {
      resDiv.classList.add("sim-clean");
      resDiv.innerHTML = `✔ Session #${result.session_id} passed all compliance rules. No flags raised.`;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  async function fetchJSON(url) {
    const r = await fetch(url);
    return r.json();
  }

  function esc(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatTime(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  function sevIcon(sev) {
    return sev === "High" ? "🔴" : sev === "Medium" ? "🟡" : "🟢";
  }

  function eventClass(event) {
    if (event.includes("tab_switch_away")) return "ev-warning";
    if (event.includes("session_start"))  return "ev-info";
    if (event.includes("quiz_submit"))    return "ev-ok";
    if (event.includes("reading"))        return "ev-ok";
    return "";
  }

  function formatEventLabel(event) {
    const labels = {
      session_start:      "Session Started",
      tab_switch_away:    "Tab Switch — Away",
      tab_switch_return:  "Tab Switch — Returned",
      reading_complete:   "Reading Complete",
      quiz_start:         "Quiz Started",
      quiz_submit:        "Quiz Submitted",
    };
    return labels[event] || event;
  }

  function detailItem(label, value, cls = "") {
    return `<div class="detail-item">
      <div class="detail-label">${label}</div>
      <div class="detail-value ${cls}">${esc(value)}</div>
    </div>`;
  }

  function statusMessage(status) {
    const msgs = {
      approved:  "✔ This flag was reviewed and approved as a false alarm.",
      voided:    "⟳ Session voided. Agent is required to retake this module.",
      escalated: "↑ This case has been escalated to HR for further action.",
    };
    return msgs[status] || status;
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal();
      closeRuleModal();
    }
  });

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    init,
    switchView,
    refreshDashboard,
    openFlagDetail,
    closeModal,
    resolveFlag,
    loadRules,
    openNewRuleModal,
    openEditRule,
    saveRule,
    closeRuleModal,
    toggleRule,
    loadAuditLog,
    populateSimForm,
    setPreset,
    simulateSession,
  };
})();

document.addEventListener("DOMContentLoaded", App.init);
