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
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 隐私模式等 */ } };

const ICON = {
  list: '<svg viewBox="0 0 24 24"><path d="M10 6h10M10 12h10M10 18h10M4 5l1.5 1.5L8 4M4 12h3M4 18h3"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
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
  calMode: 'week', calDate: today(), meetMore: false, meetOpen: {},
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
function addTask(text, opts = {}) {
  text = text.trim();
  if (!text) return;
  const t = {
    id: uid(), text, project: opts.project || (ui.project !== 'all' ? ui.project : ''),
    status: 'todo', due: opts.due || '', note: opts.note || '',
    createdAt: now(), startedAt: 0, doneAt: 0, deletedAt: 0, u: now(),
  };
  db.tasks.push(t);
  commit();
  return t;
}
function setStatus(t, status) {
  const f = { status };
  if (status === 'doing') { f.startedAt = t.startedAt || now(); f.doneAt = 0; }
  if (status === 'done') { f.doneAt = now(); f.startedAt = t.startedAt || now(); }
  if (status === 'todo') { f.startedAt = 0; f.doneAt = 0; }
  patch(t, f);
}
function removeTask(t) {
  patch(t, { deletedAt: now() });
  toast('已删除，可在「已删除」中找回', () => patch(t, { deletedAt: 0 }));
}

/* ========== 渲染 ========== */
function render() {
  renderNav();
  renderHeader();
  renderStats();
  $$('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === ui.tab));
  const v = $('#view');
  // 重绘时保留输入框里还没提交的内容和焦点
  const kept = $$('#view form [name]').map(el => [el.form.id, el.name, el.value]);
  const af = document.activeElement;
  const focus = af?.form?.id && af.name && v.contains(af) ? [af.form.id, af.name] : null;
  if (ui.tab === 'board') v.innerHTML = viewBoard();
  else if (ui.tab === 'calendar') v.innerHTML = viewCalendar();
  else v.innerHTML = viewMeetings();
  for (const [f, n, val] of kept) { const el = $(`#${f} [name="${n}"]`); if (el) el.value = val; }
  if (focus) $(`#${focus[0]} [name="${focus[1]}"]`)?.focus();
}

function renderNav() {
  const open = db.tasks.filter(t => !t.deletedAt && t.status !== 'done');
  const cnt = id => open.filter(t => t.project === id).length;
  $('#projectNav').innerHTML = `
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
    <button class="nav-add" data-act="project-add">${ICON.plus}新建项目</button>`;
}

function renderHeader() {
  const d = new Date();
  $('#todayLabel').textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 周${WEEK[d.getDay()]}`;
  const open = liveTasks().filter(t => t.status !== 'done').length;
  $('#summary').innerHTML = `<span class="dot"></span><b>${open}</b> 项待办 · <b>${weekMeetings().length}</b> 场会议`;
  renderSync();
}

function weekMeetings() {
  const s = ymd(weekStart(new Date())), e = ymd(addDays(weekStart(new Date()), 6));
  return liveMeetings().filter(m => m.date >= s && m.date <= e);
}

function renderStats() {
  const tasks = liveTasks(), t0 = today();
  const dueToday = tasks.filter(t => t.status !== 'done' && t.due === t0).length;
  const overdue = tasks.filter(t => t.status !== 'done' && t.due && t.due < t0).length;
  const doing = tasks.filter(t => t.status === 'doing').length;
  const wm = weekMeetings().length;
  $('#stats').innerHTML = `
    <div class="stat"><div class="stat-icon orange">${ICON.list}</div><div>
      <div class="stat-label">今日待办</div><div class="stat-num">${dueToday}<small>项</small></div>
      <div class="stat-sub orange">今天到期${overdue ? ` · <span class="warn">逾期 ${overdue}</span>` : ''}</div></div></div>
    <div class="stat"><div class="stat-icon green">${ICON.play}</div><div>
      <div class="stat-label">进行中</div><div class="stat-num">${doing}<small>项</small></div>
      <div class="stat-sub green">正在处理</div></div></div>
    <div class="stat"><div class="stat-icon purple">${ICON.chat}</div><div>
      <div class="stat-label">本周会议</div><div class="stat-num">${wm}<small>场</small></div>
      <div class="stat-sub purple">本周安排</div></div></div>`;
}

const projectOptions = (sel, allLabel) =>
  (allLabel ? `<option value="all">${allLabel}</option>` : '<option value="">无项目</option>') +
  projects().map(p => `<option value="${p.id}" ${sel === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('');

function projectTag(id) {
  const p = projectOf(id);
  return p && !p.deletedAt ? `<span class="tag"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</span>` : '';
}
function dueTag(t) {
  if (!t.due || t.status === 'done') return '';
  const t0 = today();
  const cls = t.due < t0 ? 'red' : t.due === t0 ? 'orange' : '';
  const label = t.due < t0 ? '已逾期 ' : t.due === t0 ? '今天到期' : '截止 ';
  return `<span class="tag ${cls}">${label}${t.due === t0 ? '' : md(parseYmd(t.due))}</span>`;
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

  const card = t => `
    <div class="card" id="t-${t.id}">
      <div class="card-text" data-act="task-edit" data-id="${t.id}" title="点击编辑">${cardText(t.text)}</div>
      <div class="card-meta">${ui.project === 'all' ? projectTag(t.project) : ''}${dueTag(t)}<span class="card-time">${t.status === 'todo' ? '创建 ' + shortTime(t.createdAt) : '开始 ' + shortTime(t.startedAt)}</span></div>
      <div class="card-foot">
        ${t.status === 'todo' ? `
          <label class="check"><input type="checkbox" data-act="task-start" data-id="${t.id}">开始处理</label>
          <span class="spacer"></span>` : `
          <label class="check on"><input type="checkbox" checked data-act="task-unstart" data-id="${t.id}">进行中</label>
          <button class="done-btn" data-act="task-done" data-id="${t.id}">${ICON.check}完成</button>
          <button class="icon-btn go" data-act="task-edit" data-id="${t.id}" title="详情 / 编辑">${ICON.arrow}</button>`}
        <button class="icon-btn" data-act="task-del" data-id="${t.id}" title="删除">${ICON.x}</button>
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
      ${ui.more ? `<div class="composer-more">
        <label>项目<select class="field" name="project">${projectOptions(ui.project !== 'all' ? ui.project : '')}</select></label>
        <label>截止日期<input class="field" type="date" name="due"></label>
        <label class="wide">备注<input class="field" name="note" placeholder="可选"></label>
      </div>` : ''}
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
      ${ui.doneOpen ? `<div class="fold-body">${done.map(t => `
        <div class="row">
          <span style="color:var(--green)">${ICON.check}</span>
          <span class="row-text strike" data-act="task-edit" data-id="${t.id}">${esc(firstLine(t.text))}</span>
          ${ui.project === 'all' ? projectTag(t.project) : ''}
          <span class="row-time">${fmtTime(t.doneAt)}</span>
          <button class="btn sm" data-act="task-reopen" data-id="${t.id}">撤回</button>
          <button class="btn sm danger" data-act="task-del" data-id="${t.id}">删除</button>
        </div>`).join('') || '<div class="empty">还没有完成的任务</div>'}</div>` : ''}
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
function taskSpan(t) {
  const t0 = today();
  const created = ymd(t.createdAt);
  if (t.status === 'done') return [ymd(t.startedAt || t.createdAt), ymd(t.doneAt)];
  if (t.status === 'doing') return [ymd(t.startedAt), t0];
  return [created, t.due && t.due > created ? t.due : created];
}
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
      <div class="legend">
        <span><i class="st-todo"></i>未完成</span><span><i class="st-doing"></i>进行中</span>
        <span><i class="st-done"></i>已完成</span><span><i class="st-meet"></i>会议</span>
      </div>
      <div class="cal-scroll">${body}</div>
    </div>`;
}

function weekView(s) {
  const days = [...Array(7)].map((_, i) => ymd(addDays(s, i)));
  const t0 = today();
  const first = days[0], last = days[6];
  const rows = liveTasks()
    .map(t => ({ t, span: taskSpan(t) }))
    .filter(({ span }) => span[0] <= last && span[1] >= first)
    .sort((a, b) => a.span[0].localeCompare(b.span[0]) || a.t.createdAt - b.t.createdAt);
  const meets = liveMeetings().filter(m => m.date >= first && m.date <= last)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const cells = () => days.map((d, i) => `<div class="wk-cell ${d === t0 ? 'is-today' : ''}" style="grid-column:${i + 2}"></div>`).join('');
  const bar = (from, to, cls, text, act, id) => {
    const a = days.indexOf(from), b = days.indexOf(to);
    return `<div class="wk-bar ${cls}" style="grid-column:${a + 2}/${b + 3}" data-act="${act}" data-id="${id}" title="${esc(text)}">${esc(text)}</div>`;
  };
  return `<div class="week">
    <div class="week-row head"><div>任务</div>${days.map((d, i) => `<div class="${d === t0 ? 'is-today' : ''}">${WEEK[i]}<b>${mdSlash(parseYmd(d))}</b></div>`).join('')}</div>
    ${rows.map(({ t, span }) => `<div class="week-row">
      <div class="wk-label" style="grid-column:1" data-act="task-edit" data-id="${t.id}" title="${esc(t.text)}"><span class="dot" style="background:${statusColor(t.status)}"></span><span>${esc(firstLine(t.text))}</span></div>
      ${cells()}${bar(span[0] < first ? first : span[0], span[1] > last ? last : span[1], 'st-' + t.status, firstLine(t.text), 'task-edit', t.id)}
    </div>`).join('')}
    ${meets.map(m => `<div class="week-row">
      <div class="wk-label" style="grid-column:1" data-act="meet-edit" data-id="${m.id}"><span class="dot" style="background:var(--purple)"></span><span>${esc(m.title)}</span></div>
      ${cells()}${bar(m.date, m.date, 'st-meet', `${m.start || ''} ${m.title}`, 'meet-edit', m.id)}
    </div>`).join('')}
    ${rows.length + meets.length ? '' : `<div class="week-row"><div class="empty" style="grid-column:1/-1">本周没有任务记录</div></div>`}
  </div>`;
}

function monthView(base) {
  const y = base.getFullYear(), mo = base.getMonth();
  const start = weekStart(new Date(y, mo, 1));
  const lastDay = new Date(y, mo + 1, 0);
  const weeks = Math.ceil((Math.round((lastDay - start) / 864e5) + 1) / 7);
  const t0 = today();
  const tasks = liveTasks(), meets = liveMeetings();
  const cells = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i), ds = ymd(d);
    const items = [
      ...tasks.filter(t => t.status === 'done' && ymd(t.doneAt) === ds).map(t => ({ cls: 'st-done', text: firstLine(t.text), act: 'task-edit', id: t.id })),
      ...tasks.filter(t => t.status !== 'done' && t.due === ds).map(t => ({ cls: 'st-' + t.status, text: firstLine(t.text), act: 'task-edit', id: t.id })),
      ...meets.filter(m => m.date === ds).map(m => ({ cls: 'st-meet', text: `${m.start || ''} ${m.title}`, act: 'meet-edit', id: m.id })),
    ];
    const shown = items.slice(0, 3);
    cells.push(`<div class="m-cell ${d.getMonth() !== mo ? 'out' : ''} ${ds === t0 ? 'is-today' : ''}">
      <span class="m-day">${d.getDate()}</span>
      ${shown.map(it => `<div class="m-chip ${it.cls}" data-act="${it.act}" data-id="${it.id}" title="${esc(it.text)}">${esc(it.text)}</div>`).join('')}
      ${items.length > 3 ? `<span class="m-more">+${items.length - 3} 项</span>` : ''}
    </div>`);
  }
  return `<div class="month"><div class="month-head">${WEEK.map(w => `<div>周${w}</div>`).join('')}</div><div class="month-grid">${cells.join('')}</div></div>`;
}

/* ----- 会议索引 ----- */
function filteredMeetings() {
  const q = ui.mq.trim().toLowerCase();
  return db.meetings.filter(m => !m.deletedAt)
    .filter(m => (ui.project === 'all' || m.project === ui.project) && (ui.mProject === 'all' || m.project === ui.mProject))
    .filter(m => ui.mType === 'all' || m.type === ui.mType)
    .filter(m => (!ui.mFrom || m.date >= ui.mFrom) && (!ui.mTo || m.date <= ui.mTo))
    .filter(m => !q || [m.title, m.points, m.conclusion].some(s => (s || '').toLowerCase().includes(q)))
    .sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start));
}

