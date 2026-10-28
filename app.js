'use strict';

/* ========== 工具 ========== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const now = () => Date.now();
const pad = n => String(n).padStart(2, '0');
const ymd = d => { d = new Date(d); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const weekStart = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return addDays(x, -x.getDay()); };
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
const md = d => { d = new Date(d); return `${d.getMonth() + 1}月${d.getDate()}日`; };
const mdSlash = d => { d = new Date(d); return `${d.getMonth() + 1}/${d.getDate()}`; };
const fmtTime = t => { const d = new Date(t); return `${ymd(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const toLocalInput = ts => { if (!ts) return ''; const d = new Date(ts); return `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fromLocalInput = v => (v ? new Date(v).getTime() || 0 : 0);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => ymd(new Date());
const firstLine = s => String(s || '').split('\n')[0];
// 页面结构和脚本版本不一致时（如浏览器缓存），缺失的区块直接跳过，不让整页报错
const setHTML = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 隐私模式等 */ } };

const ICON = {
  list: '<svg viewBox="0 0 24 24"><path d="M10 6h10M10 12h10M10 18h10M4 5l1.5 1.5L8 4M4 12h3M4 18h3"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2 1.5M9.5 3h5M12 3v3.5"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M9 21h6"/></svg>',
  prd: '<svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 12h6M10 15.5h6M10 19h3"/></svg>',
  jump: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  filter: '<svg viewBox="0 0 24 24"><path d="M4 5h16l-6 7.5V19l-4-2v-4.5z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h1M12 9h4M8 15h1M12 15h4"/></svg>',
};

/* ========== 数据 ========== */
const LS_DATA = 'wb.data', LS_CFG = 'wb.cfg', LS_UI = 'wb.ui';
const COLORS = ['#e05a4f', '#f0a032', '#8f62e0', '#3fae74', '#4a83e6', '#6f6a60', '#d4609e', '#2fa8b5'];
const MEETING_TYPES = ['周会', '需求评审', '客户沟通', '项目同步', '复盘', '其他'];
const STATUS = { todo: '未完成', doing: '进行中', done: '已完成' };
const COLLECTIONS = ['projects', 'tasks', 'meetings'];

// 每条记录都带 u（最后修改时间），删除只打 deletedAt 标记，多端合并时逐条取较新的版本
// 项目名属于个人数据，不写在公开代码里，只保存在本地和私有数据仓库中
function blank() {
  return {
    projects: [],
    tasks: [],
    meetings: [],
    updatedAt: 0,
  };
}
let db = load(LS_DATA, null) || blank();
for (const k of COLLECTIONS) db[k] ||= [];

const ui = Object.assign({
  project: 'all', tab: 'board', more: false, doneOpen: false, delOpen: false,
  calMode: 'week', calDate: today(), meetMore: false,
  mq: '', mProject: 'all', mType: 'all', mFrom: '', mTo: '',
}, load(LS_UI, {}));
const saveUi = () => store(LS_UI, ui);

const projects = () => db.projects.filter(p => !p.deletedAt).sort((a, b) => a.order - b.order);
const projectOf = id => db.projects.find(p => p.id === id);
const inScope = x => ui.project === 'all' || x.project === ui.project;
const liveTasks = () => db.tasks.filter(t => !t.deletedAt && inScope(t));
const liveMeetings = () => db.meetings.filter(m => !m.deletedAt && inScope(m));

function commit() {
  db.updatedAt = now();
  store(LS_DATA, db);
  render();
  scheduleSync();
}
function patch(obj, fields) { Object.assign(obj, fields, { u: now() }); commit(); }

/* ========== 任务操作 ========== */
// 变更记录：每次状态变化写入 t.log；旧数据没有 log 时按时间戳推算
const LOG_TEXT = { create: '创建', start: '开始处理', pause: '退回未完成', done: '完成', reopen: '撤回到进行中', delete: '删除', restore: '恢复' };
function logOf(t) {
  if (t.log?.length) return [...t.log].sort((a, b) => a.t - b.t);
  const l = [{ a: 'create', t: t.createdAt }];
  if (t.startedAt) l.push({ a: 'start', t: t.startedAt });
  if (t.doneAt) l.push({ a: 'done', t: t.doneAt });
  if (t.deletedAt) l.push({ a: 'delete', t: t.deletedAt });
  return l;
}
const withLog = (t, a, at = now()) => [...logOf(t), { a, t: at }];
// 手动修改创建/开始/完成时间后，让对应的记录跟着变
function retimeLog(log, kind, ts) {
  const idx = kind === 'create' ? log.findIndex(e => e.a === 'create')
    : log.map(e => e.a).lastIndexOf(kind);  // startedAt 对应最近一次「开始处理」，撤回不改它
  if (idx >= 0) log[idx] = { ...log[idx], t: ts };
  return log.sort((a, b) => a.t - b.t);
}
function fmtDur(ms) {
  const m = Math.max(0, Math.round(ms / 6e4));
  if (m < 60) return `${m}分钟`;
  const h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d) return `${d}天${h % 24 ? (h % 24) + '小时' : ''}`;
  return `${h}小时${m % 60 ? (m % 60) + '分' : ''}`;
}

function addTask(text, opts = {}) {
  text = text.trim();
  if (!text) return;
  const t = {
    id: uid(), text, project: opts.project || (ui.project !== 'all' ? ui.project : ''),
    status: 'todo', due: opts.due || '', note: opts.note || '', parent: opts.parent || '', meeting: opts.meeting || '',
    createdAt: now(), startedAt: 0, doneAt: 0, deletedAt: 0, u: now(),
  };
  t.log = [{ a: 'create', t: t.createdAt }];
  db.tasks.push(t);
  if (!opts.silent) commit();
  return t;
}
function setStatus(t, status) {
  if (status === t.status) return;
  const a = status === 'done' ? 'done' : status === 'todo' ? 'pause' : t.status === 'done' ? 'reopen' : 'start';
  const f = { status, log: withLog(t, a) };
  if (status === 'doing') { f.startedAt = t.startedAt || now(); f.doneAt = 0; }
  if (status === 'done') { f.doneAt = now(); f.startedAt = t.startedAt || now(); }
  if (status === 'todo') { f.startedAt = 0; f.doneAt = 0; }
  patch(t, f);
}
function removeTask(t) {
  const log = t.log;
  patch(t, { deletedAt: now(), log: withLog(t, 'delete') });
  toast('已删除，可在「已删除」中找回', () => patch(t, { deletedAt: 0, log }));
}

/* ========== 渲染 ========== */
function render() {
  renderNav();
  renderHeader();
  renderStats();
  $$('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === ui.tab));
  const v = $('#view');
  if (!v) return;
  // 重绘时保留输入框里还没提交的内容和焦点
  const kept = $$('#view form [name]').map(el => [el.form.id, el.name, el.value]);
  const af = document.activeElement;
  const focus = af?.form?.id && af.name && v.contains(af) ? [af.form.id, af.name] : null;
  if (ui.tab === 'calendar') ui.tab = 'board';  // 完成日历已固定显示在标签栏上方
  setHTML('#calendar', viewCalendar());
  if (ui.tab === 'board') v.innerHTML = viewBoard();
  else v.innerHTML = viewMeetings();
  for (const [f, n, val] of kept) { const el = $(`#${f} [name="${n}"]`); if (el) el.value = val; }
  if (focus) $(`#${focus[0]} [name="${focus[1]}"]`)?.focus();
}

function renderNav() {
  const open = db.tasks.filter(t => !t.deletedAt && t.status !== 'done');
  const cnt = id => open.filter(t => t.project === id).length;
  setHTML('#projectNav', `
    <button class="nav-item ${ui.project === 'all' ? 'active' : ''}" data-act="project" data-id="all">
      <span class="all-icon">${ICON.grid}</span>全部项目<span class="count">${open.length || ''}</span>
    </button>
    <div class="nav-sep"></div>
    ${projects().map(p => `
      <button class="nav-item ${ui.project === p.id ? 'active' : ''}" data-act="project" data-id="${p.id}">
        <span class="dot" style="background:${p.color}"></span>${esc(p.name)}
        <span class="count">${cnt(p.id) || ''}</span>
        <span class="edit" data-act="project-edit" data-id="${p.id}" title="编辑项目">✎</span>
      </button>`).join('') || '<div class="nav-empty">还没有项目</div>'}
    <button class="nav-add" data-act="project-add">${ICON.plus}新建项目</button>`);
}

// 配色：白色 / 护眼色，记在本机浏览器
function applyTheme(theme) {
  theme = theme === 'white' ? 'white' : 'eye';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('wb.theme', theme); } catch { /* 隐私模式 */ }
  $$('[data-theme-set]').forEach(b => b.classList.toggle('on', b.dataset.themeSet === theme));
}

