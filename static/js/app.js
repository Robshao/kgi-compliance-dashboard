/* ── KGI Anti-Gaming Compliance Auditor ─────────────────────────────────── */

// ── Translations ────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    'brand.title': 'KGI Compliance',
    'brand.sub': 'Anti-Gaming Auditor',
    'brand.footer': 'FSC Compliance System v1.0',

    'nav.inbox': 'Risk Inbox',
    'nav.rules': 'Rules Engine',
    'nav.audit': 'Audit Log',
    'nav.simulate': 'Simulate Session',

    'page.inbox.title': 'Risk Inbox',
    'page.inbox.sub': 'Flagged training sessions requiring review',
    'btn.refresh': '↻ Refresh',
    'stat.high': 'High Risk',
    'stat.medium': 'Medium Risk',
    'stat.low': 'Low Risk',
    'stat.total': 'Total Pending',

    'filter.search': 'Search agent, module, rule…',
    'filter.all': 'All',
    'filter.high': 'High',
    'filter.medium': 'Medium',
    'filter.low': 'Low',

    'status.pending': 'Pending',
    'status.allStatuses': 'All Statuses',
    'status.approved': 'Approved',
    'status.voided': 'Voided',
    'status.escalated': 'Escalated',

    'th.severity': 'Severity',
    'th.agent': 'Agent',
    'th.branch': 'Branch',
    'th.module': 'Module',
    'th.ruleViolated': 'Rule Violated',
    'th.flaggedAt': 'Flagged At',
    'th.status': 'Status',
    'th.ruleName': 'Rule Name',
    'th.type': 'Type',
    'th.parameters': 'Parameters',
    'th.active': 'Active',
    'th.auditId': 'Audit ID',
    'th.flagId': 'Flag ID',
    'th.actionTaken': 'Action Taken',
    'th.manager': 'Manager',
    'th.notes': 'Notes',
    'th.timestamp': 'Timestamp',

    'page.rules.title': 'Rules Engine',
    'page.rules.sub': 'Configure detection thresholds',
    'btn.newRule': '+ New Rule',

    'page.audit.title': 'Compliance Audit Log',
    'page.audit.sub': 'Immutable record of all management actions (FSC audit-ready)',

    'page.simulate.title': 'Simulate Session',
    'page.simulate.sub': 'Submit a synthetic training session to test the rules engine',
    'label.agent': 'Agent',
    'label.module': 'Module',
    'label.compTime': 'Completion Time (seconds)',
    'label.quizScore': 'Quiz Score (%)',
    'label.quizTime': 'Quiz Completion Time (seconds)',
    'label.tabSwitches': 'Tab Switches',
    'preset.label': 'Quick presets:',
    'preset.speed': 'Speed-Clicker',
    'preset.guess': 'Blind Guesser',
    'preset.distract': 'Distracted',
    'preset.normal': 'Normal',
    'btn.runSim': '▶ Run Simulation',

    'modal.ruleViolation': 'Rule Violation',
    'modal.forensicTimeline': 'Forensic Timeline',
    'modal.resolutionHistory': 'Resolution History',
    'modal.manager': 'Manager',
    'modal.justification': 'Justification Notes',
    'modal.justificationPlaceholder': 'Brief notes for FSC audit trail…',
    'btn.approve': '✔ Approve (False Alarm)',
    'btn.void': '⟳ Void & Require Retake',
    'btn.escalate': '↑ Escalate to HR',

    'modal.editRule': 'Edit Rule',
    'modal.newRule': 'New Rule',
    'label.ruleName': 'Rule Name',
    'label.severityLevel': 'Severity Level',
    'label.parameters': 'Parameters (JSON)',
    'label.description': 'Description',
    'label.active': 'Active',
    'opt.yes': 'Yes',
    'opt.no': 'No',
    'btn.cancel': 'Cancel',
    'btn.saveRule': 'Save Rule',

    'detail.compTime': 'Completion Time',
    'detail.moduleAvg': 'Module Average',
    'detail.speedVsAvg': 'Speed vs Average',
    'detail.quizScore': 'Quiz Score',
    'detail.quizTime': 'Quiz Time',
    'detail.tabSwitches': 'Tab Switches',

    'event.session_start': 'Session Started',
    'event.tab_switch_away': 'Tab Switch — Away',
    'event.tab_switch_return': 'Tab Switch — Returned',
    'event.reading_complete': 'Reading Complete',
    'event.quiz_start': 'Quiz Started',
    'event.quiz_submit': 'Quiz Submitted',

    'status.msg.approved': '✔ This flag was reviewed and approved as a false alarm.',
    'status.msg.voided': '⟳ Session voided. Agent is required to retake this module.',
    'status.msg.escalated': '↑ This case has been escalated to HR for further action.',

    'msg.noFlags': 'No flags found',
    'msg.loading': 'Loading…',
    'msg.noAudit': 'No audit entries yet.',
    'msg.noTelemetry': 'No telemetry data available.',
    'msg.notesRequired': 'Please enter justification notes for the FSC audit trail.',
    'msg.invalidJson': 'Invalid JSON in Parameters field.',
    'msg.errorResolving': 'Error resolving flag.',
    'msg.alreadyResolved': 'Flag is already resolved.',

    'btn.review': 'Review →',
    'shield.locked': '🔒 Shield',
    'btn.editRule': 'Edit',

    'sim.flagsRaised': 'flag(s) raised for Session #',
    'sim.viewInbox': 'View in Risk Inbox →',
    'sim.clean': '✔ Session #{id} passed all compliance rules. No flags raised.',
    'sim.flagged': '🚨 {count} {label} Session #{id}',

    'sev.High': 'High',
    'sev.Medium': 'Medium',
    'sev.Low': 'Low',

    'risk.suffix': 'Risk',
    'langBtn': '中文',
  },

  zh: {
    'brand.title': 'KGI 合規系統',
    'brand.sub': '反作弊稽核器',
    'brand.footer': 'FSC 合規系統 v1.0',

    'nav.inbox': '風險收件匣',
    'nav.rules': '規則引擎',
    'nav.audit': '稽核日誌',
    'nav.simulate': '模擬作答',

    'page.inbox.title': '風險收件匣',
    'page.inbox.sub': '需要審核的已標記訓練作答紀錄',
    'btn.refresh': '↻ 重新整理',
    'stat.high': '高風險',
    'stat.medium': '中風險',
    'stat.low': '低風險',
    'stat.total': '待處理總計',

    'filter.search': '搜尋業務員、模組、規則…',
    'filter.all': '全部',
    'filter.high': '高風險',
    'filter.medium': '中風險',
    'filter.low': '低風險',

    'status.pending': '待處理',
    'status.allStatuses': '所有狀態',
    'status.approved': '已核准',
    'status.voided': '已作廢',
    'status.escalated': '已呈報',

    'th.severity': '嚴重程度',
    'th.agent': '業務員',
    'th.branch': '分行',
    'th.module': '模組',
    'th.ruleViolated': '違反規則',
    'th.flaggedAt': '標記時間',
    'th.status': '狀態',
    'th.ruleName': '規則名稱',
    'th.type': '類型',
    'th.parameters': '參數',
    'th.active': '啟用',
    'th.auditId': '稽核編號',
    'th.flagId': '標記編號',
    'th.actionTaken': '處理動作',
    'th.manager': '主管',
    'th.notes': '備註',
    'th.timestamp': '時間戳記',

    'page.rules.title': '規則引擎',
    'page.rules.sub': '設定偵測閾值',
    'btn.newRule': '+ 新增規則',

    'page.audit.title': '合規稽核日誌',
    'page.audit.sub': '所有主管操作的不可竄改紀錄（符合 FSC 稽核要求）',

    'page.simulate.title': '模擬作答',
    'page.simulate.sub': '提交一筆模擬訓練作答以測試規則引擎',
    'label.agent': '業務員',
    'label.module': '模組',
    'label.compTime': '完成時間（秒）',
    'label.quizScore': '測驗分數（%）',
    'label.quizTime': '測驗完成時間（秒）',
    'label.tabSwitches': '切換分頁次數',
    'preset.label': '快速預設：',
    'preset.speed': '快速點擊',
    'preset.guess': '盲目猜題',
    'preset.distract': '分心作答',
    'preset.normal': '正常作答',
    'btn.runSim': '▶ 執行模擬',

    'modal.ruleViolation': '違反規則',
    'modal.forensicTimeline': '鑑識時間軸',
    'modal.resolutionHistory': '處理歷程',
    'modal.manager': '主管',
    'modal.justification': '說明備註',
    'modal.justificationPlaceholder': '請輸入 FSC 稽核備註…',
    'btn.approve': '✔ 核准（誤報）',
    'btn.void': '⟳ 作廢並要求重修',
    'btn.escalate': '↑ 呈報人資',

    'modal.editRule': '編輯規則',
    'modal.newRule': '新增規則',
    'label.ruleName': '規則名稱',
    'label.severityLevel': '嚴重程度',
    'label.parameters': '參數（JSON）',
    'label.description': '說明',
    'label.active': '啟用',
    'opt.yes': '是',
    'opt.no': '否',
    'btn.cancel': '取消',
    'btn.saveRule': '儲存規則',

    'detail.compTime': '完成時間',
    'detail.moduleAvg': '模組平均',
    'detail.speedVsAvg': '速度 vs 平均',
    'detail.quizScore': '測驗分數',
    'detail.quizTime': '測驗時間',
    'detail.tabSwitches': '切換分頁',

    'event.session_start': '作答開始',
    'event.tab_switch_away': '切換分頁 — 離開',
    'event.tab_switch_return': '切換分頁 — 返回',
    'event.reading_complete': '閱讀完成',
    'event.quiz_start': '測驗開始',
    'event.quiz_submit': '測驗提交',

    'status.msg.approved': '✔ 此標記已審核，確認為誤報。',
    'status.msg.voided': '⟳ 作答已作廢，業務員須重修此模組。',
    'status.msg.escalated': '↑ 此案件已呈報人資部門進行後續處理。',

    'msg.noFlags': '未找到標記紀錄',
    'msg.loading': '載入中…',
    'msg.noAudit': '尚無稽核紀錄。',
    'msg.noTelemetry': '無遙測資料。',
    'msg.notesRequired': '請輸入說明備註以建立 FSC 稽核記錄。',
    'msg.invalidJson': '參數欄位 JSON 格式無效。',
    'msg.errorResolving': '處理標記時發生錯誤。',
    'msg.alreadyResolved': '此標記已處理完畢。',

    'btn.review': '審核 →',
    'shield.locked': '🔒 保護',
    'btn.editRule': '編輯',

    'sim.flagsRaised': '個標記已針對作答 #',
    'sim.viewInbox': '前往風險收件匣 →',
    'sim.clean': '✔ 作答 #{id} 通過所有合規規則，未觸發標記。',
    'sim.flagged': '🚨 觸發 {count} {label} 作答 #{id}',

    'sev.High': '高',
    'sev.Medium': '中',
    'sev.Low': '低',

    'risk.suffix': '風險',
    'langBtn': 'EN',
  },
};