function nowSlot() {
  const d = new Date(); d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  const e = new Date(d.getTime() + 36e5);
  return [ymd(d), `${pad(d.getHours())}:${pad(d.getMinutes())}`, `${pad(e.getHours())}:${pad(e.getMinutes())}`];
}

function meetingFields(m = {}) {
  const [d, s, e] = nowSlot();
  return `
    <div class="grid3">
      <label>日期<input class="field" type="date" name="date" value="${esc(m.date || d)}" required></label>
      <label>开始<input class="field" type="time" name="start" value="${esc(m.start ?? s)}"></label>
      <label>结束<input class="field" type="time" name="end" value="${esc(m.end ?? e)}"></label>
    </div>
    <div class="grid2">
      <label>会议类型<select class="field" name="type">${MEETING_TYPES.map(t => `<option ${(m.type || '其他') === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label>关联项目<select class="field" name="project">${projectOptions(m.project ?? (ui.project !== 'all' ? ui.project : ''))}</select></label>
    </div>
    <label>讨论要点<textarea class="field" name="points" placeholder="讨论了什么">${esc(m.points)}</textarea></label>
    <label>结论 / 待跟进<textarea class="field" name="conclusion" placeholder="达成的结论、后续动作">${esc(m.conclusion)}</textarea></label>`;
}

function viewMeetings() {
  const list = filteredMeetings();
  const typeTag = m => `<span class="tag purple">${esc(m.type || '其他')}</span>`;
  return `
    <form class="panel composer" id="meetForm" autocomplete="off">
      <div class="composer-row">
        ${ICON.plus}
        <input class="composer-input" name="title" id="meetInput" placeholder="输入会议名称，回车保存（展开「更多」填写时间、要点、结论）">
        <button type="button" class="btn" data-act="toggle-meet-more">${ICON.filter}更多${ICON.down}</button>
        <button type="submit" class="btn">添加</button>
      </div>
      ${ui.meetMore ? `<div class="composer-more inline-form">${meetingFields()}</div>` : ''}
    </form>

    <div class="panel filters">
      <label class="search">${ICON.search}<input id="mq" placeholder="搜索会议名称、讨论要点、结论…" value="${esc(ui.mq)}"></label>
      <select class="field" id="mProject">${projectOptions(ui.mProject, '全部项目')}</select>
      <select class="field" id="mType"><option value="all">全部类型</option>${MEETING_TYPES.map(t => `<option ${ui.mType === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
      <input class="field" type="date" id="mFrom" value="${esc(ui.mFrom)}"><span class="to">至</span><input class="field" type="date" id="mTo" value="${esc(ui.mTo)}">
      ${ui.mq || ui.mProject !== 'all' || ui.mType !== 'all' || ui.mFrom || ui.mTo ? '<button class="btn sm" data-act="meet-clear">清除筛选</button>' : ''}
    </div>

    <p class="list-meta">共 <span class="mono">${list.length}</span> 场会议</p>
    ${list.map(m => {
      const d = parseYmd(m.date), open = ui.meetOpen[m.id];
      return `<div class="panel meet ${open ? 'open' : ''}" id="m-${m.id}">
        <div class="meet-head" data-act="meet-toggle" data-id="${m.id}">
          <div>
            <div class="meet-title">${esc(m.title)} ${typeTag(m)} ${projectTag(m.project)}</div>
            <div class="meet-time">${ICON.cal}${md(d)} 周${WEEK[d.getDay()]} ${esc(m.start || '')}${m.end ? '–' + esc(m.end) : ''}</div>
          </div>
          <span class="chev">${ICON.down}</span>
        </div>
        ${open ? `<div class="meet-body">
          <div class="meet-sec"><h4>讨论要点</h4><p>${esc(m.points) || '<span style="color:var(--faint)">未填写</span>'}</p></div>
          <div class="meet-sec"><h4>结论</h4><p>${esc(m.conclusion) || '<span style="color:var(--faint)">未填写</span>'}</p></div>
          <div class="meet-ops">
            <button class="btn sm" data-act="meet-totask" data-id="${m.id}">结论转待办</button>
            <button class="btn sm" data-act="meet-edit" data-id="${m.id}">编辑</button>
            <button class="btn sm danger" data-act="meet-del" data-id="${m.id}">删除</button>
          </div>
        </div>` : ''}
      </div>`;
    }).join('') || '<div class="panel empty">没有符合条件的会议记录</div>'}`;
}

/* ========== 对话框 ========== */
const dlg = $('#dlg');
function openDialog(html, onSubmit, cls = '') {
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
    <label>截止日期<input class="field" type="date" name="due" value="${esc(t.due)}"></label>
    <label>备注<textarea class="field" name="note">${esc(t.note)}</textarea></label>
    <div class="grid3">
      <label>创建时间<input class="field" type="datetime-local" name="createdAt" value="${toLocalInput(t.createdAt)}"></label>
      <label>开始时间<input class="field" type="datetime-local" name="startedAt" value="${toLocalInput(t.startedAt)}"></label>
      <label>完成时间<input class="field" type="datetime-local" name="doneAt" value="${toLocalInput(t.doneAt)}"></label>
    </div>
    <p class="hint">开始 / 完成时间留空时，切换状态会自动记为当前时间，补录历史任务时可手动修改。</p>
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
    const created = fromLocalInput(f.get('createdAt')), started = fromLocalInput(f.get('startedAt')), done = fromLocalInput(f.get('doneAt'));
    if (created) times.createdAt = created;
    if (t.status !== 'todo' && started) times.startedAt = started;
    if (t.status === 'done' && done) times.doneAt = done;
    patch(t, { text: f.get('text').trim() || t.text, project: f.get('project'), due: f.get('due'), note: f.get('note'), ...times });
  });
  $('#dlgDel').onclick = () => { dlg.close(); removeTask(t); };
}

function readMeeting(f) {
  return {
    date: f.get('date') || today(), start: f.get('start') || '', end: f.get('end') || '',
    type: f.get('type') || '其他', project: f.get('project') || '',
    points: (f.get('points') || '').trim(), conclusion: (f.get('conclusion') || '').trim(),
  };
}

function editMeeting(m) {
  openDialog(`<form>
    <h3>编辑会议</h3>
    <label>会议名称<input class="field" name="title" value="${esc(m.title)}" required></label>
    ${meetingFields(m)}
    <div class="acts">
      <button type="button" class="btn danger left" id="dlgDel">删除</button>
      <button type="button" class="btn" data-close>取消</button>
      <button class="btn primary">保存</button>
    </div>
  </form>`, f => patch(m, { title: f.get('title').trim() || m.title, ...readMeeting(f) }));
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
    else { ui.tab = 'meetings'; ui.meetOpen[h.o.id] = true; }
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
    case 'task-done': setStatus(findTask(id), 'done'); toast('已完成 🎉', null); break;
    case 'task-reopen': setStatus(findTask(id), 'doing'); break;
    case 'task-del': removeTask(findTask(id)); break;
    case 'task-restore': patch(findTask(id), { deletedAt: 0 }); break;
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
    case 'meet-toggle': ui.meetOpen[id] = !ui.meetOpen[id]; saveUi(); render(); break;
    case 'meet-edit': editMeeting(findMeet(id)); break;
    case 'meet-del': removeMeeting(findMeet(id)); break;
    case 'meet-totask': {
      const m = findMeet(id);
      const lines = (m.conclusion || '').split(/\n+/).map(s => s.replace(/^[\s\-*•\d.、)）]+/, '').trim()).filter(Boolean);
      if (!lines.length) { toast('这场会议还没有填写结论'); break; }
      lines.forEach(l => addTask(l, { project: m.project, note: `来自会议：${m.title}（${m.date}）` }));
      toast(`已生成 ${lines.length} 条待办`);
      break;
    }
    case 'meet-clear': Object.assign(ui, { mq: '', mProject: 'all', mType: 'all', mFrom: '', mTo: '' }); saveUi(); render(); break;
  }
});

