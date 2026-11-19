/* =========================================================
   Higherd – UC05 clickable demo (front end only, sample data)
   Follows the Higherd Bau screens: 01 My overview → 02 Document
   manager (all files) → 03 PDF Creator (mapping, compare, check) →
   04 Workflow manager (assign, library, editor, new workflow) →
   05 Workflow tasks. Reuses the app frame styles from uc06-demo.css.
   State is kept in localStorage so it survives a reload.
   ========================================================= */
(function () {
  var KEY = 'higherd-uc05-demo-v1';
  var TODAY = '15.11.2026';

  // ---------- sample data ----------
  var SOURCES = [
    { no: 'S21-BSW-ÜP-001', idx: 'A', disc: 'ING', type: 'Overview drawing', desc: 'Rail / motorway crossing', st: 'In progress', wf: 'WF-B01', role: 'Planning coord. · Gerda Bauer', prog: 45 },
    { no: 'S21-BSW-ST-002', idx: 'A', disc: 'TWP', type: 'Structures', desc: 'Structural verification', st: 'For review', wf: 'WF-B01', role: 'Reviewer · Unassigned', prog: 45 },
    { no: 'S21-BSW-EB-003', idx: 'A', disc: 'ING', type: 'Report', desc: 'Explanatory report', st: 'Draft', wf: 'WF-B01', role: 'Planning coord. · Gerda Bauer', prog: 35 },
    { no: 'S21-BSW-DB-004', idx: 'A', disc: 'ING', type: 'Cover sheet', desc: 'Rail · Project template', st: 'Draft', wf: '', role: 'Document coordination', prog: 75 }
  ];
  // Target documents created by PDF Creator: 3 rail (DB layout), 3 road (DEGES layout)
  var TARGETS = [
    { no: 'S21-BSW-PS-BAHN', idx: 'A', type: 'Title block', desc: 'Rail · Title block', side: 'rail' },
    { no: 'S21-BSW-DB-BAHN', idx: 'A', type: 'Cover sheet', desc: 'Rail · Cover sheet', side: 'rail' },
    { no: 'S21-BSW-FB-BAHN', idx: 'A', type: 'Form', desc: 'Rail · Form', side: 'rail' },
    { no: 'S21-BSW-PS-STR', idx: '01', type: 'Title block', desc: 'DEGES · Title block', side: 'road' },
    { no: 'S21-BSW-DB-STR', idx: '01', type: 'Cover sheet', desc: 'DEGES · Cover sheet', side: 'road' },
    { no: 'S21-BSW-FB-STR', idx: '01', type: 'Form', desc: 'DEGES · Form', side: 'road' }
  ];
  var WFS = {
    rail: { id: 'WF-B01', name: 'Glare screen drawing review', proc: 'Rail', status: 'Active' },
    road: { id: 'WF-S02', name: 'Document review', proc: 'Road / DEGES', status: 'Template' }
  };

  var PHASES = [
    { k: 'prep', t: 'Preparation & coordination', c: '#E11D48' },
    { k: 'tech', t: 'Technical reviews (by discipline)', c: '#2563EB' },
    { k: 'cons', t: 'Consolidation & decision support', c: '#16A34A' },
    { k: 'appr', t: 'Approval & closeout', c: '#F59E0B' }
  ];
  var ROLES = ['Planning coordinator (GC)', 'Design consortium', 'Document coordination', 'Civil structures specialist', 'Rail / road designer', 'Geotechnical designer', 'Electrical designer', 'Glare screen designer', 'Checking engineer', 'Client representative', 'Site supervision'];
  var PEOPLE = ['Gerda Bauer', 'Unassigned', 'Jonas Keller', 'Miriam Roth', 'Tobias Brandt', 'Lea Wagner'];
  var DURS = ['automatically on upload', '2 days after assignment', '5 days', '7 days', '10 days', '15 days', '20 days', 'on confirmed status'];
  var DOCSETS = ['Cover sheet · Title block · Form', 'Title block', 'Cover sheet', 'Form', 'Explanatory report'];

  function task(id, ph, t, role, code, dur, person) {
    return { id: id, ph: ph, t: t, role: role, person: person || 'Unassigned', code: code, dur: dur, docs: DOCSETS[0], par: false };
  }
  function board() {
    return [
      task('t1', 'prep', 'Prepare document package', 'Design consortium', '01a', 'automatically on upload'),
      task('t2', 'prep', 'Assign target templates', 'Design consortium', '01b', 'automatically on upload'),
      task('t3', 'prep', 'Send documents for review', 'Planning coordinator (GC)', '02', 'on confirmed status', 'Gerda Bauer'),
      task('t4', 'tech', 'Drawing format check', 'Document coordination', '04a', '20 days'),
      task('t5', 'tech', 'Structural design review', 'Civil structures specialist', '04j', '20 days'),
      task('t6', 'tech', 'Glare screen review', 'Glare screen designer', '04k', '20 days'),
      task('t7', 'cons', 'Consolidate review comments', 'Planning coordinator (GC)', 'AZ', 'on confirmed status', 'Gerda Bauer'),
      task('t8', 'cons', 'Request revision', 'Planning coordinator (GC)', 'BO', 'on confirmed status', 'Gerda Bauer'),
      task('t9', 'appr', 'Overall technical review', 'Checking engineer', '05', '15 days'),
      task('t10', 'appr', 'Client approval', 'Client representative', '06', '10 days'),
      task('t11', 'appr', 'Archive revision', 'Planning coordinator (GC)', '10', 'on confirmed status', 'Gerda Bauer')
    ];
  }

  var LIB = [
    { id: 'WF-B01', desc: 'Rail · Document review', type: 'Created automatically', proj: 'S21 · BSW-01', st: 'Active', board: 'WF-B01' },
    { id: 'WF-S02', desc: 'Road · Document review', type: 'Organization template', proj: 'Cross-project', st: 'Active', board: 'WF-S02' },
    { id: 'TPL-BAHN-01', desc: 'Title block · Rail', type: 'Uploaded', proj: 'S21 · BSW-01', st: 'Approved' },
    { id: 'TPL-STR-01', desc: 'Drawing register · DEGES', type: 'Created automatically', proj: '—', st: 'Draft' }
  ];

  var BASE_TASKS = [
    { id: 'k1', wf: 'WF-B01', st: 'Revision', no: 'S21-BSW-ST-002', disc: 'TWP', type: 'Structures', desc: 'Respond to query', due: '16.11.2026', state: 'open' },
    { id: 'k2', wf: 'WF-S02', st: 'Apply layout', no: 'S21-BSW-EB-003', disc: 'ING', type: 'Report', desc: 'Create DEGES output', due: '17.11.2026', state: 'open' },
    { id: 'k3', wf: 'WF-S02', st: 'Review documents', no: 'S21-BSW-ÜP-001', disc: 'ING', type: 'Drawing', desc: 'Check title block', due: '17.11.2026', state: 'open' },
    { id: 'k4', wf: 'WF-S02', st: 'Assign role', no: 'S21-BSW-DB-004', disc: 'ING', type: 'Cover sheet', desc: 'Assign review role', due: '18.11.2026', state: 'open' }
  ];

  var TEMPLATES = [
    ['deges-cover', 'DEGES · Cover sheet / Project template'],
    ['rail-title', 'Rail · Title block'],
    ['rail-form', 'Rail · Form']
  ];

  function defaults() {
    return {
      period: 'week',
      q: '', show: 'all',
      source: 'S21-BSW-ÜP-001',
      map: { name: 'S21 · Rail / motorway crossing', pno: 'S21-BSW-01', dno: 'S21-BSW-01-GP-PL-001-A', by: 'Gerda Bauer', tpl: 'deges-cover' },
      mapped: false,
      pview: 'mapping',
      created: false,
      assigned: { rail: false, road: false },
      wview: 'active',
      wf: 'WF-B01',
      boards: { 'WF-B01': board(), 'WF-S02': board() },
      lib: JSON.parse(JSON.stringify(LIB)),
      draftN: 3,
      menu: '', edit: '', seq: 100,
      tasks: JSON.parse(JSON.stringify(BASE_TASKS)),
      tq: '', tf: 'open',
      sort: { files: ['', 1], tasks: ['', 1] },
      log: [], seen: 0
    };
  }

  var S = load();

  function load() {
    var d = defaults();
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        Object.keys(d).forEach(function (k) { if (!(k in s)) s[k] = d[k]; });
        s.menu = ''; s.edit = '';
        return s;
      }
    } catch (e) { /* storage blocked: run with defaults */ }
    return d;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  }

  // ---------- helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function opt(list, val) {
    return list.map(function (o) {
      var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
      return '<option value="' + esc(v) + '"' + (v === val ? ' selected' : '') + '>' + esc(l) + '</option>';
    }).join('');
  }
  function phaseOf(k) { for (var i = 0; i < PHASES.length; i++) if (PHASES[i].k === k) return i; return 0; }
  function curBoard() { return S.boards[S.wf] || []; }
  function findTask(id) { var b = curBoard(); for (var i = 0; i < b.length; i++) if (b[i].id === id) return b[i]; return null; }
  function isDraft() { var r = libRow(S.wf); return !!(r && r.st === 'Draft' && S.boards[S.wf]); }
  function libRow(id) { for (var i = 0; i < S.lib.length; i++) if (S.lib[i].id === id) return S.lib[i]; return null; }

  // All documents in the document manager, with workflow and status
  function docs() {
    var list = SOURCES.map(function (d) {
      return { no: d.no, idx: d.idx, disc: d.disc, type: d.type, desc: d.desc, st: d.st, wf: d.wf, src: true };
    });
    if (S.created) {
      TARGETS.forEach(function (t) {
        var on = S.assigned[t.side];
        list.push({ no: t.no, idx: t.idx, disc: 'ING', type: t.type, desc: t.desc, st: on ? 'In workflow' : 'Draft', wf: on ? WFS[t.side].id : '', src: false, side: t.side });
      });
    }
    return list;
  }
  function openTasks() { return S.tasks.filter(function (t) { return t.state === 'open'; }); }

  // Donut: every file counted once, by where it stands
  var PKG = [
    ['coord', 'Coordination needed', '#2563EB'],
    ['done', 'Completed', '#22C55E'],
    ['prog', 'In progress', '#F59E0B'],
    ['ret', 'Task returned', '#E11D48']
  ];
  function pkgCounts() {
    var c = { coord: 0, done: 0, prog: 0, ret: 0 };
    docs().forEach(function (d) {
      var ts = S.tasks.filter(function (t) { return t.no === d.no || (t.docs && t.docs.indexOf(d.no) !== -1); });
      if (ts.some(function (t) { return t.state === 'returned'; })) c.ret++;
      else if (ts.length && ts.every(function (t) { return t.state === 'done'; })) c.done++;
      else if (d.wf) c.prog++;
      else c.coord++;
    });
    return c;
  }

  function goTo(step) {
    var tab = document.getElementById('flow-tab-' + step);
    if (!tab) return;
    tab.click();
    var root = tab.closest('[data-tabs]');
    if (root) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function scrollToApp(step) {
    var el = document.getElementById('hd-' + step);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  var ICON = {
    over: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    docs: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6',
    iface: 'M4 6h16M4 12h16M4 18h10',
    msg: 'M3 5h18v14H3zM3 6l9 7 9-7',
    plan: 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18',
    flow: 'M3 3h7v7H3zM14 14h7v7h-7zM10 6.5h4a2 2 0 0 1 2 2V14',
    set: 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
    bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
    search: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM21 21l-4.3-4.3',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6z',
    check: 'M20 6L9 17l-5-5',
    undo: 'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
    copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
    trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7v5l3 2',
    file: 'M6 2h9l5 5v15H6zM14 2v6h6',
    tpl: 'M4 4h16v16H4zM4 9h16M9 9v11',
    map: 'M4 7h12l-3-3M20 17H8l3 3',
    plus: 'M12 5v14M5 12h14',
    edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    cmp: 'M4 4h7v16H4zM13 4h7v16h-7z',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    pdf: 'M6 2h9l5 5v15H6zM9 13h6M9 17h4',
    exp: 'M12 3v12M7 10l5 5 5-5M5 21h14',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8z',
    next: 'M5 12h14M13 6l6 6-6 6',
    prev: 'M19 12H5M11 6l-6 6 6 6',
    par: 'M8 4v16M16 4v16',
    link: 'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
    warn: 'M12 3l10 18H2zM12 10v5M12 18h.01',
    spark: 'M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z',
    grip: 'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01',
    sort: 'M8 9l4-4 4 4M8 15l4 4 4-4'
  };
  function svg(name, cls) {
    return '<svg class="' + (cls || 'hd-ico') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICON[name] + '"/></svg>';
  }

  // =========================================================
  // App frame: window bar, Higherd Bau menu, top bar
  // =========================================================
  var NAV = [
    ['over', 'My overview', 1], ['users', 'Users & roles'], ['docs', 'Document manager', 2], ['iface', 'Interface management'],
    ['msg', 'Messages'], ['plan', 'Project plan'], ['flow', 'Workflow manager', 4]
  ];
  function activeNav(step) { return step === 1 ? 'over' : step === 4 ? 'flow' : 'docs'; }

  function navItem(n, step) {
    var on = activeNav(step) === n[0];
    var badge = n[0] === 'docs' && S.created ? '<em class="hd-nav__n">' + docs().length + '</em>' : '';
    if (n[2]) {
      return '<li><button type="button" class="hd-nav' + (on ? ' is-active' : '') + '" data-go="' + n[2] + '"' + (on ? ' aria-current="page"' : '') + '>' +
        svg(n[0]) + '<span class="hd-nav__l">' + esc(n[1]) + '</span>' + badge + '</button></li>';
    }
    return '<li><span class="hd-nav is-locked" aria-disabled="true" title="Not part of this demo">' +
      svg(n[0]) + '<span class="hd-nav__l">' + esc(n[1]) + '</span></span></li>';
  }

  function side(step) {
    return '<nav class="hd-side" aria-label="Higherd menu">' +
      '<p class="hd-side__logo"><img src="/assets/img/logo.svg?v=8" alt="Higherd" width="104" height="34"></p>' +
      '<ul>' + NAV.map(function (n) { return navItem(n, step); }).join('') + '</ul>' +
      '<ul class="hd-side__end">' + navItem(['set', 'Settings'], step) + '</ul>' +
    '</nav>';
  }

  var bellOpen = 0;
  function bell(step) {
    var n = Math.max(0, S.log.length - S.seen), open = bellOpen === step;
    return '<span class="b-bellwrap"><button type="button" class="hd-bell b-bellbtn" data-act="bell" data-v="' + step + '" aria-expanded="' + open + '" aria-label="Activity' + (n ? ', ' + n + ' new' : '') + '">' + svg('bell') +
        (n ? '<em class="b-bell__n" aria-hidden="true">' + n + '</em>' : '') + '</button>' +
      (open ? '<div class="b-bellpop" role="region" aria-label="Activity"><p class="b-bellpop__h"><b>Activity</b>' +
          (S.log.length ? '<button type="button" class="hd-link" data-act="clearlog">Clear</button>' : '') + '</p>' +
        (S.log.length ? '<ul>' + S.log.map(function (l) { return '<li><span>' + esc(l.t) + '</span><small>Today, ' + l.at + '</small></li>'; }).join('') + '</ul>'
                      : '<p class="hd-muted b-bellpop__e">Nothing yet. What you do in the demo shows up here.</p>') + '</div>' : '') +
    '</span>';
  }

  function top(title, sub, step) {
    return '<header class="hd-top">' +
      '<div class="hd-top__t"><div><p class="hd-top__title">' + title + '</p>' + (sub ? '<p class="hd-top__sub">' + sub + '</p>' : '') + '</div></div>' +
      '<div class="hd-top__r">' +
        '<button type="button" class="hd-aibtn" data-act="ai">' + svg('spark') + '<span>Higherd AI</span></button>' +
        bell(step) +
        '<span class="hd-user"><img class="hd-user__av hd-user__av--img" src="/assets/img/uc05/gerda-bauer.webp?v=2" alt="" width="36" height="36">' +
          '<span class="hd-user__t"><b>Gerda Bauer <span class="b-plan">Enterprise</span></b><small>Planning coordinator · GC</small></span></span>' +
      '</div>' +
    '</header>';
  }

  function frame(step, title, sub, body) {
    return '<div class="hd-chrome">' +
        '<span class="hd-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="hd-chrome__t">Higherd Bau · demo data</span>' +
        '<button type="button" class="hd-link" data-act="reset">Reset demo</button>' +
      '</div>' +
      '<div class="hd-shell">' + side(step) +
        '<div class="hd-main">' + top(title, sub, step) + '<div class="hd-body">' + body + '</div></div>' +
      '</div>';
  }

  // Document manager tabs (steps 02, 03 and 05 share them)
  function dmTabs(active) {
    var list = [['files', 'All files', 2], ['tasks', 'Workflow tasks', 5], ['land', 'Project landscape'], ['int', 'Integrations', 3]];
    return '<div class="b-tabs" role="group" aria-label="Document manager">' + list.map(function (t) {
      var on = t[0] === active;
      if (!t[2]) return '<span class="b-tab is-locked" aria-disabled="true" title="Not part of this demo">' + t[1] + '</span>';
      return '<button type="button" class="b-tab' + (on ? ' is-on' : '') + '" data-go="' + t[2] + '"' + (on ? ' aria-current="page"' : '') + '>' + t[1] + '</button>';
    }).join('') + '</div>';
  }

  function status(st) {
    var cls = { 'In progress': 'prog', 'For review': 'rev', 'Draft': 'draft', 'In workflow': 'wf', 'Completed': 'done', 'Returned': 'ret' }[st] || 'draft';
    return '<span class="b-st b-st--' + cls + '">' + esc(st) + '</span>';
  }
  function wfChip(wf) { return '<span class="b-wf' + (wf ? '' : ' is-none') + '">' + (wf ? esc(wf) : '—') + '</span>'; }

  // =========================================================
  // 01 My overview
  // =========================================================
  var BARS = [
    { l: 'Drawing', c: '#F59E0B', v: { week: 70, month: 62, all: 55 } },
    { l: 'Structures', c: '#22C55E', v: { week: 50, month: 44, all: 40 } },
    { l: 'Report', c: '#2563EB', v: { week: 60, month: 52, all: 48 } },
    { l: 'Title', c: '#DB2777', v: { week: 58, month: 50, all: 45 }, grow: 1 },
    { l: 'Form', c: '#7C3AED', v: { week: 20, month: 18, all: 15 }, grow: 1 },
    { l: 'List', c: '#9F1239', v: { week: 40, month: 35, all: 30 }, grow: 1 }
  ];

  function render1() {
    var el = $('#hd-1'); if (!el) return;
    var counts = pkgCounts(), total = docs().length, open = openTasks().length;
    var boost = (S.created ? 15 : 0) + (S.assigned.rail || S.assigned.road ? 10 : 0);
    var kpis = [['over', 'Active projects', 1], ['docs', 'Prepared documents', S.created ? 6 : 0], ['flow', 'Submission packages', S.created ? 2 : 0], ['check', 'My tasks', open]];

    var r = 38, C = 2 * Math.PI * r, off = 0;
    var segs = PKG.map(function (p) {
      if (!counts[p[0]]) return '';
      var len = C * counts[p[0]] / total;
      var seg = '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + p[2] + '" stroke-width="13" stroke-dasharray="' +
        Math.max(0, len - 1.6).toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>';
      off += len;
      return seg;
    }).join('');

    var body =
      '<section class="hd-panel">' +
        '<div class="hd-panel__h"><p class="hd-panel__t">Progress · S21 crossing / Demo</p>' +
          '<div class="hd-period b-period" role="group" aria-label="Period">' +
            [['week', 'Week'], ['month', 'Month'], ['all', 'All time']].map(function (p) {
              return '<button type="button" data-act="period" data-v="' + p[0] + '" aria-pressed="' + (S.period === p[0]) + '">' + p[1] + '</button>';
            }).join('') +
          '</div></div>' +
        '<div class="hd-kpis">' + kpis.map(function (k) {
          return '<div class="hd-kpi"><span class="hd-kpi__i" aria-hidden="true">' + svg(k[0]) + '</span><span class="hd-kpi__l">' + k[1] + '</span><b>' + k[2] + '</b></div>';
        }).join('') + '</div>' +
      '</section>' +

      '<div class="hd-grid">' +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Progress by document</p><span class="hd-tag hd-tag--soft">UC05 · Glare screen</span></div>' +
          '<div class="hd-baros" role="list">' + BARS.map(function (b) {
            var v = Math.min(100, b.v[S.period] + (b.grow ? boost : 0));
            return '<div class="hd-baro" role="listitem" aria-label="' + b.l + ' ' + v + '%">' +
              '<span class="hd-baro__v" aria-hidden="true">' + v + '%</span>' +
              '<span class="hd-baro__track" aria-hidden="true"><i class="hd-baro__fill" style="height:' + v + '%;background:' + b.c + '"></i>' +
                '<i class="hd-baro__knob" style="bottom:' + v + '%;border-color:' + b.c + '"></i></span>' +
              '<b aria-hidden="true">' + b.l + '</b></div>';
          }).join('') + '</div>' +
          '<p class="hd-foot">Title, Form and List rise as target documents are created and assigned.</p>' +
        '</section>' +
        '<section class="hd-panel hd-panel--center">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Document packages</p></div>' +
          '<div class="hd-donut"><svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(-90 50 50)">' + segs + '</g></svg>' +
            '<span class="hd-donut__c"><b>' + total + '</b>Files</span></div>' +
          '<ul class="hd-legend">' + PKG.map(function (p) {
            return '<li><i style="background:' + p[2] + '"></i>' + p[1] + ' (' + counts[p[0]] + ')</li>';
          }).join('') + '</ul>' +
          '<button type="button" class="hd-btn hd-btn--ghost" data-go="2">Open document manager</button>' +
        '</section>' +
      '</div>' +

      '<div class="hd-grid hd-grid--even">' +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">My responsibilities</p><button type="button" class="hd-link" data-go="5">Workflow tasks</button></div>' +
          '<div class="b-resp">' +
            [['Design specialist', 'Gerda Bauer · Coordination', 'Rail · ' + S.tasks.filter(function (t) { return t.state === 'open' && t.wf === 'WF-B01'; }).length + ' open tasks'],
             ['Workflow role', 'Structural review', 'Road · ' + S.tasks.filter(function (t) { return t.state === 'open' && t.wf !== 'WF-B01'; }).length + ' open tasks'],
             ['Workflow role', 'Document coordination', 'Rail and road · 1 query']].map(function (x) {
              return '<div class="b-resp__i"><small>' + x[0] + '</small><b>' + x[1] + '</b><small>' + x[2] + '</small><span class="b-active">Active</span></div>';
            }).join('') +
          '</div>' +
        '</section>' +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Recently edited documents</p><button type="button" class="hd-link" data-go="2">All files</button></div>' +
          '<div class="hd-tablewrap"><table class="hd-table">' +
            '<thead><tr><th>Drawing no.</th><th>Current role</th><th>Progress</th></tr></thead><tbody>' +
            SOURCES.map(function (d) {
              return '<tr><td><button type="button" class="hd-idlink" data-act="finddoc" data-id="' + esc(d.no) + '">' + esc(d.no) + ' / ' + d.idx + '</button></td>' +
                '<td class="b-wrap">' + esc(d.role) + '</td><td class="b-pct">' + d.prog + '%</td></tr>';
            }).join('') +
          '</tbody></table></div>' +
        '</section>' +
      '</div>';

    el.innerHTML = frame(1, 'My overview', 'S21 crossing · Glare screen BSW-01', body);
  }

  // =========================================================
  // 02 Document manager: all files
  // =========================================================
  function render2() {
    var el = $('#hd-2'); if (!el) return;
    el.innerHTML = frame(2, S.created ? 'All files · 6 new documents' : 'All files', 'Document manager', dmTabs('files') +
      '<section class="hd-panel b-files">' +
        '<div class="b-bar">' +
          '<label class="hd-search b-grow"><span class="hd-sr">Search documents</span>' + svg('search') +
            '<input id="b-q" type="search" placeholder="Search documents" value="' + esc(S.q) + '" autocomplete="off"></label>' +
          '<label class="b-sel"><span class="hd-sr">Show</span><select data-sel="show">' +
            opt([['all', 'All documents'], ['src', 'Source documents'], ['tgt', 'Target documents']], S.show) + '</select></label>' +
          (S.created && !(S.assigned.rail && S.assigned.road)
            ? '<button type="button" class="hd-btn" data-go="4">Assign workflow</button>'
            : '<button type="button" class="hd-btn" data-act="pdf">Open in PDF Creator</button>') +
        '</div>' +
        '<div id="b-files"></div>' +
      '</section>');
    renderFiles();
  }

  function th(table, key, label) {
    var srt = S.sort[table], on = srt[0] === key;
    return '<th scope="col"' + (on ? ' aria-sort="' + (srt[1] > 0 ? 'ascending' : 'descending') + '"' : '') + '>' +
      '<button type="button" class="b-sortbtn' + (on ? ' is-on' : '') + '" data-act="sort" data-v="' + table + ':' + key + '">' + label + svg('sort') + '</button></th>';
  }
  function sorted(list, table) {
    var srt = S.sort[table];
    if (!srt[0]) return list;
    return list.slice().sort(function (a, b) {
      var x = String(a[srt[0]] || ''), y = String(b[srt[0]] || '');
      if (srt[0] === 'due') { x = x.split('.').reverse().join(''); y = y.split('.').reverse().join(''); }
      return x.localeCompare(y) * srt[1];
    });
  }

  function renderFiles() {
    var box = $('#b-files'); if (!box) return;
    var q = S.q.trim().toLowerCase();
    var list = sorted(docs().filter(function (d) {
      if (S.show === 'src' && !d.src) return false;
      if (S.show === 'tgt' && d.src) return false;
      return !q || [d.no, d.type, d.desc, d.st, d.wf].join(' ').toLowerCase().indexOf(q) !== -1;
    }), 'files');
    box.innerHTML = '<div class="hd-tablewrap"><table class="hd-table b-table">' +
      '<caption class="hd-sr">Documents. Choose the source revision with the radio buttons.</caption>' +
      '<thead><tr><th scope="col">Source</th>' + th('files', 'wf', 'WF') + th('files', 'no', 'Drawing no.') + '<th scope="col">Index</th><th scope="col">Discipline</th>' +
        th('files', 'type', 'Document type') + th('files', 'desc', 'Description') + th('files', 'st', 'Status') + '</tr></thead><tbody>' +
      (list.length ? list.map(function (d) {
        return '<tr class="' + (d.src ? '' : 'is-new') + (S.source === d.no ? ' is-sel' : '') + '">' +
          '<td>' + (d.src ? '<input type="radio" name="b-src" data-src="' + esc(d.no) + '" aria-label="Use ' + esc(d.no) + ' as source"' + (S.source === d.no ? ' checked' : '') + '>' : '<span class="b-new">New</span>') + '</td>' +
          '<td>' + wfChip(d.wf) + '</td><td><button type="button" class="hd-idlink" data-act="doc" data-id="' + esc(d.no) + '">' + esc(d.no) + '</button></td><td>' + d.idx + '</td><td>' + d.disc + '</td>' +
          '<td>' + esc(d.type) + '</td><td>' + esc(d.desc) + '</td><td>' + status(d.st) + '</td></tr>';
      }).join('') : '<tr><td colspan="8" class="hd-empty">No documents match “' + esc(S.q) + '”.</td></tr>') +
      '</tbody></table></div>' +
      '<p class="hd-foot">Showing ' + list.length + ' of ' + docs().length + ' documents · Source: <b>' + esc(S.source) + ' / A</b> (stays unchanged)</p>';
  }

  // =========================================================
  // 03 PDF Creator
  // =========================================================
  function v(k) { return esc(S.map[k] || '—'); }

  function titleBlock(mini) {
    var f = function (k, cls) { return '<span class="b-fld' + (cls ? ' ' + cls : '') + '" data-fld="' + k + '"' + (mini ? '' : ' role="button" tabindex="0" aria-label="Edit mapped field"') + '>' + v(k) + '</span>'; };
    return '<div class="b-pdf' + (mini ? ' b-pdf--mini' : '') + '"' + (mini ? ' aria-label="Rail title block preview"' : '') + '>' +
      '<div class="b-pdf__r b-pdf__head"><div><span>Client / Project team</span><span>Rail client</span><span>Demonstration data</span></div>' +
        '<div><span>Design / Coordination</span><span>' + v('by') + ' · Coordination</span><span>Higherd Demo</span></div>' +
        '<div class="b-pdf__logo">RAIL CLIENT</div></div>' +
      '<div class="b-pdf__name"><small>Project name / Scope description</small>' + f('name', 'b-fld--lg') + '<span class="b-pdf__sub">Glare screen · BSW-01</span>' +
        '<span class="b-pdf__pno"><small>Project no.:</small>' + f('pno') + '<em>DRAFT · DEMO</em></span></div>' +
      '<div class="b-pdf__grid">' +
        [['Design stage', 'Approval design'], ['Station name', 'S21 · Crossing area'], ['Drawing content', 'Glare screen · Layout and elevations'], ['Route', 'Rail / motorway'],
         ['Scale', '1:100'], ['Route no.', '—'], ['Drawing number', f('dno')], ['Chainage', '—']].map(function (x) {
          return '<span>' + x[0] + '</span><span>' + x[1] + '</span>';
        }).join('') +
      '</div>' +
      '<div class="b-pdf__sign"><span>Preparation</span><span>Name (print)</span><span>Date</span><span>Signature</span>' +
        '<span>Drawn</span><span>' + v('by') + '</span><span>—</span><span></span>' +
        '<span>Quality check</span><span>—</span><span>—</span><span></span></div>' +
      '<p class="b-pdf__foot">Technical review record pending · page 1 / 1</p>' +
    '</div>';
  }

  function coverSheet() {
    return '<div class="b-cover" aria-label="Road DEGES cover sheet preview">' +
      '<small>Road · Project template</small><p class="b-cover__t">Cover sheet</p>' +
      '<p class="b-cover__p">' + v('name') + '</p><p>Glare screen · BSW-01</p><p class="hd-muted">Approval design</p>' +
      '<dl>' + [['Project', v('pno')], ['Document', 'Layout and elevations'], ['Drawing number', v('dno')], ['Prepared by', v('by') + ' · Coordination'], ['Index / Revision', '01'], ['Status', 'Draft · Review pending']].map(function (x) {
        return '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>';
      }).join('') + '</dl>' +
      '<p class="hd-foot">Based on the uploaded project template · illustrative translation, not approved</p>' +
    '</div>';
  }

  function checks() {
    var m = S.map;
    return [
      [!!(m.name && m.pno && m.dno && m.by), 'All mapped fields are filled', 'Project name, project number, drawing number and author'],
      [/^S21-BSW-\d{2}$/.test(m.pno), 'Project number matches the project pattern', 'Expected S21-BSW-NN, found ' + (m.pno || 'nothing')],
      [m.dno.indexOf(m.pno) === 0, 'Drawing number starts with the project number', m.dno || 'No drawing number'],
      [true, 'Source revision unchanged', S.source + ' / A stays as it is'],
      [null, 'Technical review pending', 'Created documents are drafts until the assigned roles review them']
    ];
  }

  var TOOLS = [['tpl', 'Template', 'tool'], ['map', 'Mapping', 'mapping'], ['plus', 'Add field', 'tool'], ['edit', 'Edit', 'tool'], ['cmp', 'Compare', 'compare'], ['shield', 'Check', 'check'], ['pdf', 'Create PDF', 'create'], ['exp', 'Export', 'export'], ['flow', 'Workflow', 'wf']];

  function render3() {
    var el = $('#hd-3'); if (!el) return;
    var view = S.pview, body;
    var toolbar = '<div class="b-tools" role="toolbar" aria-label="PDF Creator">' + TOOLS.map(function (t) {
      var on = t[2] === view;
      return '<button type="button" class="b-tool' + (on ? ' is-on' : '') + '" data-act="ptool" data-v="' + t[2] + '" data-l="' + t[1] + '"' + (on ? ' aria-pressed="true"' : '') + '>' + svg(t[0]) + '<span>' + t[1] + '</span></button>';
    }).join('') + '</div>';

    if (view === 'compare') {
      body = '<div class="b-cmp"><div><p class="hd-h4">Rail · Title block</p>' + titleBlock(true) + '</div>' +
        '<div><p class="hd-h4">Road · DEGES project template</p>' + coverSheet() + '</div></div>';
    } else if (view === 'check') {
      body = '<ul class="b-checks">' + checks().map(function (c) {
        var cls = c[0] === null ? 'is-info' : c[0] ? 'is-ok' : 'is-bad';
        return '<li class="' + cls + '">' + svg(c[0] === null ? 'clock' : c[0] ? 'check' : 'warn') +
          '<div><b>' + c[1] + '</b><small>' + esc(c[2]) + '</small></div></li>';
      }).join('') + '</ul>';
    } else {
      body = '<div class="b-mapgrid"><div class="b-canvas">' + titleBlock(false) + '</div>' +
        '<form class="b-map" data-form="map" aria-labelledby="b-map-t">' +
          '<p class="b-map__t" id="b-map-t">' + svg('map') + 'Field mapping</p>' +
          '<p class="hd-muted">Link the highlighted PDF fields to project values. The preview updates as you type.</p>' +
          [['name', 'Project name'], ['pno', 'Project number'], ['dno', 'Drawing number'], ['by', 'Created by']].map(function (x) {
            return '<label class="hd-f"><span>' + x[1] + '</span><input id="b-m-' + x[0] + '" data-map="' + x[0] + '" value="' + esc(S.map[x[0]]) + '" autocomplete="off"></label>';
          }).join('') +
          '<label class="hd-f"><span>Target template</span><select data-sel="tpl">' + opt(TEMPLATES, S.map.tpl) + '</select></label>' +
          '<p class="hd-foot">Title blocks · Cover sheets · Forms. Original files are preserved.</p>' +
          '<button type="submit" class="hd-btn' + (S.mapped ? ' hd-btn--done' : '') + '" data-act="applymap">' + (S.mapped ? '✓ Mapping applied' : 'Apply mapping') + '</button>' +
          '<button type="button" class="hd-link" data-act="ptool" data-v="compare">Compare preview →</button>' +
        '</form></div>';
    }

    var foot = '<div class="b-create"><p>' + (S.created
        ? '<b class="hd-ok">✓ 6 target documents created</b> · 3 rail, 3 road · linked to ' + esc(S.source) + ' / A'
        : '6 target documents: title block, cover sheet and form, for rail and road · technical review pending') + '</p>' +
      (S.created
        ? '<span class="b-create__a"><button type="button" class="hd-btn hd-btn--ghost" data-act="pdfpkg">Download PDF package</button><button type="button" class="hd-btn" data-go="4">Select workflow →</button></span>'
        : '<button type="button" class="hd-btn" data-act="create">Create documents</button>') + '</div>';

    var ints = ['DB InfraGO', 'PlanRadar', 'SharePoint', 'iTWO', 'Revit', 'BIM 360'];
    el.innerHTML = frame(3, 'PDF Creator (Higherd plugin)', 'Document manager › Integrations', dmTabs('int') +
      '<section class="hd-panel b-pdfc">' +
        '<div class="b-file">' + svg('file') + '<b>BSW-01 · ' + (view === 'mapping' ? 'Planstempel_Bahn.pdf' : 'Document preview') + '</b>' +
          '<span class="hd-muted">' + (S.mapped ? 'Mapped' : 'Draft') + ' · 1 page · ' + esc(TEMPLATES.filter(function (t) { return t[0] === S.map.tpl; })[0][1]) + '</span></div>' +
        toolbar + '<div class="b-pview">' + body + '</div>' + foot +
      '</section>' +
      '<div class="b-ints" aria-label="Integrations"><span class="b-int is-on">PDF Creator</span>' + ints.map(function (n) {
        return '<span class="b-int" title="Not part of this demo">' + n + '</span>';
      }).join('') + '</div>');
  }

  // Live preview while typing in the mapping form
  function syncFields(k) {
    document.querySelectorAll('#hd-3 [data-fld="' + k + '"]').forEach(function (n) { n.textContent = S.map[k] || '—'; });
  }

  // =========================================================
  // 04 Workflow manager
  // =========================================================
  function wfTabs() {
    var list = [['active', 'Active workflows'], ['library', 'Library'], ['editor', 'Editor']];
    return '<div class="b-tabs" role="group" aria-label="Workflow manager">' + list.map(function (t) {
      var on = S.wview === t[0];
      return '<button type="button" class="b-tab' + (on ? ' is-on' : '') + '" data-act="wview" data-v="' + t[0] + '"' + (on ? ' aria-current="page"' : '') + '>' + t[1] + '</button>';
    }).join('') + '</div>';
  }

  function activeView() {
    var n = TARGETS.filter(function (t) { return !S.assigned[t.side]; }).length;
    var head = !S.created
      ? '<section class="hd-panel b-hero"><p class="hd-panel__t">No target documents yet</p><p class="hd-muted">Create the rail and road documents in PDF Creator first. You can still explore the library and the editor.</p>' +
          '<div class="hd-actions b-left"><button type="button" class="hd-btn" data-go="3">Go to PDF Creator</button></div></section>'
      : '<section class="hd-panel b-hero"><p class="hd-panel__t">' + (n ? 'Assign ' + n + ' target documents to a workflow' : '✓ All 6 target documents are in a workflow') + '</p>' +
          '<p class="hd-muted">Rail and road are managed separately. Review participants, deadlines and roles before starting.</p></section>';
    var rows = ['rail', 'road'].map(function (k) {
      var w = WFS[k], on = S.assigned[k];
      return '<tr><td><b>' + w.id + '</b> · ' + w.name + '</td><td>' + w.proc + '</td><td>' + (S.created ? '3 target documents' : 'None yet') + '</td>' +
        '<td>' + (on ? status('In workflow') : '<span class="b-plain">' + w.status + '</span>') + '</td><td class="b-acts">' +
        (on ? '<span class="hd-ok">✓ Started</span>'
            : '<button type="button" class="hd-btn hd-btn--sm" data-act="assignwf" data-v="' + k + '"' + (S.created ? '' : ' disabled') + '>' + (k === 'rail' ? 'Select existing' : 'Use template') + '</button>') +
        '<button type="button" class="hd-btn hd-btn--sm hd-btn--ghost" data-act="openwf" data-id="' + w.id + '">Open in editor</button></td></tr>';
    }).join('');
    return head +
      '<section class="hd-panel"><div class="hd-tablewrap"><table class="hd-table b-table"><thead><tr><th>Workflow</th><th>Procedure</th><th>Documents</th><th>Status</th><th>Action</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>' +
      '<div class="hd-grid hd-grid--even">' +
        '<section class="hd-panel"><p class="hd-panel__t">From the workflow library</p><p class="hd-muted b-gap">Reuse review steps and roles from a suitable template.</p>' +
          '<button type="button" class="hd-btn hd-btn--ghost" data-act="wview" data-v="library">Open library</button></section>' +
        '<section class="hd-panel"><p class="hd-panel__t">Create new workflow</p><p class="hd-muted b-gap">Define steps, roles, responsibilities and deadlines.</p>' +
          '<button type="button" class="hd-btn hd-btn--ghost" data-act="newwf">Start from scratch</button></section>' +
      '</div>';
  }

  function libraryView() {
    return '<section class="hd-panel">' +
      '<div class="b-bar"><p class="hd-panel__t b-grow">Workflow library</p>' +
        '<button type="button" class="hd-btn b-orange" data-act="newwf">Create new</button></div>' +
      '<div class="hd-tablewrap"><table class="hd-table b-table"><thead><tr><th>Created on</th><th>Item ID</th><th>Description</th><th>Type</th><th>Projects</th><th>Created by</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
      S.lib.map(function (r) {
        return '<tr><td>' + (r.on || TODAY) + '</td><td><b>' + esc(r.id) + '</b></td><td>' + esc(r.desc) + '</td><td><span class="b-type">' + esc(r.type) + '</span></td>' +
          '<td>' + esc(r.proj) + '</td><td>Gerda Bauer</td><td><span class="b-plain">' + r.st + '</span></td><td class="b-icons">' +
          '<button type="button" class="b-ib" data-act="openwf" data-id="' + esc(r.id) + '" aria-label="Open ' + esc(r.id) + '"' + (r.board ? '' : ' disabled') + '>' + svg('eye') + '</button>' +
          '<button type="button" class="b-ib" data-act="dupwf" data-id="' + esc(r.id) + '" aria-label="Duplicate ' + esc(r.id) + '"' + (r.board ? '' : ' disabled') + '>' + svg('copy') + '</button>' +
          '<button type="button" class="b-ib b-ib--bad" data-act="delwf" data-id="' + esc(r.id) + '" aria-label="Delete ' + esc(r.id) + '">' + svg('trash') + '</button></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="hd-foot">A duplicate copies phases and dependencies, never completed approvals or signatures.</p></section>';
  }

  function taskCard(t, i) {
    var menu = S.menu === t.id, edit = S.edit === t.id, p = phaseOf(t.ph);
    if (edit) return assignForm(t);
    return '<li class="b-task" style="--c:' + PHASES[p].c + '" draggable="true" data-drag="' + t.id + '">' +
      '<div class="b-task__h"><span class="b-grip" aria-hidden="true" title="Drag to another phase">' + svg('grip') + '</span><b>' + esc(t.t) + '</b>' +
        '<button type="button" class="b-more" data-act="menu" data-id="' + t.id + '" aria-haspopup="menu" aria-expanded="' + menu + '" aria-label="Task menu: ' + esc(t.t) + '">' + svg('more') + '</button></div>' +
      '<small>' + esc(t.role) + (t.person !== 'Unassigned' ? ' · ' + esc(t.person) : '') + '</small>' +
      '<small class="b-task__m">' + svg('file') + esc(t.code) + (t.par ? ' <span class="b-par">Parallel review</span>' : '') + '</small>' +
      '<small class="b-task__m">' + svg('clock') + esc(t.dur) + '</small>' +
      (menu ? '<ul class="b-menu" role="menu" aria-label="Task actions">' + [
        ['user', 'Assign roles', 'edit'], ['clock', 'Task duration', 'edit'],
        ['next', 'Set next phase', 'next', p === PHASES.length - 1], ['prev', 'Set previous phase', 'prevph', p === 0],
        ['par', t.par ? 'End parallel review' : 'Parallel review with…', 'par'], ['link', 'Edit link', 'link'], ['trash', 'Remove from workflow', 'rm']
      ].map(function (m) {
        return '<li role="none"><button type="button" role="menuitem" class="b-menu__i' + (m[2] === 'rm' ? ' is-bad' : '') + '" data-act="t-' + m[2] + '" data-id="' + t.id + '"' + (m[3] ? ' disabled' : '') + '>' + svg(m[0]) + m[1] + '</button></li>';
      }).join('') + '</ul>' : '') +
    '</li>';
  }

  function assignForm(t) {
    var phs = PHASES.map(function (p) { return [p.k, p.t]; });
    return '<li class="b-task b-assign"><form data-form="assign" data-id="' + t.id + '" aria-label="Assignment for ' + esc(t.t) + '">' +
      '<p class="b-assign__t">' + esc(t.t) + '</p><p class="hd-muted">Document review BSW-01</p>' +
      '<label class="hd-f"><span>Task name</span><input name="t" value="' + esc(t.t) + '" required></label>' +
      '<label class="hd-f"><span>Responsible role</span><select name="role">' + opt(ROLES, t.role) + '</select></label>' +
      '<label class="hd-f"><span>Person</span><select name="person">' + opt(PEOPLE, t.person) + '</select></label>' +
      '<label class="hd-f"><span>Task duration</span><select name="dur">' + opt(DURS.indexOf(t.dur) === -1 ? DURS.concat([t.dur]) : DURS, t.dur) + '</select></label>' +
      '<label class="hd-f"><span>Phase</span><select name="ph">' + opt(phs, t.ph) + '</select></label>' +
      '<label class="hd-f"><span>Documents</span><select name="docs">' + opt(DOCSETS, t.docs) + '</select></label>' +
      '<p class="hd-foot">Gerda coordinates the workflow. Technical reviews and approvals remain with the assigned roles.</p>' +
      '<div class="b-assign__a"><button type="submit" class="hd-btn hd-btn--sm">Apply</button><button type="button" class="hd-btn hd-btn--sm hd-btn--ghost" data-act="cancel">Cancel</button></div>' +
    '</form></li>';
  }

  function editorView() {
    var b = curBoard(), draft = isDraft(), r = libRow(S.wf);
    return '<div class="b-bar"><p class="b-crumb b-grow">' + esc(S.wf) + ' · S21 / BSW-01 · ' + esc(r ? r.desc : '') + ' · ' + (r ? r.st : '') + '</p>' +
        '<button type="button" class="hd-btn" data-act="addtask" data-v="prep">Add new task</button>' +
        (draft ? '<button type="button" class="hd-btn b-orange" data-act="savewf">Save workflow</button>' : '') + '</div>' +
      '<div class="b-board" role="list" aria-label="Workflow phases">' + PHASES.map(function (p) {
        var list = b.filter(function (t) { return t.ph === p.k; });
        return '<section class="b-col" role="listitem" style="--c:' + p.c + '" aria-label="' + esc(p.t) + '" data-drop="' + p.k + '">' +
          '<p class="b-col__h">' + esc(p.t) + ' <span>' + list.length + '</span></p>' +
          '<ul class="b-col__l">' + list.map(taskCard).join('') + '</ul>' +
          '<button type="button" class="b-add" data-act="addtask" data-v="' + p.k + '">+ Add task</button>' +
        '</section>';
      }).join('') + '</div>' +
      '<p class="hd-foot">Drag a task to another phase, or open its menu (⋯) to assign roles, set the duration, move it between phases or run a parallel review.' + (draft ? ' Saving a draft is not a submission, signature or approval.' : '') + '</p>';
  }

  function render4() {
    var el = $('#hd-4'); if (!el) return;
    var title = S.wview === 'library' ? 'Workflow library'
      : S.wview === 'editor' ? (isDraft() ? 'New workflow · Glare screen document review' : 'Workflow · S21 crossing / Glare screen')
      : 'Select workflow';
    var body = S.wview === 'library' ? libraryView() : S.wview === 'editor' ? editorView() : activeView();
    el.innerHTML = frame(4, title, 'Workflow manager', wfTabs() + body);
  }

  // =========================================================
  // 05 Workflow tasks
  // =========================================================
  function render5() {
    var el = $('#hd-5'); if (!el) return;
    var all = S.tasks;
    var k = [['Open tasks', all.filter(function (t) { return t.state === 'open'; }).length],
             ['Due by 17.11.', all.filter(function (t) { return t.state === 'open' && t.due <= '17.11.2026'; }).length],
             ['Completed', all.filter(function (t) { return t.state === 'done'; }).length],
             ['Returned', all.filter(function (t) { return t.state === 'returned'; }).length]];
    el.innerHTML = frame(5, 'My workflow tasks', 'Document manager', dmTabs('tasks') +
      '<div class="hd-kpis hd-kpis--flat">' + k.map(function (x, i) {
        return '<div class="hd-kpi"><span class="hd-kpi__i" aria-hidden="true">' + svg(['flow', 'clock', 'check', 'undo'][i]) + '</span><span class="hd-kpi__l">' + x[0] + '</span><b>' + x[1] + '</b></div>';
      }).join('') + '</div>' +
      '<section class="hd-panel">' +
        '<div class="b-bar">' +
          '<label class="hd-search b-grow"><span class="hd-sr">Search tasks</span>' + svg('search') +
            '<input id="b-tq" type="search" placeholder="Search tasks" value="' + esc(S.tq) + '" autocomplete="off"></label>' +
          '<label class="b-sel"><span class="hd-sr">Filter</span><select data-sel="tf">' +
            opt([['open', 'Open tasks'], ['all', 'All tasks'], ['done', 'Completed'], ['returned', 'Returned']], S.tf) + '</select></label>' +
        '</div>' +
        '<div id="b-tasks"></div>' +
      '</section>');
    renderTasks();
  }

  function renderTasks() {
    var box = $('#b-tasks'); if (!box) return;
    var q = S.tq.trim().toLowerCase();
    var list = sorted(S.tasks.filter(function (t) {
      if (S.tf !== 'all' && t.state !== S.tf) return false;
      return !q || [t.wf, t.st, t.no, t.type, t.desc].join(' ').toLowerCase().indexOf(q) !== -1;
    }), 'tasks');
    box.innerHTML = '<div class="hd-tablewrap"><table class="hd-table b-table"><thead><tr>' + th('tasks', 'wf', 'WF') + th('tasks', 'st', 'Task status') + th('tasks', 'no', 'Drawing no.') + th('tasks', 'type', 'Document type') + th('tasks', 'desc', 'Description') + th('tasks', 'due', 'Due date') + '<th scope="col">Actions</th></tr></thead><tbody>' +
      (list.length ? list.map(function (t) {
        var st = t.state === 'done' ? status('Completed') : t.state === 'returned' ? status('Returned') : '<span class="b-st b-st--task">' + esc(t.st) + '</span>';
        return '<tr><td>' + wfChip(t.wf) + '</td><td>' + st + '</td><td><button type="button" class="hd-idlink" data-act="doc" data-id="' + esc(t.no.split(' ')[0]) + '">' + esc(t.no) + '</button></td><td>' + esc(t.type) + '</td>' +
          '<td class="b-wrap">' + esc(t.desc) + '</td><td>' + t.due + '</td><td class="b-icons">' +
          '<button type="button" class="b-ib" data-act="finddoc" data-id="' + esc(t.no.split(' ')[0]) + '" aria-label="Open ' + esc(t.no) + ' in the document manager">' + svg('eye') + '</button>' +
          (t.state === 'open'
            ? '<button type="button" class="b-ib b-ib--ok" data-act="done" data-id="' + t.id + '" aria-label="Mark ' + esc(t.desc) + ' done">' + svg('check') + '</button>' +
              '<button type="button" class="b-ib b-ib--bad" data-act="return" data-id="' + t.id + '" aria-label="Return ' + esc(t.desc) + '">' + svg('undo') + '</button>'
            : '<button type="button" class="b-ib" data-act="reopen" data-id="' + t.id + '" aria-label="Reopen ' + esc(t.desc) + '">' + svg('undo') + '</button>') +
          '</td></tr>';
      }).join('') : '<tr><td colspan="7" class="hd-empty">No tasks here. ' + (S.tf === 'open' ? 'All open tasks are handled.' : '') + '</td></tr>') +
      '</tbody></table></div>' +
      '<p class="hd-foot">The same status appears in the document manager and on My overview.</p>';
  }

  // =========================================================
  // Pulse: marks the first thing to try in each step until used
  // =========================================================
  var PULSE = {
    1: '.hd-panel--center .hd-btn',
    2: '[data-act="pdf"], .b-files [data-go="4"]',
    3: '[data-act="applymap"]:not(.hd-btn--done), [data-act="create"], .b-create [data-go="4"]',
    4: '[data-act="assignwf"]:not([disabled]), [data-act="openwf"]',
    5: '[data-act="done"]'
  };
  var touched = {};

  function pulse() {
    for (var n = 1; n <= 5; n++) {
      var box = document.getElementById('hd-' + n);
      if (!box) continue;
      var old = box.querySelectorAll('.hd-pulse');
      for (var i = 0; i < old.length; i++) old[i].classList.remove('hd-pulse');
      if (touched[n]) continue;
      var el = box.querySelector(PULSE[n]);
      if (el) el.classList.add('hd-pulse');
    }
  }

  function touch(e) {
    var box = e.target.closest && e.target.closest('.hd[id^="hd-"]');
    if (!box || e.target.closest('[data-act="reset"], .hd-side')) return;
    var n = box.id.slice(3);
    if (!touched[n]) { touched[n] = true; setTimeout(pulse, 0); }
  }

  var toastTimer;
  function stamp() { var d = new Date(); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
  function toast(msg, info) {
    if (!info) {
      S.log.unshift({ t: msg, at: stamp() }); S.log = S.log.slice(0, 12);
      if (S.seen > S.log.length) S.seen = S.log.length;
      save(); refreshBells();
    }
    var t = document.getElementById('hd-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'hd-toast';
      t.className = 'hd-toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.innerHTML = '<span class="hd-toast__ok" aria-hidden="true">✓</span>' + esc(msg);
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 3200);
  }

  // =========================================================
  // Actions
  // =========================================================
  function renderAll() { render1(); render2(); render3(); render4(); render5(); pulse(); }
  var RENDER = [null, function () { render1(); }, function () { render2(); }, function () { render3(); }, function () { render4(); }, function () { render5(); }];

  // Only the bell badges change when something is logged
  function refreshBells() {
    var n = Math.max(0, S.log.length - S.seen);
    document.querySelectorAll('#journey .b-bellbtn').forEach(function (b) {
      var em = b.querySelector('.b-bell__n');
      if (n && !em) { em = document.createElement('em'); em.className = 'b-bell__n'; em.setAttribute('aria-hidden', 'true'); b.appendChild(em); }
      if (em) { if (n) em.textContent = n; else em.remove(); }
      b.setAttribute('aria-label', 'Activity' + (n ? ', ' + n + ' new' : ''));
    });
  }

  // =========================================================
  // Real PDFs, built in the browser with jsPDF (js/vendor).
  // Nothing is uploaded: the file is made on the visitor's device.
  // =========================================================
  var pdfReady = null, pdfBusy = false;
  function pdfLib() {
    if (window.jspdf) return Promise.resolve(window.jspdf.jsPDF);
    if (!pdfReady) {
      pdfReady = new Promise(function (ok, fail) {
        var sc = document.createElement('script');
        sc.src = '/js/vendor/jspdf.umd.min.js?v=1';
        sc.onload = function () { if (window.jspdf) ok(window.jspdf.jsPDF); else fail(); };
        sc.onerror = function () { pdfReady = null; fail(); };
        document.head.appendChild(sc);
      });
    }
    return pdfReady;
  }

  // The built-in PDF fonts cover Latin-1 only
  function clean(t) {
    return String(t == null ? '' : t).replace(/[–—]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\x00-\xFF]/g, '?');
  }
  function fileName(t) { return clean(t).replace(/Ü/g, 'UE').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-'); }
  function val(k) { return clean(S.map[k] || '-'); }

  function pdfDraft(doc, w, h) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(70);
    doc.setTextColor(238, 232, 252);
    doc.text('DRAFT - DEMO', w / 2 - 95, h / 2 + 45, { angle: 28 });
  }

  function pdfFoot(doc, w, h, page) {
    var d = new Date();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(102, 112, 133);
    doc.text('Higherd demo - illustrative data, not approved - created ' + d.toLocaleDateString('en-GB') + ' ' + stamp() + ' from ' + clean(S.source) + ' / A', 15, h - 8);
    doc.text(page, w - 15, h - 8, { align: 'right' });
  }

  // Cell with a small label and a value
  function cell(doc, x, y, w, h, label, value, opts) {
    opts = opts || {};
    doc.setDrawColor(52, 64, 84);
    doc.setLineWidth(0.3);
    if (opts.fill) { doc.setFillColor.apply(doc, opts.fill); doc.rect(x, y, w, h, 'FD'); } else doc.rect(x, y, w, h);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(102, 112, 133);
    if (label) doc.text(clean(label), x + 2, y + 3.8);
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(opts.size || 9);
    doc.setTextColor.apply(doc, opts.color || [16, 24, 40]);
    if (value) {
      var lines = doc.splitTextToSize(clean(value), w - 4);
      doc.text(lines, x + 2, y + (label ? 8.5 : 5.5));
    }
    if (opts.mapped) {
      doc.setDrawColor(74, 15, 168);
      doc.setLineWidth(0.6);
      doc.rect(x + 1, y + (label ? 5 : 1), w - 2, h - (label ? 6 : 2));
    }
  }

  // Rail: client title block (A4 landscape)
  function pdfTitleBlock(doc, heading, page) {
    var W = 297, H = 210, x = 15, y = 15, w = 267;
    pdfDraft(doc, W, H);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(74, 15, 168);
    doc.text(clean(heading).toUpperCase(), x, 11);

    var c3 = w / 3;
    cell(doc, x, y, c3, 22, 'Client / Project team', 'Rail client\nDemonstration data');
    cell(doc, x + c3, y, c3, 22, 'Design / Coordination', val('by') + ' - Coordination\nHigherd Demo');
    cell(doc, x + 2 * c3, y, c3, 22, '', '');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(220, 38, 38);
    doc.text('RAIL CLIENT', x + 2 * c3 + c3 / 2, y + 14, { align: 'center' });

    y += 22;
    doc.setFillColor(228, 231, 236); doc.setDrawColor(52, 64, 84); doc.rect(x, y, w, 36, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(102, 112, 133);
    doc.text('Project name / Scope description', x + 2, y + 4);
    doc.setFontSize(19); doc.setTextColor(16, 24, 40);
    doc.text(val('name'), x + 4, y + 13);
    doc.setDrawColor(74, 15, 168); doc.setLineWidth(0.6); doc.rect(x + 2, y + 6, w - 4, 9.5);
    doc.setFontSize(13); doc.text('Glare screen - BSW-01', x + 4, y + 22);
    doc.setFontSize(7); doc.setTextColor(102, 112, 133); doc.text('Project no.:', x + 4, y + 31);
    doc.setFontSize(10); doc.setTextColor(16, 24, 40); doc.text(val('pno'), x + 22, y + 31);
    doc.rect(x + 20, y + 27, 50, 6);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(74, 15, 168);
    doc.text('DRAFT - DEMO', x + w - 4, y + 31, { align: 'right' });

    y += 36;
    var rows = [['Design stage', 'Approval design', 'Station name', 'S21 - Crossing area'],
                ['Drawing content', 'Glare screen - Layout and elevations', 'Route', 'Rail / motorway'],
                ['Scale', '1:100', 'Route no.', '-'],
                ['Drawing number', val('dno'), 'Chainage', '-']];
    var cw = [42, 92, 42, 91];
    rows.forEach(function (r, i) {
      var cx = x;
      r.forEach(function (v, j) {
        cell(doc, cx, y, cw[j], 10, '', v, { color: j % 2 ? [16, 24, 40] : [71, 84, 103], mapped: i === 3 && j === 1 });
        cx += cw[j];
      });
      y += 10;
    });

    var sw = [60, 90, 47, 70];
    [['Preparation', 'Name (print)', 'Date', 'Signature'], ['Drawn', val('by'), new Date().toLocaleDateString('en-GB'), ''], ['Prepared', '-', '-', ''], ['Quality check', '-', '-', '']].forEach(function (r, i) {
      var cx = x;
      r.forEach(function (v, j) {
        cell(doc, cx, y, sw[j], 9, '', v, { bold: i === 0, color: i === 0 ? [71, 84, 103] : [16, 24, 40] });
        cx += sw[j];
      });
      y += 9;
    });

    cell(doc, x, y, w / 2, 32, 'Client internal quality check', 'The detailed design submission has to be reviewed by the client\'s technical quality management before approval.');
    cell(doc, x + w / 2, y, w / 2, 32, 'Technical review record', 'Pending. Technical reviews and approvals remain with the assigned roles in the workflow.');
    pdfFoot(doc, W, H, page);
  }

  // Road: DEGES project template cover sheet (A4 portrait)
  function pdfCover(doc, page, title) {
    var W = 210, H = 297, x = 22, w = 166, y = 30;
    pdfDraft(doc, W, H);
    doc.setDrawColor(234, 236, 240); doc.setLineWidth(0.4); doc.rect(15, 15, 180, 262);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(71, 84, 103);
    doc.text('ROAD - PROJECT TEMPLATE', x, y);
    doc.setFontSize(28); doc.setTextColor(16, 24, 40); doc.text(clean(title || 'Cover sheet'), x, y + 15);
    doc.setFontSize(16); doc.text(val('name'), x, y + 28);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.text('Glare screen - BSW-01', x, y + 37);
    doc.setFontSize(10); doc.setTextColor(102, 112, 133); doc.text('Approval design', x, y + 45);

    y += 55;
    [['Project', val('pno')], ['Document', 'Layout and elevations'], ['Drawing number', val('dno')], ['Prepared by', val('by') + ' - Coordination'],
     ['Index / Revision', '01'], ['Status', 'Draft - Review pending'], ['Source revision', clean(S.source) + ' / A']].forEach(function (r) {
      doc.setDrawColor(234, 236, 240); doc.setLineWidth(0.3); doc.rect(x, y, w, 11);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(102, 112, 133); doc.text(r[0], x + 3, y + 7);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(16, 24, 40); doc.text(r[1], x + 55, y + 7);
      y += 13;
    });

    y += 6;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(102, 112, 133);
    doc.text('Based on the uploaded project template. Illustrative translation, not approved.', x, y);
    y += 30;
    doc.setDrawColor(152, 162, 179);
    [['Name (print)', val('by')], ['Date', ''], ['Signature', '']].forEach(function (s, i) {
      var sx = x + i * 58;
      doc.line(sx, y, sx + 50, y);
      doc.setFontSize(10); doc.setTextColor(16, 24, 40); doc.text(s[1], sx, y - 3);
      doc.setFontSize(7.5); doc.setTextColor(102, 112, 133); doc.text(s[0], sx, y + 5);
    });
    pdfFoot(doc, W, H, page);
  }

  // Package register (A4 portrait)
  function pdfRegister(doc, page) {
    var W = 210, H = 297, x = 18, y = 26;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(74, 15, 168);
    doc.text('HIGHERD BAU - DOCUMENT MANAGER', x, y);
    doc.setFontSize(20); doc.setTextColor(16, 24, 40); doc.text('Submission package ' + val('pno'), x, y + 11);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(71, 84, 103);
    doc.text(val('name') + ' - Glare screen BSW-01', x, y + 19);
    doc.text('Source revision: ' + clean(S.source) + ' / A (unchanged)   Prepared by: ' + val('by'), x, y + 26);

    y += 38;
    var cols = [['Drawing no.', 44], ['Index', 14], ['Document', 30], ['Layout', 36], ['Workflow', 22], ['Status', 28]];
    doc.setFillColor(248, 249, 251); doc.rect(x, y, 174, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(102, 112, 133);
    var cx = x;
    cols.forEach(function (c) { doc.text(c[0].toUpperCase(), cx + 2, y + 5.3); cx += c[1]; });
    y += 8;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    TARGETS.forEach(function (t) {
      var on = S.assigned[t.side];
      var row = [t.no, t.idx, t.type, t.side === 'rail' ? 'Rail client' : 'DEGES template', on ? WFS[t.side].id : '-', S.created ? (on ? 'In workflow' : 'Draft') : 'Not created'];
      cx = x;
      doc.setTextColor(16, 24, 40);
      row.forEach(function (v, j) { doc.text(clean(v), cx + 2, y + 6); cx += cols[j][1]; });
      doc.setDrawColor(234, 236, 240); doc.line(x, y + 9, x + 174, y + 9);
      y += 9;
    });

    y += 12;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(16, 24, 40); doc.text('Checks', x, y);
    y += 7;
    checks().forEach(function (c) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.setTextColor.apply(doc, c[0] === null ? [217, 119, 6] : c[0] ? [22, 163, 74] : [220, 38, 38]);
      doc.text(c[0] === null ? 'PENDING' : c[0] ? 'OK' : 'FIX', x, y);
      doc.setTextColor(16, 24, 40); doc.text(clean(c[1]), x + 20, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(102, 112, 133); doc.text(clean(c[2]), x + 20, y + 4.5);
      y += 11;
    });
    pdfFoot(doc, W, H, page);
  }

  // kind: 'single' (selected template), 'package' (register + both layouts), or a target drawing number
  function makePdf(kind) {
    if (pdfBusy) return;
    var bad = checks().filter(function (c) { return c[0] === false; });
    if (bad.length) {
      S.pview = 'check'; save(); render3(); goTo(3);
      toast('Fix the mapping first: ' + bad[0][1].toLowerCase(), true);
      return;
    }
    pdfBusy = true;
    pdfLib().then(function (JsPDF) {
      var doc, name, tpl = S.map.tpl, t = TARGETS.filter(function (x) { return x.no === kind; })[0];
      if (t) tpl = t.side === 'road' ? 'deges-cover' : t.type === 'Form' ? 'rail-form' : 'rail-title';
      if (kind === 'package') {
        doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
        pdfRegister(doc, 'Page 1 / 3');
        doc.addPage('a4', 'landscape'); pdfTitleBlock(doc, 'Rail - Title block', 'Page 2 / 3');
        doc.addPage('a4', 'portrait'); pdfCover(doc, 'Page 3 / 3');
        name = fileName(S.map.pno + '_submission-package') + '.pdf';
      } else if (tpl === 'deges-cover') {
        doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
        pdfCover(doc, 'Page 1 / 1', t ? t.type : 'Cover sheet');
        name = fileName(t ? t.no + '_DEGES-' + t.type : S.map.dno + '_DEGES-cover-sheet') + '.pdf';
      } else {
        doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape', compress: true });
        pdfTitleBlock(doc, t ? 'Rail - ' + t.type : tpl === 'rail-form' ? 'Rail - Form' : 'Rail - Title block', 'Page 1 / 1');
        name = fileName(t ? t.no + '_Rail-' + t.type : S.map.dno + (tpl === 'rail-form' ? '_Rail-form' : '_Rail-title-block')) + '.pdf';
      }
      doc.setProperties({ title: clean(S.map.name) + ' - ' + name, author: clean(S.map.by), creator: 'Higherd demo', subject: 'Illustrative demo document, not approved' });
      doc.save(name);
      pdfBusy = false;
      toast('PDF downloaded: ' + name);
    }, function () {
      pdfBusy = false;
      toast('The PDF tool could not load. Check the connection and try again.', true);
    });
  }

  // =========================================================
  // Document details dialog
  // =========================================================
  function closeDialog() { var d = $('#hd-dialog'); if (d && d.open) d.close(); }
  function docByNo(no) { var l = docs(); for (var i = 0; i < l.length; i++) if (l[i].no === no) return l[i]; return null; }

  function dialog() {
    var dlg = $('#hd-dialog');
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.id = 'hd-dialog';
    dlg.className = 'hd-dialog hd b-docdlg';
    dlg.setAttribute('aria-labelledby', 'b-doc-t');
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) { dlg.close(); return; }
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var a = b.getAttribute('data-act'), id = b.getAttribute('data-id');
      if (a === 'close') dlg.close();
      if (a === 'dsrc') { S.source = id; save(); renderFiles(); openDoc(id); toast('Source revision: ' + id + ' / A'); }
      if (a === 'dpdf') { dlg.close(); S.pview = 'mapping'; save(); render3(); goTo(3); }
      if (a === 'dwf') { dlg.close(); S.wview = 'active'; save(); render4(); goTo(4); }
      if (a === 'dtasks') { dlg.close(); S.tq = id; S.tf = 'all'; save(); render5(); goTo(5); }
      if (a === 'doc') openDoc(id);
      if (a === 'dpdfdl') makePdf(id);
    });
    return dlg;
  }

  function openDoc(no) {
    var d = docByNo(no);
    if (!d) { toast(no + ' is not in the document manager yet', true); return; }
    var tg = TARGETS.filter(function (t) { return t.no === no; })[0];
    var ts = S.tasks.filter(function (t) { return t.no === no || (t.docs && t.docs.indexOf(no) !== -1); });
    var linked = d.src && S.created && no === S.source ? TARGETS : [];
    var tplName = TEMPLATES.filter(function (t) { return t[0] === S.map.tpl; })[0][1];
    var hist = d.src ? [['Created by Gerda Bauer', 'Revision A']] : [['Created in PDF Creator from ' + S.source + ' / A', tplName]];
    if (d.wf) hist.unshift(['Assigned to ' + d.wf, 'Workflow']);
    ts.filter(function (t) { return t.state !== 'open'; }).forEach(function (t) { hist.unshift([(t.state === 'done' ? 'Completed: ' : 'Returned: ') + t.desc, 'Task']); });

    var dlg = dialog();
    dlg.innerHTML =
      '<div class="hd-dialog__h"><div><p class="hd-eyebrow">' + (d.src ? 'Source document' : 'Target document · ' + (tg.side === 'rail' ? 'Rail' : 'Road / DEGES')) + '</p>' +
        '<p class="hd-dialog__t" id="b-doc-t">' + esc(d.no) + ' / ' + d.idx + '</p></div>' +
        '<button type="button" class="hd-x" data-act="close" aria-label="Close">×</button></div>' +
      '<p class="hd-dialog__p">' + esc(d.type) + ' · ' + esc(d.desc) + '</p>' +
      '<div class="hd-stats"><div><span>Status</span><b>' + esc(d.st) + '</b></div><div><span>Workflow</span><b>' + (d.wf || '—') + '</b></div><div><span>Open tasks</span><b>' +
        ts.filter(function (t) { return t.state === 'open'; }).length + '</b></div></div>' +
      (linked.length ? '<p class="hd-sub">Target documents created from this revision</p><ul class="b-dlist">' + linked.map(function (t) {
        return '<li><button type="button" class="hd-idlink" data-act="doc" data-id="' + t.no + '">' + t.no + '</button><small>' + t.desc + '</small></li>';
      }).join('') + '</ul>' : '') +
      '<p class="hd-sub">History</p><ol class="b-hist">' + hist.map(function (h) {
        return '<li><b>' + esc(h[0]) + '</b><small>' + TODAY + ' · ' + esc(h[1]) + '</small></li>';
      }).join('') + '</ol>' +
      '<div class="hd-actions">' +
        (d.src && S.source !== d.no ? '<button type="button" class="hd-btn hd-btn--ghost" data-act="dsrc" data-id="' + esc(d.no) + '">Use as source</button>' : '') +
        (ts.length ? '<button type="button" class="hd-btn hd-btn--ghost" data-act="dtasks" data-id="' + esc(d.no) + '">Show tasks</button>' : '') +
        (d.src ? '' : '<button type="button" class="hd-btn hd-btn--ghost" data-act="dpdfdl" data-id="' + esc(d.no) + '">Download PDF</button>') +
        (d.src ? '<button type="button" class="hd-btn" data-act="dpdf">Open in PDF Creator</button>'
               : '<button type="button" class="hd-btn" data-act="dwf">' + (d.wf ? 'View workflow' : 'Assign workflow') + '</button>') +
      '</div>';
    if (!dlg.open) dlg.showModal();
    var x = dlg.querySelector('.hd-x'); if (x) x.focus();
  }

  // =========================================================
  // Higherd AI: suggested questions, answered from the demo state
  // =========================================================
  var AI_Q = {
    1: ['What needs my attention today?', 'How far along is the package?', 'Which documents have no workflow?'],
    2: ['Which document should I use as source?', 'What happens to the source file?', 'Which documents have no workflow?'],
    3: ['Is the mapping complete?', 'How do rail and DEGES layouts differ?', 'Can I download the PDF?', 'What do I do after creating?'],
    4: ['Which workflow fits the road documents?', 'Who is responsible in each phase?', 'Is any task unassigned?'],
    5: ['Who needs to act next?', 'Is anything overdue?', 'What happens if I return a task?']
  };

  function currentStep() {
    for (var n = 1; n <= 5; n++) { var p = document.getElementById('flow-' + n); if (p && !p.hidden) return n; }
    return 1;
  }
  function list(a) { return a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a.join(''); }
  function dueKey(t) { return t.due.split('.').reverse().join(''); }

  function aiAnswer(q) {
    var ql = q.toLowerCase(), open = openTasks(), all = docs(), c = pkgCounts();
    var noWf = all.filter(function (d) { return !d.wf; });
    var byDue = open.slice().sort(function (a, b) { return dueKey(a).localeCompare(dueKey(b)); });
    var b, un;
    if (/attention|today/.test(ql)) {
      if (!open.length) return 'Nothing is waiting for you. All workflow tasks are handled.';
      return 'You have ' + open.length + ' open task' + (open.length === 1 ? '' : 's') + '. The first is due ' + byDue[0].due + ': ' + byDue[0].desc + ' (' + byDue[0].no + ').' +
        (c.ret ? ' ' + c.ret + ' document' + (c.ret === 1 ? ' has' : 's have') + ' a returned task.' : '') +
        (S.created ? '' : ' The rail and road target documents are not created yet: open PDF Creator in step 03.');
    }
    if (/far along|progress|package/.test(ql)) {
      var pct = Math.round((c.prog + c.done) / all.length * 100);
      return pct + '% of the ' + all.length + ' files are in a workflow or completed (' + c.done + ' completed, ' + c.prog + ' in progress, ' + c.coord + (c.coord === 1 ? ' needs' : ' need') + ' coordination' + (c.ret ? ', ' + c.ret + ' returned' : '') + ').' +
        (S.created ? ' Both submission packages exist.' : ' The two submission packages appear once you create the target documents.');
    }
    if (/no workflow|without/.test(ql)) {
      if (!noWf.length) return 'Every document is in a workflow.';
      return noWf.length + ' document' + (noWf.length === 1 ? ' has' : 's have') + ' no workflow: ' + list(noWf.map(function (d) { return d.no; })) + '.' +
        (noWf.some(function (d) { return !d.src; }) ? ' Assign the new ones in step 04.' : '');
    }
    if (/pdf|download|export|print/.test(ql)) {
      return 'Yes. In PDF Creator, Create PDF downloads the selected template (' + TEMPLATES.filter(function (t) { return t[0] === S.map.tpl; })[0][1] + ') with your mapped values. Export downloads the whole package: a register of the 6 documents, the rail title block and the DEGES cover sheet. Each target document also has Download PDF in its details. The files are made on your device and marked Draft - Demo.';
    }
    if (/source/.test(ql) && /which|use/.test(ql)) {
      return 'Use ' + S.source + ' / A' + (S.source === 'S21-BSW-ÜP-001'
        ? ', the overview drawing: it carries the project name, numbers and author that both client layouts need.'
        : '. For the full project data, S21-BSW-ÜP-001 (the overview drawing) carries the most.');
    }
    if (/source file|happens to the source|unchanged/.test(ql)) {
      return 'Nothing. ' + S.source + ' keeps revision A and its ID. PDF Creator writes new target documents and links each one back to that source revision and the template version.';
    }
    if (/mapping|complete|check/.test(ql)) {
      var bad = checks().filter(function (x) { return x[0] === false; });
      if (bad.length) return 'Not yet: ' + list(bad.map(function (x) { return x[1].toLowerCase(); })) + '. Fix it in the Field mapping panel.';
      return 'Yes. All 4 fields are filled and the numbers follow the project pattern' + (S.mapped ? ', and the mapping is applied.' : '. Press Apply mapping to confirm it.') +
        ' The technical review stays with the assigned roles.';
    }
    if (/rail|deges|differ|layout/.test(ql)) {
      return 'Same data, different layouts. Rail uses the client title block with signature fields for each preparation step. DEGES uses its own project template with a cover sheet and index 01 instead of A. Both carry ' + S.map.dno + '.';
    }
    if (/after creat|what do i do/.test(ql)) {
      if (!S.created) return 'First create the documents (Create documents, bottom right). Then select a workflow for the rail and the road package in step 04.';
      if (!(S.assigned.rail && S.assigned.road)) return 'Assign the workflows in step 04: rail to WF-B01, road to WF-S02. Until then the new documents count as "Coordination needed".';
      return 'You are done here. Both packages are in review; follow the tasks in step 05.';
    }
    if (/road|which workflow|fits/.test(ql)) {
      return S.assigned.road ? 'The road documents already run in WF-S02 (Road / DEGES document review).'
        : 'WF-S02, the DEGES document review template. It has the same four phases as the rail workflow, so the reviewers see a familiar route. Use "Use template" under Active workflows.';
    }
    if (/responsible|who is|phase/.test(ql)) {
      b = curBoard();
      return 'In ' + S.wf + ': ' + PHASES.map(function (p) {
        var r = [];
        b.filter(function (t) { return t.ph === p.k; }).forEach(function (t) { if (r.indexOf(t.role) === -1) r.push(t.role); });
        return p.t + ': ' + (r.length ? list(r) : 'no tasks yet');
      }).join('. ') + '.';
    }
    if (/unassigned/.test(ql)) {
      un = curBoard().filter(function (t) { return t.person === 'Unassigned'; });
      if (!un.length) return 'No. Every task in ' + S.wf + ' has a named person.';
      return un.length + ' task' + (un.length === 1 ? '' : 's') + ' in ' + S.wf + ' only have a role, no person: ' + list(un.slice(0, 4).map(function (t) { return t.t; })) +
        (un.length > 4 ? ' and more' : '') + '. Open the task menu (⋯) and choose Assign roles.';
    }
    if (/act next|who needs|next/.test(ql)) {
      if (!byDue.length) return 'No one: all tasks are completed.';
      return byDue.slice(0, 3).map(function (t) { return t.due + ': ' + t.desc + ' (' + t.wf + ', ' + t.no + ')'; }).join('. ') + '.';
    }
    if (/overdue|late/.test(ql)) {
      return 'Nothing is overdue on ' + TODAY + '. ' + (byDue.length ? 'The next deadline is ' + byDue[0].due + ': ' + byDue[0].desc + '.' : 'There are no open tasks.');
    }
    if (/return/.test(ql)) {
      return 'The task goes back to the previous role, and the document shows "Task returned" on My overview. Reopen it when the issue is solved.';
    }
    return 'In this demo Higherd AI answers questions about this project: tasks, documents, workflows and the mapping. Try one of the suggestions below.';
  }

  var aiLog = [];

  function aiPanel() {
    var p = $('#hd-ai');
    if (p) return p;
    p = document.createElement('aside');
    p.id = 'hd-ai';
    p.className = 'hd hd-ai';
    p.setAttribute('aria-label', 'Higherd AI');
    p.hidden = true;
    document.body.appendChild(p);
    p.addEventListener('click', function (e) {
      var b = e.target.closest('[data-q], [data-act]');
      if (!b) return;
      if (b.getAttribute('data-act') === 'aiclose') { closeAI(); return; }
      if (b.hasAttribute('data-q')) ask(b.getAttribute('data-q'));
    });
    p.addEventListener('submit', function (e) {
      e.preventDefault();
      var i = p.querySelector('input'), v = i.value.trim();
      if (v) ask(v);
    });
    p.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); closeAI(); } });
    return p;
  }

  function closeAI() {
    var p = $('#hd-ai'); if (p) p.hidden = true;
    var o = $('#hd-' + currentStep() + ' [data-act="ai"]'); if (o) o.focus({ preventScroll: true });
  }

  function renderAI(typing) {
    var p = aiPanel(), step = currentStep();
    p.innerHTML =
      '<div class="hd-ai__h">' + svg('spark') + '<p><b>Higherd AI</b><small>Answers from this demo project</small></p>' +
        '<button type="button" class="hd-x" data-act="aiclose" aria-label="Close Higherd AI">×</button></div>' +
      '<div class="hd-ai__log" aria-live="polite">' +
        (aiLog.length ? '' : '<p class="hd-ai__hello">Hi Gerda. Ask me about this screen.</p>') +
        aiLog.map(function (m) { return '<p class="hd-ai__m hd-ai__m--' + m.who + '">' + esc(m.t) + '</p>'; }).join('') +
        (typing ? '<p class="hd-ai__m hd-ai__m--ai hd-ai__typing" aria-label="Higherd AI is typing"><i></i><i></i><i></i></p>' : '') +
      '</div>' +
      '<div class="hd-ai__q">' + AI_Q[step].map(function (q) { return '<button type="button" data-q="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>' +
      '<form class="hd-ai__f"><label class="hd-sr" for="hd-ai-in">Ask Higherd AI</label><input id="hd-ai-in" type="text" placeholder="Ask Higherd AI…" autocomplete="off"><button type="submit" class="hd-btn hd-btn--sm">Ask</button></form>';
    var log = p.querySelector('.hd-ai__log');
    log.scrollTop = log.scrollHeight;
  }

  function ask(q) {
    aiLog.push({ who: 'me', t: q });
    renderAI(true);
    setTimeout(function () {
      aiLog.push({ who: 'ai', t: aiAnswer(q) });
      renderAI(false);
      var i = $('#hd-ai-in'); if (i) i.focus({ preventScroll: true });
    }, 650);
  }

  function openAI(q) {
    var p = aiPanel();
    p.hidden = false;
    renderAI(false);
    if (q) ask(q);
    var i = p.querySelector('input'); if (i && !q) i.focus({ preventScroll: true });
  }


  function createDocs() {
    if (S.created) return;
    S.mapped = true; S.created = true; S.show = 'all'; S.q = '';
    save(); renderAll(); scrollToApp(3);
    toast('6 target documents created from ' + S.source + ' / A');
  }

  function assignWf(k) {
    if (!S.created || S.assigned[k]) return;
    S.assigned[k] = true;
    var w = WFS[k], nos = TARGETS.filter(function (t) { return t.side === k; }).map(function (t) { return t.no; });
    S.tasks.push({ id: 'n' + (S.seq++), wf: w.id, st: 'Send for review', no: nos[0] + ' +2', docs: nos, disc: 'ING', type: k === 'rail' ? 'Rail package' : 'DEGES package',
      desc: 'Send 3 documents for technical review', due: '19.11.2026', state: 'open' });
    save(); renderAll();
    toast('3 ' + (k === 'rail' ? 'rail' : 'road') + ' documents assigned to ' + w.id + ' · first task is with Gerda');
  }

  function focusAfter(sel) {
    setTimeout(function () { var n = $(sel); if (n) n.focus({ preventScroll: true }); }, 0);
  }

  function onClick(e) {
    var go = e.target.closest('[data-go]');
    if (go) {
      if (go.disabled) return;
      var to = Number(go.getAttribute('data-go'));
      if (to === 3 && S.pview === 'tool') S.pview = 'mapping';
      goTo(to); pulse();
      return;
    }
    var b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    var act = b.getAttribute('data-act'), id = b.getAttribute('data-id'), val = b.getAttribute('data-v'), t;

    switch (act) {
      case 'reset':
        if (!confirm('Reset the demo to the sample data?')) return;
        try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
        S = defaults(); touched = {}; aiLog = []; bellOpen = 0; closeDialog(); renderAll(); return;
      case 'ai': openAI(); return;
      case 'bell':
        var bs = Number(val);
        bellOpen = bellOpen === bs ? 0 : bs;
        if (bellOpen) { S.seen = S.log.length; save(); }
        RENDER[bs](); focusAfter('#hd-' + bs + ' [data-act="bell"]'); return;
      case 'clearlog': var cs = bellOpen || 1; S.log = []; S.seen = 0; save(); RENDER[cs](); return;
      case 'sort':
        var sp = val.split(':'), cur = S.sort[sp[0]];
        S.sort[sp[0]] = cur[0] === sp[1] ? (cur[1] > 0 ? [sp[1], -1] : ['', 1]) : [sp[1], 1];
        save(); if (sp[0] === 'files') renderFiles(); else renderTasks();
        focusAfter('[data-act="sort"][data-v="' + val + '"]'); return;
      case 'doc': openDoc(id); return;
      case 'period': S.period = val; save(); render1(); pulse(); return;
      case 'finddoc': S.q = id; S.show = 'all'; save(); render2(); goTo(2); return;
      case 'pdf': S.pview = 'mapping'; save(); render3(); goTo(3); return;
      case 'ptool':
        if (val === 'tool') { toast(b.getAttribute('data-l') + ' opens in the full product. This demo covers mapping, compare and check.', true); return; }
        if (val === 'create') { makePdf('single'); return; }
        if (val === 'export') { makePdf('package'); return; }
        if (val === 'wf') { goTo(4); return; }
        S.pview = val; save(); render3(); focusAfter('#hd-3 .b-tool.is-on'); return;
      case 'create': createDocs(); return;
      case 'pdfpkg': makePdf('package'); return;
      case 'wview': S.wview = val; S.menu = ''; S.edit = ''; save(); render4(); focusAfter('#hd-4 .b-tab.is-on'); return;
      case 'assignwf': assignWf(val); return;
      case 'openwf':
        if (!S.boards[id]) { toast('Only workflows can be opened in the editor', true); return; }
        S.wf = id; S.wview = 'editor'; S.menu = ''; S.edit = ''; save(); render4(); scrollToApp(4); return;
      case 'newwf':
        var nid = 'WF-S0' + S.draftN++;
        S.boards[nid] = [{ id: 'd' + (S.seq++), ph: 'prep', t: 'Review target documents for DEGES', role: 'Planning coordinator (GC)', person: 'Gerda Bauer', code: '01', dur: '2 days after assignment', docs: DOCSETS[0], par: false }];
        S.lib.unshift({ id: nid, desc: 'DEGES · Glare screen document review', type: 'Created manually', proj: 'S21 · BSW-01', st: 'Draft', board: nid, on: '16.11.2026' });
        S.wf = nid; S.wview = 'editor'; S.menu = ''; S.edit = ''; save(); render4(); scrollToApp(4);
        toast('Draft ' + nid + ' created. Add tasks, then save.');
        return;
      case 'savewf':
        var row = libRow(S.wf); if (row) row.st = 'Saved draft';
        S.wview = 'library'; save(); render4();
        toast(S.wf + ' saved as a draft · not a submission, signature or approval');
        return;
      case 'dupwf':
        var src = libRow(id); if (!src || !S.boards[id]) return;
        var did = id + '-C' + (S.lib.filter(function (r) { return r.id.indexOf(id + '-C') === 0; }).length + 1);
        S.boards[did] = JSON.parse(JSON.stringify(S.boards[id])).map(function (x) { x.id = 'c' + (S.seq++); return x; });
        S.lib.unshift({ id: did, desc: src.desc + ' (copy)', type: 'Duplicated', proj: src.proj, st: 'Draft', board: did, on: '16.11.2026' });
        save(); render4(); toast(did + ' created · phases and roles copied, no approvals or signatures');
        return;
      case 'delwf':
        var dr = libRow(id);
        if (dr && dr.st === 'Active') { toast(id + ' is active and cannot be deleted', true); return; }
        if (!confirm('Delete ' + id + ' from the library?')) return;
        S.lib = S.lib.filter(function (r) { return r.id !== id; });
        if (S.boards[id]) delete S.boards[id];
        if (S.wf === id) S.wf = 'WF-B01';
        save(); render4(); toast(id + ' deleted'); return;
      case 'menu':
        S.menu = S.menu === id ? '' : id; S.edit = ''; render4();
        if (S.menu) focusAfter('#hd-4 .b-menu [role="menuitem"]:not([disabled])');
        return;
      case 'addtask':
        var nt = { id: 'x' + (S.seq++), ph: val, t: 'New task', role: ROLES[0], person: 'Unassigned', code: '—', dur: '5 days', docs: DOCSETS[0], par: false };
        S.boards[S.wf].push(nt); S.edit = nt.id; S.menu = ''; save(); render4();
        focusAfter('#hd-4 [data-form="assign"] input[name="t"]');
        return;
      case 'cancel':
        t = findTask(S.edit);
        if (t && t.t === 'New task' && t.code === '—') S.boards[S.wf] = curBoard().filter(function (x) { return x.id !== t.id; });
        S.edit = ''; save(); render4(); return;
      case 't-edit': S.edit = id; S.menu = ''; render4(); focusAfter('#hd-4 [data-form="assign"] select[name="role"]'); return;
      case 't-next': case 't-prevph':
        t = findTask(id); var p = phaseOf(t.ph) + (act === 't-next' ? 1 : -1);
        if (p < 0 || p >= PHASES.length) return;
        t.ph = PHASES[p].k; S.menu = ''; save(); render4(); toast('“' + t.t + '” moved to ' + PHASES[p].t); return;
      case 't-par': t = findTask(id); t.par = !t.par; S.menu = ''; save(); render4(); toast(t.par ? 'Parallel review on for “' + t.t + '”' : 'Parallel review off'); return;
      case 't-link': S.menu = ''; render4(); toast('Links connect a task to drawings and the project plan in the full product', true); return;
      case 't-rm':
        t = findTask(id);
        if (!confirm('Remove “' + t.t + '” from this workflow?')) return;
        S.boards[S.wf] = curBoard().filter(function (x) { return x.id !== id; }); S.menu = ''; save(); render4(); toast('Task removed'); return;
      case 'done': case 'return': case 'reopen':
        S.tasks.forEach(function (x) { if (x.id === id) { t = x; x.state = act === 'done' ? 'done' : act === 'return' ? 'returned' : 'open'; } });
        save(); render1(); render5(); pulse();
        toast(act === 'done' ? '“' + t.desc + '” completed' : act === 'return' ? '“' + t.desc + '” returned to the previous role' : 'Task reopened');
        focusAfter('#b-tq');
        return;
    }
  }

  function onInput(e) {
    var t = e.target;
    if (t.id === 'b-q') { S.q = t.value; save(); renderFiles(); return; }
    if (t.id === 'b-tq') { S.tq = t.value; save(); renderTasks(); return; }
    if (t.hasAttribute('data-map')) {
      var k = t.getAttribute('data-map');
      S.map[k] = t.value; S.mapped = false; save(); syncFields(k);
      var btn = $('#hd-3 [data-act="applymap"]');
      if (btn) { btn.classList.remove('hd-btn--done'); btn.textContent = 'Apply mapping'; }
    }
  }

  function onChange(e) {
    var t = e.target;
    if (t.hasAttribute('data-src')) { S.source = t.getAttribute('data-src'); save(); renderFiles(); toast('Source revision: ' + S.source + ' / A'); return; }
    if (t.hasAttribute('data-sel')) {
      var k = t.getAttribute('data-sel');
      if (k === 'show') { S.show = t.value; save(); renderFiles(); }
      if (k === 'tf') { S.tf = t.value; save(); renderTasks(); }
      if (k === 'tpl') { S.map.tpl = t.value; S.mapped = false; save(); render3(); focusAfter('#hd-3 [data-sel="tpl"]'); }
    }
  }

  function onSubmit(e) {
    var f = e.target.closest('form[data-form]');
    if (!f) return;
    e.preventDefault();
    if (f.getAttribute('data-form') === 'map') {
      S.mapped = true; save(); render3(); pulse();
      toast('Mapping applied to 4 fields');
      focusAfter('#hd-3 [data-act="create"], #hd-3 .b-create [data-go]');
      return;
    }
    var t = findTask(f.getAttribute('data-id'));
    if (!t) return;
    var fd = {};
    Array.prototype.forEach.call(f.elements, function (n) { if (n.name) fd[n.name] = n.value; });
    t.t = fd.t.trim() || t.t; t.role = fd.role; t.person = fd.person; t.dur = fd.dur; t.docs = fd.docs; t.ph = fd.ph;
    if (t.code === '—') t.code = String(curBoard().length).padStart(2, '0');
    S.edit = ''; save(); render4();
    toast('“' + t.t + '” assigned to ' + (t.person === 'Unassigned' ? t.role : t.person));
  }

  // Close the task menu with Escape or a click outside
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (bellOpen) { var bs = bellOpen; bellOpen = 0; RENDER[bs](); focusAfter('#hd-' + bs + ' [data-act="bell"]'); return; }
    if (S.menu) { var id = S.menu; S.menu = ''; render4(); focusAfter('#hd-4 [data-act="menu"][data-id="' + id + '"]'); }
    else if (S.edit) { S.edit = ''; render4(); }
  });
  document.addEventListener('click', function (e) {
    if (S.menu && !e.target.closest('.b-menu, [data-act="menu"]')) { S.menu = ''; render4(); }
    if (bellOpen && !e.target.closest('.b-bellwrap')) { var bs = bellOpen; bellOpen = 0; RENDER[bs](); }
  });
  // Arrow keys move through the open menu
  document.addEventListener('keydown', function (e) {
    var it = e.target.closest && e.target.closest('.b-menu [role="menuitem"]');
    if (!it || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    e.preventDefault();
    var items = Array.prototype.slice.call(it.closest('.b-menu').querySelectorAll('[role="menuitem"]:not([disabled])'));
    var i = items.indexOf(it) + (e.key === 'ArrowDown' ? 1 : -1);
    items[(i + items.length) % items.length].focus();
  });
  // Clicking a highlighted field on the PDF jumps to its input
  document.addEventListener('click', function (e) {
    var f = e.target.closest('#hd-3 .b-pdf:not(.b-pdf--mini) [data-fld]');
    if (f) { var i = $('#b-m-' + f.getAttribute('data-fld')); if (i) i.focus(); }
  });
  document.addEventListener('keydown', function (e) {
    var f = e.target.closest && e.target.closest('#hd-3 [data-fld][role="button"]');
    if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); f.click(); }
  });

  var host = document.getElementById('journey');
  if (!host) return;
  host.addEventListener('pointerdown', touch);
  host.addEventListener('keydown', touch);
  host.addEventListener('click', onClick);
  host.addEventListener('input', onInput);
  host.addEventListener('change', onChange);
  host.addEventListener('submit', onSubmit);

  // ---------- drag a task to another phase ----------
  var dragId = '';
  host.addEventListener('dragstart', function (e) {
    var li = e.target.closest && e.target.closest('[data-drag]');
    if (!li) return;
    dragId = li.getAttribute('data-drag');
    li.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', dragId); } catch (err) { /* ignore */ }
  });
  host.addEventListener('dragover', function (e) {
    var col = dragId && e.target.closest('[data-drop]');
    if (!col) return;
    e.preventDefault();
    document.querySelectorAll('#hd-4 .b-col.is-over').forEach(function (c) { if (c !== col) c.classList.remove('is-over'); });
    col.classList.add('is-over');
  });
  host.addEventListener('drop', function (e) {
    var col = dragId && e.target.closest('[data-drop]');
    if (!col) return;
    e.preventDefault();
    var t = findTask(dragId), ph = col.getAttribute('data-drop');
    dragId = '';
    if (!t || t.ph === ph) { render4(); return; }
    t.ph = ph; S.menu = ''; save(); render4();
    toast('“' + t.t + '” moved to ' + PHASES[phaseOf(ph)].t);
  });
  host.addEventListener('dragend', function () {
    dragId = '';
    document.querySelectorAll('#hd-4 .is-over, #hd-4 .is-dragging').forEach(function (n) { n.classList.remove('is-over', 'is-dragging'); });
  });

  // Keep the assistant's suggestions in step with the visible screen
  host.addEventListener('click', function (e) {
    if (e.target.closest('[role="tab"], [data-step], [data-go]')) {
      setTimeout(function () { var p = $('#hd-ai'); if (p && !p.hidden) renderAI(false); }, 0);
    }
  });
  renderAll();
})();