function renderHeader() {
  const d = new Date();
  const tl = $('#todayLabel');
  if (tl) tl.textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 周${WEEK[d.getDay()]}`;
  renderSync();
}

function weekMeetings() {
  const s = ymd(weekStart(new Date())), e = ymd(addDays(weekStart(new Date()), 6));
  return liveMeetings().filter(m => m.date >= s && m.date <= e);
}

function renderStats() {
  const tasks = liveTasks(), t0 = today();
  const open = tasks.filter(t => t.status !== 'done' && t.due);
  const overdue = open.filter(isOverdue).length;
  const dueToday = open.filter(t => dueDay(t) === t0 && !isOverdue(t)).length;
  const doing = tasks.filter(t => t.status === 'doing').length;
  const wm = weekMeetings().length;
  const item = (cls, icon, label, num, unit, extra = '') => `
    <div class="stat"><span class="stat-icon ${cls}">${icon}</span><div>
      <div class="stat-label">${label}</div>
      <div class="stat-num">${num}<small>${unit}</small>${extra}</div></div></div>`;
  setHTML('#stats',
    item('orange', ICON.list, '今日到期', dueToday, '项', overdue ? `<span class="warn">逾期 ${overdue}</span>` : '') +
    item('green', ICON.play, '进行中', doing, '项') +
    item('purple', ICON.chat, '本周会议', wm, '场'));
}

const projectOptions = (sel, allLabel) =>
  (allLabel ? `<option value="all">${allLabel}</option>` : '<option value="">无项目</option>') +
  projects().map(p => `<option value="${p.id}" ${sel === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('');

function projectTag(id) {
  const p = projectOf(id);
  return p && !p.deletedAt ? `<span class="tag"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</span>` : '';
}
// 截止时间：'YYYY-MM-DD'（当天结束前）或 'YYYY-MM-DDTHH:mm'
const dueDay = t => t.due.slice(0, 10);
const dueClock = t => t.due.slice(11, 16);
const dueTs = t => (dueClock(t) ? new Date(t.due).getTime() : addDays(parseYmd(dueDay(t)), 1).getTime() - 1);
const isOverdue = t => !!t.due && t.status !== 'done' && now() > dueTs(t);
const readDue = (f, prefix = 'due') => {
  const d = f.get(prefix + 'Date'), tm = f.get(prefix + 'Time');
  return d ? (tm ? `${d}T${tm}` : d) : '';
};
const dueFields = (due = '') => `<div class="due-pair">
  <input class="field" type="date" name="dueDate" value="${esc(due.slice(0, 10))}">
  <input class="field" type="time" name="dueTime" value="${esc(due.slice(11, 16))}" title="时间可不填">
</div>`;
function dueTag(t) {
  if (!t.due || t.status === 'done') return '';
  const clock = dueClock(t) ? ' ' + dueClock(t) : '';
  if (isOverdue(t)) return `<span class="tag red">已逾期 ${dueDay(t) === today() ? '今天' : md(parseYmd(dueDay(t)))}${clock}</span>`;
  if (dueDay(t) === today()) return `<span class="tag orange">今天${clock}到期</span>`;
  return `<span class="tag">截止 ${md(parseYmd(dueDay(t)))}${clock}</span>`;
}

/* ----- 工时 ----- */
// 只算工作日（周一至周五）上班时段内、处于「进行期」的时间；午休不计
const WORK_WINDOWS = [[[9, 0], [12, 0]], [[13, 30], [18, 30]]];
const WORK_LABEL = WORK_WINDOWS.map(w => w.map(([h, m]) => `${pad(h)}:${pad(m)}`).join('–')).join('、');
function workMs(a, b) {
  let total = 0;
  for (let d = new Date(a); d.setHours(0, 0, 0, 0), d.getTime() < b; d.setDate(d.getDate() + 1)) {
    const wd = d.getDay();
    if (wd === 0 || wd === 6) continue;
    for (const [[sh, sm], [eh, em]] of WORK_WINDOWS) {
      const ws = new Date(d).setHours(sh, sm, 0, 0), we = new Date(d).setHours(eh, em, 0, 0);
      total += Math.max(0, Math.min(b, we) - Math.max(a, ws));
    }
  }
  return total;
}
const workHours = t => phasesOf(t, t.doneAt || now()).segs.filter(g => g.s === 'doing').reduce((n, g) => n + workMs(g.a, g.b), 0) / 36e5;
const fmtHours = h => (h > 0 && h < 0.05 ? '<0.1' : String(Math.round(h * 10) / 10)) + '小时';

/* ----- 关联任务 ----- */
// 子任务记录 parent；卡片上显示「接：上一步」和「后续 N」
function relTags(t) {
  const parent = t.parent && findTask(t.parent);
  const kids = db.tasks.filter(x => x.parent === t.id && !x.deletedAt);
  const meeting = t.meeting && db.meetings.find(m => m.id === t.meeting && !m.deletedAt);
  return (meeting ? `<span class="rel" data-act="meet-open" data-id="${meeting.id}" title="来自会议：${esc(meeting.title)}">↳ 会议：${esc(meeting.title)}</span>` : '')
    + (parent ? `<span class="rel" data-act="goto-task" data-id="${parent.id}" title="上一步：${esc(parent.text)}">↳ 接：${esc(firstLine(parent.text))}</span>` : '')
    + (kids.length ? `<span class="rel" data-act="goto-task" data-id="${kids[kids.length - 1].id}" title="后续任务：\n${esc(kids.map(k => firstLine(k.text)).join('\n'))}">→ 后续 ${kids.length}</span>` : '');
}
function newNextTask(t) {
  openDialog(`<form>
    <h3>新建关联任务</h3>
    <p class="hint">上一步：${esc(firstLine(t.text))}</p>
    <label>下一步要做什么<textarea class="field" name="text" required placeholder="例如：同步信息到群里"></textarea></label>
    <div class="grid2">
      <label>项目<select class="field" name="project">${projectOptions(t.project)}</select></label>
      <label>截止时间（可不填）${dueFields()}</label>
    </div>
    <label>备注<input class="field" name="note" placeholder="可选"></label>
    <label class="inline-check"><input type="checkbox" name="finish">同时把上一步标记为完成</label>
    <div class="acts">
      <button type="button" class="btn" data-close>取消</button>
      <button class="btn primary">创建</button>
    </div>
  </form>`, f => {
    const next = addTask(f.get('text'), { project: f.get('project'), due: readDue(f), note: f.get('note') || '', parent: t.id });
    if (!next) return false;
    if (f.get('finish')) setStatus(t, 'done');
    setTimeout(() => flashTask(next.id));
  });
  const ta = $('#dlg textarea');
  ta.focus();
  ta.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); ta.form.requestSubmit(); } };
}
function flashTask(id) {
  const el = document.getElementById('t-' + id);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  return true;
}