document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.act === 'task-start') setStatus(findTask(el.dataset.id), 'doing');
  if (el.dataset.act === 'task-unstart') setStatus(findTask(el.dataset.id), 'todo');
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
    f.reset();
    addTask(fd.get('text'), { project: fd.get('project') ?? undefined, due: fd.get('due') || '', note: fd.get('note') || '' });
    $('#taskInput').focus();
  }
  if (f.id === 'meetForm') {
    e.preventDefault();
    const fd = new FormData(f);
    const title = fd.get('title').trim();
    if (!title) return;
    f.reset();
    const base = ui.meetMore ? readMeeting(fd) : (() => { const [d, s, en] = nowSlot(); return { date: d, start: s, end: en, type: '其他', project: ui.project !== 'all' ? ui.project : '', points: '', conclusion: '' }; })();
    const m = { id: uid(), title, ...base, createdAt: now(), deletedAt: 0, u: now() };
    db.meetings.push(m);
    ui.meetOpen[m.id] = true;
    commit();
    $('#meetInput').focus();
  }
});

document.addEventListener('keydown', e => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || dlg.open;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (!dlg.open) openSearch(); return; }
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    if (ui.tab !== 'board' && ui.tab !== 'meetings') { ui.tab = 'board'; saveUi(); render(); }
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

render();
doSync();
