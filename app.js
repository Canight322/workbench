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
  docAdd: '<svg viewBox="0 0 24 24"><path d="M13 3H7v18h7"/><path d="M13 3l6 6v4M13 3v6h6M18 15v6M15 18h6"/></svg>',
  folder: '<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
};

/* ========== 数据 ========== */
const LS_DATA = 'wb.data', LS_CFG = 'wb.cfg', LS_UI = 'wb.ui';
const COLORS = ['#e05a4f', '#f0a032', '#8f62e0', '#3fae74', '#4a83e6', '#6f6a60', '#d4609e', '#2fa8b5'];
// 常用会议类型；纪要里写了新类型就直接用，下拉和筛选里会自动出现
const MEETING_TYPES = ['业务对接', '需求讨论', '需求评审', '技术方案评审', '测试方案评审', '周会', '产品分享会'];
// 会议相关文档：按顺序显示在会议卡片右侧；前后端技术方案合在一份时记为 TDD
const DOC_KINDS = [
  { k: 'mrd', tag: 'MRD', label: 'MRD / 需求文档' },
  { k: 'prd', tag: 'PRD', label: 'PRD / 产品需求文档' },
  { k: 'tdd', tag: 'TDD', label: 'TDD / 技术方案' },
  { k: 'fe', tag: 'FE', label: 'FE-TDD / 前端技术方案' },
  { k: 'be', tag: 'BE', label: 'BE-TDD / 后端技术方案' },
  { k: 'tc', tag: 'TC', label: 'TC / 测试方案' },
  { k: 'track', tag: '周会跟踪表', label: '周会跟踪表', jump: true },  // 卡片上显示跳转按钮
  { k: 'other', tag: '', label: '其他文档' },
];
const docKind = k => DOC_KINDS.find(d => d.k === k) || DOC_KINDS[DOC_KINDS.length - 1];
// 按文档名识别类型；先认前后端合并、前端、后端，再认 TDD（名字里都带「技术方案」），PRD 先于 MRD（「产品需求文档」也含「需求文档」）
// 文档名开头写了「类型 | 」（如「BE-TDD | 技术方案评审_…」）时按它定类型，并把前缀去掉
const DOC_PREFIX = { MRD: 'mrd', PRD: 'prd', TDD: 'tdd', 'FE-TDD': 'fe', FE: 'fe', 'BE-TDD': 'be', BE: 'be', TC: 'tc', 周会跟踪表: 'track', 跟踪表: 'track', 其他: 'other', 其他文档: 'other' };
function splitDocName(name) {
  const m = (name || '').match(/^\s*([^|｜]+?)\s*[|｜]\s*(.*)$/);
  const k = m && DOC_PREFIX[m[1].toUpperCase()] || m && DOC_PREFIX[m[1]];
  return k ? { kind: k, name: m[2].trim() } : null;
}
function docKindOf(name) {
  const tagged = splitDocName(name);
  if (tagged) return tagged.kind;
  const n = name || '';
  if (/前后端|fe\s*[&+/／]\s*be/i.test(n)) return 'tdd';
  if (/fe[-_ ]?tdd|前端(技术)?方案/i.test(n)) return 'fe';
  if (/be[-_ ]?tdd|(后端|服务端)(技术)?方案/i.test(n)) return 'be';
  if (/tdd|技术方案/i.test(n)) return 'tdd';
  if (/(^|[^a-z])tc([^a-z]|$)|测试方案|测试用例/i.test(n)) return 'tc';
  if (/prd|产品需求/i.test(n)) return 'prd';
  if (/tracking|跟踪表/i.test(n)) return 'track';
  if (/mrd|需求文档|市场需求/i.test(n)) return 'mrd';
  return 'other';
}
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
  dq: '', dKind: 'all',
}, load(LS_UI, {}));
const saveUi = () => store(LS_UI, ui);

const projects = () => db.projects.filter(p => !p.deletedAt).sort((a, b) => a.order - b.order);
const projectOf = id => db.projects.find(p => p.id === id);
const inScope = x => ui.project === 'all' || x.project === ui.project;
const liveTasks = () => db.tasks.filter(t => !t.deletedAt && inScope(t));
const liveMeetings = () => db.meetings.filter(m => !m.deletedAt && inScope(m));
// 按工作流程排：常用类型 → 以后新加的类型 → 「其他」固定最后
const meetingTypes = () => [...new Set([...MEETING_TYPES, ...db.meetings.filter(m => !m.deletedAt && m.type).map(m => m.type), '其他'])]
  .sort((a, b) => (a === '其他') - (b === '其他'));
// 项目名先精确匹配，再看互相包含（如项目叫「XX」，写成「XX项目」也能对上）；对不上就留空，不新建项目
function matchProject(name) {
  const v = (name || '').trim().toLowerCase();
  if (!v) return '';
  const ps = projects(), lc = p => p.name.toLowerCase();
  const hit = ps.find(p => lc(p) === v) || ps.filter(p => v.includes(lc(p)) || lc(p).includes(v)).sort((a, b) => b.name.length - a.name.length)[0];
  return hit?.id || '';
}
// 纪要里没写类型 / 项目时，从会议名称或文件名里找（如「…-技术方案评审」）
const typeIn = s => meetingTypes().filter(t => t !== '其他' && s.includes(t)).sort((a, b) => b.length - a.length)[0] || '';
const projectIn = s => projects().filter(p => s.toLowerCase().includes(p.name.toLowerCase())).sort((a, b) => b.name.length - a.name.length)[0]?.id || '';

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
    createdAt: opts.createdAt || now(), startedAt: 0, doneAt: 0, deletedAt: 0, u: now(),
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
function completeTask(t) { setStatus(t, 'done'); toast('已完成 🎉'); }
// 进行中卡片上的 📄+：只用来添加产出文档，可以是飞书链接，也可以是本地文件（上传到数据仓库）
function addOutputDoc(t, mode = 'link') {
  const row = docRow({}).replace(/^<div class="doc-row">|<button type="button" class="ib del"[\s\S]*$/g, '');
  const local = mode === 'local';
  openDialog(`<form>
    <h3>添加产出文档</h3>
    <p class="hint">${esc(firstLine(t.text))}</p>
    <div class="seg src-seg"><button type="button" class="${local ? '' : 'active'}" data-mode="link">飞书链接</button><button type="button" class="${local ? 'active' : ''}" data-mode="local">本地文件</button></div>
    ${local ? `
    <label class="md-drop" id="mdDrop"><input type="file" multiple hidden>
      <span class="md-drop-icon">${ICON.doc}</span>
      <span class="md-drop-main" id="mdPicked">拖入、粘贴（⌘V）或点击选择文件</span>
      <span class="md-drop-sub" id="mdPickedSub">目前支持 .md；引用了本地图片时，把图片一起选上（或直接拖整个文件夹）</span></label>
    <div id="mdNotes"></div>
    <div class="doc-row md-meta">${row.replace(/<input class="field" name="docUrl"[^>]*>/, '')}</div>
    <p class="hint">文档名默认取文件里的第一个标题，没有标题时用文件名。</p>` : `
    <div class="doc-row">${row}</div>
    <p class="hint">文档名不填时用任务名，之后可在 ✎ 里改。</p>`}
    <div class="acts"><button type="button" class="btn" data-close>取消</button><button class="btn primary" id="docAddBtn">${local ? '上传并添加' : '添加'}</button></div>
  </form>`, () => {
    if (local) { uploadLocal(t); return false; }
    const doc = readDocs($('#dlg form'), firstLine(t.text))[0];
    if (!doc) { toast('请粘贴 http 开头的链接'); return false; }
    patch(t, { docs: [...(t.docs || []), { ...doc, at: now() }] });
    toast('已添加产出文档');
  });
  $$('#dlg .src-seg button').forEach(b => b.onclick = () => addOutputDoc(t, b.dataset.mode));
  wireDocs($('#dlg form'));
  if (local) wireLocalPick(t); else $('#dlg [name=docUrl]').focus();
  // ⌘V 粘贴文件（如在访达里复制的 .md 和图片）：在「飞书链接」下也会自动切到「本地文件」；粘贴文字照常进输入框
  dlg.onpaste = e => {
    const files = [...(e.clipboardData?.files || [])];
    if (!files.length) return;
    e.preventDefault();
    if (!local) addOutputDoc(t, 'local');
    addPicked(t, files.map(f => ({ file: f, rel: f.name })));
  };
}