/* ----- 待办看板 ----- */
// 第一行作标题，其余作描述
function cardText(text) {
  const [title, ...rest] = text.split('\n');
  const desc = rest.join('\n').trim();
  return `<div class="card-title">${esc(title)}</div>${desc ? `<div class="card-desc">${esc(desc)}</div>` : ''}`;
}
const shortTime = ts => { const d = new Date(ts); return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

function viewBoard() {
  const tasks = liveTasks();
  const byCreated = (a, b) => a.createdAt - b.createdAt;
  const todo = tasks.filter(t => t.status === 'todo').sort(byCreated);
  const doing = tasks.filter(t => t.status === 'doing').sort((a, b) => a.startedAt - b.startedAt);
  const done = tasks.filter(t => t.status === 'done').sort((a, b) => b.doneAt - a.doneAt);
  const deleted = db.tasks.filter(t => t.deletedAt && !t.purged && inScope(t)).sort((a, b) => b.deletedAt - a.deletedAt);

  const cardBody = t => `
      <div class="card-text" data-act="task-edit" data-id="${t.id}" title="点击编辑">${cardText(t.text)}</div>
      ${t.note?.trim() ? `<div class="card-note" data-act="task-edit" data-id="${t.id}">${esc(t.note.trim())}</div>` : ''}
      <div class="card-meta">${ui.project === 'all' ? projectTag(t.project) : ''}${dueTag(t)}${relTags(t)}<span class="card-time">${t.status === 'todo' ? '创建 ' + shortTime(t.createdAt) : '开始 ' + shortTime(t.startedAt)}</span></div>`;
  // 操作按钮放在卡片右侧，不单独占一行；进行中卡片为「完成」+ 一排小图标
  const card = t => t.status === 'todo' ? `
    <div class="card todo-card" id="t-${t.id}">
      <div class="card-main">${cardBody(t)}</div>
      <div class="card-side">
        <button class="start-btn" data-act="task-start" data-id="${t.id}" title="开始处理">${ICON.play}<span class="lbl">开始处理</span></button>
        <button class="icon-btn" data-act="task-del" data-id="${t.id}" title="删除">${ICON.x}</button>
      </div>
    </div>` : `
    <div class="card todo-card doing-card" id="t-${t.id}">
      <div class="card-main">${cardBody(t)}</div>
      <div class="card-side stack">
        <button class="start-btn" data-act="task-done" data-id="${t.id}" title="完成">${ICON.check}<span class="lbl">完成</span></button>
        <div class="side-icons">
          <button class="icon-btn back" data-act="task-back" data-id="${t.id}" title="回退到未完成">${ICON.undo}</button>
          <button class="icon-btn go" data-act="task-next" data-id="${t.id}" title="新建关联任务（下一步）">${ICON.arrow}</button>
          <button class="icon-btn" data-act="task-del" data-id="${t.id}" title="删除">${ICON.x}</button>
        </div>
      </div>
    </div>`;

  return `
    <form class="panel composer" id="taskForm" autocomplete="off">
      <div class="composer-row">
        ${ICON.plus}
        <input class="composer-input" name="text" id="taskInput" placeholder="输入待办，回车保存">
        <button type="button" class="btn" data-act="toggle-more">${ICON.filter}更多${ICON.down}</button>
        <button type="submit" class="btn">添加</button>
      </div>
      ${`<div class="composer-more" ${ui.more ? '' : 'hidden'}>
        <label>项目<select class="field" name="project">${projectOptions(ui.project !== 'all' ? ui.project : '')}</select></label>
        <label class="span2">截止时间（可只填日期）${dueFields()}</label>
        <label class="wide">备注<input class="field" name="note" placeholder="可选"></label>
      </div>`}
    </form>

    <div class="board">
      <div class="panel col todo">
        <div class="col-head"><span class="dot" style="background:var(--orange)"></span>未完成<span class="n">${todo.length}</span></div>
        <div class="col-body">${todo.map(card).join('') || '<div class="empty">暂无待办，按 N 快速新建</div>'}</div>
      </div>
      <div class="panel col doing">
        <div class="col-head"><span class="dot" style="background:var(--green)"></span>进行中<span class="n">${doing.length}</span></div>
        <div class="col-body">${doing.map(card).join('') || '<div class="empty">勾选「开始处理」后任务会出现在这里</div>'}</div>
      </div>
    </div>

    <div class="panel fold ${ui.doneOpen ? 'open' : ''}">
      <button class="fold-head" data-act="fold" data-key="doneOpen"><span class="dot" style="background:var(--green)"></span>已完成<span class="n">${done.length}</span><span class="chev">${ICON.down}</span></button>
      ${ui.doneOpen ? `<div class="fold-body">${done.length ? `<div class="done-grid">${done.map(t => {
        const d = new Date(t.doneAt);
        return `<div class="card done-card" id="t-${t.id}">
          <div class="card-title strike" data-act="task-edit" data-id="${t.id}" title="${esc(t.text)}">${esc(firstLine(t.text))}</div>
          <div class="done-meta">
            <span class="dm" title="完成时间">${ICON.clock}<b class="mono">${mdSlash(d)} 周${WEEK[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}</b></span>
            <span class="dm" title="工时：工作日 ${WORK_LABEL} 内的进行时长（午休不计）">${ICON.timer}${fmtHours(workHours(t))}</span>
            ${ui.project === 'all' ? projectTag(t.project) : ''}${relTags(t)}
          </div>
          <div class="card-foot">
            <button class="reopen-btn" data-act="task-reopen" data-id="${t.id}">重新打开</button>
            <button class="icon-btn" data-act="task-del" data-id="${t.id}" title="删除">${ICON.x}</button>
          </div>
        </div>`;
      }).join('')}</div>` : '<div class="empty">还没有完成的任务</div>'}</div>` : ''}
    </div>

    <div class="panel fold ${ui.delOpen ? 'open' : ''}">
      <button class="fold-head" data-act="fold" data-key="delOpen"><span class="dot" style="background:var(--faint)"></span>已删除<span class="n">${deleted.length}</span><span class="chev">${ICON.down}</span></button>
      ${ui.delOpen ? `<div class="fold-body">${deleted.length ? `<div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>任务</th><th>项目</th><th>删除前状态</th><th>创建时间</th><th>删除时间</th><th></th></tr></thead>
        <tbody>${deleted.map(t => `<tr>
          <td class="t" title="${esc(t.text)}">${esc(firstLine(t.text))}</td>
          <td>${projectTag(t.project) || '<span class="tag">—</span>'}</td>
          <td>${STATUS[t.status]}</td>
          <td class="mono row-time">${fmtTime(t.createdAt)}</td>
          <td class="mono row-time">${fmtTime(t.deletedAt)}</td>
          <td class="ops"><button class="btn sm" data-act="task-restore" data-id="${t.id}">恢复</button>
            <button class="btn sm danger" data-act="task-purge" data-id="${t.id}">彻底删除</button></td>
        </tr>`).join('')}</tbody></table></div>` : '<div class="empty">没有删除记录</div>'}</div>` : ''}
    </div>`;
}

/* ----- 完成日历 ----- */
const statusColor = s => ({ todo: 'var(--orange)', doing: 'var(--faint)', done: 'var(--green)' }[s]);

function viewCalendar() {
  const base = parseYmd(ui.calDate);
  let range, body;
  if (ui.calMode === 'week') {
    const s = weekStart(base), e = addDays(s, 6);
    range = `${md(s)} - ${md(e)}`;
    body = weekView(s);
  } else {
    range = `${base.getFullYear()}年${base.getMonth() + 1}月`;
    body = monthView(base);
  }
  return `
    <div class="panel cal">
      <div class="cal-head">
        <div class="cal-title">完成日历</div>
        <div class="seg">
          <button class="${ui.calMode === 'week' ? 'active' : ''}" data-act="cal-mode" data-mode="week">周视图</button>
          <button class="${ui.calMode === 'month' ? 'active' : ''}" data-act="cal-mode" data-mode="month">月视图</button>
        </div>
        <div class="cal-nav">
          <button class="icon-btn" data-act="cal-move" data-d="-1" title="上一页">${ICON.left}</button>
          <span class="range">${range}</span>
          <button class="icon-btn" data-act="cal-move" data-d="1" title="下一页">${ICON.right}</button>
          <button class="btn" data-act="cal-today">今天</button>
        </div>
      </div>
      <div class="legend">${ui.calMode === 'week' ? `
        <span><i class="mk-mini"></i>创建</span><span><i class="ph-todo"></i>待办期</span><span><i class="mk-mini start"></i>开始</span>
        <span><i class="ph-doing"></i>进行期</span><span><i class="mk-mini done"></i>完成</span><span><i class="lg-now"></i>现在</span>` : `
        <span><i class="ev-done"></i>当天完成的任务</span>`}
      </div>
      <div class="cal-scroll">${body}</div>
    </div>`;
}

// 把变更记录切成阶段：待办期 / 进行期，以及创建、开始、完成三个节点
function phasesOf(t, cap = now()) {
  const STATE = { create: 'todo', start: 'doing', reopen: 'doing', pause: 'todo', done: 'done' };
  const segs = [], marks = [];
  let state = null, from = 0;
  for (const e of logOf(t)) {
    const next = STATE[e.a];
    if (!next) continue;
    if (state && state !== 'done' && e.t > from) segs.push({ s: state, a: from, b: e.t });
    if (e.a === 'create' || e.a === 'start' || e.a === 'done') marks.push({ k: e.a, t: e.t });
    state = next; from = e.t;
  }
  if (state && state !== 'done') segs.push({ s: state, a: from, b: Math.max(cap, from) });
  return { segs, marks };
}
const PHASE = { todo: '待办期', doing: '进行期' };

function weekView(s) {
  const days = [...Array(7)].map((_, i) => ymd(addDays(s, i)));
  const t0 = today(), nowTs = now();
  const ws = s.getTime(), we = addDays(s, 7).getTime();
  const pct = x => ((Math.min(Math.max(x, ws), we) - ws) / (we - ws)) * 100;
  const inWeek = x => x >= ws && x < we;
  const nowLine = inWeek(nowTs) ? `<i class="wk-now" style="left:${pct(nowTs)}%"></i>` : '';

  // 文字说明放在空间更大的一侧
  const note = (startTs, endTs, html) => {
    const a = pct(startTs), b = pct(endTs);
    return 100 - b >= a
      ? `<span class="wk-note" style="left:calc(${b}% + 12px)">${html}</span>`
      : `<span class="wk-note" style="right:calc(${100 - a}% + 12px)">${html}</span>`;
  };

  // 周视图只看进行中的任务（含它之前的待办期）
  const rows = liveTasks().filter(t => t.status === 'doing').map(t => {
    const { segs, marks } = phasesOf(t, nowTs);
    const visible = segs.some(g => g.a < we && g.b > ws) || marks.some(m => inWeek(m.t));
    if (!visible) return null;
    const first = Math.min(...segs.map(g => g.a), ...marks.map(m => m.t));
    const last = Math.max(...segs.map(g => g.b), ...marks.map(m => m.t));
    const segHtml = segs.filter(g => g.a < we && g.b > ws).map(g => {
      const l = pct(g.a), w = pct(g.b) - l;
      const cls = `ph ph-${g.s}${g.a < ws ? ' cut-l' : ''}${g.b > we ? ' cut-r' : ''}`;
      const tip = `${PHASE[g.s]}：${shortTime(g.a)} → ${g.b >= nowTs - 6e4 && t.status === g.s ? '现在' : shortTime(g.b)}（${fmtDur(g.b - g.a)}）`;
      return `<div class="${cls}" style="left:${l}%;width:${w}%" title="${tip}"></div>`;
    }).join('');
    const markHtml = marks.filter(m => inWeek(m.t)).map(m =>
      `<span class="mk mk-${m.k}" style="left:${pct(m.t)}%" title="${LOG_TEXT[m.k]} ${shortTime(m.t)}">${m.k === 'done' ? ICON.check : ''}</span>`).join('');
    const created = marks.find(m => m.k === 'create')?.t ?? first;
    const text = t.status === 'done'
      ? `<b class="ok">完成</b> ${shortTime(t.doneAt)} · 共 ${fmtDur(t.doneAt - created)}`
      : t.status === 'doing' ? `<b class="ing">进行中</b> 已 ${fmtDur(nowTs - t.startedAt)}`
      : `<b class="wait">待开始</b> 已等 ${fmtDur(nowTs - t.createdAt)}`;
    return { t, first, html: `<div class="week-row">
      <div class="wk-label" style="grid-column:1" data-act="task-edit" data-id="${t.id}" title="${esc(t.text)}"><span class="dot" style="background:${statusColor(t.status)}"></span><span>${esc(firstLine(t.text))}</span></div>
      ${cells()}
      <div class="wk-track" data-act="task-edit" data-id="${t.id}">${segHtml}${markHtml}${note(Math.max(first, ws), Math.min(last, we), text)}${nowLine}</div>
    </div>` };
  }).filter(Boolean).sort((a, b) => a.first - b.first);

  function cells() { return days.map((d, i) => `<div class="wk-cell ${d === t0 ? 'is-today' : ''}" style="grid-column:${i + 2}"></div>`).join(''); }

  return `<div class="week">
    <div class="week-row head"><div>任务</div>${days.map((d, i) => `<div class="${d === t0 ? 'is-today' : ''}">${WEEK[i]}<b>${mdSlash(parseYmd(d))}</b></div>`).join('')}</div>
    ${rows.map(r => r.html).join('')}
    ${rows.length ? '' : `<div class="week-row"><div class="empty" style="grid-column:1/-1">本周没有进行中的任务</div></div>`}
  </div>`;
}

function monthView(base) {
  const y = base.getFullYear(), mo = base.getMonth();
  const start = weekStart(new Date(y, mo, 1));
  const lastDay = new Date(y, mo + 1, 0);
  const weeks = Math.ceil((Math.round((lastDay - start) / 864e5) + 1) / 7);
  const t0 = today();
  // 月视图只看已完成的任务，按完成时间归到当天
  const done = liveTasks().filter(t => t.status === 'done' && t.doneAt).sort((a, b) => a.doneAt - b.doneAt);
  const cells = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i), ds = ymd(d);
    const items = done.filter(t => ymd(t.doneAt) === ds).map(t => ({
      cls: 'ev-done', text: firstLine(t.text), act: 'task-edit', id: t.id,
      tip: `${shortTime(t.doneAt)} 完成 · 共 ${fmtDur(t.doneAt - t.createdAt)}\n${t.text}`,
    }));
    const shown = items.slice(0, 3);
    cells.push({ has: items.length > 0, html: `<div class="m-cell ${d.getMonth() !== mo ? 'out' : ''} ${ds === t0 ? 'is-today' : ''}">
      <span class="m-day">${d.getDate()}</span>${items.length ? `<span class="m-count">✓ ${items.length}</span>` : ''}
      ${shown.map(it => `<div class="m-chip ${it.cls}" data-act="${it.act}" data-id="${it.id}" title="${esc(it.tip)}">${esc(it.text)}</div>`).join('')}
      ${items.length > 3 ? `<span class="m-more" title="${esc(items.slice(3).map(i => i.text).join('\n'))}">+${items.length - 3} 项</span>` : ''}
    </div>` });
  }
  // 整周都没有完成任务的那一行压矮
  const rowsHtml = [];
  for (let w = 0; w < weeks; w++) {
    const wk = cells.slice(w * 7, w * 7 + 7);
    rowsHtml.push(`<div class="month-row ${wk.some(c => c.has) ? '' : 'slim'}">${wk.map(c => c.html).join('')}</div>`);
  }
  return `<div class="month"><div class="month-head">${WEEK.map(w => `<div>周${w}</div>`).join('')}</div>${rowsHtml.join('')}</div>`;
}

