/* =========================================================
   Higherd – UC06 clickable demo (front end only, sample data)
   Turns the journey steps into working screens:
   01 Define demand · 02 Identify gap · 03 Discover talent
   04 Work Pillar Impact · 05 Documents
   Form input is kept in localStorage so it survives a reload.
   ========================================================= */
(function () {
  var KEY = 'higherd-uc06-demo-v2';

  var WOW = [
    { k: 'dni', l: 'D&I', c: '#F97316' },
    { k: 'ld', l: 'L&D', c: '#16A34A' },
    { k: 'eff', l: 'EFF', c: '#2563EB' },
    { k: 'agl', l: 'AGL', c: '#DB2777' },
    { k: 'esat', l: 'ESAT', c: '#5B21B6' },
    { k: 'esg', l: 'ESG', c: '#9F1239' }
  ];
  var WOW_NAME = { dni: 'Diversity & Inclusion', ld: 'Learning & Development', eff: 'Efficiency', agl: 'Agility', esat: 'Employee Satisfaction', esg: 'ESG' };

  var CAPS = [
    { k: 'pse', l: 'Protection system engineering' },
    { k: 'relay', l: 'Relay design / coordination' },
    { k: 'grid', l: 'Grid interface knowledge' },
    { k: 'comm', l: 'Commissioning evidence' }
  ];

  var CANDS = [
    { id: 'RK-113567', yrs: 8, weeks: 4, loc: 'Hamburg, DE', star: true, fte: 1, skill: 15, wow: 13, wd: '+6 EFF / −2 ESAT', note: 'Technical profile reviewed',
      sum: '8 years in AC-yard relay commissioning, IEC 61850 and FAT/SAT. Available in 4 weeks.',
      skills: ['Relays', 'IEC 61850', 'FAT/SAT', 'GOOSE', 'OMICRON', 'SCADA', 'Testing'] },
    { id: 'RK-113568', yrs: 5, weeks: 2, loc: 'Berlin, DE', star: true, fte: 1, skill: 13, wow: 9, wd: '+3 EFF / −3 AGL', note: 'Internal capacity check',
      sum: '5 years in HV-substation protection testing and grid interface work; ready in 2 weeks.',
      skills: ['Relays', 'HV Grid', 'SCADA', 'FAT/SAT', 'Testing'] },
    { id: 'RK-113569', yrs: 12, weeks: 8, loc: 'Munich, DE', star: true, fte: 0.5, skill: 9, wow: -1, wd: '+2 EFF / −1 ESAT', note: 'SAT skills gap',
      sum: '12 years in relay settings and protection design; SAT handover skills are limited.',
      skills: ['Settings', 'CT/VT', 'IEC 61850', 'Relay', 'Design', 'Protection', 'Studies'] },
    { id: 'RK-113570', yrs: 3, weeks: 6, loc: 'Leipzig, DE', star: false, fte: 0.5, skill: -2, wow: -6, wd: '+2 L&D / −4 AGL', note: 'Supervision needed',
      sum: '3 years in secondary-injection testing and protection IED diagnostics; site start in 6 weeks.',
      skills: ['OMICRON', 'Injection', 'IED', 'Testing', 'Relays', 'Diagnostics'] },
    { id: 'RK-113571', yrs: 6, weeks: 3, loc: 'Cologne, DE', star: false, fte: 0.5, skill: 3, wow: 1, wd: '+3 EFF / −1 ESAT', note: 'Relay gap to assess',
      sum: '6 years in IEC 61850 and RTU/SCADA interfaces; relay setting experience to verify.',
      skills: ['IEC 61850', 'GOOSE', 'SCADA', 'RTU', 'Signals', 'Relays'] },
    { id: 'RK-113572', yrs: 10, weeks: 5, loc: 'Stuttgart, DE', star: false, fte: 0.5, skill: 4, wow: -6, wd: '+4 EFF / −2 AGL', note: 'Scope fit to confirm',
      sum: '10 years of converter control integration; AC-yard protection commissioning is partial.',
      skills: ['HVDC', 'Control', 'Logic', 'Testing', 'SCADA', 'Converters', 'PLC'] }
  ];

  // Programme level (step 04): current → modeled / target
  var PILLARS = [
    { k: 'dni', l: 'D&I', c: 68, m: 68, t: 74, col: '#F97316' },
    { k: 'ld', l: 'L&D', c: 52, m: 60, t: 70, col: '#16A34A' },
    { k: 'eff', l: 'Efficiency', c: 60, m: 74, t: 74, col: '#2563EB' },
    { k: 'agl', l: 'Agility', c: 58, m: 74, t: 74, col: '#DB2777' },
    { k: 'esat', l: 'ESAT', c: 34, m: 40, t: 54, col: '#7C3AED' },
    { k: 'esg', l: 'ESG', c: 40, m: 40, t: 52, col: '#9F1239' }
  ];

  var ROLES = [
    { k: 'hrx', l: 'HR Expert', d: 'Workforce recommendation' },
    { k: 'hrd', l: 'HR Director', d: 'Current approval owner' },
    { k: 'ops', l: 'Operations Lead', d: 'Delivery impact assessment' },
    { k: 'fin', l: 'Finance Partner', d: 'Cost validation' },
    { k: 'spo', l: 'Programme Sponsor', d: 'Final authorization' }
  ];

  function defaults() {
    return {
      fte: 2,
      weeks: 8,
      route: 'Internal or external',
      comps: ['Protection systems', 'Relay settings', 'Grid coordination', 'Commissioning (preferred)'],
      wow: { dni: [70, 74], ld: [48, 65], eff: [61, 75], agl: [54, 70], esat: [42, 57], esg: [51, 59] },
      avail: { pse: 0, relay: 1, grid: 1, comm: 1 },
      view: 'overall',
      sort: 'impact',
      q: '',
      shortlist: ['RK-113567'],
      pillars: ['eff', 'agl'],
      approved: ['hrx'],
      escalated: false,
      interviews: {},
      doc: { cand: 'RK-113567', type: 'profile', lang: 'en', start: '2027-01-11', months: 12, rate: 780, hours: 40 },
      sent: {},
      savedAt: null
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
        return s;
      }
    } catch (e) { /* storage blocked: run with defaults */ }
    return d;
  }

  function save() {
    S.savedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
    var t = document.querySelectorAll('[data-saved]');
    for (var i = 0; i < t.length; i++) t[i].textContent = savedLabel();
  }

  function savedLabel() {
    if (!S.savedAt) return 'Sample data';
    var d = new Date(S.savedAt);
    return 'Saved ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  // ---------- helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function signed(n, unit) { return (n > 0 ? '+' : n < 0 ? '−' : '+') + Math.abs(n) + (unit || ''); }
  function fteTxt(n) { return (n % 1 ? n.toFixed(1) : n) + ' FTE'; }
  function cand(id) { for (var i = 0; i < CANDS.length; i++) if (CANDS[i].id === id) return CANDS[i]; return CANDS[0]; }
  function overall(c) { return Math.round((c.skill + c.wow) / 2); }
  function fmtDate(iso) {
    if (!iso) return '—';
    var p = iso.split('-');
    return p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : iso;
  }
  function money(n, lang) {
    var s = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'de' ? '.' : ',');
    return lang === 'de' ? s + ' €' : '€' + s;
  }
  function icon(id) { return '<svg aria-hidden="true" focusable="false"><use href="#' + id + '"/></svg>'; }

  function goTo(step) {
    var tab = document.getElementById('flow-tab-' + step);
    if (!tab) return;
    tab.click();
    var root = tab.closest('[data-tabs]');
    if (root) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  var HINTS = {
    1: 'Change the FTE or drag a target on the bars.',
    2: 'Use + and − to set the capacity you already have.',
    3: 'Add a candidate to the Talent Pool or arrange an interview.',
    4: 'Tick the Work Pillars, then escalate the decision.',
    5: 'Switch the document or the language.'
  };

  function chrome(step, title, role) {
    return '' +
      '<div class="hd-head">' +
        '<p class="hd-head__title">' + title + '</p>' +
      '</div>' +
      '<p class="hd-try"><b>Try it:</b> ' + HINTS[step] + '</p>';
  }

  function wpBar() {
    return '' +
      '<div class="hd-wp">' +
        '<p class="hd-eyebrow">Work package · WP-EL-042</p>' +
        '<p class="hd-wp__name">Converter Delivery / Electrical Engineering / Protection Engineer</p>' +
        '<p class="hd-wp__meta">' + fteTxt(S.fte) + ' · ready within ' + S.weeks + ' weeks</p>' +
      '</div>';
  }

  // =========================================================
  // 01 Define demand
  // =========================================================
  function render1() {
    var el = $('#hd-1'); if (!el) return;
    el.innerHTML =
      chrome(1, 'Define the requirement') +
      wpBar() +
      '<div class="hd-cols">' +
        '<section class="hd-card">' +
          '<p class="hd-card__title">Role</p>' +
          '<div class="hd-fields">' +
            '<div class="hd-field"><label for="hd-fte">Required FTE</label>' +
              '<div class="hd-stepper"><button type="button" data-act="fte" data-d="-0.5" aria-label="Less FTE">−</button>' +
              '<input id="hd-fte" type="text" inputmode="decimal" value="' + S.fte + '" readonly>' +
              '<button type="button" data-act="fte" data-d="0.5" aria-label="More FTE">+</button></div></div>' +
            '<div class="hd-field"><label for="hd-weeks">Ready within</label>' +
              '<select id="hd-weeks" data-in="weeks">' +
                [4, 8, 12].map(function (w) { return '<option value="' + w + '"' + (w == S.weeks ? ' selected' : '') + '>' + w + ' weeks</option>'; }).join('') +
              '</select></div>' +
          '</div>' +
          '<p class="hd-sub">Competencies</p>' +
          '<div class="hd-chips">' +
            S.comps.map(function (c, i) {
              return '<span class="hd-chip">' + esc(c) + '<button type="button" data-act="rmcomp" data-i="' + i + '" aria-label="Remove ' + esc(c) + '">×</button></span>';
            }).join('') +
          '</div>' +
          '<form class="hd-add" data-form="comp"><label class="hd-sr" for="hd-comp">Add competency</label>' +
            '<input id="hd-comp" type="text" placeholder="Add a competency" maxlength="40">' +
            '<button type="submit" class="hd-btn hd-btn--ghost">Add</button></form>' +
        '</section>' +
        '<section class="hd-card">' +
          '<p class="hd-card__title">Team targets</p>' +
          '<p class="hd-muted">Ways of Working: current → target</p>' +
          '<div class="hd-wow" id="hd-wow1">' + wowRows(true) + '</div>' +
        '</section>' +
      '</div>';
  }

  function wowRows(editable) {
    return WOW.map(function (d) {
      var v = S.wow[d.k], cur = v[0], tgt = v[1];
      return '' +
        '<div class="hd-wowrow">' +
          '<span class="hd-wowrow__l" title="' + WOW_NAME[d.k] + '">' + d.l + '</span>' +
          '<span class="hd-meter' + (editable ? ' is-edit' : '') + '">' +
            '<i class="hd-meter__fill" style="width:' + cur + '%;background:' + d.c + '"></i>' +
            '<i class="hd-meter__tgt" style="left:' + tgt + '%;border-color:' + d.c + '"></i>' +
            (editable ? '<input class="hd-range" type="range" min="0" max="100" value="' + tgt + '" data-wow="' + d.k + '" aria-label="' + WOW_NAME[d.k] + ' target, current ' + cur + '%">' : '') +
          '</span>' +
          '<span class="hd-wowrow__v">' + cur + '% → <b>' + tgt + '%</b></span>' +
        '</div>';
    }).join('');
  }

  // =========================================================
  // 02 Identify gap
  // =========================================================
  function render2() {
    var el = $('#hd-2'); if (!el) return;
    var maxGap = 0, maxCap = CAPS[0];
    CAPS.forEach(function (c) {
      var a = Math.min(S.avail[c.k], S.fte), g = S.fte - a;
      if (g > maxGap) { maxGap = g; maxCap = c; }
    });
    var gaps = WOW.map(function (d) { return { d: d, g: S.wow[d.k][1] - S.wow[d.k][0] }; })
      .sort(function (a, b) { return b.g - a.g; }).slice(0, 3);
    var n = function (x) { return x % 1 ? x.toFixed(1) : x; };

    el.innerHTML =
      chrome(2, 'Identify the gap') +
      '<div class="hd-cols">' +
        '<section class="hd-card">' +
          '<p class="hd-card__title">Capacity you already have</p>' +
          '<p class="hd-muted">Out of ' + fteTxt(S.fte) + ' needed per capability</p>' +
          CAPS.map(function (c) {
            var a = Math.min(S.avail[c.k], S.fte);
            return '' +
              '<div class="hd-cap">' +
                '<div class="hd-cap__top"><span class="hd-cap__name">' + c.l + '</span>' +
                  '<span class="hd-stepper hd-stepper--sm">' +
                    '<button type="button" data-act="avail" data-k="' + c.k + '" data-d="-0.5" aria-label="Less available for ' + c.l + '">−</button>' +
                    '<output class="' + (a === 0 ? 'is-bad' : a >= S.fte ? 'is-good' : '') + '">' + n(a) + ' / ' + n(S.fte) + '</output>' +
                    '<button type="button" data-act="avail" data-k="' + c.k + '" data-d="0.5" aria-label="More available for ' + c.l + '">+</button>' +
                  '</span></div>' +
                '<span class="hd-bar"><i style="width:' + (S.fte ? a / S.fte * 100 : 0) + '%"></i></span>' +
              '</div>';
          }).join('') +
        '</section>' +
        '<section class="hd-card">' +
          '<p class="hd-card__title">The gap</p>' +
          '<div class="hd-summary' + (maxGap > 0 ? '' : ' is-good') + '">' +
            (maxGap > 0
              ? '<strong>' + fteTxt(maxGap) + ' missing</strong><span>' + maxCap.l + ', needed within ' + S.weeks + ' weeks</span>'
              : '<strong>No gap</strong><span>The team covers the work package.</span>') +
          '</div>' +
          '<p class="hd-sub">Biggest Ways of Working gaps</p>' +
          '<div class="hd-gaps">' +
            gaps.map(function (x) {
              return '<div class="hd-gaprow"><span class="hd-dot" style="background:' + x.d.c + '"></span>' +
                '<span>' + WOW_NAME[x.d.k] + '</span><b>' + signed(x.g, ' pp') + '</b></div>';
            }).join('') +
          '</div>' +
        '</section>' +
      '</div>';
  }

  // =========================================================
  // 03 Discover talent
  // =========================================================
  function render3() {
    var el = $('#hd-3'); if (!el) return;
    el.innerHTML =
      chrome(3, 'Find candidates') +
      '<div class="hd-toolbar">' +
        '<label class="hd-search"><span class="hd-sr">Search candidates</span>' +
          '<input type="search" id="hd-q" placeholder="Search by skill, e.g. SCADA" value="' + esc(S.q) + '"></label>' +
        '<div class="hd-seg" role="group" aria-label="Impact view">' +
          [['overall', 'Overall'], ['wow', 'Team fit'], ['skill', 'Skills']].map(function (v) {
            return '<button type="button" data-act="view" data-v="' + v[0] + '" aria-pressed="' + (S.view === v[0]) + '">' + v[1] + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div id="hd-board"></div>' +
      '<div class="hd-shortbar" id="hd-shortbar"></div>';
    renderBoard();
  }

  function impactOf(c) { return S.view === 'wow' ? c.wow : S.view === 'skill' ? c.skill : overall(c); }

  function renderBoard() {
    var box = $('#hd-board'); if (!box) return;
    var q = S.q.trim().toLowerCase();
    var list = CANDS.filter(function (c) {
      return !q || (c.id + ' ' + c.sum + ' ' + c.skills.join(' ')).toLowerCase().indexOf(q) !== -1;
    }).sort(function (a, b) { return impactOf(b) - impactOf(a); });
    var label = { overall: 'impact', wow: 'team fit', skill: 'skills' }[S.view];

    box.innerHTML = list.length ? '<div class="hd-board">' + list.map(function (c) {
      var v = impactOf(c), on = S.shortlist.indexOf(c.id) !== -1, iv = S.interviews[c.id];
      var extra = c.skills.length - 3;
      return '' +
        '<article class="hd-cand' + (on ? ' is-on' : '') + '">' +
          '<div class="hd-cand__top">' +
            '<div><button type="button" class="hd-cand__id" data-act="profile" data-id="' + c.id + '" title="Open profile">' + c.id + '</button>' +
              (c.star ? ' <span class="hd-star" title="Top match">★</span>' : '') +
            '<p class="hd-cand__role">' + c.yrs + ' years · covers ' + fteTxt(c.fte) + '</p></div>' +
            '<span class="hd-impact ' + (v >= 0 ? 'is-up' : 'is-down') + '"><b>' + signed(v, '%') + '</b><small>' + label + '</small></span>' +
          '</div>' +
          '<div class="hd-tags">' + c.skills.slice(0, 3).map(function (s) { return '<span>' + s + '</span>'; }).join('') + (extra > 0 ? '<span>+' + extra + '</span>' : '') + '</div>' +
          (iv ? '<p class="hd-cand__iv">Interview ' + dayTxt(iv.d) + ' · ' + iv.t + '</p>' : '') +
          '<div class="hd-cand__btns">' +
            '<button type="button" class="hd-btn' + (on ? ' hd-btn--done' : '') + '" data-act="pool" data-id="' + c.id + '" aria-pressed="' + on + '">' + (on ? '✓ In Talent Pool' : 'Add to Talent Pool') + '</button>' +
            '<button type="button" class="hd-btn hd-btn--ghost' + (iv ? ' hd-btn--booked' : '') + '" data-act="interview" data-id="' + c.id + '">' + (iv ? 'Change interview' : 'Arrange interview') + '</button>' +
          '</div>' +
        '</article>';
    }).join('') + '</div>' : '<p class="hd-empty">No candidate matches “' + esc(S.q) + '”.</p>';
    renderShortbar();
  }

  function renderShortbar() {
    var bar = $('#hd-shortbar'); if (!bar) return;
    var cover = 0;
    S.shortlist.forEach(function (id) { cover += cand(id).fte; });
    var pct = S.fte ? Math.min(100, cover / S.fte * 100) : 100;
    var ivs = Object.keys(S.interviews).length;
    bar.innerHTML =
      '<div><p><b>Talent Pool covers ' + (cover % 1 ? cover.toFixed(1) : cover) + ' of ' + fteTxt(S.fte) + '</b>' +
        ' <span class="hd-muted">· ' + S.shortlist.length + ' in pool · ' + ivs + ' interview' + (ivs === 1 ? '' : 's') + ' booked</span></p>' +
      '<span class="hd-bar"><i style="width:' + pct + '%"></i></span></div>';
  }

  // Profile dialog
  function openProfile(id) {
    var c = cand(id), on = S.shortlist.indexOf(id) !== -1;
    var dlg = $('#hd-dialog');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'hd-dialog';
      dlg.className = 'hd-dialog hd';
      document.body.appendChild(dlg);
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg) dlg.close();
        var b = e.target.closest('[data-act]');
        if (!b) return;
        if (b.getAttribute('data-act') === 'close') dlg.close();
        var id = b.getAttribute('data-id');
        if (b.getAttribute('data-act') === 'pool') { togglePool(id); openProfile(id); }
        if (b.getAttribute('data-act') === 'interview') openInterview(id);
        if (b.getAttribute('data-act') === 'book') bookInterview(id);
        if (b.getAttribute('data-act') === 'cancelint') { delete S.interviews[id]; save(); renderBoard(); renderNav(); dlg.close(); toast('Interview with ' + id + ' cancelled'); }
        if (b.getAttribute('data-act') === 'docs') { S.doc.cand = b.getAttribute('data-id'); save(); render5(); dlg.close(); goTo(5); }
      });
    }
    dlg.innerHTML =
      '<div class="hd-dialog__head"><div><p class="hd-eyebrow">Candidate profile · anonymized</p><p class="hd-dialog__title">' + c.id + '</p>' +
        '<p class="hd-muted">P&amp;C Commissioning Engineer · ' + c.yrs + ' years · ' + c.loc + '</p></div>' +
        '<button type="button" class="hd-x" data-act="close" aria-label="Close">×</button></div>' +
      '<p>' + c.sum + '</p>' +
      '<div class="hd-stats">' +
        '<div><span>FTE coverage</span><b>+' + c.fte + ' FTE</b></div>' +
        '<div><span>Skills gap</span><b>' + signed(c.skill, '%') + '</b></div>' +
        '<div><span>WoW gap</span><b>' + signed(c.wow, '%') + '</b></div>' +
        '<div><span>Overall</span><b>' + signed(overall(c), '%') + '</b></div>' +
      '</div>' +
      '<p class="hd-sub">Skills</p><div class="hd-tags">' + c.skills.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div>' +
      '<dl class="hd-kv"><div><dt>Team WoW change</dt><dd>' + c.wd + '</dd></div><div><dt>Available</dt><dd>In ' + c.weeks + ' weeks</dd></div><div><dt>Assessment note</dt><dd>' + c.note + '</dd></div></dl>' +
      '<div class="hd-actions">' +
        '<button type="button" class="hd-btn hd-btn--ghost" data-act="docs" data-id="' + c.id + '">Create documents</button>' +
        '<button type="button" class="hd-btn hd-btn--ghost" data-act="interview" data-id="' + c.id + '">' + (S.interviews[id] ? 'Change interview' : 'Arrange interview') + '</button>' +
        '<button type="button" class="hd-btn' + (on ? ' hd-btn--done' : '') + '" data-act="pool" data-id="' + c.id + '">' + (on ? '✓ In Talent Pool' : 'Add to Talent Pool') + '</button>' +
      '</div>';
    if (!dlg.open) dlg.showModal();
  }

  function togglePool(id) {
    var i = S.shortlist.indexOf(id);
    if (i === -1) { S.shortlist.push(id); toast(id + ' added to the Talent Pool'); }
    else { S.shortlist.splice(i, 1); toast(id + ' removed from the Talent Pool'); }
    save(); renderBoard(); render5(); renderNav();
  }

  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function nextWorkday() {
    var d = new Date(); d.setDate(d.getDate() + 2);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return iso(d);
  }
  function dayTxt(isoDate) {
    var p = isoDate.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return DAYS[d.getDay()] + ' ' + p[2] + '.' + p[1] + '.';
  }

  function openInterview(id) {
    var dlg = $('#hd-dialog');
    if (!dlg) { openProfile(id); dlg = $('#hd-dialog'); }
    var iv = S.interviews[id] || { d: nextWorkday(), t: '10:00' };
    dlg.innerHTML =
      '<div class="hd-dialog__head"><div><p class="hd-eyebrow">Arrange interview</p><p class="hd-dialog__title">' + id + '</p>' +
        '<p class="hd-muted">Video call · 45 minutes · with the Engineering Manager</p></div>' +
        '<button type="button" class="hd-x" data-act="close" aria-label="Close">×</button></div>' +
      '<div class="hd-fields hd-mt">' +
        '<div class="hd-field"><label for="hd-iv-d">Date</label><input id="hd-iv-d" type="date" value="' + iv.d + '"></div>' +
        '<div class="hd-field"><label for="hd-iv-t">Time</label><select id="hd-iv-t">' +
          ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(function (t) { return '<option' + (t === iv.t ? ' selected' : '') + '>' + t + '</option>'; }).join('') +
        '</select></div>' +
      '</div>' +
      '<p class="hd-muted hd-mt">The candidate gets an invitation and the slot is added to the Calendar.</p>' +
      '<div class="hd-actions">' +
        (S.interviews[id]
          ? '<button type="button" class="hd-btn hd-btn--ghost" data-act="cancelint" data-id="' + id + '">Cancel interview</button>'
          : '<button type="button" class="hd-btn hd-btn--ghost" data-act="close">Cancel</button>') +
        '<button type="button" class="hd-btn" data-act="book" data-id="' + id + '">' + (S.interviews[id] ? 'Update invitation' : 'Send invitation') + '</button>' +
      '</div>';
    if (!dlg.open) dlg.showModal();
  }

  function bookInterview(id) {
    var d = $('#hd-iv-d').value || nextWorkday(), t = $('#hd-iv-t').value;
    var again = !!S.interviews[id];
    S.interviews[id] = { d: d, t: t };
    save(); renderBoard(); renderNav();
    $('#hd-dialog').close();
    toast((again ? 'Interview moved: ' : 'Invitation sent: ') + id + ', ' + dayTxt(d) + ' at ' + t);
  }

  // =========================================================
  // 04 Work Pillar Impact
  // =========================================================
  function gauge(p) {
    var gap = p.t - p.c, closed = gap > 0 ? Math.min(1, (p.m - p.c) / gap) : 1;
    var len = Math.PI * 70;
    return '' +
      '<article class="hd-gauge" style="--c:' + p.col + '">' +
        '<p class="hd-gauge__name">' + p.l + '</p>' +
        '<svg viewBox="0 0 180 100" aria-hidden="true">' +
          '<path d="M20 90 A70 70 0 0 1 160 90" fill="none" stroke="#E5E7EB" stroke-width="14" stroke-linecap="round"/>' +
          '<path d="M20 90 A70 70 0 0 1 160 90" fill="none" stroke="' + p.col + '" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + (len * closed).toFixed(1) + ' ' + len.toFixed(1) + '"/>' +
        '</svg>' +
        '<p class="hd-gauge__val">' + signed(p.m - p.c, ' pp') + '</p>' +
        '<p class="hd-gauge__flag' + (p.m >= p.t ? ' is-ok' : '') + '">' + (p.m >= p.t ? 'Target reached' : (p.t - p.m) + ' pp to target') + '</p>' +
      '</article>';
  }

  function render4() {
    var el = $('#hd-4'); if (!el) return;
    var sel = PILLARS.filter(function (p) { return S.pillars.indexOf(p.k) !== -1; });
    var n = sel.length, pp = 0, mod = 0;
    sel.forEach(function (p) { pp += p.m - p.c; mod += p.m; });
    var r1 = function (x) { return Math.round(x * 10) / 10; };

    el.innerHTML =
      chrome(4, 'Work Pillar Impact') +
      '<div class="hd-wp">' +
        '<p class="hd-eyebrow">Decision WM-204981</p>' +
        '<p class="hd-wp__name">Move 120 specialists to close a 430 FTE gap</p>' +
      '</div>' +
      '<div class="hd-cols hd-cols--wide">' +
        '<section>' +
          (n
            ? '<div class="hd-gauges">' + sel.map(gauge).join('') + '</div>' +
              '<div class="hd-summary hd-summary--row">' +
                '<div><span>Expected change</span><b>' + signed(r1(pp / n), ' pp') + '</b></div>' +
                '<div><span>Modeled position</span><b>' + r1(mod / n) + ' / 100</b></div>' +
              '</div>'
            : '<p class="hd-empty">Tick at least one Work Pillar.</p>') +
        '</section>' +
        '<section class="hd-card">' +
          '<p class="hd-card__title">Work Pillars</p>' +
          '<div class="hd-picks">' +
            PILLARS.map(function (p) {
              var on = S.pillars.indexOf(p.k) !== -1;
              return '<label class="hd-pick' + (on ? ' is-on' : '') + '"><input type="checkbox" data-pillar="' + p.k + '"' + (on ? ' checked' : '') + '>' +
                '<span class="hd-pick__l">' + p.l + '</span>' +
                '<b style="color:' + (p.m > p.c ? '#16A34A' : '#94A3B8') + '">' + signed(p.m - p.c, ' pp') + '</b></label>';
            }).join('') +
          '</div>' +
        '</section>' +
      '</div>' +
      '<div id="hd-approval"></div>';
    renderApproval();
  }

  function stageOf() {
    var a = S.approved;
    if (a.indexOf('hrd') === -1) return ['hrd'];
    var par = ['ops', 'fin'].filter(function (k) { return a.indexOf(k) === -1; });
    if (par.length) return par;
    if (a.indexOf('spo') === -1) return ['spo'];
    return [];
  }

  function renderApproval() {
    var box = $('#hd-approval'); if (!box) return;
    var up = S.escalated;
    box.innerHTML =
      '<section class="hd-card">' +
        '<div class="hd-rowhead"><p class="hd-card__title">Approval</p><p class="hd-eyebrow">You are the HR Expert</p></div>' +
        '<ol class="hd-flow">' +
          ROLES.map(function (r) {
            var cls = '', st = 'Pending';
            if (r.k === 'hrx') { cls = ' is-done'; st = up ? 'Escalated' : 'Prepared'; }
            else if (up && r.k === 'hrd') { cls = ' is-now'; st = 'In review'; }
            return '<li class="hd-role' + cls + '">' +
              '<span class="hd-role__dot" aria-hidden="true">' + (cls === ' is-done' ? '✓' : '') + '</span>' +
              '<span><b>' + r.l + (r.k === 'hrx' ? ' (you)' : '') + '</b><em>' + st + '</em></span>' +
            '</li>';
          }).join('') +
        '</ol>' +
        (up
          ? '<div class="hd-esc is-done"><p><b>Escalated to the HR Director</b> · ' + up + '. Waiting for their review.</p>' +
              '<button type="button" class="hd-link" data-act="resetappr">Undo</button></div>'
          : '<div class="hd-esc"><p>Your recommendation is ready. The HR Director reviews it next.</p>' +
              '<button type="button" class="hd-btn" data-act="escalate">Escalate to HR Director</button></div>') +
      '</section>';
  }

  // =========================================================
  // 05 Documents
  // =========================================================
  var T = {
    en: {
      profile: 'Candidate profile', offer: 'Job offer', contract: 'Service contract',
      role: 'Protection & Control Commissioning Engineer',
      lRole: 'Role', lEng: 'Engagement', eng: 'Contract', lLoc: 'Location', loc: 'Onsite, Germany', lStart: 'Start date', lDur: 'Duration',
      months: 'months', lRate: 'Day rate', lHours: 'Hours per week', lReady: 'Available', inWeeks: 'in %s weeks', lWp: 'Work package',
      lExp: 'Experience', years: 'years', lSkills: 'Skills', lImpact: 'Impact on the team', lFte: 'FTE coverage', lSkill: 'Skills gap closure',
      lWow: 'WoW gap closure', lOverall: 'Overall impact', lWowc: 'Team WoW change', lNote: 'Assessment note', lSummary: 'Summary',
      anon: 'Anonymized profile. Name and contact details are shared only after the candidate gives consent.',
      dear: 'Dear candidate %s,',
      offerBody: 'Higherd, on behalf of Converter Delivery, is pleased to offer you the role of Protection & Control Commissioning Engineer for work package WP-EL-042.',
      offerValid: 'This offer is valid for 14 days. Your name and contact details are shared with the project only after you give consent.',
      between: 'between', client: 'Converter Delivery (client), represented by Higherd', contractor: 'Contractor: candidate %s',
      c1: 'Scope', c1t: 'Protection and control commissioning for work package WP-EL-042, covering: %s.',
      c2: 'Term', c2t: 'From %s for %m months.',
      c3: 'Fees', c3t: '%r per day, about %h hours per week. Estimated contract value: %v.',
      c4: 'Evidence', c4t: 'Qualification evidence, commissioning records and test reports are provided before site start.',
      c5: 'Data protection', c5t: 'Personal data is processed only for this engagement and with the contractor’s consent.',
      sign1: 'For the client', sign2: 'Contractor', date: 'Date', issued: 'Issued'
    },
    de: {
      profile: 'Kandidatenprofil', offer: 'Stellenangebot', contract: 'Dienstleistungsvertrag',
      role: 'Protection & Control Commissioning Engineer',
      lRole: 'Position', lEng: 'Beschäftigungsart', eng: 'Vertrag', lLoc: 'Einsatzort', loc: 'Vor Ort, Deutschland', lStart: 'Startdatum', lDur: 'Laufzeit',
      months: 'Monate', lRate: 'Tagessatz', lHours: 'Wochenstunden', lReady: 'Verfügbar', inWeeks: 'in %s Wochen', lWp: 'Arbeitspaket',
      lExp: 'Erfahrung', years: 'Jahre', lSkills: 'Kompetenzen', lImpact: 'Wirkung auf das Team', lFte: 'FTE-Abdeckung', lSkill: 'Schließung Kompetenzlücke',
      lWow: 'Schließung WoW-Lücke', lOverall: 'Gesamtwirkung', lWowc: 'WoW-Veränderung im Team', lNote: 'Bewertungshinweis', lSummary: 'Zusammenfassung',
      anon: 'Anonymisiertes Profil. Name und Kontaktdaten werden erst nach Einwilligung der Kandidatin bzw. des Kandidaten weitergegeben.',
      dear: 'Sehr geehrte Kandidatin, sehr geehrter Kandidat %s,',
      offerBody: 'Higherd freut sich, Ihnen im Auftrag von Converter Delivery die Position Protection & Control Commissioning Engineer für das Arbeitspaket WP-EL-042 anzubieten.',
      offerValid: 'Dieses Angebot ist 14 Tage gültig. Name und Kontaktdaten werden erst nach Ihrer Einwilligung an das Projekt weitergegeben.',
      between: 'zwischen', client: 'Converter Delivery (Auftraggeber), vertreten durch Higherd', contractor: 'Auftragnehmer: Kandidat/in %s',
      c1: 'Leistungsumfang', c1t: 'Schutz- und Leittechnik-Inbetriebnahme für das Arbeitspaket WP-EL-042, insbesondere: %s.',
      c2: 'Laufzeit', c2t: 'Ab dem %s für %m Monate.',
      c3: 'Vergütung', c3t: '%r pro Tag, etwa %h Stunden pro Woche. Geschätzter Auftragswert: %v.',
      c4: 'Nachweise', c4t: 'Qualifikationsnachweise, Inbetriebnahmeprotokolle und Prüfberichte werden vor Einsatzbeginn vorgelegt.',
      c5: 'Datenschutz', c5t: 'Personenbezogene Daten werden nur für diesen Auftrag und mit Einwilligung des Auftragnehmers verarbeitet.',
      sign1: 'Für den Auftraggeber', sign2: 'Auftragnehmer', date: 'Datum', issued: 'Ausgestellt'
    }
  };

  function today() {
    var d = new Date();
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  function docHTML() {
    var D = S.doc, t = T[D.lang], c = cand(D.cand);
    var head = '<header class="doc__head"><img src="/assets/img/logo.svg?v=8" alt="Higherd" width="110" height="35">' +
      '<span>' + t.issued + ' ' + today() + '<br>WP-EL-042</span></header>';
    var row = function (k, v) { return '<tr><th>' + k + '</th><td>' + v + '</td></tr>'; };

    if (D.type === 'profile') {
      return head +
        '<p class="doc__kicker">' + t.profile + '</p><h1 class="doc__title">' + c.id + '</h1>' +
        '<p class="doc__lead">' + t.role + ' · ' + c.yrs + ' ' + t.years + ' · ' + c.loc + '</p>' +
        '<h2>' + t.lSummary + '</h2><p>' + c.sum + '</p>' +
        '<table>' + row(t.lExp, c.yrs + ' ' + t.years) + row(t.lReady, t.inWeeks.replace('%s', c.weeks)) + row(t.lWp, 'WP-EL-042 · Converter Delivery') + '</table>' +
        '<h2>' + t.lSkills + '</h2><p class="doc__tags">' + c.skills.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</p>' +
        '<h2>' + t.lImpact + '</h2>' +
        '<table>' + row(t.lFte, '+' + c.fte + ' FTE') + row(t.lSkill, signed(c.skill, '%')) + row(t.lWow, signed(c.wow, '%')) +
          row(t.lOverall, '<b>' + signed(overall(c), '%') + '</b>') + row(t.lWowc, c.wd) + row(t.lNote, c.note) + '</table>' +
        '<p class="doc__small">' + t.anon + '</p>';
    }

    if (D.type === 'offer') {
      return head +
        '<p class="doc__kicker">' + t.offer + '</p><h1 class="doc__title">' + t.role + '</h1>' +
        '<p>' + t.dear.replace('%s', c.id) + '</p><p>' + t.offerBody + '</p>' +
        '<table>' + row(t.lRole, t.role) + row(t.lEng, t.eng + ' · ' + esc(S.route)) + row(t.lLoc, t.loc) + row(t.lStart, fmtDate(D.start)) +
          row(t.lDur, D.months + ' ' + t.months) + row(t.lRate, money(D.rate, D.lang)) + row(t.lHours, D.hours) + '</table>' +
        '<p>' + t.offerValid + '</p>' +
        signs(t);
    }

    var days = Math.round(D.months * 21 * D.hours / 40);
    return head +
      '<p class="doc__kicker">' + t.contract + '</p><h1 class="doc__title">' + t.contract + '</h1>' +
      '<p>' + t.between + '<br><b>' + t.client + '</b><br><b>' + t.contractor.replace('%s', c.id) + '</b></p>' +
      '<ol class="doc__clauses">' +
        '<li><b>' + t.c1 + '.</b> ' + t.c1t.replace('%s', S.comps.map(esc).join(', ')) + '</li>' +
        '<li><b>' + t.c2 + '.</b> ' + t.c2t.replace('%s', fmtDate(D.start)).replace('%m', D.months) + '</li>' +
        '<li><b>' + t.c3 + '.</b> ' + t.c3t.replace('%r', money(D.rate, D.lang)).replace('%h', D.hours).replace('%v', money(D.rate * days, D.lang)) + '</li>' +
        '<li><b>' + t.c4 + '.</b> ' + t.c4t + '</li>' +
        '<li><b>' + t.c5 + '.</b> ' + t.c5t + '</li>' +
      '</ol>' +
      signs(t);
  }

  function signs(t) {
    return '<div class="doc__signs"><div><span></span>' + t.sign1 + ' · ' + t.date + '</div><div><span></span>' + t.sign2 + ' · ' + t.date + '</div></div>';
  }

  function render5() {
    var el = $('#hd-5'); if (!el) return;
    var D = S.doc;
    var ids = S.shortlist.slice();
    CANDS.forEach(function (c) { if (ids.indexOf(c.id) === -1) ids.push(c.id); });
    var key = D.cand + ':' + D.type + ':' + D.lang;

    el.innerHTML =
      chrome(5, 'Create documents') +
      '<div class="hd-cols hd-cols--doc">' +
        '<section class="hd-card">' +
          '<div class="hd-field"><label for="hd-cand">Candidate</label><select id="hd-cand" data-doc="cand">' +
            ids.map(function (id) {
              return '<option value="' + id + '"' + (id === D.cand ? ' selected' : '') + '>' + id + (S.shortlist.indexOf(id) !== -1 ? ' · in Talent Pool' : '') + '</option>';
            }).join('') +
          '</select></div>' +
          '<p class="hd-sub">Document</p>' +
          '<div class="hd-seg hd-seg--full" role="group" aria-label="Document type">' +
            [['profile', 'Profile'], ['offer', 'Job offer'], ['contract', 'Contract']].map(function (v) {
              return '<button type="button" data-act="dtype" data-v="' + v[0] + '" aria-pressed="' + (D.type === v[0]) + '">' + v[1] + '</button>';
            }).join('') +
          '</div>' +
          '<p class="hd-sub">Language</p>' +
          '<div class="hd-seg" role="group" aria-label="Language">' +
            [['en', 'English'], ['de', 'Deutsch']].map(function (v) {
              return '<button type="button" data-act="dlang" data-v="' + v[0] + '" aria-pressed="' + (D.lang === v[0]) + '">' + v[1] + '</button>';
            }).join('') +
          '</div>' +
          (D.type === 'profile' ? '' :
            '<div class="hd-fields hd-mt">' +
              '<div class="hd-field"><label for="hd-start">Start date</label><input id="hd-start" type="date" data-doc="start" value="' + D.start + '"></div>' +
              '<div class="hd-field"><label for="hd-months">Months</label><input id="hd-months" type="number" min="1" max="36" data-doc="months" value="' + D.months + '"></div>' +
              '<div class="hd-field"><label for="hd-rate">Day rate (€)</label><input id="hd-rate" type="number" min="0" step="10" data-doc="rate" value="' + D.rate + '"></div>' +
            '</div>') +
          '<div class="hd-actions hd-actions--stack">' +
            '<button type="button" class="hd-btn" data-act="print">Download PDF</button>' +
            '<button type="button" class="hd-btn hd-btn--ghost' + (S.sent[key] ? ' hd-btn--done' : '') + '" data-act="send">' + (S.sent[key] ? '✓ Sent' : 'Mark as sent') + '</button>' +
          '</div>' +
        '</section>' +
        '<section class="hd-paperwrap"><div class="doc" id="hd-doc">' + docHTML() + '</div></section>' +
      '</div>';
  }

  var DOC_CSS =
    'body{margin:0;font:13px/1.55 Inter,system-ui,Arial,sans-serif;color:#0F172A}' +
    '.doc{max-width:720px;margin:0 auto;padding:40px}' +
    '.doc__head{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:2px solid #4A0FA8;margin-bottom:24px;font-size:11px;color:#64748B;text-align:right}' +
    '.doc__kicker{margin:0;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#4A0FA8}' +
    '.doc__title{margin:4px 0 6px;font-size:22px}.doc__lead{margin:0 0 12px;color:#475569}' +
    'h2{margin:20px 0 6px;font-size:14px}table{width:100%;border-collapse:collapse;margin:10px 0}' +
    'th,td{padding:6px 0;border-bottom:1px solid #E5E7EB;text-align:left;vertical-align:top}th{width:42%;font-weight:500;color:#64748B}' +
    '.doc__tags span{display:inline-block;margin:0 6px 6px 0;padding:2px 8px;border:1px solid #E5E7EB;border-radius:99px;font-size:11px}' +
    '.doc__small{margin-top:20px;font-size:11px;color:#64748B}.doc__clauses{padding-left:18px}.doc__clauses li{margin-bottom:8px}' +
    '.doc__signs{display:flex;gap:32px;margin-top:48px;font-size:11px;color:#64748B}.doc__signs div{flex:1}.doc__signs span{display:block;height:36px;border-bottom:1px solid #94A3B8;margin-bottom:6px}';

  function printDoc() {
    var D = S.doc, t = T[D.lang];
    var name = t[D.type] + ' ' + D.cand;
    var w = window.open('', '_blank');
    if (!w) { alert('Allow pop-ups for this page to download the PDF.'); return; }
    w.document.write('<!DOCTYPE html><html lang="' + D.lang + '"><head><meta charset="utf-8"><title>' + name + '</title>' +
      '<base href="' + location.origin + '/"><style>' + DOC_CSS + '</style></head><body><div class="doc">' + docHTML() + '</div>' +
      '<script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>');
    w.document.close();
  }

  // =========================================================
  // Pulse: marks the first thing to try in each step until used
  // =========================================================
  var PULSE = {
    1: '[data-act="fte"][data-d="0.5"]',
    2: '[data-act="avail"][data-d="0.5"]',
    3: '.hd-cand [data-act="pool"][aria-pressed="false"]',
    4: '.hd-pick:not(.is-on)',
    5: '[data-act="dlang"][aria-pressed="false"]'
  };
  var touched = {};

  function pulse() {
    Object.keys(PULSE).forEach(function (n) {
      var box = document.getElementById('hd-' + n);
      if (!box) return;
      var old = box.querySelectorAll('.hd-pulse');
      for (var i = 0; i < old.length; i++) old[i].classList.remove('hd-pulse');
      if (touched[n]) return;
      var el = box.querySelector(PULSE[n]);
      if (el) el.classList.add('hd-pulse');
    });
  }

  function touch(e) {
    var box = e.target.closest && e.target.closest('.hd[id^="hd-"]');
    if (!box || e.target.closest('[data-act="reset"]')) return;
    var n = box.id.slice(3);
    if (touched[n]) return;
    touched[n] = true;
    pulse();
  }

  // =========================================================
  // Events
  // =========================================================
  // =========================================================
  // App frame: window bar + locked Higherd menu around each screen
  // =========================================================
  var NAV = [
    ['dash', 'Dashboard', 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z'],
    ['jobs', 'Job Board', 'M3 7h18v13H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'],
    ['align', 'Alignment', 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10z'],
    ['cands', 'Candidates', 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'],
    ['pool', 'Talent Pool', 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z'],
    ['cal', 'Calendar', 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18'],
    ['dec', 'Decisions', 'M12 2l10 10-10 10L2 12z'],
    ['docs', 'Documents', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6'],
    ['set', 'Settings', 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1']
  ];
  var STEP_NAV = { 1: 'jobs', 2: 'align', 3: 'cands', 4: 'dec', 5: 'docs' };
  var STEP_ROLE = { 1: 'Engineering Manager', 2: 'Engineering Manager', 3: 'Recruiter', 4: 'HR Expert', 5: 'Recruiter' };

  function navHTML(step) {
    var counts = { pool: S.shortlist.length, cal: Object.keys(S.interviews).length };
    return '<nav class="hd-side" aria-label="Higherd menu">' +
      '<p class="hd-side__logo"><img src="/assets/img/logo.svg?v=8" alt="Higherd" width="96" height="31"></p>' +
      '<ul>' + NAV.map(function (n) {
        var on = STEP_NAV[step] === n[0];
        return '<li><span class="hd-nav' + (on ? ' is-active' : ' is-locked') + '"' +
          (on ? ' aria-current="page"' : ' aria-disabled="true" title="Locked in this demo"') + '>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + n[2] + '"/></svg>' +
          '<span class="hd-nav__l">' + n[1] + '</span>' +
          (counts[n[0]] ? '<em class="hd-nav__n">' + counts[n[0]] + '</em>' : '') +
          (on ? '' : '<svg class="hd-nav__lock" aria-hidden="true"><use href="#icon-lock"/></svg>') +
        '</span></li>';
      }).join('') + '</ul></nav>';
  }

  function frame(el, step) {
    var main = document.createElement('div');
    main.className = 'hd-main';
    while (el.firstChild) main.appendChild(el.firstChild);
    el.innerHTML =
      '<div class="hd-chrome">' +
        '<span class="hd-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="hd-chrome__title">Signed in as ' + STEP_ROLE[step] + '</span>' +
        '<button type="button" class="hd-link" data-act="reset">Reset demo</button>' +
      '</div>' +
      '<div class="hd-shell">' + navHTML(step) + '</div>';
    el.querySelector('.hd-shell').appendChild(main);
  }

  // Menu badges (Talent Pool, Calendar) change without a full re-render
  function renderNav() {
    for (var n = 1; n <= 5; n++) {
      var side = document.querySelector('#hd-' + n + ' .hd-side');
      if (side) side.outerHTML = navHTML(n);
    }
  }

  function framed(fn, n) {
    return function () { fn(); var el = document.getElementById('hd-' + n); if (el) frame(el, n); };
  }
  render1 = framed(render1, 1);
  render2 = framed(render2, 2);
  render3 = framed(render3, 3);
  render4 = framed(render4, 4);
  render5 = framed(render5, 5);

  // Confirmation message after an action
  var toastTimer;
  function toast(msg) {
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

  function renderAll() { render1(); render2(); render3(); render4(); render5(); }

  function onClick(e) {
    var go = e.target.closest('[data-go]');
    if (go) { goTo(Number(go.getAttribute('data-go'))); return; }
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');

    if (act === 'reset') {
      if (!confirm('Reset the demo to the sample data?')) return;
      try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
      S = defaults(); renderAll(); return;
    }
    if (act === 'fte') {
      S.fte = Math.max(0.5, Math.min(10, S.fte + Number(b.getAttribute('data-d'))));
      save(); renderAll(); return;
    }
    if (act === 'rmcomp') {
      S.comps.splice(Number(b.getAttribute('data-i')), 1); save(); render1(); render5(); return;
    }
    if (act === 'avail') {
      var k = b.getAttribute('data-k');
      S.avail[k] = Math.max(0, Math.min(S.fte, Math.min(S.avail[k], S.fte) + Number(b.getAttribute('data-d'))));
      save(); render2(); return;
    }
    if (act === 'view') { S.view = b.getAttribute('data-v'); save(); render3(); return; }
    if (act === 'profile') { openProfile(b.getAttribute('data-id')); return; }
    if (act === 'pool') { togglePool(b.getAttribute('data-id')); return; }
    if (act === 'interview') { openInterview(b.getAttribute('data-id')); return; }
    if (act === 'escalate') {
      var d = new Date();
      S.escalated = today() + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
      save(); render4();
      toast('Decision WM-204981 escalated to the HR Director');
      return;
    }
    if (act === 'resetappr') { S.escalated = false; save(); render4(); return; }
    if (act === 'dtype') { S.doc.type = b.getAttribute('data-v'); save(); render5(); return; }
    if (act === 'dlang') { S.doc.lang = b.getAttribute('data-v'); save(); render5(); return; }
    if (act === 'print') { printDoc(); return; }
    if (act === 'send') {
      var key = S.doc.cand + ':' + S.doc.type + ':' + S.doc.lang;
      var names = { profile: 'Candidate profile', offer: 'Job offer', contract: 'Contract' };
      if (S.sent[key]) delete S.sent[key];
      else { S.sent[key] = today(); toast(names[S.doc.type] + ' sent to ' + S.doc.cand); }
      save(); render5(); return;
    }
  }

  function onInput(e) {
    var t = e.target;
    if (t.hasAttribute('data-wow')) {
      var w = S.wow[t.getAttribute('data-wow')];
      if (Number(t.value) < w[0]) t.value = w[0]; // target never below current
      w[1] = Number(t.value);
      save();
      var row = t.closest('.hd-wowrow');
      row.querySelector('.hd-meter__tgt').style.left = t.value + '%';
      row.querySelector('.hd-wowrow__v b').textContent = t.value + '%';
      render2();
      return;
    }
    if (t.id === 'hd-q') { S.q = t.value; save(); renderBoard(); return; }
    if (t.hasAttribute('data-doc') && t.tagName === 'INPUT') {
      var k = t.getAttribute('data-doc');
      S.doc[k] = t.type === 'number' ? Math.max(Number(t.min) || 0, Number(t.value) || 0) : t.value;
      save();
      $('#hd-doc').innerHTML = docHTML();
    }
  }

  function onChange(e) {
    var t = e.target;
    if (t.getAttribute('data-in') === 'weeks') { S.weeks = Number(t.value); save(); renderAll(); return; }
    if (t.getAttribute('data-in') === 'route') { S.route = t.value; save(); render5(); return; }
    if (t.getAttribute('data-in') === 'sort') { S.sort = t.value; save(); renderBoard(); return; }
    if (t.hasAttribute('data-pillar')) {
      var k = t.getAttribute('data-pillar'), i = S.pillars.indexOf(k);
      if (t.checked && i === -1) S.pillars.push(k);
      if (!t.checked && i !== -1) S.pillars.splice(i, 1);
      save(); render4(); return;
    }
    if (t.getAttribute('data-doc') === 'cand') { S.doc.cand = t.value; save(); render5(); }
  }

  function onSubmit(e) {
    var f = e.target.closest('[data-form="comp"]');
    if (!f) return;
    e.preventDefault();
    var input = f.querySelector('input'), v = input.value.trim();
    if (v && S.comps.indexOf(v) === -1) { S.comps.push(v); save(); render1(); render5(); }
    var again = $('#hd-comp'); if (again) again.focus();
  }

  var host = document.getElementById('journey');
  if (!host) return;
  host.addEventListener('pointerdown', touch);
  host.addEventListener('keydown', touch);
  host.addEventListener('click', onClick);
  host.addEventListener('input', onInput);
  host.addEventListener('change', onChange);
  host.addEventListener('submit', onSubmit);
  ['click', 'input', 'change', 'submit'].forEach(function (ev) {
    host.addEventListener(ev, function () { setTimeout(pulse, 0); });
  });
  renderAll();
  pulse();
})();
