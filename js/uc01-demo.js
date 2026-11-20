/* =========================================================
   Higherd – UC01 clickable demo (front end only, sample data)
   Project Intelligence · Frankenschnellweg · Gherd Mike, BIM Coordinator, GCE Holding
   Follows the 18 UC01 frames in review order:
   01 My overview → 02 My / Team workflow tasks (+ Project landscape, task actions) →
   03 PDF viewer: comments report and plan stamp (Sign / Sign with comments / Decline) →
   04 Integrations: InfraWorks position, Revit family attributes and Dynamo →
   05 Document manager → 06 Workflow manager → 07 Settings (model and source files).
   Reuses the app frame styles from uc06-demo.css and uc05-demo.css.
   There is no separate "Edit task" screen: workflow actions stay in the flow.
   State is kept in localStorage so it survives a reload.
   ========================================================= */
(function () {
  var KEY = 'higherd-uc01-demo-v1';
  var SIGNED_AT = '09:42';
  var SIGNED_DAY = '18 Nov';

  // ---------- sample data (from the UC01 frames) ----------
  // One row per discipline. my* = Gherd's coordination task, team* = the owner's task.
  var ROWS = [
    { k: 'RD', wf: 'WF-RD', no: 'FSW-RD-0001', idx: 'C', type: 'Alignment drawing', myT: 'Follow alignment review', myD: 'Road alignment',
      teamT: 'Review alignment', teamD: 'Road alignment', name: 'Anna Becker', role: 'Road engineer', due: '19.11.2026', bar: 'Roads',
      area: 'Road design', card: 'Road alignment', path: 'Road engineer → Road design lead → Client representative', land: 'In review · Review alignment', group: 'review' },
    { k: 'ST', wf: 'WF-B01', no: 'FSW-ST-0002', idx: 'D', type: 'Retaining wall', myT: 'Review drawing interfaces', myD: 'Structural verification',
      teamT: 'Review interfaces', teamD: 'Structural verification', name: 'Gherd Mike', role: 'BIM Coordinator', due: '18.11.2026', bar: 'Structures',
      area: 'Structures', card: 'Retaining wall RW-12', owner: 'Emma Richter · Structural engineer', path: 'Structural engineer → Checking engineer → Client representative', land: 'Awaiting approval · Approve design', group: 'review' },
    { k: 'GT', wf: 'WF-GT', no: 'FSW-GT-0003', idx: 'B', type: 'Earthworks plan', myT: 'Check completeness', myD: 'Earthworks plan',
      teamT: 'Prepare excavation plan', teamD: 'Excavation support', name: 'David Klein', role: 'Geotechnical engineer', due: '20.11.2026', bar: 'Ground',
      area: 'Geotechnics', card: 'Excavation support', path: 'Geotechnical engineer → Geotechnical reviewer → Technical lead', land: 'In progress · Prepare excavation plan', group: 'prog' },
    { k: 'DR', wf: 'WF-DR', no: 'FSW-DR-0004', idx: 'C', type: 'Drainage layout', myT: 'Coordinate review query', myD: 'Review drainage layout',
      teamT: 'Respond to review query', teamD: 'Drainage network', name: 'Nora Fischer', role: 'Drainage engineer', due: '19.11.2026', bar: 'Drainage',
      area: 'Drainage', card: 'Drainage network', path: 'Drainage engineer → Hydraulic reviewer → Technical lead', land: 'Query open · Respond to review query', group: 'query' },
    { k: 'IF', wf: 'WF-IF', no: 'FSW-IF-0005', idx: 'B', type: 'Interfaces layout', myT: 'Check interface status', myD: 'Interfaces layout',
      teamT: 'Check interfaces', teamD: 'Interfaces', name: 'Omar Weber', role: 'Interfaces engineer', due: '21.11.2026', bar: 'Interfaces',
      area: 'Interfaces', card: 'Ventilation & services', path: 'Interfaces engineer → Interfaces reviewer → Integration lead', land: 'In review · Check interfaces', group: 'review' },
    { k: 'LA', wf: 'WF-LA', no: 'FSW-LA-0006', idx: 'B', type: 'Landscape plan', myT: 'Check completeness', myD: 'Landscape plan',
      teamT: 'Prepare landscape plan', teamD: 'Landscape & planting', name: 'Lena Schulz', role: 'Landscape architect', due: '22.11.2026', bar: 'Landscape',
      area: 'Landscaping', card: 'Landscape & planting', path: 'Landscape architect → Environmental reviewer → Client representative', land: 'In progress · Prepare landscape plan', group: 'prog' }
  ];
  var MY_DUE = '18.11.2026', CREATED = '17.11.2026';

  // Saved positions in the shared model (percent of the model view)
  var POS = {
    RD: { l: 'Road alignment · FSW-RD-0001', x: 49, y: 74 },
    ST: { l: 'Retaining wall RW-12', x: 24, y: 63 },
    GT: { l: 'Excavation support · FSW-GT-0003', x: 12, y: 44 },
    DR: { l: 'Drainage network · FSW-DR-0004', x: 39, y: 88 },
    IF: { l: 'Ventilation & services · FSW-IF-0005', x: 46, y: 36 },
    LA: { l: 'Landscape & planting · FSW-LA-0006', x: 76, y: 66 }
  };

  var BARS = [
    { k: 'RD', c: '#F59E0B', v: { week: 70, month: 64, all: 58 } },
    { k: 'ST', c: '#22C55E', v: { week: 50, month: 46, all: 41 } },
    { k: 'GT', c: '#2563EB', v: { week: 60, month: 55, all: 49 } },
    { k: 'DR', c: '#DB2777', v: { week: 58, month: 51, all: 44 } },
    { k: 'IF', c: '#7C3AED', v: { week: 20, month: 18, all: 15 } },
    { k: 'LA', c: '#9F1239', v: { week: 40, month: 36, all: 31 } }
  ];

  var BASE_COMMENTS = [
    { id: 'C01', who: 'Emma Richter · Design', where: 'Page 1 · Wall elevation · 18 Nov, 09:05', t: 'Revision D includes the updated movement joint positions.', view: 'Elevation' },
    { id: 'C02', who: 'Leon Weber · Technical review', where: 'Page 1 · Section A · 18 Nov, 09:25', t: 'Confirm that the drainage detail matches the latest ground investigation.', view: 'Section A' }
  ];
  var OWN_TEXT = 'Confirm the drainage outlet position against the coordinated model before the next revision.';

  var RESULT = {
    sign: { l: 'Sign', st: 'Signed', doc: 'Signed', help: 'Sign is selected. The drawing is signed without your comments in the stamp.', done: 'Signed. The drawing has been sent to the next workflow step.' },
    comments: { l: 'Sign with comments', st: 'Signed with comments', doc: 'With comments', help: 'Sign with comments is selected. Your comments remain linked to the drawing and review report.', done: 'Signed with comments. The drawing and report have been sent to the next workflow step.' },
    decline: { l: 'Decline', st: 'Declined', doc: 'Declined', help: 'Decline is selected. The drawing goes back to Emma Richter for a new revision, with your comments.', done: 'Declined. The drawing and report have been returned to Emma Richter for revision.' }
  };

  // Workflow WF-B01, as in the Workflow manager frame
  var PHASES = [
    { k: 'prep', t: 'Preparation & coordination', c: '#E11D48' },
    { k: 'tech', t: 'Technical reviews (by discipline)', c: '#2563EB' },
    { k: 'cons', t: 'Consolidation & decision support', c: '#16A34A' },
    { k: 'appr', t: 'Approval & closeout', c: '#F59E0B' }
  ];
  function card(id, ph, t, role, code, dur, pos) { return { id: id, ph: ph, t: t, role: role, code: code, dur: dur, pos: pos || 'ST' }; }
  var BOARD = [
    card('w1', 'prep', 'Prepare document package', 'Discipline teams', '01a', 'automatically on upload'),
    card('w2', 'prep', 'Assign target templates', 'BIM Coordinator', '01b', 'automatically on upload'),
    card('w3', 'prep', 'Check completeness', 'BIM Coordinator', '00z', 'status-driven'),
    card('w4', 'prep', 'Send documents for review', 'BIM Coordinator', '02', 'on confirmed status'),
    card('w5', 'prep', 'Coordinate queries', 'BIM Coordinator', '02', '10 days'),
    card('w6', 'tech', 'Road design review', 'Road design lead', '04a', '20 days', 'RD'),
    card('w7', 'tech', 'Structural design review', 'Structural design lead', '04j', '20 days'),
    card('w8', 'tech', 'Geotechnics / earthworks', 'Geotechnical lead', '04c', '20 days', 'GT'),
    card('w9', 'tech', 'Drainage review', 'Drainage lead', '04d', '1 day', 'DR'),
    card('w10', 'tech', 'Interfaces review', 'Interfaces lead · Gherd Mike', '04h', '20 days'),
    card('w11', 'tech', 'Landscaping review', 'Landscape lead', '—', '20 days', 'LA'),
    card('w12', 'cons', 'Consolidate review comments', 'BIM Coordinator', 'AZ', 'on status change'),
    card('w13', 'cons', 'Resolve queries', 'Discipline teams', 'F', 'on comment'),
    card('w14', 'cons', 'Request revision', 'BIM Coordinator', 'BO', 'on confirmed status'),
    card('w15', 'appr', 'Overall technical review', 'Lead checking engineer', '05', '15 days'),
    card('w16', 'appr', 'Client approval', 'Client representative', '06', '10 days'),
    card('w17', 'appr', 'Prepare submission package', 'BIM Coordinator', '08', 'on confirmed status'),
    card('w18', 'appr', 'Record review response', 'BIM Coordinator', '08', 'on confirmed status'),
    card('w19', 'appr', 'File tender issue', 'Document management', '09', 'on confirmed status'),
    card('w20', 'appr', 'Archive revision', 'Document management', '10', 'on confirmed status')
  ];

  var PROJECTS = [
    { k: 'FSW', n: 'Frankenschnellweg', a: 'Structures · Coordination review', m: 'Revit · Shared coordination model', shared: 'Frankenschnellweg · Coordination model',
      files: [['FSW_Coordination_D.rvt', 'Main model · Revision D', 'full'], ['FSW_RetainingWall.rfa', 'Loaded family · Retaining walls', 'fam'], ['FSW_ModelChecks.dyn', 'Model checks · Dynamo', 'dyn']],
      meta: 'RVT · Revision D · Structures · Millimetres' },
    { k: 'GG', n: 'Gateway Gardens', a: 'Roof structure · Construction', m: 'Revit · Roof coordination model', shared: 'Gateway Gardens · Roof structure coordination model',
      files: [['GG_Coordination_C.rvt', 'Main model · Revision C', 'full'], ['GG_RoofStructure.rfa', 'Loaded family · Roof structure', 'fam'], ['GG_ModelChecks.dyn', 'Model checks · Dynamo', 'dyn']] },
    { k: 'FFM', n: 'Frankfurt Hauptbahnhof', a: 'B level · Design coordination', m: 'Revit · Coordination model', shared: 'Frankfurt Hauptbahnhof · B level coordination model',
      files: [['FFMHBF_Coordination_B.rvt', 'Main model · Revision B', 'full'], ['FFMHBF_Concourse.rfa', 'Loaded family · Concourse', 'fam'], ['FFMHBF_ModelChecks.dyn', 'Model checks · Dynamo', 'dyn']] }
  ];

  var FAMILY = [['Category', 'Generic Models'], ['Family', 'FSW_RetainingWall'], ['Type', 'RW400 · RC panel'], ['Mark', 'RW-12'], ['Level', 'L00'],
    ['Height', '6,000 mm'], ['Material', 'Reinforced concrete'], ['Phase', 'New construction']];
  var DYN_Q = 'List every instance of this family with its Mark, Material and Level.';
  var DYN_ROWS = [['RW-10', 'Reinforced concrete', 'L00'], ['RW-11', 'Reinforced concrete', 'L00'], ['RW-12', 'Reinforced concrete', 'L00'], ['RW-13', 'Reinforced concrete', 'L-01'], ['RW-14', 'Reinforced concrete', 'L-01']];

  function defaults() {
    return {
      period: 'week',
      tview: 'mine', tq: '', tf: 'all', tsort: 'due',
      own: { saved: false, text: OWN_TEXT, view: 'Detail B' },
      mode: 'comment', zoom: 100, marks: ['Detail B'],
      choice: 'comments', result: '',
      note: '',
      app: 'infra', pos: 'ST', cam: { z: 1, px: 0, orbit: 0 }, fam: true, dyn: true, dynq: DYN_Q, dynRun: false,
      q: '', disc: 'all', dsort: 'no',
      extra: [], seq: 1,
      proj: 'FSW', notif: { freq: 'Daily', email: true, comments: true, signature: true, next: true },
      log: [], seen: 0
    };
  }

  var S = load();
  var menu = '', wmenu = '', bellOpen = 0;

  function load() {
    var d = defaults();
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        Object.keys(d).forEach(function (k) { if (!(k in s)) s[k] = d[k]; });
        return s;
      }
    } catch (e) { /* storage blocked: run with defaults */ }
    return d;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  // ---------- helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function opt(list, val) {
    return list.map(function (o) {
      return '<option value="' + esc(o[0]) + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
    }).join('');
  }
  function row(k) { for (var i = 0; i < ROWS.length; i++) if (ROWS[i].k === k) return ROWS[i]; return null; }
  function proj(k) { for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].k === k) return PROJECTS[i]; return PROJECTS[0]; }
  function comments() {
    return BASE_COMMENTS.concat(S.own.saved ? [{ id: 'C03', who: 'Gherd Mike · You', where: 'Page 1 · ' + S.own.view + ' · ' + SIGNED_DAY + ', 09:38', t: S.own.text, view: S.own.view, me: true }] : []);
  }
  function done() { return !!S.result; }
  function stLabel() { return S.result ? RESULT[S.result].st : ''; }
  function openTasks() { return 6 - (S.result ? 1 : 0) + (S.result === 'decline' ? 1 : 0); }
  function list(a) { return a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a.join(''); }

  function goTo(step) {
    var tab = document.getElementById('flow-tab-' + step);
    if (!tab) return;
    tab.click();
    var root = tab.closest('[data-tabs]');
    if (root) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function currentStep() {
    for (var n = 1; n <= 7; n++) { var p = document.getElementById('flow-' + n); if (p && !p.hidden) return n; }
    return 1;
  }
  function focusAfter(sel) { setTimeout(function () { var n = $(sel); if (n) n.focus({ preventScroll: true }); }, 0); }

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
    checkc: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM8 12l3 3 5-6',
    plusc: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 8v8M8 12h8',
    sign: 'M6 2h9l5 5v15H6zM9 12h6M9 16h4',
    report: 'M5 3h14v18H5zM9 3v3h6V3M9 11h6M9 15h6',
    up: 'M12 20V5M6 11l6-6 6 6',
    decline: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM9 9l6 6M15 9l-6 6',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7v5l3 2',
    file: 'M6 2h9l5 5v15H6zM14 2v6h6',
    link: 'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
    spark: 'M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z',
    ai: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
    sort: 'M8 9l4-4 4 4M8 15l4 4 4-4',
    filter: 'M3 5h18M6 12h12M10 19h4',
    prev: 'M19 12H5M11 6l-6 6 6 6',
    next: 'M5 12h14M13 6l6 6-6 6',
    pin: 'M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12zM12 7a3 3 0 1 0 0 6a3 3 0 1 0 0-6z'
  };
  function svg(name, cls) { return '<svg class="' + (cls || 'hd-ico') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICON[name] + '"/></svg>'; }

  // =========================================================
  // App frame: window bar, Higherd menu, top bar
  // =========================================================
  var NAV = [
    ['over', 'My overview', 1], ['users', 'Users & roles'], ['docs', 'Document manager', 5], ['iface', 'Interface management'],
    ['msg', 'Messages'], ['plan', 'Project plan'], ['flow', 'Workflow manager', 6]
  ];
  function activeNav(step) { return step === 1 ? 'over' : step === 6 ? 'flow' : step === 7 ? 'set' : 'docs'; }
  function navItem(n, step) {
    var on = activeNav(step) === n[0];
    if (n[2]) {
      return '<li><button type="button" class="hd-nav' + (on ? ' is-active' : '') + '" data-go="' + n[2] + '"' + (on ? ' aria-current="page"' : '') + '>' +
        svg(n[0]) + '<span class="hd-nav__l">' + esc(n[1]) + '</span></button></li>';
    }
    return '<li><span class="hd-nav is-locked" aria-disabled="true" title="Not part of this demo">' + svg(n[0]) + '<span class="hd-nav__l">' + esc(n[1]) + '</span></span></li>';
  }
  function side(step) {
    return '<nav class="hd-side" aria-label="Higherd menu">' +
      '<p class="hd-side__logo"><img src="/assets/img/logo.svg?v=8" alt="Higherd" width="104" height="34"></p>' +
      '<ul>' + NAV.map(function (n) { return navItem(n, step); }).join('') + '</ul>' +
      '<ul class="hd-side__end">' + navItem(['set', 'Settings', 7], step) + '</ul>' +
    '</nav>';
  }
  function bell(step) {
    var n = Math.max(0, S.log.length - S.seen), open = bellOpen === step;
    return '<span class="b-bellwrap"><button type="button" class="hd-bell b-bellbtn" data-act="bell" data-v="' + step + '" aria-expanded="' + open + '" aria-label="Higherd Assistant notifications' + (n ? ', ' + n + ' new' : '') + '">' + svg('bell') +
        (n ? '<em class="b-bell__n" aria-hidden="true">' + n + '</em>' : '') + '</button>' +
      (open ? '<div class="b-bellpop" role="region" aria-label="Higherd Assistant"><p class="b-bellpop__h"><b>Higherd Assistant</b>' +
          (S.log.length ? '<button type="button" class="hd-link" data-act="clearlog">Clear</button>' : '') + '</p>' +
        (S.log.length ? '<ul>' + S.log.map(function (l) { return '<li><span>' + esc(l.t) + '</span><small>Today, ' + l.at + '</small></li>'; }).join('') + '</ul>'
                      : '<p class="hd-muted b-bellpop__e">No notifications yet. Workflow status updates show up here.</p>') + '</div>' : '') +
    '</span>';
  }
  function top(title, step) {
    return '<header class="hd-top">' +
      '<div class="hd-top__t"><div><p class="hd-top__title">' + title + '</p></div></div>' +
      '<div class="hd-top__r">' + bell(step) +
        '<span class="hd-user"><img class="hd-user__av hd-user__av--img" src="/assets/img/uc01/gherd-mike.svg" alt="" width="36" height="36">' +
          '<span class="hd-user__t"><b>Gherd Mike <span class="b-plan">Enterprise</span></b><small>GCE Holding · BIM Coordinator</small></span></span>' +
      '</div>' +
    '</header>';
  }
  function frame(step, title, body) {
    return '<div class="hd-chrome">' +
        '<span class="hd-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="hd-chrome__t">Higherd · Frankenschnellweg · demo data</span>' +
        '<button type="button" class="hd-link" data-act="reset">Reset demo</button>' +
      '</div>' +
      '<div class="hd-shell">' + side(step) +
        '<div class="hd-main c1-main">' + top(title, step) + '<div class="hd-body">' + body + '</div>' +
          '<button type="button" class="c1-aifab" data-act="ai" aria-label="Open Higherd AI Assistant" title="Higherd AI Assistant">' + svg('ai') + '</button>' +
        '</div>' +
      '</div>';
  }
  // Document manager tabs (steps 02–05 share them)
  function dmTabs(active) {
    var l = [['files', 'All files', 'data-go="5"'], ['tasks', 'Workflow tasks', 'data-act="tview" data-v="mine"'], ['land', 'Project landscape', 'data-act="tview" data-v="land"'], ['int', 'Integrations', 'data-go="3"']];
    return '<div class="b-tabs" role="group" aria-label="Document manager">' + l.map(function (t) {
      var on = t[0] === active;
      return '<button type="button" class="b-tab' + (on ? ' is-on' : '') + '" ' + t[2] + (on ? ' aria-current="page"' : '') + '>' + t[1] + '</button>';
    }).join('') + '</div>';
  }
  function chip(t, cls) { return '<span class="c1-st' + (cls ? ' c1-st--' + cls : '') + '">' + esc(t) + '</span>'; }
  function wfChip(wf) { return '<span class="b-wf">' + esc(wf) + '</span>'; }
  // Connected apps strip (Integrations)
  function apps(on) {
    var live = [['pdf', 'PDF Viewer', 'data-go="3"'], ['infra', 'InfraWorks', 'data-act="app" data-v="infra"'], ['revit', 'Revit', 'data-act="app" data-v="revit"']];
    var locked = ['DB InfraGO', 'PlanRadar', 'SharePoint', 'iTWO', 'Autodesk BIM 360'];
    return '<div class="b-ints c1-ints" role="group" aria-label="Connected apps">' + live.map(function (a) {
      return a[0] === on ? '<span class="b-int is-on" aria-current="true">' + a[1] + '</span>' : '<button type="button" class="b-int" ' + a[2] + '>' + a[1] + '</button>';
    }).join('') + locked.map(function (n) { return '<span class="b-int is-locked" title="Not part of this demo">' + n + '</span>'; }).join('') + '</div>';
  }

  // =========================================================
  // 01 My overview
  // =========================================================
  function donut() {
    var c = { review: 0, prog: 0, query: 0, signed: 0 };
    ROWS.forEach(function (r) {
      if (r.k === 'ST' && S.result) { if (S.result === 'decline') c.query++; else c.signed++; }
      else c[r.group]++;
    });
    return c;
  }
  function render1() {
    var el = $('#hd-1'); if (!el) return;
    var c = donut(), st = row('ST'), open = openTasks();
    var parts = [['review', 'Review', '#2563EB'], ['approved', 'Approved', '#22C55E'], ['prog', 'In progress', '#F59E0B'], ['query', 'Query', '#E11D48']];
    if (c.signed) parts.splice(2, 0, ['signed', RESULT[S.result].st, '#14B8A6']);
    c.approved = 0;
    var r = 38, C = 2 * Math.PI * r, off = 0, tot = 6;
    var segs = parts.map(function (p) {
      if (!c[p[0]]) return '';
      var len = C * c[p[0]] / tot;
      var s = '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + p[2] + '" stroke-width="13" stroke-dasharray="' + Math.max(0, len - 1.6).toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>';
      off += len; return s;
    }).join('');
    var docSt = S.result ? RESULT[S.result].doc : 'Awaiting approval';
    var resp = [
      ['BIM Coordinator', 'Monitor team tasks', '6 work packages · ' + open + ' open team tasks', 'data-act="tview" data-v="team"'],
      S.result ? ['Workflow role', S.result === 'decline' ? 'Review declined' : 'Review signed', 'Your review ' + RESULT[S.result].st.toLowerCase() + ' · ' + SIGNED_AT, 'data-go="3"']
               : ['Workflow role', 'Follow client approval', 'Maria Keller · Retaining wall RW-12', 'data-go="6"'],
      ['Workflow role', 'Review latest deliveries', 'FSW-ST-0002 / D · ' + docSt, 'data-act="doc" data-id="ST"']
    ];
    var recent = [['RD', 'Anna Becker · Road engineer', 'In review', 'warn'], ['ST', 'Maria Keller · Client representative', docSt, S.result ? (S.result === 'decline' ? 'bad' : 'good') : 'warn'],
      ['DR', 'Nora Fischer · Drainage engineer', 'Query open', 'warn'], ['LA', 'Lena Schulz · Landscape architect', 'In progress', 'warn']];

    var body =
      (S.result ? '<p class="c1-updated" role="status">Updated ' + SIGNED_AT + ' · Review ' + RESULT[S.result].st.toLowerCase() + ' for FSW-ST-0002 / D</p>' : '') +
      (S.result && S.note === 'open' ? notice() : '') +
      '<section class="hd-panel">' +
        '<div class="hd-panel__h"><p class="hd-panel__t">Progress · Frankenschnellweg / Demo</p>' +
          '<div class="hd-period b-period" role="group" aria-label="Period">' +
            [['week', 'Week'], ['month', 'Month'], ['all', 'All time']].map(function (p) {
              return '<button type="button" data-act="period" data-v="' + p[0] + '" aria-pressed="' + (S.period === p[0]) + '">' + p[1] + '</button>';
            }).join('') + '</div></div>' +
        '<div class="hd-kpis">' + [['docs', 'Plans in project', 3], ['check', 'Disciplines', 6], ['users', 'Designs awaiting approval', 1], ['report', 'Open discipline tasks', open]].map(function (k) {
          return '<div class="hd-kpi"><span class="hd-kpi__i" aria-hidden="true">' + svg(k[0]) + '</span><span class="hd-kpi__l">' + k[1] + '</span><b>' + k[2] + '</b></div>';
        }).join('') + '</div>' +
      '</section>' +
      '<div class="hd-grid">' +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Progress by discipline · demo</p><span class="hd-tag hd-tag--soft">UC01 · Frankenschnellweg</span></div>' +
          '<div class="hd-baros" role="list">' + BARS.map(function (b) {
            var v = b.v[S.period], lb = row(b.k).bar;
            return '<button type="button" class="hd-baro c1-baro" role="listitem" data-act="tasksfor" data-id="' + b.k + '" aria-label="' + lb + ' ' + v + '%, show the team task">' +
              '<span class="hd-baro__v" aria-hidden="true">' + v + '%</span>' +
              '<span class="hd-baro__track" aria-hidden="true"><i class="hd-baro__fill" style="height:' + v + '%;background:' + b.c + '"></i><i class="hd-baro__knob" style="bottom:' + v + '%;border-color:' + b.c + '"></i></span>' +
              '<b aria-hidden="true">' + lb + '</b></button>';
          }).join('') + '</div>' +
          '<p class="hd-foot">Select a discipline to see its team task.</p>' +
        '</section>' +
        '<section class="hd-panel hd-panel--center">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Discipline task status</p></div>' +
          '<div class="hd-donut"><svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(-90 50 50)">' + segs + '</g></svg>' +
            '<span class="hd-donut__c"><b>' + open + '</b>Open tasks</span></div>' +
          '<ul class="hd-legend">' + parts.map(function (p) { return '<li><i style="background:' + p[2] + '"></i>' + p[1] + ' · ' + c[p[0]] + '</li>'; }).join('') + '</ul>' +
          '<button type="button" class="hd-btn hd-btn--ghost" data-go="5">Open document manager</button>' +
        '</section>' +
      '</div>' +
      '<div class="hd-grid hd-grid--even">' +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">My responsibilities</p><button type="button" class="hd-link" data-act="tview" data-v="mine">Workflow tasks</button></div>' +
          '<div class="b-resp">' + resp.map(function (x) {
            return '<button type="button" class="b-resp__i c1-resp" ' + x[3] + '><small>' + x[0] + '</small><b>' + x[1] + '</b><small>' + esc(x[2]) + '</small><span class="b-active">Active</span></button>';
          }).join('') + '</div>' +
        '</section>' +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Recently edited documents</p><button type="button" class="hd-link" data-go="5">All files</button></div>' +
          '<div class="hd-tablewrap"><table class="hd-table"><thead><tr><th>Drawing number</th><th>Current role</th><th>Status</th></tr></thead><tbody>' +
            recent.map(function (x) {
              var rr = row(x[0]);
              return '<tr><td><button type="button" class="hd-idlink" data-act="doc" data-id="' + x[0] + '">' + rr.no + ' / ' + rr.idx + '</button></td><td class="b-wrap">' + x[1] + '</td><td><span class="c1-txt c1-txt--' + x[3] + '">' + esc(x[2]) + '</span></td></tr>';
            }).join('') +
          '</tbody></table></div>' +
        '</section>' +
      '</div>';
    el.innerHTML = frame(1, 'My overview', body);
  }
  function notice() {
    var r = RESULT[S.result];
    return '<section class="c1-notice" role="alertdialog" aria-labelledby="c1-notice-t" aria-describedby="c1-notice-p">' +
      '<p class="c1-notice__e">' + svg('bell') + 'Higherd Assistant</p>' +
      '<p class="c1-notice__t" id="c1-notice-t">' + (S.result === 'decline' ? 'Review declined' : 'Review signed') + '</p>' +
      '<p class="c1-notice__s">Retaining wall RW-12 · Revision D</p>' +
      '<p class="hd-muted">Gherd Mike · Your review<br>' + SIGNED_DAY + ', ' + SIGNED_AT + '</p>' +
      '<p id="c1-notice-p">' + (S.result === 'decline' ? 'Your declined review and comments report are recorded. The drawing is back with Emma Richter for revision.'
        : 'Your signed review' + (S.result === 'comments' ? ' and comments report are' : ' is') + ' recorded. The next workflow step is now pending.') + '</p>' +
      '<div class="hd-actions hd-actions--start"><button type="button" class="hd-btn hd-btn--sm" data-act="viewwf">View workflow</button>' +
        '<button type="button" class="hd-btn hd-btn--sm hd-btn--ghost" data-act="dismiss">Dismiss</button></div>' +
    '</section>';
  }

  // =========================================================
  // 02 My / Team workflow tasks, Project landscape
  // =========================================================
  var ACTS = [['link', 'Open task PDF', 'pdf', 'c1-i--p'], ['eye', 'View workflow', 'wf', 'c1-i--p'], ['sign', 'Sign', 'sign', 'c1-i--o'], ['checkc', 'Sign with comments', 'comments', 'c1-i--g'],
    ['plusc', 'Add documents', 'adddoc', 'c1-i--b'], ['report', 'Add review report', 'report', 'c1-i--g'], ['up', 'Escalate decision', 'escalate', 'c1-i--o'], ['decline', 'Decline', 'decline', 'c1-i--r']];

  function taskStatus(r, team) {
    if (r.k === 'ST' && S.result) return chip(RESULT[S.result].st, S.result === 'decline' ? 'bad' : 'done');
    return chip(team ? r.teamT : r.myT);
  }
  function taskRows(team) {
    var q = S.tq.trim().toLowerCase();
    var l = ROWS.filter(function (r) {
      var signed = r.k === 'ST' && S.result;
      if (S.tf === 'open' && signed) return false;
      if (S.tf === 'signed' && !signed) return false;
      return !q || [r.wf, team ? r.teamT : r.myT, r.no, r.k, r.type, team ? r.teamD : r.myD, team ? r.name : ''].join(' ').toLowerCase().indexOf(q) !== -1;
    });
    var key = { due: function (r) { return (team ? r.due : MY_DUE).split('.').reverse().join('') + r.no.slice(-4); }, no: function (r) { return r.no.slice(-4); }, disc: function (r) { return r.k; },
      st: function (r) { return r.k === 'ST' && S.result ? '0' : (team ? r.teamT : r.myT); } }[S.tsort];
    return l.slice().sort(function (a, b) { return key(a).localeCompare(key(b)); });
  }
  function canSign(r) { return r.k === 'ST'; }
  function rowMenu(r, team) {
    var mine = r.k === 'ST';
    var head = r.wf + ' · ' + (mine ? 'My review task' : team ? r.name + '’s task' : 'Coordination task');
    return '<div class="b-menu c1-rmenu" role="menu" aria-label="Task actions ' + r.wf + '"><p class="c1-rmenu__h">' + esc(head) + '</p>' +
      ACTS.concat([['link', 'View in model', 'model', 'c1-i--p']]).map(function (a) {
        var signAct = a[2] === 'sign' || a[2] === 'comments' || a[2] === 'decline';
        var dis = signAct && (!canSign(r) || done());
        var why = !canSign(r) ? (team ? 'Only ' + r.name + ' can sign this task' : 'This coordination task has no signature step') : 'Your review result is recorded';
        return '<button type="button" role="menuitem" class="b-menu__i ' + a[3] + '" data-act="ra" data-v="' + a[2] + '" data-id="' + r.k + '"' + (dis ? ' disabled title="' + why + '"' : '') + '>' + svg(a[0]) + a[1] + '</button>';
      }).join('') + '</div>';
  }
  function tasksView(team) {
    var l = taskRows(team), signedN = S.result ? 1 : 0;
    var headT = (team ? 'Team workflow tasks' : 'My workflow tasks') + ' · ' + (signedN ? (6 - signedN) + ' open · 1 ' + (S.result === 'decline' ? 'declined' : 'signed') : '6 tasks') + ' · Frankenschnellweg';
    var lead = signedN ? 'Your ' + (S.result === 'decline' ? 'declined' : 'signed') + ' review and comments report have been sent to the next workflow step.'
      : team ? 'Open a task to review its PDF. The purple link opens its position in the shared model.' : 'Open your task to review the drawing, comment and sign in the PDF viewer.';
    var cols = '<th scope="col">Created on</th><th scope="col">WF</th><th scope="col">Task status</th><th scope="col">Drawing no.</th><th scope="col">Discipline</th><th scope="col">Document type</th><th scope="col">Description</th>' +
      (team ? '<th scope="col">Name</th>' : '<th scope="col">Asset</th>') + '<th scope="col">Due date</th><th scope="col">Actions</th>';
    return '<div class="b-bar c1-bar">' +
        '<label class="hd-search b-grow"><span class="hd-sr">Search tasks</span>' + svg('search') + '<input id="c1-tq" type="search" placeholder="Search tasks" value="' + esc(S.tq) + '" autocomplete="off"></label>' +
        '<label class="b-sel"><span class="hd-sr">Sort</span>' + svg('sort') + '<select data-sel="tsort">' + opt([['due', 'Sort: Due date'], ['no', 'Sort: Drawing no.'], ['disc', 'Sort: Discipline'], ['st', 'Sort: Task status']], S.tsort) + '</select></label>' +
        '<label class="b-sel"><span class="hd-sr">Filter</span>' + svg('filter') + '<select data-sel="tf">' + opt([['all', 'Filter: All tasks'], ['open', 'Filter: Open'], ['signed', 'Filter: Review recorded']], S.tf) + '</select></label>' +
      '</div>' +
      '<section class="hd-panel c1-tpanel">' +
        '<div class="c1-thead"><div><p class="hd-panel__t">' + headT + '</p><p class="hd-muted">' + lead + '</p></div>' +
          '<div class="c1-thead__a"><button type="button" class="hd-btn hd-btn--sm" data-go="3">Open task</button>' +
          '<button type="button" class="hd-btn hd-btn--sm hd-btn--ghost c1-btn-o" data-act="tview" data-v="' + (team ? 'mine' : 'team') + '">' + (team ? 'My tasks' : 'Team tasks') + '</button></div></div>' +
        '<div class="hd-tablewrap c1-tw"><table class="hd-table b-table c1-table"><thead><tr>' + cols + '</tr></thead><tbody>' +
        (l.length ? l.map(function (r) {
          var open = menu === r.k;
          return '<tr class="' + (r.k === 'ST' ? 'c1-mine' : '') + '"><td>' + CREATED + '</td><td>' + wfChip(r.wf) + '</td><td>' + taskStatus(r, team) + '</td>' +
            '<td><button type="button" class="hd-idlink" data-act="doc" data-id="' + r.k + '">' + r.no + '</button></td><td>' + r.k + '</td><td class="b-wrap">' + esc(r.type) + '</td><td class="b-wrap">' + esc(team ? r.teamD : r.myD) + '</td>' +
            (team ? '<td class="c1-name"><span>' + esc(r.name) + '</span><button type="button" class="c1-pl" data-act="model" data-id="' + r.k + '" aria-label="Open the position of ' + r.no + ' in the shared model" title="Position in model">' + svg('link') + '</button></td>'
                  : '<td><span class="b-asset">FSW-01</span></td>') +
            '<td>' + (team ? r.due : MY_DUE) + '</td>' +
            '<td class="c1-acts"><div class="c1-icons">' + ACTS.map(function (a) {
              return '<button type="button" class="c1-i ' + a[3] + '" data-act="rmenu" data-id="' + r.k + '" data-v="' + a[2] + '" aria-haspopup="menu" aria-expanded="' + open + '" aria-label="' + a[1] + ' · ' + r.wf + '" title="' + a[1] + '">' + svg(a[0]) + '</button>';
            }).join('') + '</div></td></tr>';
        }).join('') : '<tr><td colspan="10" class="hd-empty">No tasks match.</td></tr>') +
        '</tbody></table></div>' + (menu && row(menu) ? rowMenu(row(menu), team) : '') +
      '</section>' +
      '<p class="hd-foot">Showing 1–' + l.length + ' of 6 tasks · Select WF-B01 to open its PDF drawing.</p>';
  }
  function landView() {
    return '<section class="hd-panel">' +
        '<div class="c1-thead"><div><p class="c1-h2">Six disciplines. Different work packages.</p><p class="hd-muted">Frankenschnellweg · 2,701 plans · Roles and review paths</p></div>' +
          '<div class="c1-thead__a"><button type="button" class="hd-btn hd-btn--sm" data-act="tview" data-v="team">Team tasks</button></div></div>' +
        '<div class="c1-land">' + ROWS.map(function (r) {
          var st = r.k === 'ST' && S.result ? RESULT[S.result].st + (S.result === 'decline' ? ' · Revise drawing' : ' · Approve design') : r.land;
          return '<article class="c1-landc"><p class="c1-landc__a">' + r.area + '</p><p class="c1-landc__t">' + esc(r.card) + '</p>' +
            '<p>' + esc(r.owner || r.name + ' · ' + r.role) + '</p><p class="hd-muted">' + r.no + ' / ' + r.idx + '</p><p class="c1-path">' + esc(r.path) + '</p><p class="c1-landc__s">' + esc(st) + '</p>' +
            '<div class="c1-landc__a2"><button type="button" class="hd-link" data-act="doc" data-id="' + r.k + '">Document</button><button type="button" class="hd-link" data-act="model" data-id="' + r.k + '">' + svg('link') + 'Position in model</button></div></article>';
        }).join('') + '</div>' +
      '</section>';
  }
  function render2() {
    var el = $('#hd-2'); if (!el) return;
    var t = S.tview;
    el.innerHTML = frame(2, t === 'land' ? 'Project landscape' : t === 'team' ? 'Team workflow tasks' : 'My workflow tasks',
      dmTabs(t === 'land' ? 'land' : 'tasks') + (t === 'land' ? landView() : tasksView(t === 'team')));
    placeMenu();
  }
  // The actions pop-up sits in the panel (not in the scrolling table) under the row's icons
  function placeMenu() {
    var m = $('#hd-2 .c1-rmenu'); if (!m) return;
    var b = $('#hd-2 [data-act="rmenu"][data-id="' + menu + '"]'), pan = m.closest('.c1-tpanel');
    if (!b || !pan) return;
    var icons = b.parentNode.getBoundingClientRect(), pr = pan.getBoundingClientRect();
    m.style.top = Math.round(icons.bottom - pr.top + 4) + 'px';
    var right = Math.max(8, Math.round(pr.right - icons.right));
    if (pr.width - right < m.offsetWidth + 8) right = Math.max(8, Math.round(pr.width - m.offsetWidth - 8));
    m.style.right = right + 'px';
  }
  window.addEventListener('resize', function () { if (menu) placeMenu(); });

  // =========================================================
  // 03 PDF viewer: drawing, comments report, plan stamp
  // =========================================================
  var VIEWS = { 'Elevation': { x: 40, y: 50, w: 700, h: 160 }, 'Plan': { x: 34, y: 250, w: 712, h: 120 }, 'Section A': { x: 60, y: 400, w: 340, h: 170 }, 'Detail B': { x: 440, y: 410, w: 300, h: 120 } };
  var PINS = { 'Elevation': [250, 120], 'Plan': [610, 312], 'Section A': [150, 485], 'Detail B': [600, 470] };

  function drawing() {
    var cs = comments(), g = '';
    // Elevation
    g += '<g class="c1-dw"><rect x="40" y="60" width="700" height="140"/><line x1="40" y1="210" x2="740" y2="210"/><line x1="46" y1="45" x2="46" y2="220"/><line x1="734" y1="45" x2="734" y2="220"/>';
    for (var i = 1; i < 13; i++) g += '<line x1="' + (40 + i * 54) + '" y1="60" x2="' + (40 + i * 54) + '" y2="200"/>';
    g += '</g>';
    // Plan
    g += '<g class="c1-dw"><rect x="34" y="260" width="712" height="100"/><line x1="34" y1="285" x2="746" y2="285"/><line x1="34" y1="335" x2="746" y2="335"/>';
    for (i = 1; i < 13; i++) g += '<line x1="' + (34 + i * 55) + '" y1="260" x2="' + (34 + i * 55) + '" y2="360"/>';
    g += '<line x1="560" y1="375" x2="660" y2="375" class="c1-dw--a"/></g>';
    // Section A
    g += '<g class="c1-dw"><path d="M80 560V530h40V410h24l30 120h200" /><path d="M120 530V418h14l34 112" class="c1-dw--fill"/><path d="M180 430l100-20 120-5M180 445l100-18 120-4"/><path d="M176 520v-40l28-28"/>' +
      '<rect x="80" y="530" width="300" height="30" class="c1-dw--fill"/><path d="M100 556l10-12M140 556l10-12M180 556l10-12M220 556l10-12M260 556l10-12M300 556l10-12M340 556l10-12"/></g>';
    // Detail B
    g += '<g class="c1-dw"><rect x="450" y="420" width="280" height="110"/><line x1="530" y1="420" x2="530" y2="530"/><line x1="640" y1="420" x2="640" y2="530"/><line x1="465" y1="450" x2="715" y2="450"/><line x1="465" y1="475" x2="715" y2="475"/><line x1="465" y1="500" x2="715" y2="500"/></g>';
    // Draw markups
    S.marks.forEach(function (m) {
      var v = VIEWS[m]; if (!v) return;
      var p = PINS[m];
      g += '<rect class="c1-markup" x="' + (p[0] - 70) + '" y="' + (p[1] - 32) + '" width="140" height="64" rx="6"/>';
    });
    // Labels
    g += '<g class="c1-dwl"><text x="40" y="38">Elevation</text><text x="34" y="245">Plan</text><text x="60" y="398">Section A</text><text x="450" y="408">Detail B</text></g>';
    // Click targets for the four views
    Object.keys(VIEWS).forEach(function (k) {
      var v = VIEWS[k];
      g += '<rect class="c1-hit" x="' + v.x + '" y="' + v.y + '" width="' + v.w + '" height="' + v.h + '" data-view="' + k + '" tabindex="' + (S.mode === 'select' || done() ? -1 : 0) + '" role="button" aria-label="' + (S.mode === 'draw' ? 'Draw a markup on ' : 'Place your comment on ') + k + '"/>';
    });
    // Pins
    cs.forEach(function (c) {
      var p = PINS[c.view];
      g += '<g class="c1-pin' + (c.me ? ' is-me' : '') + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="20"/><text x="' + p[0] + '" y="' + (p[1] + 6) + '">' + c.id.replace('C0', 'C') + '</text></g>';
    });
    if (!S.own.saved) {
      var dp = PINS[S.own.view];
      g += '<g class="c1-pin is-draft"><circle cx="' + dp[0] + '" cy="' + dp[1] + '" r="20"/><text x="' + dp[0] + '" y="' + (dp[1] + 6) + '">C3</text></g>';
    }
    return '<svg class="c1-drawing" viewBox="0 0 780 590" role="img" aria-label="Retaining wall RW-12 drawing with ' + cs.length + ' comment pins" style="width:' + S.zoom + '%">' + g + '</svg>';
  }
  function ownBox() {
    if (S.own.saved) {
      return '<div class="c1-own"><p><b>C03 · Your comment · ' + esc(S.own.view) + '</b></p><p>' + esc(S.own.text) + '</p>' +
        '<p class="c1-own__s">Saved to drawing and comments report' + (done() ? '' : ' · <button type="button" class="hd-link" data-act="editc">Edit</button>') + '</p></div>';
    }
    return '<form class="c1-own c1-own--edit" data-form="comment"><label for="c1-ct"><b>C03 · Your comment · ' + esc(S.own.view) + '</b></label>' +
      '<textarea id="c1-ct" name="t" rows="2" required>' + esc(S.own.text) + '</textarea>' +
      '<div class="c1-own__a"><span class="hd-muted">In Comment mode, select a view on the drawing to move the pin.</span><button type="submit" class="hd-btn hd-btn--sm">Save comment</button></div></form>';
  }
  function stamp() {
    var cs = comments(), r = S.result ? RESULT[S.result] : null, ch = RESULT[S.choice];
    var needC = S.choice === 'comments' && !S.own.saved;
    return '<section class="hd-panel c1-stamp" aria-labelledby="c1-stamp-t"><p class="c1-h3" id="c1-stamp-t">Plan stamp</p>' +
      '<div class="c1-stampbox"><p class="c1-stampbox__t">FSW-ST-0002 · Revision D</p><p>Retaining wall RW-12 · Frankenschnellweg</p>' +
        '<p>Reviewer: Gherd Mike · BIM Coordinator<br>Task: Review drawing interfaces<br>Report: ' + cs.length + ' comments attached</p>' +
        '<p class="c1-stampbox__s' + (r ? ' is-done' : '') + '">' + (r ? esc(r.st) + ' · ' + SIGNED_DAY + ', ' + SIGNED_AT : 'Review in progress · Not signed') + '</p></div>' +
      '<p class="c1-lbl">' + (r ? 'Recorded review result' : 'Choose your review result') + '</p>' +
      '<div class="c1-choice" role="radiogroup" aria-label="Review result">' + ['sign', 'comments', 'decline'].map(function (k) {
        var on = (r ? S.result : S.choice) === k;
        return '<button type="button" role="radio" class="c1-ch' + (on ? ' is-on' : '') + '" aria-checked="' + on + '" data-act="choice" data-v="' + k + '"' + (r ? ' disabled' : '') + '>' + RESULT[k].l + '</button>';
      }).join('') + '</div>' +
      '<p class="c1-help" role="status">' + (r ? esc(r.done) : esc(ch.help) + (needC ? ' Save your comment C03 first.' : '')) + '</p>' +
      (r ? '<button type="button" class="hd-btn" data-go="1">View dashboard</button>'
         : '<button type="button" class="hd-btn" data-act="confirm"' + (needC ? ' disabled' : '') + '>' + (S.choice === 'decline' ? 'Confirm decline' : 'Confirm signature') + '</button>') +
      '<p class="hd-foot">Your signature covers your own task. The approval roles of the other participants stay as they are.</p>' +
    '</section>';
  }
  function render3() {
    var el = $('#hd-3'); if (!el) return;
    var cs = comments();
    var tools = [['select', 'Select'], ['comment', 'Comment'], ['draw', 'Draw']];
    var body = dmTabs('int') +
      '<div class="c1-doch"><div><p class="c1-h2">Retaining wall RW-12 · FSW-ST-0002.pdf</p><p class="hd-muted">Revision D · WF-B01 · Your task: Review drawing interfaces</p></div>' +
        '<button type="button" class="hd-btn hd-btn--sm hd-btn--ghost c1-btn-o" data-act="tview" data-v="mine">Back to my tasks</button></div>' +
      '<div class="c1-tools" role="toolbar" aria-label="PDF tools">' + tools.map(function (t) {
        return '<button type="button" class="c1-tool' + (S.mode === t[0] ? ' is-on' : '') + '" data-act="mode" data-v="' + t[0] + '" aria-pressed="' + (S.mode === t[0]) + '"' + (done() && t[0] !== 'select' ? ' disabled' : '') + '>' + t[1] + '</button>';
      }).join('') +
        '<button type="button" class="c1-tool" data-act="zoom">Zoom ' + S.zoom + '%</button>' +
        '<button type="button" class="c1-tool" data-act="download">Download</button>' +
        '<button type="button" class="c1-tool" data-act="model" data-id="ST">View in model</button>' +
        '<span class="c1-saved" role="status">' + (S.own.saved ? 'Comments saved' : '1 comment not saved yet') + '</span></div>' +
      '<div class="c1-pdfgrid">' +
        '<section class="hd-panel c1-sheet">' +
          '<div class="c1-sheet__h"><b>RETAINING WALL RW-12</b><span>FSW-ST-0002 · D · Sheet 1 / 1</span></div>' +
          '<p class="hd-muted">Elevation · Plan · Section A · Drainage detail B</p>' +
          '<div class="c1-canvas c1-mode--' + S.mode + '">' + drawing() + '</div>' +
          '<div class="c1-tb"><b>Frankenschnellweg · Structures · Coordination review</b><p>Revision D <span>Drawing: FSW-ST-0002</span> <span>Prepared: Emma Richter</span></p><small>Demo drawing · Illustrative geometry</small></div>' +
          ownBox() +
        '</section>' +
        '<div class="c1-side">' +
          '<section class="hd-panel c1-report" aria-labelledby="c1-rep-t"><p class="c1-h3" id="c1-rep-t">' + svg('report', 'hd-ico c1-repi') + 'Comments report</p>' +
            '<p class="hd-muted">All drawing comments · ' + cs.length + ' entries · Revision D</p>' +
            '<ol class="c1-clist">' + cs.map(function (c) {
              return '<li' + (c.me ? ' class="is-me"' : '') + '><b>' + c.id + ' · ' + esc(c.who) + '</b><small>' + esc(c.where) + '</small><p>' + esc(c.t) + '</p></li>';
            }).join('') + '</ol>' +
            '<p class="hd-foot">Updates automatically as comments are added to the drawing.</p></section>' +
          stamp() +
        '</div>' +
      '</div>' + apps('pdf');
    el.innerHTML = frame(3, 'PDF viewer', body);
  }

  // =========================================================
  // 04 Integrations: InfraWorks and Revit
  // =========================================================
  function camStyle() {
    var c = S.cam;
    return 'transform:perspective(900px) rotateY(' + c.orbit + 'deg) translateX(' + c.px + '%) scale(' + c.z + ')';
  }
  function viewer(pins) {
    return '<div class="c1-view" id="c1-view"><div class="c1-view__img" style="' + camStyle() + '"><img src="/assets/img/uc01/model-frankenschnellweg.webp" alt="Shared project model of the Frankenschnellweg: road, retaining walls, bridge and surrounding buildings" width="1800" height="747" loading="lazy" decoding="async">' +
      (pins ? Object.keys(POS).map(function (k) {
        var p = POS[k], on = S.pos === k;
        return '<button type="button" class="c1-mpin' + (on ? ' is-on' : '') + '" style="left:' + p.x + '%;top:' + p.y + '%" data-act="pos" data-id="' + k + '" aria-pressed="' + on + '" aria-label="Position: ' + esc(p.l) + '">' + svg('pin') + (on ? '<span>' + esc(p.l) + '</span>' : '') + '</button>';
      }).join('') : '<span class="c1-mtag" style="left:' + POS.ST.x + '%;top:' + POS.ST.y + '%">RW-12 · Retaining wall</span>') +
      '</div></div>';
  }
  function camBtns(list) {
    return list.map(function (b) { return '<button type="button" class="c1-tool' + (b[2] ? ' is-on' : '') + '" data-act="cam" data-v="' + b[0] + '"' + (b[2] !== undefined ? ' aria-pressed="' + !!b[2] + '"' : '') + '>' + b[1] + '</button>'; }).join('');
  }
  function infraView() {
    return '<section class="hd-panel c1-doch"><div><p class="c1-h2">InfraWorks · Frankenschnellweg</p><p>Position: ' + esc(POS[S.pos].l) + '</p></div>' +
        '<button type="button" class="hd-btn hd-btn--sm hd-btn--ghost c1-btn-o" data-act="tview" data-v="team">Back to workflow</button></section>' +
      '<section class="c1-stage">' +
        '<div class="c1-stage__h"><div><b>Frankenschnellweg</b><p class="hd-muted">Shared project model · InfraWorks</p></div><span class="hd-muted">Demo position preview</span></div>' +
        viewer(true) +
        '<div class="c1-camtools" role="toolbar" aria-label="Model view">' + camBtns([['orbit', 'Orbit'], ['pan', 'Pan'], ['zoom', 'Zoom'], ['fit', 'Fit model'], ['full', 'Full screen']]) + '</div>' +
      '</section>' +
      '<p class="hd-foot">Reference visualization: Schüßler-Plan · Frankenschnellweg. Saved positions open in the connected project model.</p>' +
      apps('infra') + '<p class="hd-foot">Connected apps</p>';
  }
  function revitView() {
    var dynq = S.dynq;
    return '<section class="hd-panel c1-doch"><div><p class="c1-h2">Frankenschnellweg · Revit model</p><p class="hd-muted">FSW_Coordination_D.rvt · Revision D · Full project model</p></div>' +
        '<div class="c1-thead__a"><button type="button" class="hd-btn hd-btn--sm hd-btn--ghost c1-btn-o" data-act="srcfiles">Source files</button><button type="button" class="hd-btn hd-btn--sm hd-btn--ghost c1-btn-o" data-go="7">Model settings</button></div></section>' +
      '<section class="c1-stage">' +
        '<div class="c1-camtools c1-camtools--top" role="toolbar" aria-label="Revit view">' +
          '<button type="button" class="c1-tool is-on" data-act="cam" data-v="fit">Full model</button>' + camBtns([['orbit', 'Orbit'], ['pan', 'Pan'], ['fit', 'Fit model']]) +
          '<button type="button" class="c1-tool' + (S.fam ? ' is-on' : '') + '" data-act="panel" data-v="fam" aria-pressed="' + S.fam + '">Family attributes</button>' +
          '<button type="button" class="c1-tool' + (S.dyn ? ' is-on' : '') + '" data-act="panel" data-v="dyn" aria-pressed="' + S.dyn + '">Dynamo</button>' +
          '<span class="hd-muted">Demo model preview</span></div>' +
        '<div class="c1-revit' + (S.fam ? ' has-fam' : '') + '">' + viewer(false) +
          (S.fam ? '<aside class="c1-fam" aria-labelledby="c1-fam-t"><p class="c1-h3" id="c1-fam-t">Family attributes</p><p class="c1-accent">Selected element · RW-12</p><p class="hd-muted">Instance and type information</p>' +
            '<dl>' + FAMILY.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl>' +
            '<button type="button" class="hd-btn hd-btn--sm hd-btn--ghost c1-btn-o" data-act="srcfiles">View source file</button><p class="hd-foot">Demo attributes</p></aside>' : '') +
          (S.dyn ? '<form class="c1-dyn" data-form="dyn" aria-labelledby="c1-dyn-t"><div class="c1-dyn__h"><p class="c1-h3" id="c1-dyn-t">' + svg('spark') + 'Higherd AI Assistant · Dynamo</p><span class="hd-muted">Gherd Mike · BIM Coordinator</span></div>' +
            '<p class="hd-muted">Source: FSW_ModelChecks.dyn · Selected family: FSW_RetainingWall</p>' +
            '<label class="hd-sr" for="c1-dq">Ask the Dynamo check</label><input id="c1-dq" class="c1-dyn__q" name="q" value="' + esc(dynq) + '" autocomplete="off">' +
            (S.dynRun ? '<div class="hd-tablewrap"><table class="hd-table c1-dyn__t"><caption class="hd-sr">Preview of FSW_RetainingWall instances</caption><thead><tr><th>Mark</th><th>Material</th><th>Level</th></tr></thead><tbody>' +
              DYN_ROWS.map(function (d) { return '<tr' + (d[0] === 'RW-12' ? ' class="c1-mine"' : '') + '><td>' + d[0] + '</td><td>' + d[1] + '</td><td>' + d[2] + '</td></tr>'; }).join('') +
              '</tbody></table></div><p class="c1-ok" role="status">' + svg('check') + '5 instances found · Read-only preview, no changes applied to the model.</p>' : '') +
            '<div class="c1-dyn__a"><span class="hd-muted">Inspect model data · Preview before applying any changes</span>' +
              (S.dynRun ? '<button type="button" class="hd-btn hd-btn--sm hd-btn--ghost" data-act="dynclear">Clear preview</button>' : '<button type="submit" class="hd-btn hd-btn--sm">Preview</button>') + '</div></form>' : '') +
        '</div>' +
      '</section>' + apps('revit') +
      '<p class="hd-foot">Illustrative project visualization · Revit source files and properties are demonstration data. Higherd connects Revit to the workflow; modelling stays in Revit.</p>';
  }
  function render4() {
    var el = $('#hd-4'); if (!el) return;
    el.innerHTML = frame(4, S.app === 'revit' ? 'Revit model' : 'Integrations', dmTabs('int') + (S.app === 'revit' ? revitView() : infraView()));
  }

  // =========================================================
  // 05 Document manager: all files
  // =========================================================
  function docStatus(r) {
    if (r.k === 'ST' && S.result) return chip(RESULT[S.result].doc, S.result === 'decline' ? 'bad' : 'done');
    return chip('For review', 'rev');
  }
  function render5() {
    var el = $('#hd-5'); if (!el) return;
    var q = S.q.trim().toLowerCase();
    var l = ROWS.filter(function (r) {
      if (S.disc !== 'all' && r.k !== S.disc) return false;
      return !q || [r.wf, r.no, r.k, r.type, r.myD].join(' ').toLowerCase().indexOf(q) !== -1;
    }).sort(function (a, b) {
      if (S.dsort === 'edited') return (a.k === 'ST' && S.result ? 0 : 1) - (b.k === 'ST' && S.result ? 0 : 1) || a.no.slice(-4).localeCompare(b.no.slice(-4));
      if (S.dsort === 'type') return a.type.localeCompare(b.type);
      return a.no.slice(-4).localeCompare(b.no.slice(-4));
    });
    var body = dmTabs('files') +
      '<div class="b-bar c1-bar">' +
        '<label class="hd-search b-grow"><span class="hd-sr">Search documents</span>' + svg('search') + '<input id="c1-q" type="search" placeholder="Search documents" value="' + esc(S.q) + '" autocomplete="off"></label>' +
        '<label class="b-sel"><span class="hd-sr">Sort</span>' + svg('sort') + '<select data-sel="dsort">' + opt([['no', 'Sort: Drawing no.'], ['edited', 'Sort: Last edited'], ['type', 'Sort: Document type']], S.dsort) + '</select></label>' +
        '<label class="b-sel"><span class="hd-sr">Filter</span>' + svg('filter') + '<select data-sel="disc">' + opt([['all', 'Filter: All disciplines']].concat(ROWS.map(function (r) { return [r.k, r.k + ' · ' + r.area]; })), S.disc) + '</select></label>' +
        '<button type="button" class="hd-btn" data-act="info" data-v="Uploading new documents is not part of this demo.">New document</button>' +
      '</div>' +
      '<section class="hd-panel">' +
        '<p class="hd-panel__t">Frankenschnellweg · 2,701 plans · 6 disciplines</p><p class="hd-muted">Road design · Structures · Geotechnics / earthworks · Drainage · Interfaces · Landscaping</p>' +
        '<div class="hd-tablewrap c1-tw"><table class="hd-table b-table c1-table"><thead><tr><th scope="col">Created on</th><th scope="col">WF</th><th scope="col">Drawing no.</th><th scope="col">Index</th><th scope="col">Company code</th><th scope="col">Discipline</th><th scope="col">Document type</th><th scope="col">Description</th><th scope="col">Asset</th><th scope="col">Level</th><th scope="col">Status</th><th scope="col">Last edited</th></tr></thead><tbody>' +
        (l.length ? l.map(function (r) {
          return '<tr class="' + (r.k === 'ST' && S.result ? 'c1-mine' : '') + '"><td>' + CREATED + '</td><td>' + wfChip(r.wf) + '</td><td><button type="button" class="hd-idlink" data-act="doc" data-id="' + r.k + '">' + r.no + '</button></td><td>' + r.idx + '</td><td>HG</td><td>' + r.k + '</td>' +
            '<td class="b-wrap">' + esc(r.type) + '</td><td class="b-wrap">' + esc(r.myD) + '</td><td><span class="b-asset">FSW-01</span></td><td>—</td><td>' + docStatus(r) + '</td><td>' + (r.k === 'ST' && S.result ? '18.11.2026' : '17.11.2026') + '</td></tr>';
        }).join('') : '<tr><td colspan="12" class="hd-empty">No documents match.</td></tr>') +
        '</tbody></table></div>' +
        '<nav class="c1-pages" aria-label="Pages"><button type="button" class="hd-link" data-act="page">' + svg('prev') + 'Previous</button><span>' +
          ['1', '2', '3', '…', '449', '450', '451'].map(function (p) {
            return p === '…' ? '<i aria-hidden="true">…</i>' : '<button type="button" class="c1-pg' + (p === '1' ? ' is-on' : '') + '"' + (p === '1' ? ' aria-current="page"' : ' data-act="page"') + '>' + p + '</button>';
          }).join('') + '</span><button type="button" class="hd-link" data-act="page">Next' + svg('next') + '</button></nav>' +
      '</section>' +
      '<p class="hd-foot">Showing 1–6 of 2,701 plans · Each document keeps its own revision history.</p>';
    el.innerHTML = frame(5, 'All files', body);
  }

  // =========================================================
  // 06 Workflow manager (WF-B01)
  // =========================================================
  function wfState(c) {
    if (c.id === 'w10') return S.result ? chip(RESULT[S.result].st, S.result === 'decline' ? 'bad' : 'done') : chip('Your task · Open', 'me');
    if (c.id === 'w12' && S.result && S.result !== 'decline') return chip('Next step · Pending', 'next');
    if (c.id === 'w14' && S.result === 'decline') return chip('Next step · Pending', 'next');
    if (c.id === 'w16') return chip('Maria Keller · Client approval', 'plain');
    return '';
  }
  function render6() {
    var el = $('#hd-6'); if (!el) return;
    var all = BOARD.concat(S.extra);
    var body =
      '<div class="c1-wfbar"><div class="b-tabs" role="group" aria-label="Workflow manager"><span class="b-tab is-locked" aria-disabled="true" title="Not part of this demo">Active workflows</span><span class="b-tab is-locked" aria-disabled="true" title="Not part of this demo">Library</span><span class="b-tab is-on" aria-current="page">Editor</span></div>' +
        '<div class="c1-thead__a"><button type="button" class="hd-btn hd-btn--sm" data-act="addcard">Add new task</button><button type="button" class="hd-btn hd-btn--sm b-orange" data-act="info" data-v="Support is reachable from the full app. In this demo nothing is sent.">Contact support</button></div></div>' +
      '<section class="c1-wfhead"><div><p class="c1-h2">Frankenschnellweg · WF-B01</p><p>Live Model · InfraWorks</p></div>' +
        '<div class="c1-thead__a"><button type="button" class="hd-link" data-act="model" data-id="ST">' + svg('link') + 'Position in model</button><button type="button" class="hd-btn hd-btn--sm" data-act="model" data-id="ST">View in model</button></div></section>' +
      '<div class="b-board" role="list" aria-label="Workflow phases">' + PHASES.map(function (p) {
        var l = all.filter(function (c) { return c.ph === p.k; });
        return '<section class="b-col" role="listitem" style="--c:' + p.c + '" aria-label="' + esc(p.t) + '"><p class="b-col__h">' + esc(p.t) + ' <span>' + l.length + '</span></p>' +
          '<ul class="b-col__l">' + l.map(function (c) {
            var open = wmenu === c.id, me = c.id === 'w10';
            return '<li class="b-task' + (me ? ' c1-me' : '') + '" style="--c:' + p.c + '"><div class="b-task__h"><b>' + esc(c.t) + '</b>' +
              '<button type="button" class="b-more" data-act="wmenu" data-id="' + c.id + '" aria-haspopup="menu" aria-expanded="' + open + '" aria-label="Task menu: ' + esc(c.t) + '">' + svg('more') + '</button></div>' +
              '<small>' + esc(c.role) + '</small><small class="b-task__m">' + svg('file') + esc(c.code) + '</small><small class="b-task__m">' + svg('clock') + esc(c.dur) + '</small>' + wfState(c) +
              (open ? '<ul class="b-menu" role="menu" aria-label="Task actions">' +
                '<li role="none"><button type="button" role="menuitem" class="b-menu__i" data-act="model" data-id="' + c.pos + '">' + svg('link') + 'View in model</button></li>' +
                '<li role="none"><button type="button" role="menuitem" class="b-menu__i" data-act="tview" data-v="team">' + svg('eye') + 'Show team tasks</button></li>' +
                (me ? '<li role="none"><button type="button" role="menuitem" class="b-menu__i" data-go="3">' + svg('sign') + 'Open task PDF</button></li>' : '') +
              '</ul>' : '') + '</li>';
          }).join('') + '</ul></section>';
      }).join('') + '</div>' +
      '<p class="hd-foot">Actions stay in the flow: open the task PDF, sign, or jump to the model from a task menu (⋯). Signing your task does not change the approval roles of the other participants.</p>';
    el.innerHTML = frame(6, 'Workflow · Frankenschnellweg', body);
  }

  // =========================================================
  // 07 Settings: project, model characteristics, source files
  // =========================================================
  function sw(k, label) {
    var on = !!S.notif[k];
    return '<li><span>' + label + '</span><button type="button" class="b-switch' + (on ? ' is-on' : '') + '" role="switch" aria-checked="' + on + '" data-act="notif" data-v="' + k + '" aria-label="' + label + '"><i aria-hidden="true"></i><span>' + (on ? 'On' : 'Off') + '</span></button></li>';
  }
  function render7() {
    var el = $('#hd-7'); if (!el) return;
    var p = proj(S.proj);
    var body = '<div class="c1-setgrid"><div class="c1-setmain">' +
      '<section class="hd-panel"><div class="c1-thead"><div><p class="c1-h2">Gherd Mike</p><p class="hd-muted">GCE Holding · ' + esc(p.n) + '</p></div>' +
          '<button type="button" class="hd-btn hd-btn--sm hd-btn--ghost c1-btn-o" data-act="info" data-v="Profile changes are not part of this demo.">Edit profile</button></div>' +
        '<p class="c1-h3">About this role</p><p>Coordinates project information, reviews drawing interfaces and maintains the shared project model connection.</p>' +
        '<dl class="c1-facts"><div><dt>Project role</dt><dd>BIM Coordinator</dd></div><div><dt>Active project</dt><dd>' + esc(p.n) + '</dd></div><div><dt>Access</dt><dd>Project model settings</dd></div></dl></section>' +
      '<section class="hd-panel"><p class="c1-h3">My projects</p><div class="c1-projs">' + PROJECTS.map(function (x) {
          var on = x.k === S.proj;
          return '<button type="button" class="c1-proj' + (on ? ' is-on' : '') + '" data-act="proj" data-v="' + x.k + '" aria-pressed="' + on + '"><b>' + esc(x.n) + '</b><small>' + esc(x.a) + '</small><small>' + esc(x.m) + '</small><span>' + (on ? 'Selected project' : 'Select project') + '</span></button>';
        }).join('') + '</div></section>' +
      '<section class="hd-panel"><div class="c1-thead"><p class="c1-h3">Model characteristics</p><span class="c1-accent">Demo connection</span></div>' +
        '<p class="hd-muted">One shared model for the project. Task and drawing links open their saved position in this model.</p>' +
        '<dl class="c1-fields"><div><dt>Project</dt><dd>' + esc(p.n) + '</dd></div><div><dt>Source application</dt><dd>Autodesk Revit</dd></div><div><dt>Shared model</dt><dd>' + esc(p.shared) + '</dd></div><div><dt>View in integrations</dt><dd>Revit model viewer · Full project</dd></div></dl>' +
        '<button type="button" class="c1-linkrow" data-act="srcopen" data-v="full">' + svg('link') + '<b>View in model → Open linked position in model</b></button>' +
        '<p class="hd-muted">Each task stores its own position reference. The model connection is managed here by the BIM Coordinator.</p>' + (p.meta ? '<p class="hd-muted">' + p.meta + '</p>' : '') +
        '<p class="c1-h3 c1-mt">Source files</p><p class="hd-foot">Demo source entries · Select a file to open its integration view.</p>' +
        '<ul class="c1-files">' + p.files.map(function (f) {
          return '<li>' + svg('file', 'hd-ico c1-fi') + '<button type="button" class="hd-idlink" data-act="srcopen" data-v="' + f[2] + '">' + esc(f[0]) + '</button><span class="hd-muted">' + esc(f[1]) + '</span>' +
            '<button type="button" class="c1-pl" data-act="srcopen" data-v="' + f[2] + '" aria-label="Open ' + esc(f[0]) + ' in Integrations">' + svg('link') + '</button></li>';
        }).join('') + '</ul>' +
        '<div class="hd-actions hd-actions--start"><button type="button" class="hd-btn hd-btn--sm" data-act="info" data-v="Changing the model connection is not part of this demo.">Change connection</button>' +
          '<button type="button" class="hd-btn hd-btn--sm hd-btn--ghost c1-btn-o" data-act="srcopen" data-v="full">Open in Integrations</button></div>' +
      '</section></div>' +
      '<div class="c1-setside">' +
        '<section class="hd-panel"><p class="c1-h3">Subscription</p><p class="c1-plan">Enterprise plan</p><p class="hd-muted">Managed by GCE Holding.</p></section>' +
        '<section class="hd-panel"><p class="c1-h3">Higherd Assistant</p><p>Project status notifications</p>' +
          '<button type="button" class="hd-btn hd-btn--sm hd-btn--ghost c1-btn-o c1-mt" data-act="freq" aria-label="Notification frequency: ' + S.notif.freq + '. Change">' + S.notif.freq + '</button>' +
          '<ul class="c1-sws">' + sw('email', 'Email notifications') + sw('comments', 'Review comments') + sw('signature', 'Signature recorded') + sw('next', 'Next workflow step') + '</ul></section>' +
        '<section class="hd-panel"><p class="c1-h3">Project model access</p><p><b>BIM Coordinator</b></p><p class="hd-muted">Manage the shared model connection.</p><p class="c1-mt"><b>Project team</b></p><p class="hd-muted">Open linked positions from drawings and workflow tasks.</p></section>' +
      '</div></div>';
    el.innerHTML = frame(7, 'My settings', body);
  }

  // =========================================================
  // Document details dialog
  // =========================================================
  function dialog() {
    var dlg = $('#hd-dialog');
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.id = 'hd-dialog';
    dlg.className = 'hd-dialog hd b-docdlg';
    dlg.setAttribute('aria-labelledby', 'c1-doc-t');
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) { dlg.close(); return; }
      var b = e.target.closest('[data-act], [data-go]');
      if (!b) return;
      dlg.close();
      if (b.hasAttribute('data-go')) { goTo(Number(b.getAttribute('data-go'))); return; }
      var a = b.getAttribute('data-act');
      if (a === 'model') openModel(b.getAttribute('data-id'));
      if (a === 'download') makePdf();
    });
    return dlg;
  }
  function openDoc(k) {
    var r = row(k), st = k === 'ST', cs = st ? comments() : [];
    var hist = [['Revision ' + r.idx + ' uploaded', r.owner ? r.owner.split(' · ')[0] : r.name], ['Assigned to ' + r.wf, 'Workflow']];
    if (st && S.own.saved) hist.unshift(['Comment C03 added on ' + S.own.view, 'Gherd Mike']);
    if (st && S.result) hist.unshift([RESULT[S.result].st + ' · comments report attached', 'Gherd Mike · ' + SIGNED_AT]);
    var dlg = dialog();
    dlg.innerHTML =
      '<div class="hd-dialog__h"><div><p class="hd-eyebrow">' + r.area + ' · ' + r.wf + '</p><p class="hd-dialog__t" id="c1-doc-t">' + r.no + ' / ' + r.idx + '</p></div>' +
        '<button type="button" class="hd-x" data-act="close" aria-label="Close">×</button></div>' +
      '<p class="hd-dialog__p">' + esc(r.type) + ' · ' + esc(r.myD) + '</p>' +
      '<div class="hd-stats"><div><span>Status</span><b>' + (st && S.result ? RESULT[S.result].doc : 'For review') + '</b></div><div><span>Comments</span><b>' + (st ? cs.length : 0) + '</b></div><div><span>Owner</span><b>' + esc(st ? 'Emma Richter' : r.name) + '</b></div></div>' +
      (cs.length ? '<p class="hd-sub">Comments report</p><ol class="b-hist">' + cs.map(function (c) { return '<li><b>' + c.id + ' · ' + esc(c.t) + '</b><small>' + esc(c.who) + ' · ' + esc(c.where) + '</small></li>'; }).join('') + '</ol>' : '') +
      '<p class="hd-sub">History</p><ol class="b-hist">' + hist.map(function (h) { return '<li><b>' + esc(h[0]) + '</b><small>' + esc(h[1]) + '</small></li>'; }).join('') + '</ol>' +
      '<div class="hd-actions">' +
        '<button type="button" class="hd-btn hd-btn--ghost" data-act="model" data-id="' + k + '">View in model</button>' +
        (st ? '<button type="button" class="hd-btn hd-btn--ghost" data-act="download">Download PDF</button><button type="button" class="hd-btn" data-go="3">Open in PDF viewer</button>' : '') +
      '</div>';
    if (!dlg.open) dlg.showModal();
    var x = dlg.querySelector('.hd-x'); if (x) x.focus();
  }

  // =========================================================
  // Real PDF of the reviewed drawing (jsPDF, made on the device)
  // =========================================================
  var pdfReady = null;
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
  function makePdf() {
    pdfLib().then(function (J) {
      var doc = new J({ orientation: 'landscape', unit: 'mm', format: 'a4' }), y;
      var clean = function (t) { return String(t).replace(/[→]/g, '->').replace(/[·]/g, '-').replace(/[–—]/g, '-').replace(/[’]/g, "'"); };
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text('RETAINING WALL RW-12', 15, 18);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text('FSW-ST-0002 - Revision D - Sheet 1 / 1 - Frankenschnellweg', 15, 25);
      doc.setDrawColor(40); doc.rect(15, 32, 170, 40); for (var i = 1; i < 12; i++) doc.line(15 + i * 14.2, 32, 15 + i * 14.2, 72);
      doc.rect(15, 80, 170, 28); doc.line(15, 87, 185, 87); doc.line(15, 101, 185, 101);
      doc.rect(15, 116, 80, 40); doc.rect(105, 116, 80, 40);
      doc.setFontSize(8); doc.text('Elevation', 15, 30); doc.text('Plan', 15, 78); doc.text('Section A', 15, 114); doc.text('Detail B', 105, 114);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('Comments report', 195, 34);
      doc.setFontSize(9); y = 42;
      comments().forEach(function (c) {
        doc.setFont('helvetica', 'bold'); doc.text(clean(c.id + ' - ' + c.who), 195, y); y += 5;
        doc.setFont('helvetica', 'normal'); doc.text(clean(c.where), 195, y); y += 5;
        var lines = doc.splitTextToSize(clean(c.t), 85); doc.text(lines, 195, y); y += lines.length * 4.5 + 4;
      });
      doc.rect(195, 128, 87, 40); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('Plan stamp - FSW-ST-0002 - Rev. D', 199, 136);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      doc.text(['Reviewer: Gherd Mike - BIM Coordinator', 'Task: Review drawing interfaces', 'Report: ' + comments().length + ' comments attached',
        S.result ? clean(RESULT[S.result].st + ' - ' + SIGNED_DAY + ', ' + SIGNED_AT) : 'Review in progress - Not signed'], 199, 144);
      doc.setFontSize(8); doc.setTextColor(120); doc.text('Higherd demo - illustrative geometry and sample data - not a construction document', 15, 200);
      doc.save('FSW-ST-0002_D_review' + (S.result ? '_' + S.result : '') + '.pdf');
      toast('FSW-ST-0002 / D downloaded with ' + comments().length + ' comments', true);
    }, function () { toast('The PDF could not be created. Please try again.', true); });
  }

  // =========================================================
  // Higherd AI Assistant: answers from the demo state
  // =========================================================
  var AI_Q = {
    1: ['What needs my attention today?', 'Which discipline is behind?', 'What changed after my review?'],
    2: ['Which task is mine to sign?', 'Who needs to act next?', 'What does the purple link do?'],
    3: ['Summarize the comments', 'Sign or sign with comments?', 'Does my signature approve the design?'],
    4: ['Where is RW-12 in the model?', 'What does the Dynamo check do?', 'Can I edit the model here?'],
    5: ['What is the status of FSW-ST-0002?', 'Which documents are for review?'],
    6: ['What happens after my review?', 'Who approves the drawing?'],
    7: ['Which model is connected?', 'How do I switch project?']
  };
  function aiAnswer(q) {
    var ql = q.toLowerCase(), r = S.result, open = openTasks();
    if (/attention|today/.test(ql)) return r ? 'Your review of FSW-ST-0002 / D is recorded (' + RESULT[r].st.toLowerCase() + '). ' + open + ' discipline tasks are open. Next due: Anna Becker’s road alignment review and Nora Fischer’s drainage query, both 19.11.2026.'
      : 'One task needs your signature: WF-B01, Review drawing interfaces on FSW-ST-0002 / D, due 18.11.2026. Open it from My workflow tasks. ' + open + ' discipline tasks are open in total.';
    if (/behind|discipline/.test(ql)) return 'Interfaces is lowest at ' + BARS[4].v[S.period] + '% (Omar Weber, due 21.11.2026), then Landscape at ' + BARS[5].v[S.period] + '%. Drainage has an open query with Nora Fischer.';
    if (/changed|after my review/.test(ql)) return r ? 'FSW-ST-0002 / D now shows “' + RESULT[r].doc + '” in the document manager, the team task is ' + RESULT[r].st.toLowerCase() + ', open tasks went from 6 to ' + open + ', and Higherd Assistant notified the next step.' : 'Nothing yet. Once you sign in the PDF viewer, the task, document status, dashboard and notification update together.';
    if (/mine|sign\b|to sign/.test(ql) && !/comments\?/.test(ql)) return 'WF-B01: Review drawing interfaces on FSW-ST-0002 (Retaining wall RW-12). The other rows are coordination tasks or belong to their owners, so their Sign actions stay disabled for you.';
    if (/act next|who needs/.test(ql)) return r ? (r === 'decline' ? 'Emma Richter, to revise FSW-ST-0002. ' : 'The BIM Coordinator step “Consolidate review comments”, then client approval with Maria Keller. ') + 'In the team: Anna Becker and Nora Fischer are due 19.11.2026.' : 'You first (WF-B01, due 18.11.2026). Then Anna Becker and Nora Fischer, due 19.11.2026.';
    if (/purple|link/.test(ql)) return 'It opens the saved position of that task in the shared model, inside Integrations (InfraWorks). Each task stores its own position reference.';
    if (/summar|comments$/.test(ql)) return comments().map(function (c) { return c.id + ' (' + c.who.split(' · ')[0] + '): ' + c.t; }).join(' ') + (S.own.saved ? '' : ' Your comment C03 is drafted but not saved yet.');
    if (/sign or|sign with/.test(ql)) return S.own.saved || !r ? 'You commented during your task, so Sign with comments fits: the stamp records your signature and keeps C03 linked to the drawing and report. Use Decline only if the drawing must go back for revision.' : '';
    if (/approve/.test(ql)) return 'No. Your signature closes your own review task. Technical review and client approval stay with their roles: the checking engineer and Maria Keller as client representative.';
    if (/rw-12|where is/.test(ql)) return 'RW-12 is the retaining wall on the left of the road in the InfraWorks view. Choose Retaining wall RW-12 in the model, or use View in model from the PDF viewer.';
    if (/dynamo/.test(ql)) return 'FSW_ModelChecks.dyn reads the model. Preview lists every FSW_RetainingWall instance with Mark, Material and Level. Nothing changes in the model unless it is applied in Revit.';
    if (/edit the model|edit/.test(ql)) return 'No. Higherd links InfraWorks and Revit to the workflow and shows positions and attributes. Modelling stays in the authoring tools.';
    if (/status of|fsw-st/.test(ql)) return 'FSW-ST-0002 / D: ' + (r ? RESULT[r].doc + ', ' + comments().length + ' comments attached, last edited 18.11.2026.' : 'For review, ' + comments().length + ' comments so far, awaiting your interfaces review.');
    if (/for review/.test(ql)) return (r ? 5 : 6) + ' documents show “For review”: ' + ROWS.filter(function (x) { return !(x.k === 'ST' && r); }).map(function (x) { return x.no; }).join(', ') + '.';
    if (/after my review|what happens/.test(ql)) return r === 'decline' ? '“Request revision” is next: the drawing returns to Emma Richter.' : 'The drawing moves to “Consolidate review comments”, then overall technical review and client approval.';
    if (/who approves/.test(ql)) return 'The lead checking engineer (overall technical review) and the client representative, Maria Keller. Your signature does not change those roles.';
    if (/connected|model is/.test(ql)) { var p = proj(S.proj); return p.n + ': ' + p.shared + ' in Autodesk Revit, viewed in Integrations as Revit model viewer · Full project.'; }
    if (/switch project/.test(ql)) return 'Under My projects in Settings, choose Select project on Gateway Gardens or Frankfurt Hauptbahnhof. Each project keeps its own model and source files.';
    return 'In this demo Higherd AI Assistant answers questions about the Frankenschnellweg project: tasks, comments, signatures and the model. Try one of the suggestions.';
  }
  var aiLog = [];
  function aiPanel() {
    var p = $('#hd-ai');
    if (p) return p;
    p = document.createElement('aside');
    p.id = 'hd-ai'; p.className = 'hd hd-ai'; p.setAttribute('aria-label', 'Higherd AI Assistant'); p.hidden = true;
    document.body.appendChild(p);
    p.addEventListener('click', function (e) {
      var b = e.target.closest('[data-q], [data-act]');
      if (!b) return;
      if (b.getAttribute('data-act') === 'aiclose') { closeAI(); return; }
      if (b.hasAttribute('data-q')) ask(b.getAttribute('data-q'));
    });
    p.addEventListener('submit', function (e) { e.preventDefault(); var i = p.querySelector('input'), v = i.value.trim(); if (v) ask(v); });
    p.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); closeAI(); } });
    return p;
  }
  function closeAI() { var p = $('#hd-ai'); if (p) p.hidden = true; var o = $('#hd-' + currentStep() + ' [data-act="ai"]'); if (o) o.focus({ preventScroll: true }); }
  function renderAI(typing) {
    var p = aiPanel(), step = currentStep();
    p.innerHTML =
      '<div class="hd-ai__h">' + svg('spark') + '<p><b>Higherd AI Assistant</b><small>Answers from this demo project</small></p><button type="button" class="hd-x" data-act="aiclose" aria-label="Close Higherd AI Assistant">×</button></div>' +
      '<div class="hd-ai__log" aria-live="polite">' + (aiLog.length ? '' : '<p class="hd-ai__hello">Hi Gherd. Ask me about this screen.</p>') +
        aiLog.map(function (m) { return '<p class="hd-ai__m hd-ai__m--' + m.who + '">' + esc(m.t) + '</p>'; }).join('') +
        (typing ? '<p class="hd-ai__m hd-ai__m--ai hd-ai__typing" aria-label="Higherd AI Assistant is typing"><i></i><i></i><i></i></p>' : '') + '</div>' +
      '<div class="hd-ai__q">' + AI_Q[step].map(function (q) { return '<button type="button" data-q="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>' +
      '<form class="hd-ai__f"><label class="hd-sr" for="hd-ai-in">Ask Higherd AI Assistant</label><input id="hd-ai-in" type="text" placeholder="Ask Higherd AI Assistant…" autocomplete="off"><button type="submit" class="hd-btn hd-btn--sm">Ask</button></form>';
    var log = p.querySelector('.hd-ai__log'); log.scrollTop = log.scrollHeight;
  }
  function ask(q) {
    aiLog.push({ who: 'me', t: q }); renderAI(true);
    setTimeout(function () { aiLog.push({ who: 'ai', t: aiAnswer(q) || aiAnswer('') }); renderAI(false); var i = $('#hd-ai-in'); if (i) i.focus({ preventScroll: true }); }, 650);
  }
  function openAI() { var p = aiPanel(); p.hidden = false; renderAI(false); var i = p.querySelector('input'); if (i) i.focus({ preventScroll: true }); }

  // =========================================================
  // Pulse, toast, notifications
  // =========================================================
  var PULSE = {
    1: '.hd-panel [data-act="tview"][data-v="mine"]',
    2: '.c1-mine .c1-i, [data-act="tview"][data-v="team"].hd-btn',
    3: '[data-form="comment"] [type="submit"], [data-act="confirm"]:not([disabled]), .c1-stamp [data-go="1"]',
    4: '[data-act="app"][data-v="revit"], .c1-dyn [type="submit"]',
    5: '.c1-mine .hd-idlink, .hd-table .hd-idlink',
    6: '.c1-me .b-more',
    7: '.c1-proj:not(.is-on)'
  };
  var touched = {};
  function pulse() {
    for (var n = 1; n <= 7; n++) {
      var box = document.getElementById('hd-' + n); if (!box) continue;
      box.querySelectorAll('.hd-pulse').forEach(function (o) { o.classList.remove('hd-pulse'); });
      if (touched[n]) continue;
      var el = box.querySelector(PULSE[n]); if (el) el.classList.add('hd-pulse');
    }
  }
  function touch(e) {
    var box = e.target.closest && e.target.closest('.hd[id^="hd-"]');
    if (!box || e.target.closest('[data-act="reset"], .hd-side')) return;
    var n = box.id.slice(3);
    // Step 03 keeps guiding until the review is recorded
    if (n === '3' && !S.result) return;
    if (!touched[n]) { touched[n] = true; setTimeout(pulse, 0); }
  }
  var toastTimer;
  function stampNow() { var d = new Date(); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
  function toast(msg, info) {
    if (!info) { S.log.unshift({ t: msg, at: stampNow() }); S.log = S.log.slice(0, 12); save(); refreshBells(); }
    var t = document.getElementById('hd-toast');
    if (!t) { t = document.createElement('div'); t.id = 'hd-toast'; t.className = 'hd-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = '<span class="hd-toast__ok' + (info ? ' b-toast-info' : '') + '" aria-hidden="true">' + (info ? 'i' : '✓') + '</span>' + esc(msg);
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 3400);
  }
  function refreshBells() {
    var n = Math.max(0, S.log.length - S.seen);
    document.querySelectorAll('#journey .b-bellbtn').forEach(function (b) {
      var em = b.querySelector('.b-bell__n');
      if (n && !em) { em = document.createElement('em'); em.className = 'b-bell__n'; em.setAttribute('aria-hidden', 'true'); b.appendChild(em); }
      if (em) { if (n) em.textContent = n; else em.remove(); }
      b.setAttribute('aria-label', 'Higherd Assistant notifications' + (n ? ', ' + n + ' new' : ''));
    });
  }

  // =========================================================
  // Actions
  // =========================================================
  var RENDER = [null, render1, render2, render3, render4, render5, render6, render7];
  function renderAll() { for (var i = 1; i < RENDER.length; i++) RENDER[i](); pulse(); }
  function rerender(n) { RENDER[n](); pulse(); }

  function openModel(k) { S.pos = POS[k] ? k : 'ST'; S.app = 'infra'; S.cam = { z: 1, px: 0, orbit: 0 }; menu = ''; wmenu = ''; save(); render4(); render2(); render6(); goTo(4); }
  function showTasks(v) { S.tview = v; menu = ''; save(); render2(); goTo(2); }

  function confirmResult() {
    if (S.result) return;
    if (S.choice === 'comments' && !S.own.saved) return;
    S.result = S.choice; S.mode = 'select'; S.note = 'open';
    save(); renderAll();
    var r = RESULT[S.result];
    toast('Higherd Assistant · FSW-ST-0002 / D ' + r.st.toLowerCase() + ' · ' + (S.result === 'decline' ? 'returned to Emma Richter' : 'next workflow step pending'));
    focusAfter('#hd-3 .c1-stamp [data-go="1"]');
  }

  function rowAction(v, k) {
    var r = row(k); menu = '';
    if (v === 'pdf') { render2(); if (k === 'ST') goTo(3); else toast('In this demo the PDF viewer opens WF-B01 · FSW-ST-0002. ' + r.no + ' stays with ' + r.name + '.', true); return; }
    if (v === 'wf') { render2(); goTo(6); return; }
    if (v === 'sign' || v === 'comments' || v === 'decline') { if (k !== 'ST' || S.result) { render2(); return; } S.choice = v; save(); render2(); render3(); goTo(3); return; }
    if (v === 'report') { render2(); if (k === 'ST') { goTo(3); focusAfter('#c1-ct'); } else toast('Review reports are added by the task owner, ' + r.name + '.', true); return; }
    if (v === 'adddoc') { render2(); toast('Adding documents is not part of this demo.', true); return; }
    if (v === 'escalate') { render2(); toast('Higherd Assistant · Decision on ' + r.no + ' escalated to the technical lead'); return; }
    if (v === 'model') { openModel(k); return; }
  }

  function cam(v) {
    var c = S.cam;
    if (v === 'orbit') c.orbit = c.orbit >= 12 ? -12 : c.orbit + 6;
    if (v === 'pan') c.px = c.px >= 8 ? -8 : c.px + 4;
    if (v === 'zoom') c.z = c.z >= 1.6 ? 1 : Math.round((c.z + 0.2) * 10) / 10;
    if (v === 'fit') { c.z = 1; c.px = 0; c.orbit = 0; }
    if (v === 'full') { var el = $('#c1-view'); if (el && el.requestFullscreen) el.requestFullscreen().catch(function () {}); return; }
    save();
    var img = $('#hd-4 .c1-view__img'); if (img) img.setAttribute('style', camStyle());
  }

  function onClick(e) {
    var go = e.target.closest('[data-go]');
    if (go && !go.disabled) { goTo(Number(go.getAttribute('data-go'))); pulse(); return; }
    var hit = e.target.closest('.c1-hit');
    if (hit && !S.result) { placeOnView(hit.getAttribute('data-view')); return; }
    var b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    var act = b.getAttribute('data-act'), id = b.getAttribute('data-id'), v = b.getAttribute('data-v');
    var step = Number((b.closest('.hd[id^="hd-"]') || { id: 'hd-0' }).id.slice(3));
    switch (act) {
      case 'reset':
        if (!confirm('Reset the demo to the sample data?')) return;
        try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
        S = defaults(); touched = {}; aiLog = []; menu = ''; wmenu = ''; bellOpen = 0; renderAll(); return;
      case 'ai': openAI(); return;
      case 'bell':
        bellOpen = bellOpen === Number(v) ? 0 : Number(v);
        if (bellOpen) S.seen = S.log.length;
        save(); rerender(Number(v)); refreshBells(); focusAfter('#hd-' + v + ' [data-act="bell"]'); return;
      case 'clearlog': S.log = []; S.seen = 0; save(); rerender(step); return;
      case 'period': S.period = v; save(); render1(); focusAfter('#hd-1 [data-act="period"][data-v="' + v + '"]'); return;
      case 'tview': showTasks(v); return;
      case 'tasksfor': S.tq = row(id).no; S.tf = 'all'; showTasks('team'); return;
      case 'doc': openDoc(id); return;
      case 'dismiss': S.note = 'dismissed'; save(); render1(); toast('Notification dismissed. It stays under Higherd Assistant.', true); focusAfter('#hd-1 [data-act="bell"]'); return;
      case 'viewwf': S.note = 'dismissed'; save(); render1(); showTasks('team'); return;
      case 'rmenu': menu = menu === id ? '' : id; render2(); if (menu) focusAfter('#hd-2 .c1-rmenu [data-v="' + v + '"]:not([disabled]), #hd-2 .c1-rmenu [role="menuitem"]:not([disabled])'); return;
      case 'ra': rowAction(v, id); return;
      case 'model': openModel(id); return;
      case 'mode': S.mode = v; save(); render3(); focusAfter('#hd-3 [data-act="mode"][data-v="' + v + '"]'); return;
      case 'zoom': S.zoom = S.zoom >= 150 ? 100 : S.zoom + 25; save(); render3(); focusAfter('#hd-3 [data-act="zoom"]'); return;
      case 'download': makePdf(); return;
      case 'editc': S.own.saved = false; save(); render3(); render5(); focusAfter('#c1-ct'); return;
      case 'choice': S.choice = v; save(); render3(); pulse(); focusAfter('#hd-3 [data-act="choice"][data-v="' + v + '"]'); return;
      case 'confirm': confirmResult(); return;
      case 'app': S.app = v; save(); render4(); render3(); if (step !== 4) goTo(4); pulse(); return;
      case 'pos': S.pos = id; save(); render4(); focusAfter('#hd-4 [data-act="pos"][data-id="' + id + '"]'); return;
      case 'cam': cam(v); return;
      case 'panel': S[v] = !S[v]; save(); render4(); focusAfter('#hd-4 [data-act="panel"][data-v="' + v + '"]'); return;
      case 'dynclear': S.dynRun = false; save(); render4(); focusAfter('#c1-dq'); return;
      case 'srcfiles': goTo(7); focusAfter('#hd-7 .c1-files .hd-idlink'); return;
      case 'page': toast('This demo shows page 1 of 451.', true); return;
      case 'info': toast(v, true); return;
      case 'wmenu': wmenu = wmenu === id ? '' : id; render6(); if (wmenu) focusAfter('#hd-6 .b-menu [role="menuitem"]'); return;
      case 'addcard':
        S.extra.push(card('x' + (S.seq++), 'prep', 'New task ' + S.seq, 'BIM Coordinator', '—', '5 days'));
        save(); render6(); toast('New task added to Preparation & coordination'); return;
      case 'proj': S.proj = v; save(); render7(); toast('Active project in settings: ' + proj(v).n, true); focusAfter('#hd-7 [data-act="proj"][data-v="' + v + '"]'); return;
      case 'srcopen':
        if (S.proj !== 'FSW') { toast('Model views in this demo are set up for Frankenschnellweg. ' + proj(S.proj).n + ' keeps its own connection.', true); return; }
        S.app = 'revit'; S.fam = v === 'fam' || v === 'full' ? true : S.fam; S.dyn = v === 'dyn' || v === 'full' ? true : S.dyn;
        if (v === 'fam') S.dyn = false; if (v === 'dyn') S.fam = false;
        save(); render4(); goTo(4); return;
      case 'freq': S.notif.freq = { Daily: 'Weekly', Weekly: 'Instant', Instant: 'Daily' }[S.notif.freq]; save(); render7(); focusAfter('#hd-7 [data-act="freq"]'); return;
      case 'notif': S.notif[v] = !S.notif[v]; save(); render7(); focusAfter('#hd-7 [data-act="notif"][data-v="' + v + '"]'); return;
    }
  }

  function placeOnView(view) {
    if (S.mode === 'comment') {
      if (S.own.saved) { toast('C03 is saved on ' + S.own.view + '. Choose Edit to move it.', true); return; }
      S.own.view = view; save(); render3(); focusAfter('#c1-ct');
    } else if (S.mode === 'draw') {
      var i = S.marks.indexOf(view);
      if (i === -1) S.marks.push(view); else S.marks.splice(i, 1);
      save(); render3(); toast(i === -1 ? 'Markup added on ' + view : 'Markup removed from ' + view, true);
      focusAfter('#hd-3 .c1-hit[data-view="' + view + '"]');
    }
  }

  function onInput(e) {
    var t = e.target;
    if (t.id === 'c1-tq') { S.tq = t.value; save(); var pos = t.selectionStart; render2(); var n = $('#c1-tq'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } return; }
    if (t.id === 'c1-q') { S.q = t.value; save(); var p2 = t.selectionStart; render5(); var n2 = $('#c1-q'); if (n2) { n2.focus(); n2.setSelectionRange(p2, p2); } return; }
    if (t.id === 'c1-ct') { S.own.text = t.value; save(); return; }
    if (t.id === 'c1-dq') { S.dynq = t.value; save(); }
  }
  function onChange(e) {
    var t = e.target;
    if (!t.hasAttribute('data-sel')) return;
    var k = t.getAttribute('data-sel');
    S[k] = t.value; save();
    if (k === 'tsort' || k === 'tf') render2(); else render5();
    focusAfter('[data-sel="' + k + '"]');
  }
  function onSubmit(e) {
    var f = e.target.closest('form[data-form]');
    if (!f) return;
    e.preventDefault();
    if (f.getAttribute('data-form') === 'comment') {
      var txt = f.querySelector('textarea').value.trim();
      if (!txt) return;
      S.own.text = txt; S.own.saved = true; save(); render3(); render5(); pulse();
      toast('C03 saved on ' + S.own.view + ' · comments report updated (3 entries)');
      focusAfter('#hd-3 [data-act="confirm"]');
    }
    if (f.getAttribute('data-form') === 'dyn') {
      S.dynRun = true; save(); render4();
      toast('Dynamo preview · 5 FSW_RetainingWall instances listed', true);
      focusAfter('#hd-4 .c1-ok');
    }
  }

  document.addEventListener('keydown', function (e) {
    var hit = e.target.closest && e.target.closest('.c1-hit');
    if (hit && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (!S.result) placeOnView(hit.getAttribute('data-view')); return; }
    if (e.key !== 'Escape') return;
    if (bellOpen) { var bs = bellOpen; bellOpen = 0; rerender(bs); focusAfter('#hd-' + bs + ' [data-act="bell"]'); return; }
    if (menu) { var m = menu; menu = ''; render2(); focusAfter('#hd-2 [data-act="rmenu"][data-id="' + m + '"]'); return; }
    if (wmenu) { var w = wmenu; wmenu = ''; render6(); focusAfter('#hd-6 [data-act="wmenu"][data-id="' + w + '"]'); }
  });
  document.addEventListener('click', function (e) {
    if (menu && !e.target.closest('.c1-rmenu, [data-act="rmenu"]')) { menu = ''; render2(); }
    if (wmenu && !e.target.closest('.b-menu, [data-act="wmenu"]')) { wmenu = ''; render6(); }
    if (bellOpen && !e.target.closest('.b-bellwrap')) { var bs = bellOpen; bellOpen = 0; rerender(bs); }
  });
  // Arrow keys move through an open menu
  document.addEventListener('keydown', function (e) {
    var it = e.target.closest && e.target.closest('.b-menu [role="menuitem"]');
    if (!it || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    e.preventDefault();
    var items = Array.prototype.slice.call(it.closest('.b-menu').querySelectorAll('[role="menuitem"]:not([disabled])'));
    var i = items.indexOf(it) + (e.key === 'ArrowDown' ? 1 : -1);
    items[(i + items.length) % items.length].focus();
  });

  var host = document.getElementById('journey');
  if (!host) return;
  host.addEventListener('pointerdown', touch);
  host.addEventListener('keydown', touch);
  host.addEventListener('click', onClick);
  host.addEventListener('input', onInput);
  host.addEventListener('change', onChange);
  host.addEventListener('submit', onSubmit);
  // Keep the assistant's suggestions in step with the visible screen
  host.addEventListener('click', function (e) {
    if (e.target.closest('[role="tab"], [data-step], [data-go], [data-act="tview"], [data-act="model"]')) {
      setTimeout(function () { var p = $('#hd-ai'); if (p && !p.hidden) renderAI(false); }, 0);
    }
  });
  renderAll();
})();