/* ----- 会议索引 ----- */
function filteredMeetings() {
  const q = ui.mq.trim().toLowerCase();
  return db.meetings.filter(m => !m.deletedAt)
    .filter(m => (ui.project === 'all' || m.project === ui.project) && (ui.mProject === 'all' || m.project === ui.mProject))
    .filter(m => ui.mType === 'all' || m.type === ui.mType)
    .filter(m => (!ui.mFrom || m.date >= ui.mFrom) && (!ui.mTo || m.date <= ui.mTo))
    .filter(m => !q || [m.title, m.summary, m.points, m.conclusion, m.myTodos, m.othersTodos, ...(m.docs || []).map(d => d.name)].some(s => (s || '').toLowerCase().includes(q)))
    .sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start));
}

function nowSlot() {
  const d = new Date(); d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  const e = new Date(d.getTime() + 36e5);
  return [ymd(d), `${pad(d.getHours())}:${pad(d.getMinutes())}`, `${pad(e.getHours())}:${pad(e.getMinutes())}`];
}

function meetingFields(m = {}, inDialog = false) {
  const [d, s, e] = nowSlot();
  return `
    <label><span>会议纪要链接 <span class="req">*</span></span><input class="field" type="url" name="link" value="${esc(m.link)}" placeholder="https://xxx.feishu.cn/docx/…"${inDialog ? ' required' : ''}></label>
    <div class="grid3">
      <label>日期<input class="field" type="date" name="date" value="${esc(m.date || d)}" required></label>
      <label>开始<input class="field" type="time" name="start" value="${esc(m.start ?? s)}"></label>
      <label>结束<input class="field" type="time" name="end" value="${esc(m.end ?? e)}"></label>
    </div>
    <div class="grid2">
      <label>会议类型<select class="field" name="type">${MEETING_TYPES.map(t => `<option ${(m.type || '其他') === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label>关联项目<select class="field" name="project">${projectOptions(m.project ?? (ui.project !== 'all' ? ui.project : ''))}</select></label>
    </div>
    <label>一句话总结<input class="field" name="summary" value="${esc(m.summary)}" placeholder="卡片上只显示这一句"></label>
    <label>讨论要点<textarea class="field" name="points">${esc(m.points)}</textarea></label>
    <label>结论<textarea class="field" name="conclusion">${esc(m.conclusion)}</textarea></label>
    <label><span>我的待办 <span class="hint-inline">每行一条，保存时新行自动生成待办并关联；删掉某行不会删除已生成的待办</span></span><textarea class="field" name="myTodos">${esc(m.myTodos)}</textarea></label>
    <label>他人待办<textarea class="field" name="othersTodos" placeholder="例如：@叙璋 周四前确认结算规则">${esc(m.othersTodos)}</textarea></label>`;
}

function viewMeetings() {
  const list = filteredMeetings();
  return `
    <form class="panel composer" id="meetForm" autocomplete="off">
      <div class="composer-row">
        ${ICON.plus}
        <input class="composer-input" name="title" id="meetInput" placeholder="粘贴「会议名称 + 会议纪要链接」，回车归档">
        <button type="button" class="btn" data-act="toggle-meet-more">${ICON.filter}更多${ICON.down}</button>
        <button type="submit" class="btn">添加</button>
      </div>
      <div class="composer-more inline-form" ${ui.meetMore ? '' : 'hidden'}>${meetingFields()}<p class="hint">PRD 等其他文档可以在归档后点 ✎ 编辑添加。</p></div>
    </form>

    <div class="panel filters">
      <label class="search">${ICON.search}<input id="mq" placeholder="搜索会议名称、文档名、要点、结论…" value="${esc(ui.mq)}"></label>
      <select class="field" id="mProject">${projectOptions(ui.mProject, '全部项目')}</select>
      <select class="field" id="mType"><option value="all">全部类型</option>${MEETING_TYPES.map(t => `<option ${ui.mType === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
      <input class="field" type="date" id="mFrom" value="${esc(ui.mFrom)}"><span class="to">至</span><input class="field" type="date" id="mTo" value="${esc(ui.mTo)}">
      ${ui.mq || ui.mProject !== 'all' || ui.mType !== 'all' || ui.mFrom || ui.mTo ? '<button class="btn sm" data-act="meet-clear">清除筛选</button>' : ''}
    </div>

    <p class="list-meta">共 <span class="mono">${list.length}</span> 场会议</p>
    <div class="meet-list">${list.map(meetCard).join('') || '<div class="panel empty">没有符合条件的会议记录</div>'}</div>`;
}

// 会议卡片：标题行带类型、项目标签；右侧每个文档一个图标按钮（🎤 纪要 / 📄 PRD / ↗ 其他），竖线后是编辑（删除放在编辑窗口里）
function meetCard(m) {
  const d = parseYmd(m.date);
  const time = m.start ? ` ${esc(m.start)}${m.end ? '–' + esc(m.end) : ''}` : '';
  return `<div class="card meet-card" id="m-${m.id}" data-act="meet-open" data-id="${m.id}">
    <div class="card-main">
      <div class="meet-head"><span class="meet-name">${esc(m.title)}</span><span class="tag purple">${esc(m.type || '其他')}</span>${projectTag(m.project)}</div>
      <div class="meet-when">${mdSlash(d)} 周${WEEK[d.getDay()]}${time}</div>
      ${m.summary ? `<div class="meet-preview">${esc(m.summary)}</div>` : ''}
    </div>
    ${meetActs(m)}
  </div>`;
}

const meetDocBtn = (url, icon, title) =>
  `<a class="doc-btn" href="${esc(url)}" target="_blank" rel="noopener" title="${esc(title)}">${icon}</a>`;
function meetActs(m) {
  return `<div class="meet-acts">
      ${m.link ? meetDocBtn(m.link, ICON.mic, '会议纪要')
        : `<button class="doc-btn missing" data-act="meet-edit" data-id="${m.id}" title="还没有会议纪要链接，点击补充">${ICON.mic}</button>`}
      ${(m.docs || []).map(doc => meetDocBtn(doc.url, doc.kind === 'prd' ? ICON.prd : ICON.jump, doc.name || (doc.kind === 'prd' ? 'PRD' : '文档'))).join('')}
      <span class="acts-sep"></span>
      <button class="ib" data-act="meet-edit" data-id="${m.id}" title="编辑（删除也在里面）">${ICON.edit}</button>
    </div>`;
}

// 会议详情：只读，点窗口外关闭；点 ✎ 才进入编辑
const ST_CLASS = { todo: 'st-todo-s', doing: 'st-doing-s', done: 'st-done-s' };
function openMeetingDetail(m) {
  const d = parseYmd(m.date);
  const time = m.start ? ` ${esc(m.start)}${m.end ? '–' + esc(m.end) : ''}` : '';
  const mine = db.tasks.filter(t => t.meeting === m.id && !t.deletedAt).sort((a, b) => a.createdAt - b.createdAt);
  const sec = (title, body) => body ? `<div class="d-sec"><h4>${title}</h4>${body}</div>` : '';
  const text = v => v ? `<p>${esc(v)}</p>` : '';
  openDialog(`<div class="detail">
    <div class="d-head">
      <div class="d-main"><div class="d-title">${esc(m.title)}</div>
        <div class="d-sub"><span class="d-when">${mdSlash(d)} 周${WEEK[d.getDay()]}${time}</span><span class="tag purple">${esc(m.type || '其他')}</span>${projectTag(m.project)}</div></div>
      ${meetActs(m)}
    </div>
    ${m.summary ? `<div class="d-summary">${esc(m.summary)}</div>` : ''}
    ${sec('讨论要点', text(m.points))}
    ${sec('结论', text(m.conclusion))}
    ${sec('我的待办', mine.map(t => `<div class="d-todo" data-act="goto-task" data-id="${t.id}" title="跳到看板">
      <span class="d-st ${ST_CLASS[t.status]}">${STATUS[t.status]}</span><span class="d-todo-text">${esc(firstLine(t.text))}</span>${ICON.arrow}</div>`).join(''))}
    ${sec('他人待办', text(m.othersTodos))}
    ${m.summary || m.points || m.conclusion || mine.length || m.othersTodos ? '' : '<p class="d-empty">还没有填写总结、要点和待办，点 ✎ 补充</p>'}
  </div>`, null, 'detail-dlg');
  // 点窗口外（遮罩）关闭
  dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
}

// 「我的待办」每行生成一条关联待办；已有同名关联待办（含已删除）的不重复生成
function syncMyTodos(m) {
  const lines = (m.myTodos || '').split(/\n+/).map(s => s.replace(/^\s*(?:[-*•]|\d+[.、)）])\s*/, '').trim()).filter(Boolean);
  const existing = new Set(db.tasks.filter(t => t.meeting === m.id).map(t => t.text.trim()));
  const created = lines.filter(l => !existing.has(l)).map(l => addTask(l, { project: m.project, meeting: m.id, silent: true }));
  return created.length;
}

/* ========== 对话框 ========== */
const dlg = $('#dlg');
function openDialog(html, onSubmit, cls = '') {
  if (dlg.open) dlg.close();
  dlg.onclick = null;
  dlg.className = 'dlg ' + cls;
  dlg.innerHTML = html;
  const form = $('form', dlg);
  if (form && onSubmit) form.onsubmit = e => { e.preventDefault(); if (onSubmit(new FormData(form), e.submitter) !== false) dlg.close(); };
  $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
  dlg.showModal();
}

function editTask(t) {
  openDialog(`<form>
    <h3>编辑任务</h3>
    <label>内容<textarea class="field" name="text" required>${esc(t.text)}</textarea></label>
    <div class="grid2">
      <label>项目<select class="field" name="project">${projectOptions(t.project)}</select></label>
      <label>状态<select class="field" name="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${t.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    </div>
    <label>截止时间（可只填日期，也可不填）${dueFields(t.due)}</label>
    <label>备注<textarea class="field" name="note">${esc(t.note)}</textarea></label>
    <div class="grid3 even">
      <label>创建时间<input class="field" type="datetime-local" name="createdAt" value="${toLocalInput(t.createdAt)}"></label>
      <label>开始时间<input class="field" type="datetime-local" name="startedAt" value="${toLocalInput(t.startedAt)}"></label>
      <label>完成时间<input class="field" type="datetime-local" name="doneAt" value="${toLocalInput(t.doneAt)}"></label>
    </div>
    <p class="hint">开始 / 完成时间留空时，切换状态会自动记为当前时间，补录历史任务时可手动修改。</p>
    <div class="timeline"><div class="tl-title">变更记录</div>${logOf(t).map((e, i, l) => `
      <div class="tl-item tl-${e.a}"><i></i><span class="mono">${fmtTime(e.t)}</span><b>${LOG_TEXT[e.a] || e.a}</b>${i ? `<em>${fmtDur(e.t - l[i - 1].t)}后</em>` : ''}</div>`).join('')}
    </div>
    <div class="acts">
      <button type="button" class="btn danger left" id="dlgDel">删除</button>
      <button type="button" class="btn" data-close>取消</button>
      <button class="btn primary">保存</button>
    </div>
  </form>`, f => {
    const status = f.get('status');
    if (status !== t.status) setStatus(t, status);
    // 手填的时间优先于状态切换时自动记录的时间
    const times = {};
    let log = logOf(t);
    const created = fromLocalInput(f.get('createdAt')), started = fromLocalInput(f.get('startedAt')), done = fromLocalInput(f.get('doneAt'));
    // 只处理真正改动过的时间（输入框精确到分钟）
    const changed = (v, old) => v && Math.floor(v / 6e4) !== Math.floor((old || 0) / 6e4);
    if (changed(created, t.createdAt)) { times.createdAt = created; log = retimeLog(log, 'create', created); }
    if (t.status !== 'todo' && changed(started, t.startedAt)) { times.startedAt = started; log = retimeLog(log, 'start', started); }
    if (t.status === 'done' && changed(done, t.doneAt)) { times.doneAt = done; log = retimeLog(log, 'done', done); }
    if (Object.keys(times).length) times.log = log;
    patch(t, { text: f.get('text').trim() || t.text, project: f.get('project'), due: readDue(f), note: f.get('note'), ...times });
  });
  $('#dlgDel').onclick = () => { dlg.close(); removeTask(t); };
}

// 只接受 http(s) 链接，避免 javascript: 之类的地址
const safeLink = v => (/^https?:\/\/\S+$/i.test((v || '').trim()) ? v.trim() : '');
const findByLink = link => link && db.meetings.find(m => !m.deletedAt && m.link === link);

function readMeeting(f) {
  return {
    link: safeLink(f.get('link')),
    date: f.get('date') || today(), start: f.get('start') || '', end: f.get('end') || '',
    type: f.get('type') || '其他', project: f.get('project') || '',
    summary: (f.get('summary') || '').trim(),
    points: (f.get('points') || '').trim(), conclusion: (f.get('conclusion') || '').trim(),
    myTodos: (f.get('myTodos') || '').trim(), othersTodos: (f.get('othersTodos') || '').trim(),
  };
}

// 其他文档：每行 类型（PRD / 其他）+ 文档名 + 链接
const isPrdName = name => /prd|需求文档/i.test(name || '');
const docRow = (doc = {}) => `<div class="doc-row">
  <select class="field" name="docKind" data-touched="${doc.kind ? 1 : ''}"><option value="prd" ${doc.kind === 'prd' ? 'selected' : ''}>PRD</option><option value="other" ${doc.kind === 'prd' ? '' : 'selected'}>其他</option></select>
  <input class="field" name="docName" value="${esc(doc.name)}" placeholder="文档名">
  <input class="field" name="docUrl" type="url" value="${esc(doc.url)}" placeholder="https://…">
  <button type="button" class="ib del" data-doc-del title="移除">${ICON.x}</button>
</div>`;
function readDocs(form) {
  return $$('.doc-row', form).map(row => {
    const kind = $('[name=docKind]', row).value, url = safeLink($('[name=docUrl]', row).value);
    const name = $('[name=docName]', row).value.trim() || (kind === 'prd' ? 'PRD' : '文档');
    return url ? { kind, name, url } : null;
  }).filter(Boolean);
}

function editMeeting(m) {
  openDialog(`<form>
    <h3>编辑会议</h3>
    <label>会议名称<input class="field" name="title" value="${esc(m.title)}" required></label>
    ${meetingFields(m, true)}
    <div class="docs-edit"><div class="docs-label">其他文档</div>
      <div class="doc-rows">${(m.docs || []).map(docRow).join('')}</div>
      <button type="button" class="add-doc" data-doc-add>${ICON.plus}添加文档</button>
    </div>
    <div class="acts">
      <button type="button" class="btn danger left" id="dlgDel">删除</button>
      <button type="button" class="btn" data-close>取消</button>
      <button class="btn primary">保存</button>
    </div>
  </form>`, f => {
    Object.assign(m, { title: f.get('title').trim() || m.title, ...readMeeting(f), docs: readDocs($('#dlg form')), u: now() });
    const n = syncMyTodos(m);
    commit();
    if (n) toast(`已生成 ${n} 条关联待办`);
  });
  const form = $('#dlg form');
  form.addEventListener('click', e => {
    if (e.target.closest('[data-doc-add]')) { $('.doc-rows', form).insertAdjacentHTML('beforeend', docRow()); $('.doc-row:last-child [name=docName]', form).focus(); }
    const del = e.target.closest('[data-doc-del]');
    if (del) del.closest('.doc-row').remove();
  });
  // 文档名里带 PRD / 需求文档 时自动选 PRD（手动改过类型就不再自动切）
  form.addEventListener('input', e => {
    if (e.target.name !== 'docName') return;
    const sel = $('[name=docKind]', e.target.closest('.doc-row'));
    if (!sel.dataset.touched) sel.value = isPrdName(e.target.value) ? 'prd' : 'other';
  });
  form.addEventListener('change', e => { if (e.target.name === 'docKind') e.target.dataset.touched = '1'; });
  $('#dlgDel').onclick = () => { dlg.close(); removeMeeting(m); };
}


function removeMeeting(m) {
  patch(m, { deletedAt: now() });
  toast('会议记录已删除', () => patch(m, { deletedAt: 0 }));
}

function editProject(p) {
  openDialog(`<form>
    <h3>${p ? '编辑项目' : '新建项目'}</h3>
    <label>名称<input class="field" name="name" value="${esc(p?.name)}" required></label>
    <label>颜色<div style="display:flex;gap:8px;flex-wrap:wrap">${COLORS.map((c, i) => `
      <label style="flex-direction:row;align-items:center"><input type="radio" name="color" value="${c}" ${(p ? p.color === c : i === projects().length % COLORS.length) ? 'checked' : ''}>
      <span style="width:18px;height:18px;border-radius:50%;background:${c};display:inline-block"></span></label>`).join('')}</div></label>
    <div class="acts">
      ${p ? '<button type="button" class="btn danger left" id="dlgDel">删除项目</button>' : ''}
      <button type="button" class="btn" data-close>取消</button>
      <button class="btn primary">保存</button>
    </div>
  </form>`, f => {
    const name = f.get('name').trim(), color = f.get('color') || COLORS[0];
    if (!name) return false;
    if (p) patch(p, { name, color });
    else { db.projects.push({ id: uid(), name, color, order: Math.max(0, ...db.projects.map(x => x.order)) + 1, u: now() }); commit(); }
  });
  if (p) $('#dlgDel').onclick = () => {
    if (!confirm(`删除项目「${p.name}」？其中的任务和会议会保留，但不再归属任何项目。`)) return;
    dlg.close();
    if (ui.project === p.id) ui.project = 'all';
    patch(p, { deletedAt: now() });
  };
}

/* ----- ⌘K 搜索 ----- */
function openSearch() {
  openDialog(`<label class="search">${ICON.search}<input id="sq" placeholder="搜索任务和会议…" autocomplete="off"></label><div class="results" id="sr"></div>`, null, 'search-dlg');
  const input = $('#sq'), box = $('#sr');
  let sel = 0, hits = [];
  const draw = () => {
    const q = input.value.trim().toLowerCase();
    const tasks = db.tasks.filter(t => !t.deletedAt && (!q || (t.text + ' ' + t.note).toLowerCase().includes(q)))
      .sort((a, b) => b.u - a.u).map(t => ({ kind: 'task', o: t, label: firstLine(t.text), tag: STATUS[t.status] }));
    const meets = db.meetings.filter(m => !m.deletedAt && (!q || [m.title, m.points, m.conclusion].join(' ').toLowerCase().includes(q)))
      .sort((a, b) => b.u - a.u).map(m => ({ kind: 'meet', o: m, label: m.title, tag: '会议 ' + mdSlash(parseYmd(m.date)) }));
    hits = [...tasks, ...meets].slice(0, 30);
    sel = Math.min(sel, Math.max(0, hits.length - 1));
    box.innerHTML = hits.map((h, i) => `<button class="result ${i === sel ? 'sel' : ''}" data-i="${i}">
      <span class="tag ${h.kind === 'meet' ? 'purple' : ''}">${h.tag}</span><span class="t">${esc(h.label)}</span></button>`).join('')
      || '<div class="empty">无结果</div>';
  };
  const go = h => {
    if (!h) return;
    dlg.close();
    if (h.kind === 'task') { ui.tab = 'board'; if (h.o.status === 'done') ui.doneOpen = true; }
    else { ui.tab = 'meetings'; }
    if (!inScope(h.o)) ui.project = 'all';
    saveUi(); render();
    const el = document.getElementById((h.kind === 'task' ? 't-' : 'm-') + h.o.id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('flash'); }
    else if (h.kind === 'task') editTask(h.o);
  };
  input.oninput = () => { sel = 0; draw(); };
  input.onkeydown = e => {
    if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, hits.length - 1); draw(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); }
    if (e.key === 'Enter') { e.preventDefault(); go(hits[sel]); }
  };
  box.onclick = e => { const b = e.target.closest('.result'); if (b) go(hits[+b.dataset.i]); };
  draw();
  input.focus();
}