/* ----- 本地文件（产出文档） ----- */
// 存到数据仓库 docs/<任务名>/，图片放同目录 assets/，md 里的图片路径改成 assets/…；目前只支持 .md
const LOCAL_MAX = 30 * 1024 * 1024;
const LOCAL_EXT = /\.md$/i, IMG_EXT = /\.(png|jpe?g|gif|webp|svg|bmp)$/i;
const safeSeg = s => (s || '').replace(/[\\/:*?"<>|#%\[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40) || '未命名';
const dirOf = p => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');
const baseOf = p => p.slice(p.lastIndexOf('/') + 1);
function joinPath(dir, rel) {
  const out = dir ? dir.split('/') : [];
  for (const seg of rel.split('/')) { if (!seg || seg === '.') continue; if (seg === '..') out.pop(); else out.push(seg); }
  return out.join('/');
}
const decodeRef = r => { try { return decodeURI(r); } catch { return r; } };
// md 里引用的本地图片：![](…) 和 <img src="…">，跳过网络图片
function mdImageRefs(md) {
  const refs = new Set();
  for (const m of md.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g)) refs.add(m[1]);
  for (const m of md.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) refs.add(m[1]);
  return [...refs].filter(r => !/^[a-z][a-z0-9+.-]*:/i.test(r));
}
async function fileB64(f) {
  const bytes = new Uint8Array(await f.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
// 拖进来的文件夹：递归读出全部文件，带上相对路径
async function droppedFiles(dt) {
  const out = [], entries = [...dt.items].map(i => i.webkitGetAsEntry?.()).filter(Boolean);
  if (!entries.length) return [...dt.files].map(f => ({ file: f, rel: f.name }));
  const walk = async (entry, prefix) => {
    if (entry.isFile) { const f = await new Promise((ok, no) => entry.file(ok, no)); out.push({ file: f, rel: prefix + f.name }); return; }
    const reader = entry.createReader();
    for (let batch; (batch = await new Promise((ok, no) => reader.readEntries(ok, no))).length;) for (const e of batch) await walk(e, prefix + entry.name + '/');
  };
  for (const e of entries) await walk(e, '');
  return out;
}
async function listDir(dir) {
  const r = await gh('GET', null, dir);
  if (r.status === 404) return new Set();
  if (!r.ok) throw new Error(await ghError(r));
  const j = await r.json();
  return new Set(Array.isArray(j) ? j.map(x => x.name) : []);
}
// 同名时加编号：解绑流程方案.md → 解绑流程方案-2.md
function freeName(name, taken) {
  if (!taken.has(name)) return { name, n: 1 };
  const dot = name.lastIndexOf('.'), stem = dot > 0 ? name.slice(0, dot) : name, ext = dot > 0 ? name.slice(dot) : '';
  for (let n = 2; ; n++) if (!taken.has(`${stem}-${n}${ext}`)) return { name: `${stem}-${n}${ext}`, n };
}
const localPick = { files: [], st: null, nameTouched: false };
function wireLocalPick(t) {
  Object.assign(localPick, { files: [], st: null, nameTouched: false });
  const drop = $('#mdDrop'), inp = $('input[type=file]', drop);
  inp.onchange = () => { addPicked(t, [...inp.files].map(f => ({ file: f, rel: f.webkitRelativePath || f.name }))); inp.value = ''; };
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', async e => { e.preventDefault(); drop.classList.remove('over'); addPicked(t, await droppedFiles(e.dataTransfer)); });
  $('#dlg [name=docName]').addEventListener('input', e => { if (e.isTrusted) localPick.nameTouched = true; });
}
// 每次拖入 / 选择都累加（缺图时可以再拖进来补上），然后重新检查
async function addPicked(t, list) {
  for (const x of list) if (!localPick.files.some(y => y.rel === x.rel)) localPick.files.push(x);
  const main = $('#mdPicked'), sub = $('#mdPickedSub'), notes = $('#mdNotes'), drop = $('#mdDrop');
  const md = localPick.files.find(x => LOCAL_EXT.test(x.rel));
  localPick.st = null;
  if (!md) { drop.classList.remove('picked'); notes.innerHTML = `<div class="img-miss">${ICON.x}<div><b>目前只支持 .md 文件</b><span>其他格式以后按需要再支持</span></div></div>`; return; }
  const text = await md.file.text();
  const heading = (text.match(/^#{1,6}\s+(.+)$/m) || [])[1]?.trim() || '';
  const refs = mdImageRefs(text), mdDir = dirOf(md.rel);
  // 先按相对路径找，找不到再按文件名找（只选了文件、没拖文件夹时没有路径）
  const imgs = refs.map(ref => {
    const want = joinPath(mdDir, decodeRef(ref));
    const hit = localPick.files.find(x => x.rel === want) || localPick.files.find(x => IMG_EXT.test(x.rel) && baseOf(x.rel) === baseOf(want));
    return { ref, file: hit?.file || null };
  });
  const missing = imgs.filter(i => !i.file), found = imgs.filter(i => i.file);
  const size = md.file.size + found.reduce((n, i) => n + i.file.size, 0);
  drop.classList.add('picked');
  main.textContent = baseOf(md.rel);
  sub.textContent = [`${(md.file.size / 1024).toFixed(1)} KB`, heading && `读到标题「${heading}」`, !missing.length && found.length && `含 ${found.length} 张图片`].filter(Boolean).join(' · ');
  if (size > LOCAL_MAX) { notes.innerHTML = `<div class="img-miss">${ICON.x}<div><b>文件太大：${(size / 1048576).toFixed(1)} MB</b><span>.md 加图片合计不能超过 30 MB</span></div></div>`; return; }
  if (!cfgReady()) { notes.innerHTML = `<div class="img-miss">${ICON.x}<div><b>还没有连接 GitHub</b><span>本地文件要存到数据仓库，请先点右上角「连接 GitHub」</span></div></div>`; return; }
  const dir = `docs/${safeSeg(firstLine(t.text))}`;
  let taken;
  try { taken = await listDir(dir); } catch (e) { notes.innerHTML = `<div class="img-miss">${ICON.x}<div><b>读取数据仓库失败</b><span>${esc(e.message)}</span></div></div>`; return; }
  const save = freeName(baseOf(md.rel), taken);
  localPick.st = { dir, text, imgs: found, save };
  notes.innerHTML = (missing.length ? `<div class="img-miss">${ICON.x}<div><b>缺 ${missing.length} 张图片：${missing.map(i => esc(decodeRef(i.ref))).join('、')}</b><span>把它拖到上面的框里补上；不补也能上传，缺的图会显示为缺图</span></div></div>` : '')
    + (save.n > 1 ? `<p class="hint">这个任务里已有同名文件，这次保存为「${esc(save.name)}」。</p>` : '');
  const name = $('#dlg [name=docName]');
  if (!localPick.nameTouched) {
    name.value = (heading || baseOf(md.rel).replace(LOCAL_EXT, '')) + (save.n > 1 ? `（${save.n}）` : '');
    name.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
async function uploadLocal(t) {
  const st = localPick.st;
  if (!st) { toast(localPick.files.length ? '这个文件还不能上传，看一下上面的提示' : '请先选择或拖入 .md 文件'); return; }
  const btn = $('#docAddBtn');
  btn.disabled = true; btn.textContent = '上传中…';
  try {
    const put = async (path, content) => {
      const r = await gh('PUT', { message: `workbench: 上传 ${path}`, content, branch: cfg().branch || 'main' }, path);
      if (!r.ok) throw new Error(await ghError(r));
    };
    // 图片先传，传好后把 md 里的引用改成 assets/新文件名
    let text = st.text;
    if (st.imgs.length) {
      const taken = await listDir(`${st.dir}/assets`);
      for (const img of st.imgs) {
        const { name } = freeName(img.file.name, taken);
        taken.add(name);
        await put(`${st.dir}/assets/${name}`, await fileB64(img.file));
        const to = 'assets/' + encodeURI(name), re = img.ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        text = text.replace(new RegExp(`(\\]\\(\\s*<?)${re}(?=[\\s>)])`, 'g'), `$1${to}`).replace(new RegExp(`(src=["'])${re}(?=["'])`, 'g'), `$1${to}`);
      }
    }
    const path = `${st.dir}/${st.save.name}`;
    await put(path, b64enc(text));
    const c = cfg(), kind = $('#dlg [name=docKind]').value, name = $('#dlg [name=docName]').value.trim() || st.save.name.replace(LOCAL_EXT, '');
    const url = `https://github.com/${c.owner}/${c.repo}/blob/${encodeURIComponent(c.branch || 'main')}/${path.split('/').map(encodeURIComponent).join('/')}`;
    patch(t, { docs: [...(t.docs || []), { kind, name, url, path, at: now() }] });
    dlg.close();
    toast('已上传并添加产出文档');
  } catch (e) {
    btn.disabled = false; btn.textContent = '上传并添加';
    toast('上传失败：' + e.message);
  }
}
// 在工作台里查看本地文件：从数据仓库读出 md 排版显示，图片用同一个 Token 读出来再显示
async function openLocalDoc(path) {
  const owner = db.tasks.find(t => (t.docs || []).some(d => d.path === path));
  const doc = owner?.docs.find(d => d.path === path) || { path, name: baseOf(path), url: '' };
  const k = docKind(doc.kind);
  openDialog(`<div class="detail" tabindex="-1" autofocus>
    <div class="d-head">
      <div class="d-main"><div class="d-title">${esc(doc.name)}</div>
        <div class="d-sub"><span class="tag">${esc(k.tag || '文档')}</span><span class="d-when">本地文件 · ${esc(path)}${doc.at ? ' · 上传于 ' + esc(shortTime(doc.at)) : ''}</span></div></div>
      ${doc.url ? `<div class="meet-acts"><a class="btn sm gh-link" href="${esc(doc.url)}" target="_blank" rel="noopener" title="在 GitHub 上打开（需要登录 GitHub）">在 GitHub 查看${ICON.jump}</a></div>` : ''}
    </div>
    <div class="d-body"><div class="d-sec"><div class="md" id="localMd"><p class="d-empty">读取中…</p></div></div></div>
  </div>`, null, 'detail-dlg');
  dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
  const box = $('#localMd');
  try {
    if (!cfgReady()) throw new Error('还没有连接 GitHub');
    const r = await gh('GET', null, path, true);
    if (!r.ok) throw new Error(await ghError(r));
    // 第一个标题和窗口标题重复，正文里不再显示
    box.innerHTML = renderMd((await r.text()).replace(/^\s*#\s+.+\n?/, '').replace(/^\s+/, ''));
    for (const img of $$('img[data-src]', box)) {
      const ir = await gh('GET', null, joinPath(dirOf(path), decodeRef(img.dataset.src)), true).catch(() => null);
      if (ir?.ok) img.src = URL.createObjectURL(await ir.blob());
      else img.replaceWith(Object.assign(document.createElement('span'), { className: 'img-lost', textContent: `〔缺图：${img.alt || baseOf(img.dataset.src)}〕` }));
    }
  } catch (e) { box.innerHTML = `<p class="d-empty">读取失败：${esc(e.message)}</p>`; }
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
  else if (ui.tab === 'docs') v.innerHTML = viewDocs();
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
  // 未完成：有截止时间的在前（已逾期 → 今天 → 由近到远）；没有的按创建时间由新到旧；
  // 同一场会议生成的（创建时间相同）按「我的待办」里的书写顺序挨在一起
  const lineIdx = t => {
    const m = t.meeting && db.meetings.find(x => x.id === t.meeting);
    const i = m ? todoLines(m.myTodos).indexOf((t.todo ?? t.text).trim()) : -1;
    return i < 0 ? Infinity : i;
  };
  const byTodo = (a, b) => (!!b.due - !!a.due) || (a.due ? dueTs(a) - dueTs(b) : b.createdAt - a.createdAt)
    || (a.meeting === b.meeting ? lineIdx(a) - lineIdx(b) : 0) || (a.id < b.id ? -1 : 1);
  const todo = tasks.filter(t => t.status === 'todo').sort(byTodo);
  const doing = tasks.filter(t => t.status === 'doing').sort((a, b) => a.startedAt - b.startedAt);
  const done = tasks.filter(t => t.status === 'done').sort((a, b) => b.doneAt - a.doneAt);
  const deleted = db.tasks.filter(t => t.deletedAt && !t.purged && inScope(t)).sort((a, b) => b.deletedAt - a.deletedAt);

  const cardBody = t => `
      <div class="card-text" data-act="task-open" data-id="${t.id}" title="点击查看">${cardText(t.text)}</div>
      ${t.note?.trim() ? `<div class="card-note" data-act="task-open" data-id="${t.id}">${esc(t.note.trim())}</div>` : ''}
      <div class="card-meta">${ui.project === 'all' ? projectTag(t.project) : ''}${dueTag(t)}${relTags(t)}${t.docs?.length ? `<span class="card-docs">${docBtns(t.docs, ' sm')}</span>` : ''}<span class="card-time">${t.status === 'todo' ? '创建 ' + shortTime(t.createdAt) : '开始 ' + shortTime(t.startedAt)}</span></div>`;
  // 操作按钮放在卡片右侧，不单独占一行；进行中卡片为「完成」+ 一排小图标
  const card = t => t.status === 'todo' ? `
    <div class="card todo-card" id="t-${t.id}">
      <div class="card-main">${cardBody(t)}</div>
      <div class="card-side">
        <button class="start-btn" data-act="task-start" data-id="${t.id}" title="开始：移到「进行中」，开始计工时">${ICON.play}<span class="lbl">开始</span></button>
        <button class="start-btn alt" data-act="task-done" data-id="${t.id}" title="完成：跳过「进行中」直接完成，适合马上就能做完的事">${ICON.check}<span class="lbl">完成</span></button>
        <button class="icon-btn" data-act="task-edit" data-id="${t.id}" title="编辑（删除也在里面）">${ICON.edit}</button>
      </div>
    </div>` : `
    <div class="card todo-card doing-card" id="t-${t.id}">
      <div class="card-main">${cardBody(t)}</div>
      <div class="card-side stack">
        <button class="start-btn" data-act="task-done" data-id="${t.id}" title="完成">${ICON.check}<span class="lbl">完成</span></button>
        <div class="side-icons">
          <button class="icon-btn back" data-act="task-back" data-id="${t.id}" title="回退到未完成">${ICON.undo}</button>
          <button class="icon-btn go" data-act="task-next" data-id="${t.id}" title="新建关联任务（下一步）">${ICON.arrow}</button>
          <button class="icon-btn doc" data-act="task-doc-add" data-id="${t.id}" title="添加产出文档">${ICON.docAdd}</button>
          <button class="icon-btn" data-act="task-edit" data-id="${t.id}" title="编辑（删除也在里面）">${ICON.edit}</button>
        </div>
      </div>
    </div>`;

  return `
    <form class="panel composer" id="taskForm" autocomplete="off">
      <div class="composer-row">
        ${ICON.plus}
        <input class="composer-input" name="text" id="taskInput" placeholder="输入待办（标题：备注），回车保存">
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
        <div class="col-body">${doing.map(card).join('') || '<div class="empty">点「开始」后任务会出现在这里</div>'}</div>
      </div>
    </div>

    <div class="panel fold ${ui.doneOpen ? 'open' : ''}">
      <button class="fold-head" data-act="fold" data-key="doneOpen"><span class="dot" style="background:var(--green)"></span>已完成<span class="n">${done.length}</span><span class="chev">${ICON.down}</span></button>
      ${ui.doneOpen ? `<div class="fold-body">${done.length ? `<div class="done-grid">${done.map(t => {
        const d = new Date(t.doneAt);
        return `<div class="card done-card" id="t-${t.id}">
          <div class="card-title strike" data-act="task-open" data-id="${t.id}" title="${esc(t.text)}">${esc(firstLine(t.text))}</div>
          <div class="done-meta">
            <span class="dm" title="完成时间">${ICON.clock}<b class="mono">${mdSlash(d)} 周${WEEK[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}</b></span>
            <span class="dm" title="工时：工作日 ${WORK_LABEL} 内的进行时长（午休不计）">${ICON.timer}${fmtHours(workHours(t))}</span>
            ${ui.project === 'all' ? projectTag(t.project) : ''}${relTags(t)}${t.docs?.length ? `<span class="card-docs">${docBtns(t.docs, ' sm')}</span>` : ''}
          </div>
          <div class="card-foot">
            <button class="reopen-btn" data-act="task-reopen" data-id="${t.id}">重新打开</button>
            <button class="icon-btn" data-act="task-edit" data-id="${t.id}" title="编辑（删除也在里面）">${ICON.edit}</button>
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
      <div class="wk-label" style="grid-column:1" data-act="task-open" data-id="${t.id}" title="${esc(t.text)}"><span class="dot" style="background:${statusColor(t.status)}"></span><span>${esc(firstLine(t.text))}</span></div>
      ${cells()}
      <div class="wk-track" data-act="task-open" data-id="${t.id}">${segHtml}${markHtml}${note(Math.max(first, ws), Math.min(last, we), text)}${nowLine}</div>
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
      cls: 'ev-done', text: firstLine(t.text), act: 'task-open', id: t.id,
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
      <label>会议类型<input class="field" name="type" list="typeList${inDialog ? 'D' : ''}" value="${esc(m.type || '')}" placeholder="选择或输入新类型"><datalist id="typeList${inDialog ? 'D' : ''}">${meetingTypes().map(t => `<option value="${esc(t)}">`).join('')}</datalist></label>
      <label>关联项目<select class="field" name="project">${projectOptions(m.project ?? (ui.project !== 'all' ? ui.project : ''))}</select></label>
    </div>
    <label>一句话总结<input class="field" name="summary" value="${esc(m.summary)}" placeholder="卡片上只显示这一句"></label>
    <label>讨论要点<textarea class="field" name="points">${esc(m.points)}</textarea></label>
    <label>结论<textarea class="field" name="conclusion">${esc(m.conclusion)}</textarea></label>
    <label><span>我的待办 <span class="hint-inline">每行一条「短标题：详情」，短标题作待办、详情作备注；保存时新行生成待办，改过的行更新原待办；删掉某行时，还没开始的待办会一并删除</span></span><textarea class="field" name="myTodos" placeholder="例如：整理首批商家清单：按 GMV 排序，周五前发群里">${esc(m.myTodos)}</textarea></label>
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
        ${importBtn()}
      </div>
      <div class="composer-more inline-form" ${ui.meetMore ? '' : 'hidden'}>${meetingFields()}<p class="hint">PRD 等其他文档可以在归档后点 ✎ 编辑添加。</p></div>
    </form>

    <div class="panel filters">
      <label class="search">${ICON.search}<input id="mq" placeholder="搜索会议名称、文档名、要点、结论…" value="${esc(ui.mq)}"></label>
      <select class="field" id="mProject">${projectOptions(ui.mProject, '全部项目')}</select>
      <select class="field" id="mType"><option value="all">全部类型</option>${meetingTypes().map(t => `<option ${ui.mType === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
      <input class="field" type="date" id="mFrom" value="${esc(ui.mFrom)}"><span class="to">至</span><input class="field" type="date" id="mTo" value="${esc(ui.mTo)}">
      ${ui.mq || ui.mProject !== 'all' || ui.mType !== 'all' || ui.mFrom || ui.mTo ? '<button class="btn sm" data-act="meet-clear">清除筛选</button>' : ''}
    </div>

    <p class="list-meta">共 <span class="mono">${list.length}</span> 场会议</p>
    <div class="meet-list">${list.map(meetCard).join('') || '<div class="panel empty">没有符合条件的会议记录</div>'}</div>`;
}

/* ----- 文档 ----- */
// 任务的产出文档汇总在一处，按添加 / 完成时间倒序；同一个链接只列一次，来源合并
function allDocs() {
  const map = new Map();
  const add = (d, src) => {
    const e = map.get(d.url) || map.set(d.url, { ...d, srcs: [], ts: 0 }).get(d.url);
    e.srcs.push(src); e.ts = Math.max(e.ts, src.ts);
  };
  db.tasks.filter(t => !t.deletedAt).forEach(t => (t.docs || []).forEach(d => add(d, { kind: 'task', id: t.id, label: firstLine(t.text), done: t.status === 'done', project: t.project, ts: d.at || t.doneAt || t.startedAt || t.createdAt })));
  return [...map.values()].sort((a, b) => b.ts - a.ts);
}
function viewDocs() {
  const q = ui.dq.trim().toLowerCase();
  const list = allDocs()
    .filter(d => ui.project === 'all' || d.srcs.some(s => s.project === ui.project))
    .filter(d => ui.dKind === 'all' || docKind(d.kind).k === ui.dKind)
    .filter(d => !q || [d.name, ...d.srcs.map(s => s.label)].some(v => (v || '').toLowerCase().includes(q)));
  return `
    <div class="panel filters">
      <label class="search">${ICON.search}<input id="dq" placeholder="搜索文档名、任务…" value="${esc(ui.dq)}"></label>
      <select class="field" id="dKind"><option value="all">全部类型</option>${DOC_KINDS.map(k => `<option value="${k.k}" ${ui.dKind === k.k ? 'selected' : ''}>${k.label}</option>`).join('')}</select>
      ${ui.dq || ui.dKind !== 'all' ? '<button class="btn sm" data-act="doc-clear">清除筛选</button>' : ''}
    </div>
    <p class="list-meta">共 <span class="mono">${list.length}</span> 个产出文档</p>
    <div class="doc-list">${list.map(d => `<div class="card doc-item">
      ${docBtn(d)}
      <div class="card-main">
        <div class="doc-name">${esc(d.name || '文档')}</div>
        <div class="card-meta">${ui.project === 'all' ? projectTag(d.srcs.find(s => s.project)?.project) : ''}${d.srcs.map(s =>
          `<span class="rel" data-act="task-open" data-id="${s.id}">${esc(s.label)}${s.done ? ' ✓' : ' · 进行中'}</span>`).join('')}<span class="card-time">${mdSlash(d.ts)}</span></div>
      </div>
    </div>`).join('') || '<div class="panel empty">还没有产出文档。进行中的任务点 📄+ 添加后会出现在这里</div>'}</div>`;
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

const meetDocBtn = (url, icon, title, cls = '') =>
  `<a class="doc-btn${cls}" href="${esc(url)}" target="_blank" rel="noopener" title="${esc(title)}">${icon}</a>`;
const kindOrder = d => DOC_KINDS.indexOf(docKind(d.kind));
// 一排文档按钮（会议卡片、任务卡片、文档页共用）；sm 为任务卡片上的小号
const docBtn = (doc, sm = '') => {
  const k = docKind(doc.kind), tagged = k.tag && !k.jump;
  const [icon, title, cls] = tagged ? [esc(k.tag), `${k.label}：${doc.name || ''}`, ' doc-tag' + sm] : [ICON.jump, doc.name || k.tag || '文档', sm];
  // 本地文件（存在数据仓库里）点开在工作台里查看
  return doc.path ? `<button type="button" class="doc-btn${cls}" data-act="doc-view" data-path="${esc(doc.path)}" title="${esc(title)}（本地文件）">${icon}</button>` : meetDocBtn(doc.url, icon, title, cls);
};
const docBtns = (docs, sm = '') => [...(docs || [])].sort((a, b) => kindOrder(a) - kindOrder(b)).map(d => docBtn(d, sm)).join('');
// 一行文档：「文档名 | 链接」「[文档名](链接)」或只有链接；label 是所在标签对应的类型
function docFromLine(l, label = 'other', fallbackName = '') {
  const md = l.match(/\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/), i = l.lastIndexOf('|');
  const name = md ? md[1].trim() : i < 0 ? '' : l.slice(0, i).replace(/^[-*•]\s*/, '').trim(), url = md ? md[2] : findUrl(i < 0 ? l : l.slice(i + 1));
  const tagged = splitDocName(name), clean = (tagged ? tagged.name : name) || fallbackName;
  const kind = tagged?.kind || (label === 'other' ? docKindOf(clean) : label);
  return url ? { kind, name: clean || docKind(kind).tag || '文档', url } : null;
}
function meetActs(m) {
  return `<div class="meet-acts">
      ${m.link ? meetDocBtn(m.link, ICON.mic, '会议纪要')
        : `<button class="doc-btn missing" data-act="meet-edit" data-id="${m.id}" title="还没有会议纪要链接，点击补充">${ICON.mic}</button>`}
      ${docBtns(m.docs)}
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
  const sec = (title, body) => body ? `<div class="d-sec"><h4><i></i>${title}</h4>${body}</div>` : '';
  const text = v => v ? `<div class="md">${renderMd(v)}</div>` : '';
  // tabindex + autofocus：打开时焦点落在窗口本身，不让第一个文档按钮出现焦点框
  openDialog(`<div class="detail" tabindex="-1" autofocus>
    <div class="d-head">
      <div class="d-main"><div class="d-title">${esc(m.title)}</div>
        <div class="d-sub"><span class="d-when">${mdSlash(d)} 周${WEEK[d.getDay()]}${time}</span><span class="tag purple">${esc(m.type || '其他')}</span>${projectTag(m.project)}</div></div>
      ${meetActs(m)}
    </div>
    <div class="d-body">
    ${m.summary ? `<div class="d-summary">${esc(m.summary)}</div>` : ''}
    ${sec('讨论要点', text(m.points))}
    ${sec('结论', text(m.conclusion))}
    <div class="d-sec"><h4><i></i>我的待办<button class="h4-btn" data-act="meet-todo-new" data-id="${m.id}" title="挂到这场会议下，创建时间记为会议结束时间">${ICON.plus}新建</button></h4>
      <form class="d-add" id="meetTodoForm" data-id="${m.id}" autocomplete="off" hidden>${ICON.plus}<input name="text" placeholder="短标题：详情，回车保存，Esc 取消"></form>${mine.map(t => `<div class="d-todo" data-act="goto-task" data-id="${t.id}" title="跳到看板">
      <span class="d-st ${ST_CLASS[t.status]}">${STATUS[t.status]}</span>
      <span class="d-todo-main"><span class="d-todo-text">${esc(firstLine(t.text))}</span>${t.note?.trim() ? `<span class="d-todo-note">${esc(t.note.trim())}</span>` : ''}</span>
      ${t.docs?.length ? `<span class="card-docs">${docBtns(t.docs, ' sm')}</span>` : ''}${ICON.arrow}</div>`).join('')}
    </div>
    ${sec('他人待办', text(m.othersTodos))}
    ${sec('附件文档', attachList(m.docs))}
    ${m.summary || m.points || m.conclusion || mine.length || m.othersTodos ? '' : '<p class="d-empty">还没有填写总结、要点和待办，点 ✎ 补充</p>'}
    </div>
  </div>`, null, 'detail-dlg');
  // 点窗口外（遮罩）关闭
  dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
}

// 轻量 Markdown：列表（1. / 1.1 / -）悬挂缩进，层级按缩进排名；有下级的条目、冒号前的短标签加粗；支持 **粗体**、`代码`、# 小标题
function mdInline(s, boldLabel) {
  // 图片：网络图片直接显示，相对路径记在 data-src，由查看窗口读出来再显示
  let h = esc(s).replace(/!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+&quot;[^)]*&quot;)?\s*\)/g, (_, alt, src) =>
    /^https?:\/\//i.test(src) ? `<img alt="${alt}" src="${src}">` : /^[a-z][a-z0-9+.-]*:/i.test(src) ? '' : `<img alt="${alt}" data-src="${src}">`)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>');
  if (boldLabel) h = h.replace(/^([^：:<>。，,]{1,18}?)([：:])(?=\s*\S)/, '<b>$1$2</b>');
  return h;
}
function renderMd(src) {
  const items = String(src || '').replace(/\r/g, '').split('\n').map(line => {
    if (!line.trim()) return { kind: 'gap' };
    const indent = line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
    const t = line.trim();
    let m;
    if ((m = t.match(/^#{1,4}\s+(.+)/))) return { kind: 'h', text: m[1], indent };
    if ((m = t.match(/^(\d+(?:\.\d+)*)[.、)）]?\s+(.+)/))) return { kind: 'li', marker: m[1].includes('.') ? m[1] : m[1] + '.', text: m[2], indent };
    if ((m = t.match(/^[-*•·]\s+(.+)/))) return { kind: 'li', marker: '•', bullet: true, text: m[1], indent };
    return { kind: 'p', text: t, indent };
  });
  // 缩进按出现过的值排名得到层级，2/3/4 空格混用也不乱
  const indents = [...new Set(items.filter(i => i.kind === 'li' || i.kind === 'p').map(i => i.indent))].sort((a, b) => a - b);
  const lv = i => Math.min(indents.indexOf(i.indent), 4);
  return items.map((it, k) => {
    if (it.kind === 'gap') return '<div class="md-gap"></div>';
    if (it.kind === 'h') return `<div class="md-h">${mdInline(it.text)}</div>`;
    if (it.kind === 'p') return `<div class="md-p" style="--lv:${lv(it)}">${mdInline(it.text, true)}</div>`;
    const next = items.slice(k + 1).find(n => n.kind === 'li' || n.kind === 'p');
    const group = next && lv(next) > lv(it);
    const labeled = /^[^：:<>。，,]{1,18}?[：:]\s*\S/.test(it.text);
    return `<div class="md-li${it.bullet ? ' bullet' : ''}${group ? ' group' : ''}${labeled ? ' labeled' : ''}" style="--lv:${lv(it)}"><span class="md-mk">${it.marker}</span><span>${mdInline(it.text, true)}</span></div>`;
  }).join('');
}

// 「我的待办」每行生成一条关联待办；已有同名关联待办（含已删除）的不重复生成
// 会议结束时间（没有结束时间用开始时间）；还没到或没填时间时取当前时间
function meetingEndTs(m) {
  const clock = m.end || m.start;
  const ts = m.date && clock ? new Date(`${m.date}T${clock}`).getTime() : 0;
  return ts && ts < now() ? ts : now();
}
// 「我的待办」每行写成「短标题：详情」，短标题作待办内容，详情作备注；没有冒号就只有标题
// 冒号不能是时间（10:30）或链接（https://）里的
function splitTodo(line) {
  const m = (line || '').match(/^(.+?)\s*(?:：|(?<!\d):(?!\/\/|\d))\s*(.+)$/s);
  return m ? { title: m[1].trim(), detail: m[2].trim() } : { title: (line || '').trim(), detail: '' };
}
const todoLines = v => (v || '').split(/\n+/).map(s => s.replace(/^\s*(?:[-*•]|\d+[.、)）])\s*/, '').trim()).filter(Boolean);
// 两段文字的相近程度（相邻两字的重合比例，0～1）
function similarity(a, b) {
  const grams = s => { const g = new Map(); for (let i = 0; i < s.length - 1; i++) { const k = s.slice(i, i + 2); g.set(k, (g.get(k) || 0) + 1); } return g; };
  const ga = grams(a), gb = grams(b);
  let hit = 0;
  for (const [k, n] of ga) hit += Math.min(n, gb.get(k) || 0);
  return ga.size + gb.size ? (2 * hit) / (a.length - 1 + b.length - 1 || 1) : 0;
}
// 「我的待办」每行对应一条关联待办，待办上的 todo 记着它来自哪一行（旧数据没有时按待办内容算）
// 文档里改了某一行：同一位置被替换、或新旧两行足够相近时，更新原来那条待办（状态和变更记录保留），不再新建；
// 待办在看板上改过内容 / 备注的，那一项保持你改的，不覆盖。真正新增的行才生成新待办（创建时间为会议结束时间）
function syncMyTodos(m, prev = '') {
  const lines = todoLines(m.myTodos), before = todoLines(prev);
  const linked = db.tasks.filter(t => t.meeting === m.id && !t.manual && !t.purged);   // 手动加的、已彻底删除的不参与对应
  const keyOf = t => (t.todo ?? t.text).trim();
  const free = linked.filter(t => !lines.includes(keyOf(t)));   // 对不上任何一行的待办（行被改了或删了）
  let changed = 0;
  const fresh = lines.filter(l => !linked.some(t => keyOf(t) === l)).filter(l => {
    const pos = lines.indexOf(l), samePos = before[pos] && !lines.includes(before[pos]) ? before[pos] : null;
    // 旧数据：这一行早就在了却没有对应待办，而某条待办的内容也不在旧的行里（看板上改过名字），就是它们俩
    const orphan = t => before.includes(l) && !before.includes(keyOf(t));
    const best = free.map(t => ({ t, orphan: orphan(t), score: keyOf(t) === samePos || orphan(t) ? 1 : similarity(keyOf(t), l) }))
      .sort((a, b) => b.score - a.score)[0];
    if (!best || best.score < 0.35) return true;
    const t = best.t;
    free.splice(free.indexOf(t), 1);
    const was = splitTodo(keyOf(t)), next = splitTodo(l), patch = { todo: l, u: now() };
    if (!best.orphan && [was.title, keyOf(t)].includes(t.text.trim())) patch.text = next.title;
    if (!best.orphan && [was.detail, ''].includes((t.note || '').trim())) patch.note = next.detail;
    Object.assign(t, patch);
    changed++;
    return false;
  });
  const createdAt = meetingEndTs(m);
  fresh.forEach(l => {
    const { title, detail } = splitTodo(l);
    const t = addTask(title, { note: detail, project: m.project, meeting: m.id, createdAt, silent: true });
    t.todo = l;
  });
  // 文档里删掉的行：对应待办还没开始的，彻底删除（不进「已删除」）；已开始 / 已完成的保留
  const gone = free.filter(t => before.includes(keyOf(t)) && !t.deletedAt && t.status === 'todo');
  gone.forEach(t => Object.assign(t, { deletedAt: now(), purged: 1, text: '', note: '', todo: '', log: withLog(t, 'delete'), u: now() }));
  return { n: fresh.length, changed, removed: gone.length };
}
const todoMsg = r => [r.n && `生成 ${r.n} 条关联待办`, r.changed && `更新 ${r.changed} 条关联待办`, r.removed && `删除 ${r.removed} 条关联待办`].filter(Boolean).join('，');

/* ----- 自动导入会议纪要 ----- */
// 选定本机的纪要文件夹后，打开页面时自动读取新建 / 修改过的 .md（按【会议名称】【纪要链接】…模板），归档进会议索引
// 纪要链接必填；文档改过后更新原来那条会议记录；「我的待办」新增的行生成关联待办
const LS_IMPORT = 'wb.import';  // 已读过的纪要文件：文件名 → 修改时间
const MD_KEYS = {
  会议名称: 'title', 纪要链接: 'link', 日期: 'date', 时间: 'time', 类型: 'type', 会议类型: 'type', 项目: 'project', 关联项目: 'project',
  MRD: 'mrd', 需求文档: 'mrd', PRD: 'prd', 产品需求文档: 'prd', TDD: 'tdd', 技术方案: 'tdd', 技术方案文档: 'tdd',
  'FE-TDD': 'fe', 前端技术方案: 'fe', 'BE-TDD': 'be', 后端技术方案: 'be', TC: 'tc', 测试方案: 'tc',
  周会跟踪表: 'track', 跟踪表: 'track', TRACKING: 'track', 其他文档: 'other', 文档: 'other',
  一句话总结: 'summary', 讨论要点: 'points', 结论: 'conclusion', 我的待办: 'myTodos', 他人待办: 'othersTodos',
};

// 日期接受 2026-10-27、10/27、10月27日；没写时从文件名「YYYYMMDD-HHMM-…」里取
function normDate(s, fileName) {
  let m = s.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/(\d{1,2})[/月](\d{1,2})/);
  if (m) return `${new Date().getFullYear()}-${pad(m[1])}-${pad(m[2])}`;
  m = fileName.match(/^(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : today();
}
const findUrl = s => (String(s || '').match(/https?:\/\/[^\s)\]>）]+/i) || [''])[0];
const normClock = s => { const m = (s || '').match(/(\d{1,2})[:：](\d{2})/); return m ? `${pad(m[1])}:${m[2]}` : ''; };

function parseMinutes(text, fileName) {
  const raw = {};
  let cur = null;
  for (const line of text.split(/\r?\n/)) {
    // 兼容「- **【纪要链接】**：…」「## 【讨论要点】」这类写法
    const m = line.match(/^\s*(?:[-*>#]+\s*)?(?:\*\*|__)?【(.+?)】(?:\*\*|__)?\s*[:：]?\s*(.*)$/);
    // 标签也可能写成「PRD/产品需求文档」，任一部分认得就行
    const key = m && [m[1], ...m[1].split(/[/／|]/)].map(x => MD_KEYS[x.trim()] || MD_KEYS[x.trim().toUpperCase()]).find(Boolean);
    if (key) { cur = key; (raw[cur] ||= []).push(...(m[2].trim() ? [m[2]] : [])); }
    else if (cur) raw[cur].push(line);
  }
  const val = k => (raw[k] || []).join('\n').trim();
  const lines = k => val(k).split('\n').map(s => s.trim()).filter(Boolean);
  const [start, end] = val('time').split(/[-–—~～至]/);
  const fnClock = fileName.match(/^\d{8}-(\d{2})(\d{2})/);
  // 文档每行「文档名 | 链接」或 Markdown 链接「[文档名](链接)」，只有链接时名字留空
  const docs = DOC_KINDS.flatMap(({ k: label }) => lines(label).map(l => docFromLine(l, label))).filter(Boolean);
  return {
    title: val('title').replace(/^#+\s*|\*\*/g, '').trim(), link: findUrl(val('link')),
    date: normDate(val('date'), fileName),
    start: normClock(start) || (val('time') ? '' : fnClock ? `${fnClock[1]}:${fnClock[2]}` : ''), end: normClock(end),
    // 类型、项目留空时由导入时从会议名称 / 文件名里补；项目名写了但对不上时记下来提示
    type: val('type').replace(/\*\*/g, '').trim(), project: matchProject(val('project')), projectName: val('project'),
    summary: val('summary'), points: val('points'), conclusion: val('conclusion'),
    myTodos: lines('myTodos').map(l => l.replace(/^(?:[-*•]|\d+[.、)）])\s*/, '')).filter(Boolean).join('\n'), othersTodos: val('othersTodos'), docs,
  };
}

// 自动检查只读新建 / 修改过的文件；手动点按钮时全部重读（内容没变的不会重复导入）
async function importMinutes(files, all = false) {
  const seen = load(LS_IMPORT, {});
  const res = { added: [], updated: [], todos: 0, todoChanged: 0, todoRemoved: 0, bad: [], files: [] };
  const note = (name, st, msg = '') => res.files.push({ name, st, msg });
  for (const file of files) {
    if (!/\.md$/i.test(file.name) || (!all && seen[file.name] === file.lastModified)) continue;
    const { projectName, ...m } = parseMinutes(await file.text(), file.name);
    seen[file.name] = file.lastModified;  // 缺字段的文件改好后修改时间会变，到时再读
    if (!m.title || !m.link) {
      res.bad.push(file.name);
      note(file.name, 'bad', `没有读到${[!m.title && '【会议名称】', !m.link && '【纪要链接】（需要 http 开头的链接）'].filter(Boolean).join('和')}`);
      continue;
    }
    // 同一份纪要：先按纪要链接找，链接改过时按来源文件找；找到就用文档内容更新原记录
    const old = findByLink(m.link) || db.meetings.find(x => !x.deletedAt && x.src === file.name);
    // 类型 / 项目：纪要里写的 > 网页上已设的 > 从会议名称、文件名里找到的；类型都没有时记为「其他」
    const guess = `${m.title} ${file.name}`, keepType = old?.type && old.type !== '其他' ? old.type : '';
    m.type = m.type || keepType || typeIn(guess) || '其他';
    m.project = m.project || old?.project || projectIn(guess);
    const info = rec => [rec.title, `类型：${rec.type}`, `项目：${projectOf(rec.project)?.name || '无'}`,
      projectName && !matchProject(projectName) ? `纪要里的项目「${projectName}」没有对上现有项目` : ''].filter(Boolean).join(' · ');
    if (!old) {
      const rec = { id: uid(), ...m, src: file.name, createdAt: now(), deletedAt: 0, u: now() };
      db.meetings.push(rec);
      res.todos += syncMyTodos(rec).n;
      res.added.push(rec.title);
      note(file.name, 'add', info(rec));
      continue;
    }
    // 网页上补的文档也保留
    const next = { ...m, docs: mergeDocs(m.docs, old.docs) };
    if (Object.keys(next).every(k => JSON.stringify(next[k] ?? '') === JSON.stringify(old[k] ?? ''))) { note(file.name, 'same', info(old)); continue; }
    const prev = old.myTodos;
    Object.assign(old, next, { src: file.name, u: now() });
    const r = syncMyTodos(old, prev);
    res.todos += r.n; res.todoChanged += r.changed; res.todoRemoved += r.removed;
    res.updated.push(old.title);
    note(file.name, 'upd', info(old));
  }
  store(LS_IMPORT, seen);
  if (res.added.length || res.updated.length) commit();
  return res;
}
const mergeDocs = (a, b) => [...a, ...(b || []).filter(d => !a.some(x => x.url === d.url))];
function importReport(r, manual) {
  const parts = [];
  if (r.added.length) parts.push(`已导入 ${r.added.length} 场会议`);
  if (r.updated.length) parts.push(`已更新 ${r.updated.length} 场：${r.updated.join('、')}`);
  const tm = todoMsg({ n: r.todos, changed: r.todoChanged, removed: r.todoRemoved });
  if (tm) parts.push(tm);
  if (r.bad.length) parts.push(`缺少会议名称或纪要链接：${r.bad.join('、')}`);
  if (manual) return importResult(r);
  if (parts.length) toast(parts.join('；'));
}
// 手动检查时弹窗列出每个文件的结果，不会像提示条那样几秒就消失
const IMPORT_ST = { add: ['新增', 'green'], upd: ['已更新', 'green'], same: ['无变化', ''], bad: ['未导入', 'red'] };
function importResult(r) {
  openDialog(`<form>
    <h3>导入纪要${imp.dir ? `：${esc(imp.dir.name)}` : ''}</h3>
    ${r.files.length ? `<div class="tbl-wrap"><table class="tbl"><tbody>${r.files.map(f => `<tr>
      <td><span class="tag ${IMPORT_ST[f.st][1]}">${IMPORT_ST[f.st][0]}</span></td>
      <td class="t" title="${esc(f.name)}">${esc(f.name)}${f.msg ? `<div class="hint">${esc(f.msg)}</div>` : ''}</td></tr>`).join('')}</tbody></table></div>`
      : '<p class="hint">文件夹里没有 .md 文件。纪要需要直接放在这个文件夹里，子文件夹不会读取。</p>'}
    ${r.todos || r.todoChanged || r.todoRemoved ? `<p class="hint">${todoMsg({ n: r.todos, changed: r.todoChanged, removed: r.todoRemoved })}。</p>` : ''}
    ${r.bad.length ? '<p class="hint">未导入的文件请按模板补上【会议名称】和【纪要链接】，保存后会自动重新导入。</p>' : ''}
    <div class="acts"><button class="btn primary">好的</button></div>
  </form>`, () => {});
}

// 文件夹句柄存在 IndexedDB（localStorage 存不了），下次打开页面还能用
function idb(mode, fn) {
  return new Promise((ok, no) => {
    const r = indexedDB.open('wb', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onerror = () => no(r.error);
    r.onsuccess = () => {
      try {
        const tx = r.result.transaction('kv', mode), q = fn(tx.objectStore('kv'));
        tx.oncomplete = () => ok(q.result);
        tx.onerror = () => no(tx.error);
      } catch (e) { no(e); }
    };
  });
}
const imp = { dir: null, perm: '', last: 0, asked: false, busy: false };
async function dirFiles(dir) {
  const out = [];
  for await (const h of dir.values()) if (h.kind === 'file' && /\.md$/i.test(h.name)) out.push(await h.getFile());
  return out;
}

// 打开页面 / 切回页面时自动跑；浏览器要求重新授权时，只能等用户点一下
async function autoImport(manual = false) {
  if (!window.showDirectoryPicker) return;
  if (!imp.dir) imp.dir = await idb('readonly', s => s.get('minutesDir')).catch(() => null) || null;
  if (!imp.dir) return;
  const perm = await imp.dir.queryPermission({ mode: 'read' });
  if (perm !== imp.perm) { imp.perm = perm; render(); }
  if (perm !== 'granted') {
    if (!imp.asked) { imp.asked = true; toast(`自动导入纪要需要授权读取「${imp.dir.name}」`, () => importClick(), '授权'); }
    return;
  }
  // 只比对文件修改时间，开销很小；同时触发的几次检查（如切回窗口时 focus 和 visibilitychange）只跑一次
  if (imp.busy || (!manual && now() - imp.last < 20000)) return;
  imp.busy = true; imp.last = now();
  try { importReport(await importMinutes(await dirFiles(imp.dir), manual), manual); }
  finally { imp.busy = false; }
}
const runImport = manual => autoImport(manual).catch(e => toast('导入纪要失败：' + (e.message || e)));

// 按住 Alt / Option 点击可以更换文件夹
async function importClick(change = false) {
  if (!window.showDirectoryPicker) return pickMinutesFiles();
  try {
    if (imp.dir && !change && await imp.dir.requestPermission({ mode: 'read' }) === 'granted') { imp.perm = 'granted'; render(); return runImport(true); }
    imp.dir = await showDirectoryPicker({ id: 'minutes', mode: 'read' });
    await idb('readwrite', s => s.put(imp.dir, 'minutesDir')).catch(() => {});
    imp.perm = 'granted'; render();
    toast(`已连接「${imp.dir.name}」，以后打开工作台会自动导入新纪要`);
    setTimeout(() => runImport(true), 1500);
  } catch (e) { if (e.name !== 'AbortError') toast('导入纪要失败：' + e.message); }
}
// Safari / Firefox 不支持记住文件夹，只能每次手动选
function pickMinutesFiles() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.multiple = true; inp.webkitdirectory = true; inp.hidden = true;
  document.body.appendChild(inp);
  inp.onchange = () => { inp.remove(); importMinutes([...inp.files], true).then(r => importReport(r, true)); };
  inp.click();
}
function importBtn() {
  if (!imp.dir) return `<button type="button" class="btn" data-act="meet-import" title="选择本机的会议纪要文件夹，之后打开工作台自动导入新纪要">${ICON.folder}<span class="lbl">自动导入</span></button>`;
  const ok = imp.perm === 'granted';
  return `<button type="button" class="btn${ok ? '' : ' warn'}" data-act="meet-import" title="${ok ? `已连接「${esc(imp.dir.name)}」，点击立即检查；按住 Alt 点击更换文件夹` : '点击授权后继续自动导入'}">${ICON.folder}<span class="lbl">${ok ? esc(imp.dir.name) : '授权导入'}</span></button>`;
}

/* ========== 对话框 ========== */
const dlg = $('#dlg');
function openDialog(html, onSubmit, cls = '') {
  if (dlg.open) dlg.close();
  dlg.onclick = null; dlg.onpaste = null;
  dlg.className = 'dlg ' + cls;
  dlg.innerHTML = html;
  const form = $('form', dlg);
  if (form && onSubmit) form.onsubmit = e => { e.preventDefault(); if (onSubmit(new FormData(form), e.submitter) !== false) dlg.close(); };
  $$('[data-close]', dlg).forEach(b => b.onclick = () => dlg.close());
  dlg.showModal();
}

// 会议详情的附件文档：中文类型名 + 文档标题，整行点击跳转（会议纪要在右上角 🎤，不列在这里）
const DOC_CN = { mrd: '需求文档', prd: '产品需求文档', tdd: '技术方案', fe: '前端技术方案', be: '后端技术方案', tc: '测试方案', track: '周会跟踪表', other: '其他文档' };
const attachList = docs => [...(docs || [])].sort((a, b) => kindOrder(a) - kindOrder(b)).map(d =>
  `<a class="d-todo d-attach" href="${esc(d.url)}" target="_blank" rel="noopener" title="${esc(d.url)}"><span class="d-attach-kind">${DOC_CN[docKind(d.kind).k]}</span><span class="d-todo-text">${esc(d.name || '文档')}</span>${ICON.jump}</a>`).join('');
// 详情窗口里的文档列表：类型 + 文档名，点击打开
const docList = docs => (docs || []).length ? [...docs].sort((a, b) => kindOrder(a) - kindOrder(b)).map(d => {
  const k = docKind(d.kind);
  const inner = `<span class="tag">${esc(k.tag || '文档')}</span><span class="d-todo-text">${esc(d.name || k.tag || '文档')}</span>${ICON.jump}`;
  return d.path ? `<div class="d-todo d-doc" data-act="doc-view" data-path="${esc(d.path)}">${inner}</div>` : `<a class="d-todo d-doc" href="${esc(d.url)}" target="_blank" rel="noopener">${inner}</a>`;
}).join('') : '';
// 任务详情：只读，点窗口外关闭；点 ✎ 才进入编辑（删除在编辑窗口里）
function openTaskDetail(t) {
  const [title, ...rest] = t.text.split('\n');
  const desc = rest.join('\n').trim();
  const sec = (h, body) => body ? `<div class="d-sec"><h4><i></i>${h}</h4>${body}</div>` : '';
  const meeting = t.meeting && db.meetings.find(m => m.id === t.meeting && !m.deletedAt);
  const parent = t.parent && findTask(t.parent);
  openDialog(`<div class="detail" tabindex="-1" autofocus>
    <div class="d-head">
      <div class="d-main"><div class="d-title">${esc(title)}</div>
        <div class="d-sub"><span class="d-st ${ST_CLASS[t.status]}">${STATUS[t.status]}</span>${projectTag(t.project)}${dueTag(t)}</div></div>
      <div class="meet-acts"><button class="ib" data-act="task-edit" data-id="${t.id}" title="编辑（删除也在里面）">${ICON.edit}</button></div>
    </div>
    <div class="d-body">
    ${sec('描述', desc && `<div class="md">${renderMd(desc)}</div>`)}
    ${sec('备注', t.note?.trim() && `<div class="md">${renderMd(t.note.trim())}</div>`)}
    ${sec('产出文档', docList(t.docs))}
    ${sec('关联', [meeting && `<div class="d-todo" data-act="meet-open" data-id="${meeting.id}"><span class="d-todo-text">会议：${esc(meeting.title)}</span>${ICON.arrow}</div>`,
      parent && `<div class="d-todo" data-act="goto-task" data-id="${parent.id}"><span class="d-todo-text">上一步：${esc(firstLine(parent.text))}</span>${ICON.arrow}</div>`].filter(Boolean).join(''))}
    ${sec('变更记录', `<div class="timeline">${logOf(t).map((e, i, l) => `
      <div class="tl-item tl-${e.a}"><i></i><span class="mono">${fmtTime(e.t)}</span><b>${LOG_TEXT[e.a] || e.a}</b>${i ? `<em>${fmtDur(e.t - l[i - 1].t)}后</em>` : ''}</div>`).join('')}</div>`)}
    </div>
  </div>`, null, 'detail-dlg');
  dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
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
    ${docsEdit(t.docs, '产出文档')}
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
    patch(t, { text: f.get('text').trim() || t.text, project: f.get('project'), due: readDue(f), note: f.get('note'), docs: readDocs($('#dlg form'), firstLine(f.get('text').trim() || t.text)), ...times });
  });
  wireDocs($('#dlg form'));
  $('#dlgDel').onclick = () => { dlg.close(); removeTask(t); };
}

// 只接受 http(s) 链接，避免 javascript: 之类的地址
const safeLink = v => (/^https?:\/\/\S+$/i.test((v || '').trim()) ? v.trim() : '');
const findByLink = link => link && db.meetings.find(m => !m.deletedAt && m.link === link);

function readMeeting(f) {
  return {
    link: safeLink(f.get('link')),
    date: f.get('date') || today(), start: f.get('start') || '', end: f.get('end') || '',
    type: (f.get('type') || '').trim() || '其他', project: f.get('project') || '',
    summary: (f.get('summary') || '').trim(),
    points: (f.get('points') || '').trim(), conclusion: (f.get('conclusion') || '').trim(),
    myTodos: (f.get('myTodos') || '').trim(), othersTodos: (f.get('othersTodos') || '').trim(),
  };
}

// 其他文档：每行 类型 + 文档名 + 链接
const docRow = (doc = {}) => `<div class="doc-row">
  <select class="field" name="docKind" data-touched="${doc.kind ? 1 : ''}">${DOC_KINDS.map(d => `<option value="${d.k}" title="${d.label}" ${docKind(doc.kind).k === d.k ? 'selected' : ''}>${d.tag || '其他'}</option>`).join('')}</select>
  <input class="field" name="docName" value="${esc(doc.name)}" placeholder="文档名">
  <input class="field" name="docUrl" type="url" value="${esc(doc.url)}" placeholder="粘贴飞书链接">
  <button type="button" class="ib del" data-doc-del title="移除">${ICON.x}</button>
</div>`;
function readDocs(form, fallbackName = '') {
  return $$('.doc-row', form).map(row => {
    const raw = $('[name=docName]', row).value.trim(), tagged = splitDocName(raw);
    const kind = tagged?.kind || $('[name=docKind]', row).value, url = safeLink($('[name=docUrl]', row).value);
    const name = (tagged ? tagged.name : raw) || fallbackName || docKind(kind).tag || '文档';
    return url ? { kind, name, url } : null;
  }).filter(Boolean);
}

// 编辑窗口里的文档区（会议的其他文档、任务的产出文档）
const docsEdit = (docs, label) => `<div class="docs-edit"><div class="docs-label">${label}</div>
  <div class="doc-rows">${(docs || []).map(docRow).join('')}</div>
  <button type="button" class="add-doc" data-doc-add>${ICON.plus}添加文档</button>
</div>`;
function wireDocs(form) {
  form.addEventListener('click', e => {
    if (e.target.closest('[data-doc-add]')) { $('.doc-rows', form).insertAdjacentHTML('beforeend', docRow()); $('.doc-row:last-child [name=docName]', form).focus(); }
    const del = e.target.closest('[data-doc-del]');
    if (del) del.closest('.doc-row').remove();
  });
  // 按文档名自动选类型（手动改过类型就不再自动切）
  form.addEventListener('input', e => {
    if (e.target.name !== 'docName') return;
    const sel = $('[name=docKind]', e.target.closest('.doc-row'));
    if (!sel.dataset.touched) sel.value = docKindOf(e.target.value);
  });
  form.addEventListener('change', e => { if (e.target.name === 'docKind') e.target.dataset.touched = '1'; });
  // 粘贴链接：从飞书复制的内容常带着标题（富文本里的链接文字，或「标题 换行 链接」），文档名还空着就自动填上
  form.addEventListener('paste', e => {
    if (e.target.name !== 'docUrl') return;
    const html = e.clipboardData.getData('text/html'), plain = e.clipboardData.getData('text/plain');
    const url = findUrl(plain) || findUrl(html);
    if (!url) return;
    let title = '';
    if (html) {
      const a = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('a')].find(x => x.href === url || x.textContent.trim());
      title = a?.textContent.trim() || '';
    }
    // 「标题 | 链接」（书签小工具复制的格式）或 Markdown「[标题](链接)」写在同一行
    const same = plain.split('\n').map(l => l.trim()).find(l => l.includes(url)) || '';
    const md = same.match(/^\[([^\]]+)\]\(/), bar = same.lastIndexOf('|');
    if (!title && md) title = md[1].trim();
    if (!title && bar > 0) title = same.slice(0, bar).trim();
    if (!title) title = plain.split('\n').map(l => l.trim()).find(l => l && !l.includes(url)) || '';
    if (title === url || /^https?:\/\//.test(title)) title = '';
    e.preventDefault();
    e.target.value = url;
    const row = e.target.closest('.doc-row'), name = $('[name=docName]', row);
    if (title && !name.value.trim()) { name.value = title; name.dispatchEvent(new Event('input', { bubbles: true })); }
  });
}

function editMeeting(m) {
  openDialog(`<form>
    <h3>编辑会议</h3>
    <label>会议名称<input class="field" name="title" value="${esc(m.title)}" required></label>
    ${meetingFields(m, true)}
    ${docsEdit(m.docs, '其他文档')}
    <div class="acts">
      <button type="button" class="btn danger left" id="dlgDel">删除</button>
      <button type="button" class="btn" data-close>取消</button>
      <button class="btn primary">保存</button>
    </div>
  </form>`, f => {
    const prev = m.myTodos;
    Object.assign(m, { title: f.get('title').trim() || m.title, ...readMeeting(f), docs: readDocs($('#dlg form')), u: now() });
    const msg = todoMsg(syncMyTodos(m, prev));
    commit();
    if (msg) toast(`已${msg}`);
  });
  wireDocs($('#dlg form'));
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
    const tasks = db.tasks.filter(t => !t.deletedAt && (!q || [t.text, t.note, ...(t.docs || []).map(d => d.name)].join(' ').toLowerCase().includes(q)))
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
    else if (h.kind === 'task') openTaskDetail(h.o);
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

// filePath 默认是数据文件；读 docs/ 下的本地文件时传 raw，拿原始内容（超过 1MB 的文件也能读）
async function gh(method, body, filePath = cfg().path, raw = false) {
  const c = cfg();
  const path = filePath.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${path}`
    + (method === 'GET' ? `?ref=${encodeURIComponent(c.branch || 'main')}` : '');
  return fetch(url, {
    method, cache: 'no-store',
    headers: { Authorization: `Bearer ${c.token}`, Accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
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
function toast(msg, undo, label = '撤销') {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>${undo ? `<button>${esc(label)}</button>` : ''}`;
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
    case 'task-open': openTaskDetail(findTask(id)); break;
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
      if (!flashTask(id)) openTaskDetail(t);
      break;
    }
    case 'task-start': setStatus(findTask(id), 'doing'); break;
    case 'task-back': setStatus(findTask(id), 'todo'); toast('已回退到未完成'); break;
    case 'task-done': completeTask(findTask(id)); break;
    case 'task-reopen': setStatus(findTask(id), 'doing'); break;
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
    case 'meet-import': importClick(e.altKey); break;
    case 'meet-edit': editMeeting(findMeet(id)); break;
    case 'meet-del': removeMeeting(findMeet(id)); break;
    case 'meet-todo-new': { const f = $('#meetTodoForm'); f.hidden = false; $('input', f).focus(); break; }
    case 'task-doc-add': addOutputDoc(findTask(id)); break;
    case 'doc-view': openLocalDoc(el.dataset.path); break;
    case 'doc-clear': Object.assign(ui, { dq: '', dKind: 'all' }); saveUi(); render(); break;
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
  if (['mProject', 'mType', 'mFrom', 'mTo', 'dKind'].includes(el.id)) { ui[el.id] = el.value; saveUi(); render(); }
});

document.addEventListener('input', e => {
  if (e.target.id === 'mq' || e.target.id === 'dq') {
    const id = e.target.id;
    ui[id] = e.target.value; saveUi();
    const pos = e.target.selectionStart;
    render();
    const inp = $('#' + id); inp.focus(); inp.setSelectionRange(pos, pos);
  }
});

document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id === 'taskForm') {
    e.preventDefault();
    const fd = new FormData(f);
    if (!fd.get('text').trim()) return;
    if (ui.more) f.reset(); else f.text.value = '';
    // 「标题：备注」：冒号前作待办内容，冒号后作备注；「更多」里也填了备注时两段都留
    const { title, detail } = splitTodo(fd.get('text').trim()), extra = ui.more ? (fd.get('note') || '').trim() : '';
    const note = [detail, extra].filter(Boolean).join('\n');
    addTask(title, ui.more ? { project: fd.get('project'), due: readDue(fd), note } : { note });
    $('#taskInput').focus();
  }
  // 会议详情里手动新建「我的待办」：挂到该会议，创建时间为会议结束时间
  if (f.id === 'meetTodoForm') {
    e.preventDefault();
    const m = findMeet(f.dataset.id), raw = f.text.value.trim();
    if (!m || !raw) return;
    const { title, detail } = splitTodo(raw);
    const t = addTask(title, { note: detail, project: m.project, meeting: m.id, createdAt: meetingEndTs(m), silent: true });
    t.manual = true;
    commit();
    openMeetingDetail(m);
    return;
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
    const { n } = syncMyTodos(m);
    commit();
    if (n) toast(`已归档，并生成 ${n} 条关联待办`);
    $('#meetInput').focus();
  }
});

document.addEventListener('keydown', e => {
  // 会议详情里新建待办时，Esc 只收起输入行，不关整个窗口
  if (e.key === 'Escape' && e.target.closest?.('#meetTodoForm')) { e.preventDefault(); e.target.value = ''; e.target.form.hidden = true; return; }
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || dlg.open;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (!dlg.open) openSearch(); return; }
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    const inp = $(ui.tab === 'meetings' ? '#meetInput' : ui.tab === 'docs' ? '#dq' : '#taskInput');
    inp.scrollIntoView({ block: 'center' }); inp.focus();
  }
});

// 回到页面或定时拉取远端更新
// 回到页面、点回窗口（和编辑器并排开着时不会触发 visibilitychange）、页面开着时每分钟：拉取远端更新，再检查纪要文件夹
const refresh = () => (now() - sync.last > 15000 ? doSync() : Promise.resolve()).then(() => runImport());
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
window.addEventListener('focus', refresh);
setInterval(() => { if (!document.hidden && !sync.busy) doSync().then(() => runImport()); }, 60000);
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
// 先拉一次远端数据再导入，避免别的设备已归档过的会议重复导入
doSync().then(() => runImport());