// ── i18n core ────────────────────────────────────────────────────────────────
let currentLang = localStorage.getItem('kgi_lang') || 'en';

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ||
         (TRANSLATIONS['en'][key]) ||
         key;
}

function applyTranslations() {
  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // Placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  // Select option text
  document.querySelectorAll('[data-i18n-opt]').forEach(el => {
    el.textContent = t(el.dataset.i18nOpt);
  });
  // Language toggle button label
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) langBtn.textContent = t('langBtn');

  document.documentElement.lang = currentLang === 'zh' ? 'zh-TW' : 'en';
}

// ── App ──────────────────────────────────────────────────────────────────────
const App = (() => {

  let currentFlagId   = null;
  let currentSeverity = '';
  let managers        = [];

  // ── Init ───────────────────────────────────────────────────────────────────
  async function init() {
    applyTranslations();
    setupNav();
    await loadManagers();
    loadDashboard();
  }

  function toggleLang() {
    currentLang = currentLang === 'en' ? 'zh' : 'en';
    localStorage.setItem('kgi_lang', currentLang);
    applyTranslations();
    // Re-render whichever view is active so dynamic content also translates
    const activeView = document.querySelector('.view.active');
    if (activeView) {
      const viewId = activeView.id.replace('view-', '');
      if (viewId === 'dashboard') loadDashboard();
      if (viewId === 'rules')     loadRules();
      if (viewId === 'audit')     loadAuditLog();
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  function setupNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        switchView(link.dataset.view);
      });
    });

    document.getElementById('search-input').addEventListener('input',
      debounce(() => loadFlags(), 300));
    document.getElementById('status-filter').addEventListener('change', loadFlags);

    document.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentSeverity = pill.dataset.severity;
        loadFlags();
      });
    });
  }

  function switchView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(`view-${name}`).classList.add('active');
    document.querySelector(`[data-view="${name}"]`).classList.add('active');
    if (name === 'dashboard') loadDashboard();
    if (name === 'rules')     loadRules();
    if (name === 'audit')     loadAuditLog();
    if (name === 'simulate')  populateSimForm();
  }

  // ── Reference Data ─────────────────────────────────────────────────────────
  async function loadManagers() {
    managers = await fetchJSON('/api/managers');
    const sel = document.getElementById('resolve-manager');
    sel.innerHTML = managers.map(m =>
      `<option value="${m.manager_id}">${esc(m.manager_name)} (${esc(m.role)})</option>`
    ).join('');
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  async function loadDashboard() {
    await Promise.all([loadStats(), loadFlags()]);
  }

  async function loadStats() {
    const stats = await fetchJSON('/api/stats');
    const bySev = {};
    (stats.by_severity || []).forEach(s => { bySev[s.severity_level] = s.count; });
    document.getElementById('stat-high').textContent   = bySev['High']   || 0;
    document.getElementById('stat-medium').textContent = bySev['Medium'] || 0;
    document.getElementById('stat-low').textContent    = bySev['Low']    || 0;
    document.getElementById('stat-total').textContent  = stats.pending_flags || 0;
  }

  async function loadFlags() {
    const search = document.getElementById('search-input').value;
    const status = document.getElementById('status-filter').value;
    const params = new URLSearchParams({ status });
    if (currentSeverity) params.set('severity', currentSeverity);
    if (search) params.set('search', search);

    const flags = await fetchJSON(`/api/flagged-sessions?${params}`);
    renderFlagsTable(flags);
  }

  function renderFlagsTable(flags) {
    const tbody = document.getElementById('flags-tbody');
    if (!flags.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="loading-cell" style="cursor:default">${t('msg.noFlags')}</td></tr>`;
      return;
    }
    tbody.innerHTML = flags.map(f => {
      const shield = f.streak_shield_locked
        ? `<span class="shield-badge">${t('shield.locked')}</span>` : '';
      const statusLabel = statusText(f.resolution_status);
      return `
        <tr onclick="App.openFlagDetail(${f.flag_id})">
          <td><span class="severity-badge sev-${f.severity_level}">${sevIcon(f.severity_level)} ${t('sev.' + f.severity_level)}</span></td>
          <td><strong>${esc(f.agent_name)}</strong>${shield}</td>
          <td>${esc(f.branch)}</td>
          <td>${esc(f.module_name)}</td>
          <td>${esc(f.rule_name)}</td>
          <td>${formatTime(f.flag_timestamp)}</td>
          <td><span class="status-badge status-${f.resolution_status}">${statusLabel}</span></td>
          <td><button class="btn btn-sm btn-outline" onclick="event.stopPropagation();App.openFlagDetail(${f.flag_id})">${t('btn.review')}</button></td>
        </tr>`;
    }).join('');
  }

  function refreshDashboard() { loadDashboard(); }

  // ── Flag Detail Modal ──────────────────────────────────────────────────────
  async function openFlagDetail(flagId) {
    currentFlagId = flagId;
    const f = await fetchJSON(`/api/flagged-sessions/${flagId}`);

    document.getElementById('modal-title').textContent = `Flag #${f.flag_id} — ${f.agent_name}`;
    document.getElementById('modal-meta').textContent  =
      `${f.module_name} · ${f.branch} · ${formatTime(f.flag_timestamp)}`;

    const badge = document.getElementById('modal-severity-badge');
    badge.className = `severity-badge sev-${f.severity_level}`;
    badge.textContent = `${sevIcon(f.severity_level)} ${t('sev.' + f.severity_level)} ${t('risk.suffix')}`;

    const avg  = f.avg_completion_seconds || 1;
    const pct  = Math.round((f.completion_time_seconds / avg) * 100);
    const compClass = pct < 30 ? 'val-danger' : pct < 60 ? 'val-warning' : 'val-ok';

    document.getElementById('modal-overview').innerHTML = `
      ${detailItem(t('detail.compTime'),    `${f.completion_time_seconds}s`, compClass)}
      ${detailItem(t('detail.moduleAvg'),   `${avg}s`, '')}
      ${detailItem(t('detail.speedVsAvg'),  `${pct}%`, compClass)}
      ${detailItem(t('detail.quizScore'),   `${f.quiz_score}%`,
          f.quiz_score === 0 ? 'val-danger' : f.quiz_score < 50 ? 'val-warning' : 'val-ok')}
      ${detailItem(t('detail.quizTime'),    `${f.quiz_completion_time_seconds}s`,
          f.quiz_completion_time_seconds <= 5 ? 'val-danger' : '')}
      ${detailItem(t('detail.tabSwitches'), `${f.tab_switch_count}`,
          f.tab_switch_count > 5 ? 'val-danger' : f.tab_switch_count > 2 ? 'val-warning' : 'val-ok')}
    `;

    const params = f.parameter_json || {};
    const paramChips = Object.entries(params)
      .map(([k, v]) => `<span class="rule-param-tag">${k}: ${v}</span>`)
      .join('');
    document.getElementById('modal-rule-info').innerHTML = `
      <strong>${esc(f.rule_name)}</strong>
      <span class="severity-badge sev-${f.severity_level}" style="margin-left:8px">${t('sev.' + f.severity_level)}</span>
      <p style="margin-top:8px;color:var(--text-muted)">${esc(f.description || '')}</p>
      <div class="rule-params">${paramChips}</div>
    `;

    // Forensic timeline
    const tlEl  = document.getElementById('modal-timeline');
    const events = f.telemetry_json || [];
    if (events.length) {
      tlEl.innerHTML = events.map(ev => {
        const cls = eventClass(ev.event);
        return `
          <div class="tl-event ${cls}">
            <div class="tl-time">T+${ev.time}s</div>
            <div class="tl-label">${t('event.' + ev.event) !== 'event.' + ev.event ? t('event.' + ev.event) : formatEventLabel(ev.event)}</div>
            <div class="tl-detail">${esc(ev.detail)}</div>
          </div>`;
      }).join('');
    } else {
      tlEl.innerHTML = `<p style="color:var(--text-muted);font-size:13px">${t('msg.noTelemetry')}</p>`;
    }

    // Audit history
    const histBlock = document.getElementById('audit-history-block');
    const histDiv   = document.getElementById('modal-audit-history');
    if (f.audit_history && f.audit_history.length) {
      histBlock.style.display = 'block';
      histDiv.innerHTML = f.audit_history.map(a => `
        <div class="audit-entry">
          <div class="audit-entry-header">
            <span class="audit-entry-action">${esc(a.action_taken)}</span>
            <span class="audit-entry-time">${formatTime(a.timestamp)}</span>
          </div>
          <div class="audit-entry-by">${t('th.manager')}: ${esc(a.manager_name)} · ${esc(a.role)}</div>
          ${a.manager_justification_notes
            ? `<div class="audit-entry-notes">"${esc(a.manager_justification_notes)}"</div>`
            : ''}
        </div>`).join('');
    } else {
      histBlock.style.display = 'none';
    }

    // Resolution bar
    const resBar    = document.getElementById('resolution-bar');
    const resNotice = document.getElementById('resolved-notice');
    // Re-apply translations on modal elements
    applyTranslations();

    if (f.resolution_status === 'pending') {
      resBar.style.display = 'flex';
      resNotice.className  = 'resolved-notice hidden';
    } else {
      resBar.style.display = 'none';
      resNotice.className  = `resolved-notice resolved-${f.resolution_status}`;
      resNotice.textContent = statusMessage(f.resolution_status);
    }

    document.getElementById('resolve-notes').value = '';
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  function closeModal(event) {
    if (event && event.target !== document.getElementById('modal-overlay')) return;
    document.getElementById('modal-overlay').classList.add('hidden');
    currentFlagId = null;
  }

  // ── Resolve Flag ───────────────────────────────────────────────────────────
  async function resolveFlag(action) {
    if (!currentFlagId) return;
    const managerId = document.getElementById('resolve-manager').value;
    const notes     = document.getElementById('resolve-notes').value.trim();

    if (!notes) {
      alert(t('msg.notesRequired'));
      return;
    }

    const resp = await fetch(`/api/flagged-sessions/${currentFlagId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes, manager_id: parseInt(managerId) }),
    });

    if (resp.ok) {
      const statusMap = { approve: 'approved', void: 'voided', escalate: 'escalated' };
      const status    = statusMap[action];
      document.getElementById('resolution-bar').style.display = 'none';
      const resNotice = document.getElementById('resolved-notice');
      resNotice.className  = `resolved-notice resolved-${status}`;
      resNotice.textContent = statusMessage(status);
      loadStats();
      loadFlags();
    } else {
      const err = await resp.json();
      alert(err.error === 'Flag is already resolved'
        ? t('msg.alreadyResolved')
        : t('msg.errorResolving'));
    }
  }

  // ── Rules View ─────────────────────────────────────────────────────────────
  async function loadRules() {
    const rules = await fetchJSON('/api/rules');
    const tbody = document.getElementById('rules-tbody');
    tbody.innerHTML = rules.map(r => {
      const chips = Object.entries(r.parameter_json)
        .map(([k, v]) => `<span class="param-chip">${k}: ${v}</span>`)
        .join('');
      return `
        <tr>
          <td><strong>${esc(r.rule_name)}</strong><br>
              <span style="color:var(--text-muted);font-size:12px">${esc(r.description || '')}</span></td>
          <td><code style="font-size:12px;color:var(--accent)">${esc(r.rule_type)}</code></td>
          <td><div class="param-chips">${chips}</div></td>
          <td><span class="severity-badge sev-${r.severity_level}">${sevIcon(r.severity_level)} ${t('sev.' + r.severity_level)}</span></td>
          <td>
            <label class="toggle">
              <input type="checkbox" ${r.is_active ? 'checked' : ''}
                onchange="App.toggleRule(${r.rule_id}, this.checked)" />
              <span class="toggle-slider"></span>
            </label>
          </td>
          <td><button class="btn btn-sm btn-outline" onclick="App.openEditRule(${r.rule_id})">${t('btn.editRule')}</button></td>
        </tr>`;
    }).join('');
  }

  async function toggleRule(ruleId, active) {
    await fetch(`/api/rules/${ruleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: active ? 1 : 0 }),
    });
  }

  function openNewRuleModal() {
    document.getElementById('rule-modal-title').textContent = t('modal.newRule');
    document.getElementById('edit-rule-id').value     = '';
    document.getElementById('edit-rule-name').value   = '';
    document.getElementById('edit-rule-severity').value = 'Medium';
    document.getElementById('edit-rule-params').value = '{}';
    document.getElementById('edit-rule-desc').value   = '';
    document.getElementById('edit-rule-active').value = '1';
    applyTranslations();
    document.getElementById('rule-modal-overlay').classList.remove('hidden');
  }

  async function openEditRule(ruleId) {
    const rules = await fetchJSON('/api/rules');
    const rule  = rules.find(r => r.rule_id === ruleId);
    if (!rule) return;
    document.getElementById('rule-modal-title').textContent = t('modal.editRule');
    document.getElementById('edit-rule-id').value       = rule.rule_id;
    document.getElementById('edit-rule-name').value     = rule.rule_name;
    document.getElementById('edit-rule-severity').value = rule.severity_level;
    document.getElementById('edit-rule-params').value   = JSON.stringify(rule.parameter_json, null, 2);
    document.getElementById('edit-rule-desc').value     = rule.description || '';
    document.getElementById('edit-rule-active').value   = rule.is_active ? '1' : '0';
    applyTranslations();
    document.getElementById('rule-modal-overlay').classList.remove('hidden');
  }

  async function saveRule() {
    const ruleId   = document.getElementById('edit-rule-id').value;
    const name     = document.getElementById('edit-rule-name').value.trim();
    const severity = document.getElementById('edit-rule-severity').value;
    const active   = document.getElementById('edit-rule-active').value;
    const desc     = document.getElementById('edit-rule-desc').value.trim();
    let params;
    try {
      params = JSON.parse(document.getElementById('edit-rule-params').value);
    } catch {
      alert(t('msg.invalidJson'));
      return;
    }

    const payload = { rule_name: name, severity_level: severity,
                      parameter_json: params, is_active: parseInt(active), description: desc };

    if (ruleId) {
      await fetch(`/api/rules/${ruleId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      payload.rule_type = name.toUpperCase().replace(/\s+/g, '_');
      await fetch('/api/rules', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    closeRuleModal();
    loadRules();
  }

  function closeRuleModal(event) {
    if (event && event.target !== document.getElementById('rule-modal-overlay')) return;
    document.getElementById('rule-modal-overlay').classList.add('hidden');
  }

  // ── Audit Log ──────────────────────────────────────────────────────────────
  async function loadAuditLog() {
    const logs  = await fetchJSON('/api/audit-log');
    const tbody = document.getElementById('audit-tbody');
    if (!logs.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="loading-cell">${t('msg.noAudit')}</td></tr>`;
      return;
    }
    tbody.innerHTML = logs.map(l => `
      <tr>
        <td>#${l.audit_id}</td>
        <td>#${l.flag_id}</td>
        <td>${esc(l.agent_name)}</td>
        <td>${esc(l.module_name)}</td>
        <td><span class="severity-badge sev-${l.severity_level}">${sevIcon(l.severity_level)} ${t('sev.' + l.severity_level)}</span></td>
        <td><strong>${esc(l.action_taken)}</strong></td>
        <td>${esc(l.manager_name)}<br><span style="color:var(--text-muted);font-size:11px">${esc(l.role)}</span></td>
        <td><span style="color:var(--text-muted);font-style:italic">${esc(l.manager_justification_notes || '—')}</span></td>
        <td style="white-space:nowrap">${formatTime(l.timestamp)}</td>
      </tr>`).join('');
  }

  // ── Simulate ───────────────────────────────────────────────────────────────
  async function populateSimForm() {
    const agentSel  = document.getElementById('sim-agent');
    const moduleSel = document.getElementById('sim-module');

    if (!agentSel.options.length) {
      const agentData = await fetchJSON('/api/agents');
      agentSel.innerHTML = agentData.map(a =>
        `<option value="${a.agent_id}">${esc(a.agent_name)} (${esc(a.branch)})</option>`
      ).join('');
      moduleSel.innerHTML = [1,2,3,4,5,6].map(i =>
        `<option value="${i}">Module ${i}</option>`).join('');
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
    document.getElementById('sim-comp').value  = p.comp;
    document.getElementById('sim-score').value = p.score;
    document.getElementById('sim-qtime').value = p.qtime;
    document.getElementById('sim-tabs').value  = p.tabs;
  }

  async function simulateSession() {
    const agentId  = document.getElementById('sim-agent').value;
    const moduleId = document.getElementById('sim-module').value;
    const comp     = document.getElementById('sim-comp').value;
    const score    = document.getElementById('sim-score').value;
    const qtime    = document.getElementById('sim-qtime').value;
    const tabs     = document.getElementById('sim-tabs').value;

    const resp = await fetch('/api/sessions/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id: parseInt(agentId) || 1,
        module_id: parseInt(moduleId) || 1,
        completion_time_seconds: parseInt(comp),
        quiz_score: parseInt(score),
        quiz_completion_time_seconds: parseInt(qtime),
        tab_switch_count: parseInt(tabs),
      }),
    });

    const result = await resp.json();
    const resDiv = document.getElementById('sim-result');
    resDiv.classList.remove('hidden', 'sim-clean', 'sim-flagged');

    if (result.flags_raised && result.flags_raised.length) {
      resDiv.classList.add('sim-flagged');
      const flagList = result.flags_raised.map(f =>
        `<div>⚠ <strong>${esc(f.rule_name)}</strong> — <span class="severity-badge sev-${f.severity_level}" style="font-size:10px">${t('sev.' + f.severity_level)}</span></div>`
      ).join('');
      const heading = currentLang === 'zh'
        ? `🚨 觸發 ${result.flags_raised.length} 個標記（作答 #${result.session_id}）`
        : `🚨 ${result.flags_raised.length} flag(s) raised for Session #${result.session_id}`;
      resDiv.innerHTML = `<strong>${heading}</strong>
        <div style="margin-top:8px">${flagList}</div>
        <div style="margin-top:10px">
          <button class="btn btn-sm btn-outline" onclick="App.switchView('dashboard')">${t('sim.viewInbox')}</button>
        </div>`;
    } else {
      resDiv.classList.add('sim-clean');
      resDiv.textContent = currentLang === 'zh'
        ? `✔ 作答 #${result.session_id} 通過所有合規規則，未觸發標記。`
        : `✔ Session #${result.session_id} passed all compliance rules. No flags raised.`;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  async function fetchJSON(url) {
    const r = await fetch(url);
    return r.json();
  }

  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatTime(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString(currentLang === 'zh' ? 'zh-TW' : 'en-GB',
      { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  function sevIcon(sev) {
    return sev === 'High' ? '🔴' : sev === 'Medium' ? '🟡' : '🟢';
  }

  function statusText(status) {
    const map = {
      pending:   'status.pending',
      approved:  'status.approved',
      voided:    'status.voided',
      escalated: 'status.escalated',
    };
    return t(map[status] || status);
  }

  function statusMessage(status) {
    const map = {
      approved:  'status.msg.approved',
      voided:    'status.msg.voided',
      escalated: 'status.msg.escalated',
    };
    return t(map[status] || status);
  }

  function eventClass(event) {
    if (event.includes('tab_switch_away')) return 'ev-warning';
    if (event.includes('session_start'))  return 'ev-info';
    if (event.includes('quiz_submit'))    return 'ev-ok';
    if (event.includes('reading'))        return 'ev-ok';
    return '';
  }

  function formatEventLabel(event) {
    const labels = {
      session_start:     'Session Started',
      tab_switch_away:   'Tab Switch — Away',
      tab_switch_return: 'Tab Switch — Returned',
      reading_complete:  'Reading Complete',
      quiz_start:        'Quiz Started',
      quiz_submit:       'Quiz Submitted',
    };
    return labels[event] || event;
  }

  function detailItem(label, value, cls = '') {
    return `<div class="detail-item">
      <div class="detail-label">${label}</div>
      <div class="detail-value ${cls}">${esc(value)}</div>
    </div>`;
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeRuleModal(); }
  });

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    init,
    toggleLang,
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

document.addEventListener('DOMContentLoaded', App.init);