/* ----- 同步设置 ----- */
function openSettings() {
  const c = cfg();
  openDialog(`<form>
    <h3>GitHub 数据同步</h3>
    <p class="hint">数据会以 JSON 文件保存在你指定的 GitHub 仓库中，多台设备填同样的配置即可同步。
      建议使用<b>私有仓库</b>存数据，并创建一个只授权该仓库 <code>Contents: Read and write</code> 的
      <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Fine-grained Token</a>。
      Token 只保存在当前浏览器本地。</p>
    <label>Token<input class="field mono" name="token" type="password" value="${esc(c.token)}" placeholder="github_pat_…" required></label>
    <div class="grid2">
      <label>仓库所有者<input class="field" name="owner" value="${esc(c.owner)}" placeholder="你的 GitHub 用户名" required></label>
      <label>仓库名<input class="field" name="repo" value="${esc(c.repo)}" placeholder="workbench-data" required></label>
    </div>
    <div class="grid2">
      <label>分支<input class="field" name="branch" value="${esc(c.branch || 'main')}"></label>
      <label>文件路径<input class="field" name="path" value="${esc(c.path || 'workbench.json')}"></label>
    </div>
    <div class="status ${sync.state === 'err' ? 'err' : sync.state === 'ok' ? 'ok' : ''}" id="setStatus">${esc(syncText())}</div>
    <div class="acts">
      <button type="button" class="btn left" id="exportBtn">导出 JSON</button>
      <button type="button" class="btn" id="importBtn">导入 JSON</button>
      ${c.token ? '<button type="button" class="btn danger" id="unlinkBtn">断开</button>' : ''}
      <button class="btn primary">保存并同步</button>
    </div>
  </form>`, f => {
    store(LS_CFG, {
      token: f.get('token').trim(), owner: f.get('owner').trim(), repo: f.get('repo').trim(),
      branch: f.get('branch').trim() || 'main', path: f.get('path').trim().replace(/^\/+/, '') || 'workbench.json',
    });
    doSync();
  });
  $('#exportBtn').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }));
    a.download = `workbench-${today()}.json`;
    a.click();
  };
  $('#importBtn').onclick = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json,.json'; inp.hidden = true;
    // 文件框需挂在弹窗内：弹窗打开时页面其余部分是 inert，挂在外面不会触发 change
    dlg.appendChild(inp);
    inp.onchange = async () => {
      inp.remove();
      try {
        const data = JSON.parse(await inp.files[0].text());
        if (!Array.isArray(data.tasks)) throw new Error('格式不正确');
        db = merge(db, data); commit(); dlg.close(); toast('已导入并合并');
      } catch (e) { alert('导入失败：' + e.message); }
    };
    inp.click();
  };
  const ub = $('#unlinkBtn');
  if (ub) ub.onclick = () => { if (confirm('断开后本机数据保留，但不再同步。')) { localStorage.removeItem(LS_CFG); sync.state = 'off'; dlg.close(); renderSync(); } };
}

