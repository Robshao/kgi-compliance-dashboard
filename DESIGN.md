# KGI 反作弊合規稽核系統 — 完整技術設計文件

> 技術棧：Python / Flask · SQLite · HTML + CSS + JavaScript (Vanilla)

---

## 目錄

1. [專案背景與目標](#1-專案背景與目標)
2. [整體架構設計](#2-整體架構設計)
3. [資料庫設計](#3-資料庫設計)
4. [後端設計（Flask API）](#4-後端設計flask-api)
5. [規則引擎設計](#5-規則引擎設計)
6. [前端設計](#6-前端設計)
7. [雙語國際化系統（i18n）](#7-雙語國際化系統i18n)
8. [資料流程圖](#8-資料流程圖)
9. [API 端點說明](#9-api-端點說明)
10. [安全性與稽核設計](#10-安全性與稽核設計)
11. [本機啟動指南](#11-本機啟動指南)

---

## 1. 專案背景與目標

### 1.1 問題陳述

在微學習平台中，訓練課程與績效指標、獎金或銷售執照掛鉤時，人性會驅使部分員工尋找捷徑：

- **快速點擊（Speed-Clicking）**：3 秒鐘滑完所有閱讀卡片
- **盲目猜題（Blind Guessing）**：隨機點選答案以跳過測驗
- **分心作答（Distraction）**：頻繁切換瀏覽器分頁
- **答案記憶（Pattern Memorization）**：靠記憶 A-B-C-D 順序過關

### 1.2 合規風險

若壽險業務員「快速點完」FSC（金融監督管理委員會）強制要求的防洗錢模組，事後發生違規，金融控股公司將承擔法律責任。監理機關會審查系統日誌並追究：**「你的系統允許業務員在 12 秒內完成 7 分鐘的課程，你們明知他沒有閱讀。」**

### 1.3 系統目標

| 目標 | 說明 |
|------|------|
| 即時偵測 | 自動掃描每筆作答遙測資料，比對動態規則 |
| 視覺化稽核 | 提供主管鑑識時間軸，還原業務員完整行為 |
| 標準化處理 | 強制主管在三種動作中擇一，並留下不可竄改紀錄 |
| FSC 合規 | 所有處理動作永久存入稽核日誌，隨時可供監理機關查閱 |

---

## 2. 整體架構設計

### 2.1 系統架構圖

```
┌─────────────────────────────────────────────────────┐
│                    瀏覽器 (Client)                    │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  Risk Inbox │  │ Rules Engine │  │  Audit Log  │  │
│  │  風險收件匣  │  │   規則引擎   │  │  稽核日誌   │  │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘  │
│         │                │                  │         │
│         └────────────────┼──────────────────┘         │
│                          │ fetch() / REST API          │
└──────────────────────────┼─────────────────────────────┘
                           │ HTTP Request / Response
┌──────────────────────────▼─────────────────────────────┐
│                  Flask Web Server (app.py)               │
│                                                          │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  路由處理   │  │  規則引擎    │  │  資料庫存取    │   │
│  │  Routes    │  │  Evaluation  │  │  SQLite ORM    │   │
│  └────────────┘  └──────────────┘  └────────────────┘   │
│                                                          │
│                     database.py                          │
└──────────────────────────┬─────────────────────────────┘
                           │ sqlite3
┌──────────────────────────▼─────────────────────────────┐
│                   SQLite Database                        │
│                   compliance.db                          │
│                                                          │
│  ComplianceRules │ Sessions │ FlaggedSessions            │
│  Agents │ Managers │ LearningModules │ AuditLog          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 技術選型理由

| 技術 | 選擇 | 理由 |
|------|------|------|
| 後端語言 | Python 3 | 語法簡潔、快速開發、豐富生態系 |
| Web 框架 | Flask | 輕量、無強制 ORM、適合中小型 REST API |
| 資料庫 | SQLite | 零設定、單一檔案、適合 Demo 與面試展示 |
| 前端 | Vanilla JS | 無需 Node.js 環境、無框架依賴、易於理解 |
| 樣式 | 純 CSS（CSS Variables） | 完全掌控、深色主題、無外部依賴 |

### 2.3 專案目錄結構

```
kgi-compliance-dashboard/
│
├── app.py              # Flask 主應用程式、所有路由定義
├── database.py         # 資料庫初始化、Schema、Seed Data、規則引擎
├── requirements.txt    # Python 依賴套件清單
├── compliance.db       # SQLite 資料庫（執行後自動產生）
│
├── templates/
│   └── index.html      # 單頁應用程式（SPA）HTML 骨架
│
└── static/
    ├── css/
    │   └── style.css   # 完整樣式（深色主題、元件樣式）
    └── js/
        └── app.js      # 前端邏輯、翻譯系統、API 呼叫
```

---

## 3. 資料庫設計

### 3.1 完整 Schema

#### Agents（業務員）
```sql
CREATE TABLE Agents (
    agent_id             INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name           TEXT    NOT NULL,
    branch               TEXT    NOT NULL,  -- 所屬分行
    email                TEXT,
    leaderboard_points   INTEGER DEFAULT 0, -- 排行榜積分
    streak_shield_locked INTEGER DEFAULT 0  -- 連續作答保護鎖定狀態
);
```
**設計說明：**
- `leaderboard_points`：遊戲化積分系統，High Risk 標記觸發時自動凍結
- `streak_shield_locked`：保護盾被鎖定代表連勝保護暫停，直到主管解除標記

---

#### Managers（主管）
```sql
CREATE TABLE Managers (
    manager_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    manager_name TEXT NOT NULL,
    role         TEXT NOT NULL  -- 'Branch Manager' / 'Compliance Officer' / 'HR Manager'
);
```

---

#### LearningModules（學習模組）
```sql
CREATE TABLE LearningModules (
    module_id                INTEGER PRIMARY KEY AUTOINCREMENT,
    module_name              TEXT    NOT NULL,
    expected_duration_seconds INTEGER NOT NULL, -- 設計預期完成時間
    avg_completion_seconds    INTEGER            -- 全員實際平均完成時間（動態更新）
);
```
**設計說明：**
- `avg_completion_seconds` 是規則引擎的基準值。Rule 1（超速）依此計算 20% 門檻
- 平均值可定期由後台 Job 更新，確保基準線跟隨用戶行為調整

---

#### ComplianceRules（合規規則字典）
```sql
CREATE TABLE ComplianceRules (
    rule_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name      TEXT    NOT NULL,                         -- 規則顯示名稱
    rule_type      TEXT    NOT NULL,                         -- 規則類型代碼
    parameter_json TEXT    NOT NULL,                         -- JSON 格式的動態參數
    severity_level TEXT    NOT NULL CHECK(
                           severity_level IN ('Low','Medium','High')),
    is_active      INTEGER NOT NULL DEFAULT 1,               -- 開關控制
    description    TEXT,                                     -- 說明文字
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**設計說明：**
- `parameter_json` 是系統「動態規則」的核心。所有閾值儲存為 JSON，不 hardcode 在程式碼中
- 範例：`{"threshold_pct": 20}` 代表「完成時間低於平均的 20% 即觸發」
- 主管可透過 UI 直接修改此 JSON，系統立即生效，不需要重新部署

---

#### Sessions（作答遙測資料）
```sql
CREATE TABLE Sessions (
    session_id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id                      INTEGER NOT NULL,
    module_id                     INTEGER NOT NULL,
    start_time                    TIMESTAMP NOT NULL,
    end_time                      TIMESTAMP,
    completion_time_seconds       INTEGER,   -- 總完成時間（秒）
    quiz_score                    INTEGER,   -- 測驗分數 0-100
    quiz_completion_time_seconds  INTEGER,   -- 作答測驗花費時間（秒）
    tab_switch_count              INTEGER DEFAULT 0, -- 切換分頁次數
    telemetry_json                TEXT,      -- JSON 陣列：完整行為事件序列
    session_status                TEXT DEFAULT 'completed',
    FOREIGN KEY (agent_id)  REFERENCES Agents(agent_id),
    FOREIGN KEY (module_id) REFERENCES LearningModules(module_id)
);
```
**設計說明：**
- `telemetry_json` 儲存完整的行為時間軸，格式如下：
```json
[
  {"time": 0,  "event": "session_start",     "detail": "Module opened"},
  {"time": 3,  "event": "tab_switch_away",   "detail": "Switched to external app (event 1)"},
  {"time": 11, "event": "tab_switch_return", "detail": "Returned to module"},
  {"time": 18, "event": "reading_complete",  "detail": "All flashcards swiped"},
  {"time": 20, "event": "quiz_start",        "detail": "Quiz started"},
  {"time": 22, "event": "quiz_submit",       "detail": "Quiz submitted – score 0%"}
]
```
- 這個 JSON 直接渲染為前端的「鑑識時間軸」，提供主管完整的行為還原

---

#### FlaggedSessions（標記佇列）
```sql
CREATE TABLE FlaggedSessions (
    flag_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id        INTEGER NOT NULL,  -- 關聯到哪一筆作答
    agent_id          INTEGER NOT NULL,  -- 哪位業務員
    rule_violated_id  INTEGER NOT NULL,  -- 觸犯哪條規則（FK → ComplianceRules）
    flag_timestamp    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolution_status TEXT DEFAULT 'pending'
                      CHECK(resolution_status IN ('pending','approved','voided','escalated')),
    FOREIGN KEY (session_id)       REFERENCES Sessions(session_id),
    FOREIGN KEY (agent_id)         REFERENCES Agents(agent_id),
    FOREIGN KEY (rule_violated_id) REFERENCES ComplianceRules(rule_id)
);
```
**設計說明：**
- 一筆 Session 可能觸發多條規則，產生多個 FlaggedSession 記錄
- `resolution_status` 僅有四種合法狀態，使用 `CHECK` 約束確保資料完整性

---

#### ComplianceAuditLog（不可竄改稽核日誌）
```sql
CREATE TABLE ComplianceAuditLog (
    audit_id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    flag_id                     INTEGER NOT NULL,
    manager_id                  INTEGER NOT NULL,  -- 誰處理的
    action_taken                TEXT    NOT NULL,  -- 處理動作全名
    manager_justification_notes TEXT,              -- 主管說明備註
    timestamp                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flag_id)    REFERENCES FlaggedSessions(flag_id),
    FOREIGN KEY (manager_id) REFERENCES Managers(manager_id)
);
```
**設計說明：**
- 此表只有 `INSERT`，**永不更新或刪除**，確保 immutable（不可竄改）
- `action_taken` 儲存完整動作名稱（如 `"VOID SESSION & REQUIRE RETAKE"`），而非代碼，確保日誌自解釋
- 這是 FSC 稽核的核心證據，主管每次處理動作都強制記錄

### 3.2 資料表關聯圖

```
Agents ──────────────────────┐
    │                         │
    │ 1:N                     │ 1:N
    ▼                         ▼
Sessions ──── 1:N ──── FlaggedSessions ──── 1:N ──── ComplianceAuditLog
    │                         │                              │
    │ N:1                     │ N:1                          │ N:1
    ▼                         ▼                              ▼
LearningModules        ComplianceRules                   Managers
```

---

## 4. 後端設計（Flask API）

### 4.1 應用程式入口（app.py）

```python
from flask import Flask, jsonify, request, render_template, abort
from database import get_db, init_db, evaluate_session

app = Flask(__name__)

if __name__ == "__main__":
    init_db()          # 初始化資料庫（建表 + Seed Data）
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)
```

**啟動流程：**
1. `init_db()` 檢查資料庫是否已存在
2. 若不存在，建立所有資料表並寫入示範資料（Seed Data）
3. Flask 啟動，監聽指定 port

### 4.2 資料庫連線設計

```python
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row   # 讓查詢結果可用欄位名稱存取
    conn.execute("PRAGMA foreign_keys = ON")  # 啟用外鍵約束
    return conn
```

**關鍵設計：**
- `sqlite3.Row`：讓每筆結果可以用 `row["column_name"]` 存取，而不是 index
- `PRAGMA foreign_keys = ON`：SQLite 預設關閉外鍵約束，必須手動開啟
- 每個 request 建立獨立連線，request 結束後關閉（無 connection pool，適合單機 Demo）

### 4.3 Seed Data 設計

`_seed()` 函式在資料庫首次初始化時執行，寫入：
- **3 位主管**（Branch Manager / Compliance Officer / HR）
- **8 位業務員**（分布在台北A/B、台中、高雄）
- **6 個學習模組**（含預期時間與平均完成時間）
- **5 條合規規則**（涵蓋超速、猜題、分心等情境）
- **15 筆作答記錄**（涵蓋各種違規與正常情境）

Seed Data 完成後，系統自動對每筆作答執行規則評估，產生對應的標記（flags）。

---

## 5. 規則引擎設計

### 5.1 設計理念

規則引擎的核心精神是「**動態（Dynamic）**」而非「**硬編碼（Hardcoded）**」：

```
❌ 硬編碼方式（不好）：
   if completion_time < 0.2 * avg_time:
       create_flag()

✅ 動態規則方式（本系統做法）：
   rules = db.query("SELECT * FROM ComplianceRules WHERE is_active = 1")
   for rule in rules:
       params = json.loads(rule["parameter_json"])
       if evaluate(rule["rule_type"], params, session_data):
           create_flag()
```

### 5.2 五條預設規則

#### Rule 1：超速驗證（SPEEDING）
```json
parameter_json: {"threshold_pct": 20}
severity: High
```
**邏輯：** `completion_time < avg_completion_seconds × 20% → 觸發`

模組平均完成時間為 430 秒（約 7 分鐘），若業務員在 86 秒（1.5 分鐘）內完成，
代表根本沒有閱讀。

---

#### Rule 2：盲目猜題偵測（PATTERN_GUESSING）
```json
parameter_json: {"max_quiz_seconds": 5, "max_score_pct": 0}
severity: High
```
**邏輯：** `quiz_time ≤ 5秒 AND quiz_score = 0% → 觸發`

5 秒內完成所有測驗題目且全錯，代表隨機點擊以跳過測驗。

---

#### Rule 3：過度分心（DISTRACTION）
```json
parameter_json: {"max_tab_switches": 5}
severity: Medium
```
**邏輯：** `tab_switch_count > 5 → 觸發`

7 分鐘課程中切換超過 5 次分頁，代表嚴重分心，學習效果存疑。

---

#### Rule 4：超速完美分數（SPEED_WITH_PERFECT）
```json
parameter_json: {"threshold_pct": 25, "min_score_pct": 100}
severity: Medium
```
**邏輯：** `completion_time < avg × 25% AND quiz_score = 100% → 觸發`

異常快速完成卻拿到滿分，可能代表提前取得答案或使用外部輔助。

---

#### Rule 5：重複低分（REPEAT_FAILURE）
```json
parameter_json: {"max_score_pct": 40, "min_attempts": 2}
severity: Low
```
**邏輯：** `quiz_score ≤ 40% AND 同模組前次也低於 40% → 觸發`

同一模組兩次以上低分，代表業務員沒有從中學習，可能是長期脫離的訊號。

---

### 5.3 規則評估函式

```python
def _evaluate_and_flag(c, session_id, agent_id, module_id,
                       comp_secs, quiz_score, quiz_secs, tab_sw, flag_time):

    # 1. 取得所有啟用中的規則
    rules = c.execute("SELECT * FROM ComplianceRules WHERE is_active = 1").fetchall()

    # 2. 取得此模組的平均完成時間（規則基準值）
    module = c.execute("SELECT avg_completion_seconds FROM LearningModules
                        WHERE module_id=?", (module_id,)).fetchone()

    for rule in rules:
        params = json.loads(rule["parameter_json"])  # 動態解析參數
        triggered = False

        # 3. 依規則類型分別評估
        if rule["rule_type"] == "SPEEDING":
            threshold = avg_secs * params["threshold_pct"] / 100
            triggered = comp_secs < threshold

        elif rule["rule_type"] == "PATTERN_GUESSING":
            triggered = (quiz_secs <= params["max_quiz_seconds"] and
                         quiz_score <= params["max_score_pct"])
        # ... 其他規則類型

        # 4. 觸發則寫入 FlaggedSessions
        if triggered:
            c.execute("INSERT INTO FlaggedSessions ...")

            # 5. High Risk 自動執行懲罰
            if rule["severity_level"] == "High":
                c.execute("UPDATE Agents SET streak_shield_locked=1 ...")
```

### 5.4 自動懲罰系統

當 High Risk 標記觸發時，系統自動執行：
- **鎖定 Streak Shield**（`streak_shield_locked = 1`）
- 連勝保護暫停，直到主管審核並決定動作

解除條件：
- 主管選擇「核准（誤報）」→ 自動解除鎖定
- 主管選擇「作廢並要求重修」→ 保持鎖定，待重修完成
- 主管選擇「呈報人資」→ 保持鎖定

---

## 6. 前端設計

### 6.1 單頁應用程式（SPA）架構

```html
<!-- 所有頁面同時存在 DOM，透過 CSS display 切換 -->
<section id="view-dashboard" class="view active"> ... </section>
<section id="view-rules"     class="view"> ... </section>
<section id="view-audit"     class="view"> ... </section>
<section id="view-simulate"  class="view"> ... </section>
```

切換頁面只需：
```javascript
function switchView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${name}`).classList.add('active');
}
```
無頁面重新載入，用戶體驗流暢。

### 6.2 CSS 設計系統（Design Tokens）

```css
:root {
    /* 背景色階 */
    --bg:         #0f1117;   /* 最底層背景 */
    --surface:    #1a1d27;   /* 卡片、側邊欄 */
    --surface2:   #222536;   /* 輸入框、hover 狀態 */
    --border:     #2e3247;   /* 所有邊框 */

    /* 語義色彩 */
    --high:       #ef4444;   /* 高風險 紅色 */
    --medium:     #f59e0b;   /* 中風險 黃色 */
    --low:        #22c55e;   /* 低風險 綠色 */
    --accent:     #4f7fff;   /* 主要互動色（藍色） */
}
```

**設計原則：** 使用 CSS Variables 統一管理色彩，修改一處即全域生效，維護性高。

### 6.3 App 物件（模組化 JavaScript）

前端採用 **IIFE（立即執行函式）+ 閉包**模式，封裝所有邏輯：

```javascript
const App = (() => {
    // 私有狀態（外部無法直接存取）
    let currentFlagId   = null;
    let currentSeverity = '';
    let managers        = [];

    // 私有方法
    async function loadFlags() { ... }
    async function renderFlagsTable() { ... }

    // 公開 API（只暴露需要的方法）
    return {
        init,
        toggleLang,
        openFlagDetail,
        resolveFlag,
        // ...
    };
})();
```

**優點：**
- 避免全域變數污染
- 狀態封裝，防止外部意外修改
- 清晰的公開 API 設計

### 6.4 非同步資料載入（fetch API）

```javascript
async function fetchJSON(url) {
    const r = await fetch(url);
    return r.json();
}

// 使用範例：
async function loadDashboard() {
    // 平行載入，效能最佳
    await Promise.all([loadStats(), loadFlags()]);
}
```

**重點：** 使用 `Promise.all()` 同時發送多個請求，避免串行等待，提升載入速度。

### 6.5 Debounce（防抖）搜尋

```javascript
// 用戶停止輸入 300ms 後才發送請求，避免每按一鍵就呼叫 API
document.getElementById('search-input').addEventListener('input',
    debounce(() => loadFlags(), 300)
);

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
```

### 6.6 XSS 防護

所有動態插入 HTML 的用戶資料，一律經過 `esc()` 函式處理：

```javascript
function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
```

---

## 7. 雙語國際化系統（i18n）

### 7.1 設計架構

```
TRANSLATIONS 物件
    ├── en（英文）: { 'key': '英文字串', ... }
    └── zh（中文）: { 'key': '中文字串', ... }

t('key')  →  依 currentLang 返回對應字串
```

### 7.2 核心實作

```javascript
// 當前語言（預設英文，儲存於 localStorage）
let currentLang = localStorage.getItem('kgi_lang') || 'en';

// 取得翻譯字串
function t(key) {
    return TRANSLATIONS[currentLang][key]   // 當前語言
        || TRANSLATIONS['en'][key]           // Fallback 英文
        || key;                              // 最終 Fallback 顯示 key 本身
}

// 套用翻譯到 DOM
function applyTranslations() {
    // 文字內容
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    // Placeholder 屬性
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    // Select Option 文字
    document.querySelectorAll('[data-i18n-opt]').forEach(el => {
        el.textContent = t(el.dataset.i18nOpt);
    });
}
```

### 7.3 HTML 標記方式

```html
<!-- 文字內容翻譯 -->
<h1 data-i18n="page.inbox.title">Risk Inbox</h1>

<!-- Placeholder 翻譯 -->
<input data-i18n-placeholder="filter.search" placeholder="Search…" />

<!-- Select Option 翻譯 -->
<option value="pending" data-i18n-opt="status.pending">Pending</option>
```

### 7.4 語言切換流程

```
用戶點擊「中文」按鈕
    │
    ▼
toggleLang()
    ├── currentLang = 'zh'
    ├── localStorage.setItem('kgi_lang', 'zh')  ← 記住偏好
    ├── applyTranslations()  ← 更新靜態 HTML 元素
    └── 重新渲染當前頁面（loadDashboard / loadRules / loadAuditLog）
            └── 所有動態生成的 HTML 使用 t() 重新產生中文版本
```

---

## 8. 資料流程圖

### 8.1 新作答被標記的完整流程

```
業務員完成訓練模組
    │
    ▼
POST /api/sessions/simulate（Demo 用）
或 P2/P3 系統上傳遙測資料
    │
    ▼
建立 Sessions 記錄
（儲存完成時間、分數、切換次數、遙測 JSON）
    │
    ▼
evaluate_session(session_id)
    │
    ├── 查詢所有 is_active = 1 的規則
    ├── 查詢該模組 avg_completion_seconds
    │
    ├── 逐一比對規則
    │   ├── SPEEDING     → comp_time < avg × threshold_pct%?
    │   ├── PATTERN_GUESSING → quiz_time ≤ 5s AND score = 0%?
    │   ├── DISTRACTION  → tab_switches > max?
    │   └── ...
    │
    ├── 觸發 → INSERT INTO FlaggedSessions
    │           └── severity = High → UPDATE Agents SET streak_shield_locked=1
    │
    └── 未觸發 → 無動作
```

### 8.2 主管處理標記的完整流程

```
主管在 Risk Inbox 看到待處理標記
    │
    ▼
點擊「審核」→ 開啟 Flag Detail Modal
    │
    ├── 載入作答詳細資料
    ├── 載入鑑識時間軸（telemetry_json）
    ├── 顯示違反規則說明與參數
    │
    ▼
主管填寫說明備註並選擇動作：
    ├── 「核准（誤報）」
    ├── 「作廢並要求重修」
    └── 「呈報人資」
    │
    ▼
POST /api/flagged-sessions/{id}/resolve
    │
    ├── UPDATE FlaggedSessions SET resolution_status = ?
    ├── INSERT INTO ComplianceAuditLog（永久記錄）
    │
    └── 依動作類型：
        ├── approve  → UPDATE Agents SET streak_shield_locked=0（解除保護鎖定）
        ├── void     → 保持鎖定，業務員需重修
        └── escalate → 保持鎖定，轉交 HR
```

---

## 9. API 端點說明

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/` | 返回 SPA 主頁面（index.html） |
| `GET` | `/api/stats` | 儀表板統計（各嚴重程度待處理數量） |
| `GET` | `/api/flagged-sessions` | 取得標記列表（支援 severity / status / search 篩選） |
| `GET` | `/api/flagged-sessions/<id>` | 取得單一標記詳細資料（含遙測時間軸、稽核歷程） |
| `POST` | `/api/flagged-sessions/<id>/resolve` | 處理標記（approve / void / escalate） |
| `GET` | `/api/rules` | 取得所有合規規則 |
| `PUT` | `/api/rules/<id>` | 更新規則（名稱、參數、嚴重程度、開關） |
| `POST` | `/api/rules` | 新增規則 |
| `GET` | `/api/audit-log` | 取得完整稽核日誌 |
| `GET` | `/api/agents` | 取得所有業務員 |
| `GET` | `/api/managers` | 取得所有主管 |
| `POST` | `/api/sessions/simulate` | 模擬提交一筆作答（Demo 用） |

### 9.1 回應格式範例

**GET /api/flagged-sessions**
```json
[
  {
    "flag_id": 1,
    "agent_name": "Henry Tsai",
    "branch": "Taipei Branch A",
    "module_name": "AML Compliance Fundamentals",
    "rule_name": "Impossible Speed Verification",
    "severity_level": "High",
    "completion_time_seconds": 38,
    "quiz_score": 75,
    "tab_switch_count": 1,
    "resolution_status": "pending",
    "flag_timestamp": "2026-04-08T13:44:00"
  }
]
```

**POST /api/flagged-sessions/1/resolve**
```json
// Request Body
{
  "action": "void",
  "notes": "業務員完成時間僅為平均的 8%，確認為作弊行為，要求重修。",
  "manager_id": 1
}

// Response
{
  "success": true,
  "new_status": "voided"
}
```

---

## 10. 安全性與稽核設計

### 10.1 不可竄改稽核日誌（Immutable Audit Trail）

`ComplianceAuditLog` 表的「不可竄改」設計：

1. **無 UPDATE / DELETE 路由**：後端 API 完全沒有對此表的修改端點
2. **強制備註**：前端驗證必須輸入 `manager_justification_notes`，空白拒絕送出
3. `AUTOINCREMENT` + `DEFAULT CURRENT_TIMESTAMP`：時間戳記由資料庫自動產生，防止偽造
4. **外鍵約束**：`PRAGMA foreign_keys = ON` 確保每筆日誌都有合法的 flag_id 和 manager_id

### 10.2 前端 XSS 防護

所有動態 HTML 內容透過 `esc()` 函式編碼，防止跨站腳本攻擊：
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`

### 10.3 API 輸入驗證

```python
# 動作白名單驗證
valid_actions = {"approve", "void", "escalate"}
if action not in valid_actions:
    return jsonify({"error": "Invalid action"}), 400

# 狀態防重複處理
if flag["resolution_status"] != "pending":
    return jsonify({"error": "Flag is already resolved"}), 409

# JSON 參數格式驗證
try:
    params = json.loads(parameter_json)
except:
    return jsonify({"error": "Invalid JSON"}), 400
```

---

## 11. 本機啟動指南

### 11.1 環境需求

| 需求 | 版本 |
|------|------|
| Python | 3.8 以上 |
| Flask | 3.0.0 以上 |
| 瀏覽器 | Chrome / Firefox / Safari（現代版本） |

### 11.2 啟動步驟

```bash
# 1. Clone 專案
git clone https://github.com/Robshao/kgi-compliance-dashboard.git
cd kgi-compliance-dashboard

# 2. 安裝依賴
pip3 install flask

# 3. 啟動伺服器
python3 app.py
```

### 11.3 訪問應用程式

開啟瀏覽器，前往：**http://localhost:5000**

> 首次執行會自動建立 `compliance.db` 並填入 15 筆示範作答資料及預設規則。

### 11.4 若 Port 5000 被佔用

```bash
PORT=8080 python3 app.py
# 然後訪問 http://localhost:8080
```

### 11.5 重置示範資料

```bash
# 刪除資料庫，下次啟動時會重新建立乾淨的示範資料
rm compliance.db
python3 app.py
```

---

## 附錄：技術決策摘要

| 決策 | 選擇 | 捨棄方案 | 原因 |
|------|------|----------|------|
| 資料庫 | SQLite | PostgreSQL / MySQL | 零設定、單檔、面試環境友善 |
| ORM | 原生 sqlite3 | SQLAlchemy | 減少依賴、SQL 邏輯直觀可見 |
| 前端框架 | Vanilla JS | React / Vue | 無需 Node.js、依賴最小化 |
| 規則儲存 | JSON 欄位 | 多張關聯表 | 動態擴充不需要改 Schema |
| 國際化 | 自建 i18n | i18next | 零依賴、適合小型專案 |
| 狀態管理 | IIFE 閉包 | Redux / Vuex | 無需框架、結構清晰 |

---

*文件版本：1.0 · 最後更新：2026-04-14*