/* ========== GitHub 同步 ========== */
const cfg = () => load(LS_CFG, {});
const cfgReady = () => { const c = cfg(); return c.token && c.owner && c.repo; };
const sync = { state: 'off', msg: '', busy: false, again: false, timer: 0, last: 0 };

function b64enc(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
const b64dec = b => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s/g, '')), c => c.charCodeAt(0)));

function merge(a, b) {
  const out = { updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0) };
  for (const k of COLLECTIONS) {
    const map = new Map();
    for (const x of [...(a[k] || []), ...(b[k] || [])]) {
      const cur = map.get(x.id);
      if (!cur || (x.u || 0) > (cur.u || 0)) map.set(x.id, x);
    }
    out[k] = [...map.values()].sort((x, y) => (x.id < y.id ? -1 : 1));
  }
  return out;
}
const canon = d => JSON.stringify(COLLECTIONS.map(k => [...(d[k] || [])].sort((x, y) => (x.id < y.id ? -1 : 1))));

async function gh(method, body) {
  const c = cfg();
  const path = c.path.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${path}`
    + (method === 'GET' ? `?ref=${encodeURIComponent(c.branch || 'main')}` : '');
  return fetch(url, {
    method, cache: 'no-store',
    headers: { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    body: body && JSON.stringify(body),
  });
}
async function ghError(r) {
  let m = '';
  try { m = (await r.json()).message; } catch { /* ignore */ }
  if (r.status === 401) return 'Token 无效或已过期';
  if (r.status === 403) return 'Token 没有该仓库的写权限' + (m ? `（${m}）` : '');
  if (r.status === 404) return '找不到仓库或分支，请检查配置和 Token 权限';
  return `GitHub 返回 ${r.status}${m ? '：' + m : ''}`;
}

async function doSync() {
  if (!cfgReady()) { sync.state = 'off'; renderSync(); return; }
  if (sync.busy) { sync.again = true; return; }
  sync.busy = true; sync.state = 'syncing'; renderSync();
  try {
    const c = cfg();
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      const r = await gh('GET');
      let remote = null, sha;
      if (r.ok) { const j = await r.json(); sha = j.sha; remote = JSON.parse(b64dec(j.content)); }
      else if (r.status !== 404) throw new Error(await ghError(r));

      const merged = remote ? merge(db, remote) : db;
      if (canon(merged) !== canon(db)) { db = merged; store(LS_DATA, db); render(); }
      if (remote && canon(merged) === canon(remote)) { ok = true; break; }

      const p = await gh('PUT', {
        message: `workbench: sync ${fmtTime(now())}`,
        content: b64enc(JSON.stringify(merged, null, 1)),
        branch: c.branch || 'main', ...(sha ? { sha } : {}),
      });
      if (p.ok) ok = true;
      else if (p.status !== 409 && !(p.status === 422 && sha)) throw new Error(await ghError(p));
    }
    if (!ok) throw new Error('多端同时写入冲突，稍后会自动重试');
    sync.state = 'ok'; sync.msg = ''; sync.last = now();
  } catch (e) {
    sync.state = 'err'; sync.msg = e.message || String(e);
  } finally {
    sync.busy = false; renderSync();
    if (sync.again) { sync.again = false; doSync(); }
  }
}
function scheduleSync() {
  if (!cfgReady()) return;
  clearTimeout(sync.timer);
  sync.timer = setTimeout(doSync, 1200);
}
function syncText() {
  if (sync.state === 'off') return cfgReady() ? '等待同步' : '未连接 GitHub，数据仅保存在本机浏览器';
  if (sync.state === 'syncing') return '同步中…';
  if (sync.state === 'err') return '同步失败：' + sync.msg;
  return '已同步 ' + fmtTime(sync.last).slice(11);
}
function renderSync() {
  const b = $('#syncBtn');
  if (!b) return;
  b.className = 'sync-btn ' + sync.state;
  b.innerHTML = `<i></i>${sync.state === 'off' ? (cfgReady() ? '待同步' : '连接 GitHub') : sync.state === 'syncing' ? '同步中' : sync.state === 'err' ? '同步失败' : '已同步'}`;
  b.title = syncText();
  const s = $('#setStatus');
  if (s) { s.textContent = syncText(); s.className = 'status ' + (sync.state === 'err' ? 'err' : sync.state === 'ok' ? 'ok' : ''); }
}

/* ========== 交互 ========== */
let toastTimer;
function toast(msg, undo) {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button>撤销</button>' : ''}`;
  el.hidden = false;
  if (undo) $('button', el).onclick = () => { el.hidden = true; undo(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 5000);
}

const findTask = id => db.tasks.find(t => t.id === id);
const findMeet = id => db.meetings.find(m => m.id === id);

document.addEventListener('click', e => {
  if (e.target.closest('a[href]')) return;
  const th = e.target.closest('[data-theme-set]');
  if (th) { applyTheme(th.dataset.themeSet); return; }
  const tab = e.target.closest('#tabs button');
  if (tab) { ui.tab = tab.dataset.tab; saveUi(); render(); return; }
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const id = el.dataset.id, act = el.dataset.act;
  // 复选框由 change 事件处理
  if (el.type === 'checkbox') return;
  switch (act) {
    case 'project-edit': e.stopPropagation(); editProject(projectOf(id)); break;
    case 'project': ui.project = id; saveUi(); render(); break;
    case 'project-add': editProject(null); break;
    case 'settings': openSettings(); break;
    case 'toggle-more': ui.more = !ui.more; saveUi(); render(); $('#taskInput').focus(); break;
    case 'toggle-meet-more': ui.meetMore = !ui.meetMore; saveUi(); render(); $('#meetInput').focus(); break;
    case 'fold': ui[el.dataset.key] = !ui[el.dataset.key]; saveUi(); render(); break;
    case 'task-edit': editTask(findTask(id)); break;
    case 'task-next': newNextTask(findTask(id)); break;
    case 'meet-open': openMeetingDetail(findMeet(id)); break;
    case 'goto-task': {
      e.stopPropagation();
      const t = findTask(id);
      if (!t) break;
      if (dlg.open) dlg.close();
      if (ui.tab !== 'board') { ui.tab = 'board'; saveUi(); render(); }
      if (t.status === 'done' && !t.deletedAt) { ui.doneOpen = true; saveUi(); render(); }
      if (!flashTask(id)) editTask(t);
      break;
    }
    case 'task-start': setStatus(findTask(id), 'doing'); break;
    case 'task-back': setStatus(findTask(id), 'todo'); toast('已回退到未完成'); break;
    case 'task-done': setStatus(findTask(id), 'done'); toast('已完成 🎉', null); break;
    case 'task-reopen': setStatus(findTask(id), 'doing'); break;
    case 'task-del': removeTask(findTask(id)); break;
    case 'task-restore': { const t = findTask(id); patch(t, { deletedAt: 0, log: withLog(t, 'restore') }); break; }
    case 'task-purge':
      if (confirm('彻底删除后无法恢复，确定吗？')) patch(findTask(id), { purged: 1, text: '', note: '' });
      break;
    case 'cal-mode': ui.calMode = el.dataset.mode; saveUi(); render(); break;
    case 'cal-today': ui.calDate = today(); saveUi(); render(); break;
    case 'cal-move': {
      const d = parseYmd(ui.calDate), n = +el.dataset.d;
      ui.calDate = ymd(ui.calMode === 'week' ? addDays(d, 7 * n) : new Date(d.getFullYear(), d.getMonth() + n, 1));
      saveUi(); render(); break;
    }
    case 'meet-edit': editMeeting(findMeet(id)); break;
    case 'meet-del': removeMeeting(findMeet(id)); break;
    case 'meet-clear': Object.assign(ui, { mq: '', mProject: 'all', mType: 'all', mFrom: '', mTo: '' }); saveUi(); render(); break;
  }
});

// 点击输入卡片以外的地方时，自动折叠「更多」
// 等这次点击完成后再折叠：立刻折叠会让下方内容上移，鼠标松开时已不在原按钮上，点击就丢了
let foldTargets = [];
document.addEventListener('pointerdown', e => {
  if (dlg.open) return;
  foldTargets = [['more', '#taskForm'], ['meetMore', '#meetForm']].filter(([key, form]) => ui[key] && !e.target.closest(form));
});
document.addEventListener('pointerup', () => {
  if (!foldTargets.length) return;
  const targets = foldTargets;
  foldTargets = [];
  setTimeout(() => {
    for (const [key, form] of targets) {
      ui[key] = false;
      const panel = $(`${form} .composer-more`);
      if (panel) panel.hidden = true;
    }
    saveUi();
  });
});

document.addEventListener('change', e => {
  const el = e.target;
  if (['mProject', 'mType', 'mFrom', 'mTo'].includes(el.id)) { ui[el.id] = el.value; saveUi(); render(); }
});

document.addEventListener('input', e => {
  if (e.target.id === 'mq') {
    ui.mq = e.target.value; saveUi();
    const pos = e.target.selectionStart;
    render();
    const inp = $('#mq'); inp.focus(); inp.setSelectionRange(pos, pos);
  }
});

document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id === 'taskForm') {
    e.preventDefault();
    const fd = new FormData(f);
    if (!fd.get('text').trim()) return;
    if (ui.more) f.reset(); else f.text.value = '';
    addTask(fd.get('text'), ui.more ? { project: fd.get('project'), due: readDue(fd), note: fd.get('note') || '' } : {});
    $('#taskInput').focus();
  }
  if (f.id === 'meetForm') {
    e.preventDefault();
    const fd = new FormData(f);
    const raw = fd.get('title').trim();
    if (!raw) return;
    // 支持直接粘贴「会议名称 + 纪要链接」：链接存为会议纪要，剩下的作标题
    const pasted = raw.match(/https?:\/\/\S+/i)?.[0] || '';
    const title = raw.replace(pasted, '').trim() || '会议纪要';
    const base = ui.meetMore ? readMeeting(fd) : (() => { const [d, s, en] = nowSlot(); return { date: d, start: s, end: en, type: '其他', project: ui.project !== 'all' ? ui.project : '', points: '', conclusion: '', link: '' }; })();
    base.link = base.link || safeLink(pasted);
    if (!base.link) { toast('请附上会议纪要链接：在会议名称后面粘贴链接即可'); return; }
    const dup = findByLink(base.link);
    if (dup) {
      const el = document.getElementById('m-' + dup.id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('flash'); }
      toast(`这个链接已经归档过：${dup.title}`);
      return;
    }
    if (ui.meetMore) f.reset(); else f.title.value = '';
    const m = { id: uid(), title, ...base, docs: [], createdAt: now(), deletedAt: 0, u: now() };
    db.meetings.push(m);
    const n = syncMyTodos(m);
    commit();
    if (n) toast(`已归档，并生成 ${n} 条关联待办`);
    $('#meetInput').focus();
  }
});

document.addEventListener('keydown', e => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || dlg.open;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (!dlg.open) openSearch(); return; }
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    const inp = $(ui.tab === 'meetings' ? '#meetInput' : '#taskInput');
    inp.scrollIntoView({ block: 'center' }); inp.focus();
  }
});

// 回到页面或定时拉取远端更新
document.addEventListener('visibilitychange', () => { if (!document.hidden && now() - sync.last > 15000) doSync(); });
setInterval(() => { if (!document.hidden && !sync.busy) doSync(); }, 60000);
// 跨日自动刷新「今天」
let lastDay = today();
setInterval(() => { if (today() !== lastDay) { lastDay = today(); render(); } }, 60000);
// 其他标签页修改了本地数据
window.addEventListener('storage', e => { if (e.key === LS_DATA) { db = load(LS_DATA, db); render(); } });

// 出错时给出提示，而不是留下空白页
function showFatal(msg) {
  if (document.getElementById('fatal')) return;
  const el = document.createElement('div');
  el.id = 'fatal';
  el.className = 'fatal';
  el.innerHTML = `<b>页面加载出错</b><span>多半是浏览器缓存了旧文件，刷新一下通常就好；你的数据不会丢失。</span><button>刷新页面</button><small>${esc(msg)}</small>`;
  el.querySelector('button').onclick = () => location.reload();
  document.body.prepend(el);
}
window.addEventListener('error', e => showFatal(e.message || '未知错误'));
window.addEventListener('unhandledrejection', e => showFatal(String(e.reason?.message || e.reason)));

applyTheme(document.documentElement.dataset.theme);
render();
doSync();
