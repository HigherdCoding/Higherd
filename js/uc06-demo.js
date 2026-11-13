/* =========================================================
   Higherd – UC06 clickable demo (front end only, sample data)
   Follows the Higherd company app screens from the Figma file:
   01 Dashboard → 02 Gap → 03 Post a job (Job Details) or Find
   candidate (Candidates Profile) → 04 Talent Pool (Report View with
   the barometers) → 05 Workforce Alignment (Decision Impact).
   Higherd AI answers suggested questions on every screen.
   State is kept in localStorage so it survives a reload.
   ========================================================= */
(function () {
  var KEY = 'higherd-uc06-demo-v5';

  // ---------- sample data ----------
  var DIMS = [
    { k: 'dni', l: 'D&I', n: 'Diversity & Inclusion', c: '#F59E0B' },
    { k: 'ld', l: 'L&D', n: 'Learning & Development', c: '#22C55E' },
    { k: 'eff', l: 'EFF', n: 'Efficiency', c: '#2563EB' },
    { k: 'agl', l: 'AGL', n: 'Agility', c: '#C026D3' },
    { k: 'esat', l: 'ESAT', n: 'Employee Satisfaction', c: '#6D28D9' },
    { k: 'esg', l: 'ESG', n: 'ESG Goals', c: '#9F1239' }
  ];
  var BASE = { dni: 70, ld: 50, eff: 60, agl: 58, esat: 20, esg: 40 };

  // wow: impact on the team per dimension, in DIMS order
  var CANDS = [
    { id: 'RK-113567', yrs: 8, weeks: 4, loc: 'Hamburg', fte: 1, match: 95, wow: [1, 0, 6, 1, -2, 0], en: 5, de: 5,
      sum: '8 years in AC-yard relay commissioning, IEC 61850 and FAT/SAT. Available in 4 weeks.',
      skills: ['Relays', 'IEC 61850', 'FAT/SAT', 'GOOSE', 'OMICRON', 'SCADA'],
      exp: [['Senior P&C Commissioning Engineer', 'GridTech Services GmbH | Hamburg | 2020 – Present', 'Commissioned protection and control for three 380 kV AC yards: relay configuration, IEC 61850 station bus and FAT/SAT.'],
            ['Protection Test Engineer', 'Nordwind Energie | Kiel | 2017 – 2020', 'Secondary injection testing and handover documentation for onshore wind substations.']] },
    { id: 'RK-113568', yrs: 5, weeks: 2, loc: 'Berlin', fte: 1, match: 90, wow: [0, 2, 3, 4, 1, 0], en: 4, de: 5,
      sum: '5 years in HV-substation protection testing and grid interface work. Ready in 2 weeks.',
      skills: ['Relays', 'HV Grid', 'SCADA', 'FAT/SAT', 'Testing'],
      exp: [['Protection Testing Engineer', 'HV Netz Services | Berlin | 2021 – Present', 'Protection testing and grid interface checks for 110 kV substations.'],
            ['Electrical Engineer', 'Stadtwerke Projekt | Potsdam | 2020 – 2021', 'Supported SCADA integration and FAT for distribution substations.']] },
    { id: 'RK-113569', yrs: 12, weeks: 8, loc: 'Munich', fte: 0.5, match: 86, wow: [0, 1, 2, 0, -1, 0], en: 4, de: 5,
      sum: '12 years in relay settings and protection design. SAT handover skills are limited.',
      skills: ['Settings', 'CT/VT', 'IEC 61850', 'Protection', 'Studies'],
      exp: [['Lead Protection Design Engineer', 'Energie Design AG | Munich | 2015 – Present', 'Relay settings, CT/VT dimensioning and protection studies for transmission projects.'],
            ['Protection Engineer', 'Alpen Grid | Innsbruck | 2013 – 2015', 'Protection coordination studies and settings reviews.']] },
    { id: 'RK-113571', yrs: 6, weeks: 3, loc: 'Cologne', fte: 0.5, match: 81, wow: [1, 0, 3, 1, -1, 0], en: 5, de: 4,
      sum: '6 years in IEC 61850 and RTU/SCADA interfaces. Relay setting experience to verify.',
      skills: ['IEC 61850', 'GOOSE', 'SCADA', 'RTU', 'Signals'],
      exp: [['SCADA & Automation Engineer', 'Rhein Automation | Cologne | 2019 – Present', 'IEC 61850 engineering, GOOSE messaging and RTU integration.'],
            ['Controls Engineer', 'Westnetz Projekt | Essen | 2018 – 2019', 'Signal lists and SCADA point testing.']] },
    { id: 'RK-113570', yrs: 3, weeks: 6, loc: 'Leipzig', fte: 0.5, match: 73, wow: [0, 3, -1, -4, 0, 0], en: 4, de: 5,
      sum: '3 years in secondary-injection testing and protection IED diagnostics. Needs supervision.',
      skills: ['OMICRON', 'Injection', 'IED', 'Testing', 'Relays'],
      exp: [['Junior Test Engineer', 'PrüfTech | Leipzig | 2023 – Present', 'Secondary injection tests and IED diagnostics under supervision.'],
            ['Graduate Engineer', 'Sachsen Energie | Dresden | 2022 – 2023', 'Testing support for substation retrofits.']] },
    { id: 'RK-113572', yrs: 10, weeks: 5, loc: 'Stuttgart', fte: 0.5, match: 68, wow: [0, 0, 4, -2, 0, 1], en: 5, de: 4,
      sum: '10 years of converter control integration. AC-yard protection commissioning is partial.',
      skills: ['HVDC', 'Control', 'Logic', 'Testing', 'SCADA'],
      exp: [['Converter Control Engineer', 'HVDC Systems | Stuttgart | 2016 – Present', 'Control and protection integration for HVDC converter stations.'],
            ['Automation Engineer', 'Industrie Steuerung | Ulm | 2014 – 2016', 'PLC logic and control testing.']] }
  ];

  var STATUS = [
    ['review', 'In Review', '#3B82F6'],
    ['interviewing', 'Interviewing', '#F59E0B'],
    ['final', 'Final Interview', '#22C55E'],
    ['offer', 'Offer', '#E11D48']
  ];
  var POOL_BASE = { review: 6, interviewing: 5, final: 3, offer: 3 };

  var PERIOD = { weekly: [12, 4, 14, 3], monthly: [18, 6, 21, 5], all: [31, 9, 26, 12] };
  var KPI = ['Projects in scope', 'Critical capability gaps', 'Days to readiness', 'Measures in progress'];

  var GAPS = [
    { id: 'GAP-042', t: 'Protection & Control Engineer', m: 'Converter Delivery · 2 FTE missing', s: 'Critical', live: true },
    { id: 'GAP-038', t: 'HV Commissioning Lead', m: 'Grid Connection · 1 FTE missing', s: 'Open' },
    { id: 'GAP-031', t: 'SCADA Specialist', m: 'Substation Upgrade · 1 FTE missing', s: 'Open' }
  ];

  // Step 05: programme-level decision (current → modeled / target)
  var PILLARS = [
    { k: 'dni', l: 'D&I', c: 68, m: 68, t: 74, col: '#F97316' },
    { k: 'ld', l: 'L&D', c: 52, m: 60, t: 70, col: '#16A34A' },
    { k: 'eff', l: 'Efficiency', c: 60, m: 74, t: 74, col: '#2563EB' },
    { k: 'agl', l: 'Agility', c: 58, m: 74, t: 74, col: '#DB2777' },
    { k: 'esat', l: 'ESAT', c: 34, m: 40, t: 54, col: '#7C3AED' },
    { k: 'esg', l: 'ESG', c: 40, m: 40, t: 52, col: '#9F1239' }
  ];

  function defaults() {
    return {
      period: 'weekly',
      mode: 'post',
      q: '',
      job: {
        title: 'Protection & Control Commissioning Engineer',
        fte: 2, weeks: 8, loc: 'Germany · onsite', type: 'Contract', exp: '3+ years',
        skills: ['Protection systems', 'Relay settings', 'Commissioning', 'IEC 61850'],
        desc: '', published: false, view: 'form', tab: 'details', hired: false, posted: '', deact: false
      },
      base: JSON.parse(JSON.stringify(BASE)),
      pool: {},
      report: '',
      pq: '',
      notes: {},
      pillars: ['eff', 'agl'],
      approved: ''
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
        Object.keys(d.job).forEach(function (k) { if (!(k in s.job)) s.job[k] = d.job[k]; });
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
  function signed(n, u) { return (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n) + (u || ''); }
  function num(n) { return n % 1 ? n.toFixed(1) : String(n); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function cand(id) { for (var i = 0; i < CANDS.length; i++) if (CANDS[i].id === id) return CANDS[i]; return null; }
  function poolIds() { return CANDS.filter(function (c) { return S.pool[c.id]; }).map(function (c) { return c.id; }); }
  function inPool(id) { return !!S.pool[id]; }
  function cover() { var f = 0; poolIds().forEach(function (id) { f += cand(id).fte; }); return f; }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function isoToday(add) { var d = new Date(); d.setDate(d.getDate() + (add || 0)); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function longDate(iso) { var p = iso.split('-'); return MONTHS[+p[1] - 1] + ' ' + (+p[2]) + ', ' + p[0]; }
  function shortDate(iso) { var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function addDays(iso, n) { var p = iso.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function wowSum(c) { return c.wow.reduce(function (a, b) { return a + b; }, 0); }
  function skillsMatch(c) { return Math.max(55, c.match - 5); }
  function cultureFit(c) { return Math.max(45, Math.min(95, 62 + 3 * wowSum(c))); }

  // Team Ways of Working with a list of candidates added
  function modeled(ids) {
    var out = {};
    DIMS.forEach(function (d, i) {
      var v = S.base[d.k];
      ids.forEach(function (id) { v += cand(id).wow[i]; });
      out[d.k] = Math.max(0, Math.min(100, v));
    });
    return out;
  }

  function poolCounts() {
    var c = {};
    STATUS.forEach(function (s) { c[s[0]] = POOL_BASE[s[0]]; });
    poolIds().forEach(function (id) { c[S.pool[id].status]++; });
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

  function currentStep() {
    for (var n = 1; n <= 5; n++) {
      var p = document.getElementById('flow-' + n);
      if (p && !p.hidden) return n;
    }
    return 1;
  }

  var ICON = {
    dash: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
    cands: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    pool: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
    jobs: 'M3 7h18v13H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    msg: 'M3 5h18v14H3zM3 6l9 7 9-7',
    cal: 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18',
    wow: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    align: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    dec: 'M12 2l10 10-10 10L2 12z',
    moves: 'M7 17L17 7M9 7h8v8',
    commit: 'M5 12h14M12 5v14',
    measure: 'M21 12a9 9 0 1 1-9-9M21 3v6h-6',
    set: 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
    bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
    spark: 'M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z',
    search: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM21 21l-4.3-4.3',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6z',
    report: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6',
    plus: 'M12 5v14M5 12h14',
    visa: 'M3 6h18v12H3zM3 10h18M7 15h4',
    trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
    back: 'M19 12H5M12 19l-7-7 7-7',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8z',
    team: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8z',
    edu: 'M22 10L12 5 2 10l10 5 10-5zM6 12v5c3 2 9 2 12 0v-5',
    clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7v5l3 2',
    euro: 'M18 7a7 7 0 1 0 0 10M4 10h10M4 14h10',
    globe: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
    check: 'M20 6L9 17l-5-5'
  };
  function svg(name, cls) {
    return '<svg class="' + (cls || 'hd-ico') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICON[name] + '"/></svg>';
  }

  // =========================================================
  // App frame: window bar, Higherd menu, top bar
  // =========================================================
  var NAV = [
    ['dash', 'Dashboard', 1], ['cands', 'Candidates', 3, 'find'], ['pool', 'Talent Pool', 4], ['jobs', 'Job Board', 3, 'post'],
    ['msg', 'Messages'], ['cal', 'Calendar'], ['wow', 'Ways of Working (WoW)']
  ];
  var NAV_WI = [['align', 'Workforce Alignment', 2], ['dec', 'Decisions', 5], ['moves', 'Strategic Moves'], ['commit', 'Project Commitments'], ['measure', 'Measured Outcomes']];

  function activeNav(step) {
    if (step === 1) return 'dash';
    if (step === 2) return 'align';
    if (step === 3) return S.mode === 'post' ? 'jobs' : 'cands';
    if (step === 4) return 'pool';
    return 'dec';
  }

  function navItem(n, step) {
    var on = activeNav(step) === n[0], live = !!n[2];
    var badge = n[0] === 'pool' && poolIds().length ? '<em class="hd-nav__n">' + poolIds().length + '</em>' : '';
    if (live) {
      return '<li><button type="button" class="hd-nav' + (on ? ' is-active' : '') + '" data-go="' + n[2] + '"' +
        (n[3] ? ' data-mode="' + n[3] + '"' : '') + (on ? ' aria-current="page"' : '') + '>' +
        svg(n[0]) + '<span class="hd-nav__l">' + n[1] + '</span>' + badge + '</button></li>';
    }
    return '<li><span class="hd-nav is-locked" aria-disabled="true" title="Not part of this demo">' +
      svg(n[0]) + '<span class="hd-nav__l">' + n[1] + '</span></span></li>';
  }

  function side(step) {
    return '<nav class="hd-side" aria-label="Higherd menu">' +
      '<p class="hd-side__logo"><img src="/assets/img/logo.svg?v=8" alt="Higherd" width="104" height="34"></p>' +
      '<ul>' + NAV.map(function (n) { return navItem(n, step); }).join('') + '</ul>' +
      '<p class="hd-side__sec">Workforce Intelligence</p>' +
      '<ul>' + NAV_WI.map(function (n) { return navItem(n, step); }).join('') + '</ul>' +
      '<ul class="hd-side__end">' + navItem(['set', 'Settings'], step) + '</ul>' +
    '</nav>';
  }

  var ROLE = { 1: 'HR Manager', 2: 'HR Director', 3: 'Recruiter', 4: 'HR Manager', 5: 'HR Director' };

  function top(step, title, sub, back) {
    return '<header class="hd-top">' +
      '<div class="hd-top__t">' +
        (back ? '<button type="button" class="hd-back" data-act="' + back + '" aria-label="Back">' + svg('back') + '</button>' : '') +
        '<div><p class="hd-top__title">' + title + '</p>' + (sub ? '<p class="hd-top__sub">' + sub + '</p>' : '') + '</div></div>' +
      '<div class="hd-top__r">' +
        '<button type="button" class="hd-aibtn" data-act="ai">' + svg('spark') + '<span>Higherd AI</span></button>' +
        '<span class="hd-bell" aria-hidden="true">' + svg('bell') + '</span>' +
        '<span class="hd-user"><span class="hd-user__av" aria-hidden="true">GD</span>' +
          '<span class="hd-user__t"><b>Gerd Doe</b><small>' + ROLE[step] + ' · Higherd</small></span></span>' +
      '</div>' +
    '</header>';
  }

  function frame(step, title, sub, body, back) {
    return '<div class="hd-chrome">' +
        '<span class="hd-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="hd-chrome__t">Higherd · demo data</span>' +
        '<button type="button" class="hd-link" data-act="reset">Reset demo</button>' +
      '</div>' +
      '<div class="hd-shell">' + side(step) +
        '<div class="hd-main">' + top(step, title, sub, back) + '<div class="hd-body">' + body + '</div></div>' +
      '</div>';
  }

  // =========================================================
  // Shared widgets
  // =========================================================
  function baros(values, showDelta, editable) {
    return '<div class="hd-baros' + (editable ? ' is-edit' : '') + '">' + DIMS.map(function (d) {
      var base = S.base[d.k], v = values[d.k], dv = v - base;
      return '<div class="hd-baro" title="' + d.n + '">' +
        '<span class="hd-baro__v">' + v + '%' +
          (showDelta && dv ? '<em class="' + (dv > 0 ? 'is-up' : 'is-down') + '">' + signed(dv) + '</em>' : '') + '</span>' +
        '<span class="hd-baro__track"' + (editable ? ' data-baro="' + d.k + '" tabindex="0" role="slider" aria-label="' + d.n + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '"' : '') + '>' +
          (showDelta && dv ? '<i class="hd-baro__base" style="height:' + base + '%"></i>' : '') +
          '<i class="hd-baro__fill" style="height:' + v + '%;background:' + d.c + '"></i>' +
          '<i class="hd-baro__knob" style="bottom:' + v + '%;border-color:' + d.c + '"></i>' +
        '</span>' +
        '<b>' + d.l + '</b>' +
      '</div>';
    }).join('') + '</div>';
  }

  function donut(counts) {
    var total = 0;
    STATUS.forEach(function (s) { total += counts[s[0]]; });
    var r = 38, C = 2 * Math.PI * r, off = 0;
    var segs = STATUS.map(function (s) {
      var len = C * counts[s[0]] / total;
      var seg = '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + s[2] + '" stroke-width="13" ' +
        'stroke-dasharray="' + Math.max(0, len - 1.6).toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>';
      off += len;
      return seg;
    }).join('');
    return '<div class="hd-donut"><svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(-90 50 50)">' + segs + '</g></svg>' +
      '<span class="hd-donut__c"><b>' + total + '</b>Applicants</span></div>' +
      '<ul class="hd-legend">' + STATUS.map(function (s) {
        return '<li><i style="background:' + s[2] + '"></i>' + s[1] + '</li>';
      }).join('') + '</ul>';
  }

  function ring(value, label, color) {
    var r = 26, C = 2 * Math.PI * r;
    return '<div class="hd-ring"><svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="#EEF0F3" stroke-width="6"/>' +
      '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="6" stroke-linecap="round" ' +
        'stroke-dasharray="' + (C * value / 100).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 32 32)"/></svg>' +
      '<b>' + value + '%</b><span>' + label + '</span></div>';
  }

  function impactCells(c) {
    return c.wow.map(function (v) {
      return '<td class="hd-imp ' + (v > 0 ? 'is-up' : v < 0 ? 'is-down' : '') + '">' + signed(v) + '</td>';
    }).join('');
  }

  function impactChips(c) {
    var list = c.wow.map(function (v, i) { return { v: v, d: DIMS[i] }; })
      .filter(function (x) { return x.v !== 0; })
      .sort(function (a, b) { return Math.abs(b.v) - Math.abs(a.v); }).slice(0, 3);
    return '<span class="hd-chips">' + list.map(function (x) {
      return '<span class="hd-chip ' + (x.v > 0 ? 'is-up' : 'is-down') + '">' + signed(x.v) + ' ' + x.d.l + '</span>';
    }).join('') + '</span>';
  }

  function poolBtn(c, small) {
    var on = inPool(c.id);
    return '<button type="button" class="hd-btn' + (on ? ' hd-btn--done' : '') + (small ? ' hd-btn--sm' : '') + '" data-act="pool" data-id="' + c.id + '" aria-pressed="' + on + '">' +
      (on ? '✓ In Talent Pool' : 'Add to Talent Pool') + '</button>';
  }

  function dots(n) {
    var s = '';
    for (var i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? 'is-on' : '') + '"></i>';
    return '<span class="hd-dotsrate" aria-label="' + n + ' of 5">' + s + '</span>';
  }

  // =========================================================
  // 01 Dashboard
  // =========================================================
  function render1() {
    var el = $('#hd-1'); if (!el) return;
    var k = PERIOD[S.period], ids = poolIds();
    var body =
      '<section class="hd-banner"><div><p class="hd-banner__t">Strategic Workforce Alignment</p>' +
        '<p class="hd-banner__s">Portfolio: Energy &amp; Infrastructure · Converter Delivery</p></div>' +
        '<button type="button" class="hd-btn" data-go="2">Review plan</button></section>' +

      '<section class="hd-panel">' +
        '<div class="hd-panel__h"><p class="hd-panel__t">Workforce Overview</p>' +
          '<div class="hd-period" role="group" aria-label="Period">' +
            [['weekly', 'Weekly'], ['monthly', 'Monthly'], ['all', 'All Time']].map(function (p) {
              return '<button type="button" data-act="period" data-v="' + p[0] + '" aria-pressed="' + (S.period === p[0]) + '">' + p[1] + '</button>';
            }).join('') +
          '</div></div>' +
        '<div class="hd-kpis">' + KPI.map(function (l, i) {
          return '<div class="hd-kpi"><span class="hd-kpi__i" aria-hidden="true">' + svg(['align', 'wow', 'cal', 'measure'][i]) + '</span>' +
            '<span class="hd-kpi__l">' + l + '</span><b>' + k[i] + '</b></div>';
        }).join('') + '</div>' +
      '</section>' +

      '<div class="hd-grid">' +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Ways of Working (WoW)</p>' +
            (ids.length ? '<span class="hd-tag">With Talent Pool</span>' : '<span class="hd-tag hd-tag--soft">Team baseline</span>') + '</div>' +
          baros(modeled(ids), ids.length > 0, true) +
          '<p class="hd-foot">Drag a bar up or down to set the team&#39;s level. The rest of the demo uses it.</p>' +
        '</section>' +
        '<section class="hd-panel hd-panel--center">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Talent Pool</p></div>' +
          donut(poolCounts()) +
          '<button type="button" class="hd-btn hd-btn--ghost" data-go="4">Go to Talent Pool</button>' +
        '</section>' +
      '</div>' +

      '<div class="hd-grid">' +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Candidates</p><button type="button" class="hd-link" data-go="3" data-mode="find">View all</button></div>' +
          '<div class="hd-tablewrap"><table class="hd-table">' +
            '<thead><tr><th>Candidate</th><th>Match</th>' + DIMS.map(function (d) { return '<th class="hd-imp">' + d.l + '</th>'; }).join('') + '</tr></thead>' +
            '<tbody>' + CANDS.slice(0, 5).map(function (c) {
              return '<tr><td><button type="button" class="hd-idlink" data-act="profile" data-id="' + c.id + '">' + c.id + '</button></td>' +
                '<td class="hd-match">' + c.match + '%</td>' + impactCells(c) + '</tr>';
            }).join('') + '</tbody>' +
          '</table></div>' +
          '<p class="hd-foot">Impact on the team&#39;s Ways of Working, per candidate</p>' +
        '</section>' +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Most Recent Gaps</p></div>' +
          '<div class="hd-gaps">' + GAPS.map(function (g) {
            return '<button type="button" class="hd-gap' + (g.live ? ' is-live' : '') + '" data-act="gap" data-live="' + (g.live ? 1 : 0) + '">' +
              '<span class="hd-gap__id">' + g.id + '</span>' +
              '<span class="hd-gap__s ' + (g.live ? 'is-crit' : '') + '">' + g.s + '</span>' +
              '<b>' + g.t + '</b><small>' + g.m + '</small></button>';
          }).join('') + '</div>' +
        '</section>' +
      '</div>';

    el.innerHTML = frame(1, 'Hi, Gerd. How are you doing today?', 'Your people, projects and workforce priorities in one view.', body);
  }

  // =========================================================
  // 02 Gap
  // =========================================================
  var CAPGAP = [['Protection systems', 52, 85], ['Electrical engineering', 64, 88], ['Commissioning', 38, 90]];

  function render2() {
    var el = $('#hd-2'); if (!el) return;
    var body =
      '<section class="hd-banner hd-banner--state"><div><p class="hd-eyebrow">Future state · GAP-042</p>' +
        '<p class="hd-banner__t">Build capability for converter delivery</p></div>' +
        '<div class="hd-banner__team"><p class="hd-eyebrow">Team</p><b>Electrical Engineering</b></div></section>' +

      '<div class="hd-kpis hd-kpis--flat">' +
        [['Recorded internal resources', '140', 'ERP project classification'], ['Verified active internal roles', '30', 'Project leader + HR review'],
         ['Records to reconcile', '110', 'Not equivalent to savings', 'warn'], ['Critical delivery gap', num(S.job.fte) + ' FTE', 'Commissioning · ' + S.job.weeks + ' weeks']].map(function (x) {
          return '<div class="hd-kpi hd-kpi--bar' + (x[3] ? ' is-warn' : '') + '"><span class="hd-kpi__l">' + x[0] + '</span><b>' + x[1] + '</b><small>' + x[2] + '</small></div>';
        }).join('') +
      '</div>' +

      '<div class="hd-grid hd-grid--gap">' +
        '<div class="hd-stack">' +
          '<section class="hd-panel">' +
            '<div class="hd-panel__h"><p class="hd-panel__t">Capability &amp; capacity gaps</p><span class="hd-tag hd-tag--soft">Source: Project + HR</span></div>' +
            CAPGAP.map(function (g) {
              return '<div class="hd-hbar"><span>' + g[0] + '</span><span class="hd-hbar__t"><i style="width:' + (g[1] / g[2] * 100) + '%"></i></span><small>' + g[1] + ' / ' + g[2] + '</small></div>';
            }).join('') +
          '</section>' +
          '<section class="hd-panel">' +
            '<div class="hd-panel__h"><p class="hd-panel__t">Ways of Working (WoW)</p><span class="hd-tag hd-tag--soft">Baseline</span></div>' +
            '<div class="hd-wowgrid">' + DIMS.map(function (d) {
              return '<div class="hd-wowline"><span>' + d.n + '</span><b>' + S.base[d.k] + '%</b>' +
                '<span class="hd-hbar__t"><i style="width:' + S.base[d.k] + '%;background:' + d.c + '"></i></span></div>';
            }).join('') + '</div>' +
          '</section>' +
        '</div>' +
        '<section class="hd-panel hd-desk">' +
          '<p class="hd-eyebrow">Decision desk</p>' +
          '<p class="hd-panel__t">How do you want to close the gap?</p>' +
          '<p class="hd-muted">' + num(S.job.fte) + ' FTE of protection engineering, ready within ' + S.job.weeks + ' weeks.</p>' +
          '<button type="button" class="hd-option" data-go="3" data-mode="post">' +
            '<span class="hd-option__n">01</span><span><b>Post a job</b><small>Publish the role on the Job Board. Higherd AI writes the description.</small></span><span aria-hidden="true">→</span></button>' +
          '<button type="button" class="hd-option" data-go="3" data-mode="find">' +
            '<span class="hd-option__n">02</span><span><b>Find candidate</b><small>' + CANDS.length + ' matching candidates in Higherd, ready in 2–8 weeks.</small></span><span aria-hidden="true">→</span></button>' +
          '<div class="hd-option is-off"><span class="hd-option__n">03</span><span><b>Redeploy internally</b><small>No verified internal specialist available.</small></span></div>' +
        '</section>' +
      '</div>';

    el.innerHTML = frame(2, 'Capability gap', 'Workforce Intelligence / Alignment · GAP-042', body);
  }

  // =========================================================
  // 03 Post a job (form → Job Details) or Find candidate
  // =========================================================
  function opt(list, val, fmt) {
    return list.map(function (o) {
      return '<option value="' + o + '"' + (String(o) === String(val) ? ' selected' : '') + '>' + (fmt ? fmt(o) : o) + '</option>';
    }).join('');
  }

  function switcher() {
    return '<div class="hd-switch" role="group" aria-label="How to close the gap">' +
      '<button type="button" data-act="mode" data-v="post" aria-pressed="' + (S.mode === 'post') + '">' + svg('jobs') + 'Post a job</button>' +
      '<button type="button" data-act="mode" data-v="find" aria-pressed="' + (S.mode === 'find') + '">' + svg('search') + 'Find candidate</button>' +
    '</div>';
  }

  function jobForm() {
    var J = S.job;
    return switcher() +
      '<section class="hd-panel">' +
        '<div class="hd-panel__h"><p class="hd-panel__t">' + (J.published ? 'Edit Job' : 'Post New Job') + '</p><span class="hd-tag hd-tag--soft">From GAP-042</span></div>' +
        '<div class="hd-form">' +
          '<label class="hd-f hd-f--wide"><span>Job title</span><input type="text" data-job="title" value="' + esc(J.title) + '"></label>' +
          '<div class="hd-f"><span>Positions (FTE)</span><span class="hd-stepper">' +
            '<button type="button" data-act="fte" data-d="-0.5" aria-label="Fewer positions">−</button><output>' + num(J.fte) + '</output>' +
            '<button type="button" data-act="fte" data-d="0.5" aria-label="More positions">+</button></span></div>' +
          '<label class="hd-f"><span>Ready within</span><select data-jobsel="weeks">' + opt([4, 8, 12], J.weeks, function (w) { return w + ' weeks'; }) + '</select></label>' +
          '<label class="hd-f"><span>Location</span><select data-jobsel="loc">' + opt(['Germany · onsite', 'Germany · hybrid', 'Remote'], J.loc) + '</select></label>' +
          '<label class="hd-f"><span>Contract type</span><select data-jobsel="type">' + opt(['Contract', 'Permanent', 'Temporary'], J.type) + '</select></label>' +
          '<label class="hd-f"><span>Experience</span><select data-jobsel="exp">' + opt(['1+ years', '3+ years', '5+ years', '8+ years'], J.exp) + '</select></label>' +
        '</div>' +
        '<p class="hd-sub">Required skills</p>' +
        '<div class="hd-skills">' + J.skills.map(function (s, i) {
          return '<span class="hd-skill">' + esc(s) + '<button type="button" data-act="rmskill" data-i="' + i + '" aria-label="Remove ' + esc(s) + '">×</button></span>';
        }).join('') +
          '<form class="hd-addskill" data-form="skill"><label class="hd-sr" for="hd-skill">Add skill</label><input id="hd-skill" type="text" placeholder="+ Add skill" maxlength="30"></form>' +
        '</div>' +
        '<div class="hd-desc">' +
          '<div class="hd-desc__h"><p class="hd-sub">Job description</p>' +
            '<button type="button" class="hd-aiinline" data-act="writedesc">' + svg('spark') + (J.desc ? 'Rewrite with Higherd AI' : 'Write with Higherd AI') + '</button></div>' +
          '<label class="hd-sr" for="hd-desc">Job description</label>' +
          '<textarea id="hd-desc" data-job="desc" rows="5" placeholder="Describe the role, or let Higherd AI write it from the gap.">' + esc(J.desc) + '</textarea>' +
        '</div>' +
        '<div class="hd-actions">' +
          (J.published
            ? '<button type="button" class="hd-btn hd-btn--ghost" data-act="jobview" data-v="details">Cancel</button><button type="button" class="hd-btn" data-act="saveedit">Save changes</button>'
            : '<button type="button" class="hd-btn" data-act="publish">Publish job</button>') +
        '</div>' +
      '</section>';
  }

  var TASKS = ['Configure and test protection relays in the AC yard', 'Run FAT/SAT and secondary injection tests',
    'Commission IEC 61850 station bus and GOOSE messaging', 'Check SCADA and grid interfaces with the HV design team',
    'Write commissioning records and handover documents'];

  function jobDetails() {
    var J = S.job, posted = J.posted || isoToday();
    var ivs = poolIds().filter(function (id) { return S.pool[id].status !== 'review'; }).length;
    var desc = J.desc || 'We are looking for a ' + J.title + ' to commission protection and control systems for Converter Delivery.';
    var body =
      (J.deact
        ? '<section class="hd-confirm"><p><b>Deactivate this job?</b> Please add a reason why you are deactivating this job.</p>' +
            '<label class="hd-sr" for="hd-reason">Reason</label><input id="hd-reason" type="text" placeholder="Add reason here">' +
            '<div class="hd-actions"><button type="button" class="hd-btn hd-btn--ghost" data-act="deact" data-v="0">Cancel</button>' +
            '<button type="button" class="hd-btn hd-btn--danger" data-act="deactivate">Deactivate Job</button></div></section>'
        : '') +
      '<section class="hd-panel hd-jobhead">' +
        '<div><p class="hd-jobhead__t">' + esc(J.title) + (J.hired ? ' <span class="hd-pill hd-pill--ok">Successful hire</span>' : ' <span class="hd-pill">Active</span>') + '</p>' +
          '<p class="hd-muted">JOB-042 • ' + esc(J.loc.replace(' · ', ', ')) + '</p>' +
          '<p class="hd-jobhead__m"><span>Posted: <b>' + longDate(posted) + '</b></span><span>Expires: <b>' + longDate(addDays(posted, 45)) + '</b></span>' +
            '<span>Applicants: <b class="hd-accent">' + CANDS.length + '</b></span><button type="button" class="hd-link" data-act="mode" data-v="find">View Applicants</button></p></div>' +
        '<div class="hd-jobhead__b">' +
          '<button type="button" class="hd-btn" data-act="jobview" data-v="form">Edit Job</button>' +
          '<button type="button" class="hd-btn hd-btn--green' + (J.hired ? ' is-on' : '') + '" data-act="hired">' + (J.hired ? '✓ Successful Hire' : 'Mark as Successful Hire') + '</button>' +
          '<button type="button" class="hd-btn hd-btn--outline-danger" data-act="deact" data-v="1">Deactivate Job</button>' +
        '</div>' +
      '</section>' +
      '<section class="hd-panel">' +
        '<div class="hd-tabs2" role="group" aria-label="Job view">' +
          '<button type="button" data-act="jobtab" data-v="details" aria-pressed="' + (J.tab === 'details') + '">Job Details</button>' +
          '<button type="button" data-act="jobtab" data-v="stats" aria-pressed="' + (J.tab === 'stats') + '">Statistics</button>' +
        '</div>' +
        (J.tab === 'stats'
          ? '<div class="hd-kpis hd-mt">' +
              [['Views', 248], ['Applicants', CANDS.length], ['In Talent Pool', poolIds().length], ['Interviews', ivs]].map(function (x) {
                return '<div class="hd-kpi"><span class="hd-kpi__l">' + x[0] + '</span><b>' + x[1] + '</b></div>';
              }).join('') + '</div>' +
            '<p class="hd-foot">Statistics since the job was posted on ' + longDate(posted) + '.</p>'
          : '<div class="hd-jobgrid">' +
              '<div>' +
                '<p class="hd-h4">Job Description &amp; Responsibilities</p><p class="hd-copy">' + esc(desc) + '</p>' +
                '<p class="hd-h4">General Skills Requirements</p><ul class="hd-bul">' + J.skills.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
                '<p class="hd-h4">Task Oriented Skills Requirements</p><ul class="hd-bul">' + TASKS.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' +
              '</div>' +
              '<aside class="hd-keybox"><p class="hd-h4">Key Job Details</p>' +
                [['team', 'Team', 'Electrical Engineering'], ['edu', 'Req. Education', 'Bachelor’s in Electrical Engineering'], ['jobs', 'Experience', J.exp],
                 ['clock', 'Type', J.type + ' · ' + num(J.fte) + ' FTE'], ['euro', 'Day rate', '€700 – €850']].map(function (x) {
                  return '<div class="hd-keyrow">' + svg(x[0]) + '<span>' + x[1] + '</span><b>' + esc(x[2]) + '</b></div>';
                }).join('') +
                '<div class="hd-keyrow">' + svg('globe') + '<span>Languages</span></div>' +
                '<div class="hd-langs"><div><b>English</b>' + dots(5) + '<small>Fluent</small></div><div><b>German</b>' + dots(4) + '<small>Professional</small></div></div>' +
                '<p class="hd-sub">Software Requirements</p>' +
                '<div class="hd-skills">' + ['OMICRON Test Universe', 'DIGSI 5', 'PCM600', 'IEC 61850 tools'].map(function (s) { return '<span class="hd-skill hd-skill--green">' + s + '</span>'; }).join('') + '</div>' +
              '</aside>' +
            '</div>') +
      '</section>';
    return switcher() + body;
  }

  function render3() {
    var el = $('#hd-3'); if (!el) return;
    var J = S.job, body, title, sub, back = '';
    if (S.mode === 'post') {
      if (J.published && J.view === 'details') {
        body = jobDetails(); title = 'Job Details'; sub = ''; back = 'jobback';
      } else {
        body = jobForm(); title = 'Job Board'; sub = (J.published ? 'Edit the job for GAP-042' : 'Post a job for GAP-042') + ' · ' + num(J.fte) + ' FTE';
      }
    } else {
      body = switcher() +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Matching candidates</p>' +
            '<label class="hd-search">' + svg('search') + '<span class="hd-sr">Search candidates</span><input type="search" id="hd-q" placeholder="Search by skill" value="' + esc(S.q) + '"></label></div>' +
          '<div id="hd-results"></div>' +
        '</section>' +
        '<section class="hd-coverbar" id="hd-coverbar"></section>';
      title = 'Candidates'; sub = 'Matched to ' + esc(J.title) + ' · anonymized IDs';
    }
    el.innerHTML = frame(3, title, sub, body, back);
    if (S.mode === 'find') { renderResults(); renderCover(); }
  }

  function renderResults() {
    var box = $('#hd-results'); if (!box) return;
    var q = S.q.trim().toLowerCase();
    var list = CANDS.filter(function (c) {
      return !q || (c.id + ' ' + c.sum + ' ' + c.skills.join(' ')).toLowerCase().indexOf(q) !== -1;
    });
    box.innerHTML = list.length ? '<div class="hd-cards">' + list.map(function (c) {
      return '<article class="hd-card' + (inPool(c.id) ? ' is-on' : '') + '">' +
        '<div class="hd-card__h"><button type="button" class="hd-idlink" data-act="profile" data-id="' + c.id + '">' + c.id + '</button>' +
          '<span class="hd-match">' + c.match + '% match</span></div>' +
        '<p class="hd-card__r">P&amp;C Commissioning Engineer · ' + c.yrs + ' years · covers ' + num(c.fte) + ' FTE</p>' +
        '<p class="hd-sub">Impact on WoW</p>' + impactChips(c) +
        '<div class="hd-card__b"><button type="button" class="hd-btn hd-btn--ghost hd-btn--sm" data-act="profile" data-id="' + c.id + '">View profile</button>' + poolBtn(c, true) + '</div>' +
      '</article>';
    }).join('') + '</div>' : '<p class="hd-empty">No candidate matches “' + esc(S.q) + '”.</p>';
  }

  function renderCover() {
    var bar = $('#hd-coverbar'); if (!bar) return;
    var f = cover(), pct = Math.min(100, f / S.job.fte * 100);
    bar.innerHTML = '<div><p><b>Talent Pool covers ' + num(f) + ' of ' + num(S.job.fte) + ' FTE</b> <span class="hd-muted">· ' + poolIds().length + ' candidates</span></p>' +
      '<span class="hd-hbar__t"><i style="width:' + pct + '%;background:#16A34A"></i></span></div>' +
      '<button type="button" class="hd-btn" data-go="4"' + (poolIds().length ? '' : ' disabled') + '>Go to Talent Pool →</button>';
  }

  // =========================================================
  // 04 Talent Pool (table) → Report View (barometers)
  // =========================================================
  function statusSel(id) {
    var st = S.pool[id].status;
    var col = STATUS.filter(function (s) { return s[0] === st; })[0][2];
    return '<label class="hd-sr" for="st-' + id + '">Status of ' + id + '</label><select id="st-' + id + '" class="hd-status" data-status="' + id + '" style="--c:' + col + '">' +
      STATUS.map(function (s) { return '<option value="' + s[0] + '"' + (st === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select>';
  }

  function render4() {
    var el = $('#hd-4'); if (!el) return;
    if (S.report && inPool(S.report)) { el.innerHTML = frame(4, 'Report View', '', reportView(cand(S.report)), 'reportback'); return; }
    S.report = '';
    var ids = poolIds(), f = cover(), body;
    var q = S.pq.trim().toLowerCase();
    var rows = ids.filter(function (id) { var c = cand(id); return !q || (id + ' ' + c.skills.join(' ')).toLowerCase().indexOf(q) !== -1; });

    if (!ids.length) {
      body = '<section class="hd-panel hd-emptystate">' + svg('pool', 'hd-emptystate__i') +
        '<p class="hd-panel__t">Your Talent Pool is empty</p>' +
        '<p class="hd-muted">Add candidates in step 03, then open their full report to see the barometers.</p>' +
        '<button type="button" class="hd-btn" data-go="3" data-mode="find">Find candidates</button></section>';
    } else {
      body =
        '<section class="hd-coverbar"><div><p><b>GAP-042: Talent Pool covers ' + num(f) + ' of ' + num(S.job.fte) + ' FTE</b> <span class="hd-muted">· ' + (f >= S.job.fte ? 'gap covered' : num(S.job.fte - f) + ' FTE still open') + '</span></p>' +
          '<span class="hd-hbar__t"><i style="width:' + Math.min(100, f / S.job.fte * 100) + '%;background:#16A34A"></i></span></div>' +
          '<button type="button" class="hd-btn" data-go="5">Next: Workforce Alignment →</button></section>' +
        '<section class="hd-panel">' +
          '<div class="hd-pooltools">' +
            '<label class="hd-search">' + svg('search') + '<span class="hd-sr">Search the Talent Pool</span><input type="search" id="hd-pq" placeholder="Search candidates by skills" value="' + esc(S.pq) + '"></label>' +
            '<span class="hd-pooltools__r"><select class="hd-plain" aria-label="Period"><option>Last 30 days</option><option>Last 90 days</option></select>' +
            '<button type="button" class="hd-btn hd-btn--outline-danger hd-btn--sm" data-act="clearpool">Clear Talent Pool</button></span>' +
          '</div>' +
          '<div class="hd-tablewrap"><table class="hd-table hd-table--pool">' +
            '<thead><tr><th>Date added</th><th>Candidate ID</th><th>Position</th><th>Type</th><th>Job ID</th><th>Job title</th><th>Status</th><th>Match</th><th>Actions</th></tr></thead>' +
            '<tbody>' + (rows.length ? rows.map(function (id) {
              var c = cand(id), p = S.pool[id];
              return '<tr' + (S.report === id ? ' class="is-sel"' : '') + '><td>' + shortDate(p.date) + '</td>' +
                '<td><button type="button" class="hd-idlink" data-act="profile" data-id="' + id + '">' + id + '</button></td>' +
                '<td>P&amp;C Engineer</td>' +
                '<td><span class="hd-pill ' + (p.type === 'applied' ? 'hd-pill--ok' : '') + '">' + (p.type === 'applied' ? 'Applied' : 'Saved') + '</span></td>' +
                '<td>' + (p.job ? 'JOB-042' : '<button type="button" class="hd-btn hd-btn--xs" data-act="assign" data-id="' + id + '">Assign to Job</button>') + '</td>' +
                '<td>' + (p.job ? 'P&amp;C Commissioning Eng.' : '—') + '</td>' +
                '<td>' + statusSel(id) + '</td>' +
                '<td class="hd-match">' + c.match + '%</td>' +
                '<td><span class="hd-acts">' +
                  '<button type="button" data-act="profile" data-id="' + id + '" title="View Candidate Profile" aria-label="View candidate profile of ' + id + '" class="a-view">' + svg('eye') + '</button>' +
                  '<button type="button" data-act="report" data-id="' + id + '" title="View Full Report" aria-label="View full report of ' + id + '" class="a-report">' + svg('report') + '</button>' +
                  '<button type="button" data-act="assign" data-id="' + id + '" title="Assign to Job" aria-label="Assign ' + id + ' to the job" class="a-assign">' + svg('plus') + '</button>' +
                  '<button type="button" data-act="visa" data-id="' + id + '" title="Add to Visa Board" aria-label="Add ' + id + ' to the Visa Board" class="a-visa">' + svg('visa') + '</button>' +
                  '<button type="button" data-act="pool" data-id="' + id + '" title="Remove From Talent Pool" aria-label="Remove ' + id + ' from the Talent Pool" class="a-del">' + svg('trash') + '</button>' +
                '</span></td></tr>';
            }).join('') : '<tr><td colspan="9" class="hd-empty">No candidate matches “' + esc(S.pq) + '”.</td></tr>') + '</tbody></table></div>' +
          '<p class="hd-foot">Open <b>View Full Report</b> to see how a candidate changes the team&#39;s Ways of Working.</p>' +
        '</section>';
    }
    el.innerHTML = frame(4, 'Talent Pool', ids.length ? ids.length + ' candidate' + (ids.length === 1 ? '' : 's') + ' for GAP-042' : 'Candidates you saved for GAP-042', body);
  }

  function hasAny(c, list) { return c.skills.some(function (s) { return list.indexOf(s) !== -1; }); }

  var REQ = [
    ['Protection systems', ['Relays', 'Relay', 'Protection', 'Settings', 'IED']],
    ['Relay settings', ['Settings', 'Relay', 'Relays', 'CT/VT']],
    ['Commissioning (FAT/SAT)', ['FAT/SAT', 'Testing', 'Injection', 'OMICRON']],
    ['IEC 61850', ['IEC 61850', 'GOOSE']],
    ['SCADA interfaces', ['SCADA', 'RTU', 'Signals']]
  ];

  function reportView(c) {
    var J = S.job, M = modeled([c.id]);
    var rows = REQ.map(function (r) {
      var ok = hasAny(c, r[1]), score = ok ? Math.min(98, 84 + Math.min(c.yrs, 10)) : 55 + c.yrs;
      var lab = score >= 90 ? 'Excellent' : score >= 80 ? 'Very Good' : score >= 70 ? 'Good' : 'Partial';
      var qual = ok ? (r[1].filter(function (k) { return c.skills.indexOf(k) !== -1; })[0] + ', ' + Math.min(c.yrs, 10) + '+ years') : 'Limited evidence';
      return '<tr><td>' + r[0] + '</td><td>' + qual + '</td><td><span class="hd-pill hd-pill--' + (score >= 90 ? 'ok' : score >= 80 ? 'warn' : 'bad') + '">' + lab + '</span></td><td>' + score + '%</td></tr>';
    }).join('');
    var expOk = c.yrs >= 3;
    return '' +
      '<section class="hd-panel hd-rephead">' +
        '<div class="hd-rephead__l"><span class="hd-av" aria-hidden="true">' + svg('user') + '</span>' +
          '<div><p class="hd-rephead__t">' + c.id + '</p><p class="hd-muted">Expert · P&amp;C Commissioning Engineer</p>' +
          '<div class="hd-actions hd-actions--start"><button type="button" class="hd-btn" data-act="contact">Contact Candidate</button>' +
          '<button type="button" class="hd-btn hd-btn--ghost" data-act="profile" data-id="' + c.id + '">View profile</button></div></div></div>' +
        '<div class="hd-rings">' + ring(c.match, 'Overall Match', '#4A0FA8') + ring(skillsMatch(c), 'Skills Match', '#16A34A') + ring(cultureFit(c), 'Culture Fit', '#F59E0B') + '</div>' +
      '</section>' +
      '<div class="hd-grid">' +
        '<section class="hd-panel"><p class="hd-panel__t hd-mb">Key Requirements Match</p>' +
          '<div class="hd-tablewrap"><table class="hd-table"><thead><tr><th>Requirement</th><th>Candidate qualification</th><th>Match</th><th>Score</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '</section>' +
        '<section class="hd-panel"><div class="hd-panel__h"><p class="hd-panel__t">Culture Fit Analysis</p><span class="hd-tag">Team with ' + c.id + '</span></div>' +
          baros(M, true) +
          '<p class="hd-foot">The light part of each bar is the team today. The colour is the team with this candidate.</p>' +
        '</section>' +
      '</div>' +
      '<section class="hd-panel"><p class="hd-panel__t hd-mb">Skill Comparison</p>' +
        '<div class="hd-cmp"><div><p class="hd-h4">Job Required Skills</p><div class="hd-skills">' + J.skills.map(function (s) { return '<span class="hd-skill hd-skill--green">' + esc(s) + '</span>'; }).join('') + '</div></div>' +
        '<div><p class="hd-h4">Candidate Skills</p><div class="hd-skills">' + c.skills.map(function (s) {
          var hit = REQ.some(function (r) { return r[1].indexOf(s) !== -1; });
          return '<span class="hd-skill ' + (hit ? 'hd-skill--green' : 'hd-skill--plain') + '">' + s + '</span>';
        }).join('') + '</div></div></div>' +
      '</section>' +
      '<div class="hd-grid hd-grid--even">' +
        '<section class="hd-panel"><p class="hd-panel__t hd-mb">Experience Match</p>' +
          '<div class="hd-cmp"><div><p class="hd-h4">Job Required Experience</p><ul class="hd-checks">' +
            '<li>' + esc(J.exp) + ' experience</li><li>P&amp;C commissioning on HV substations</li><li>Onsite work in Germany</li></ul></div>' +
          '<div><p class="hd-h4">Candidate Experience</p><ul class="hd-checks">' +
            '<li class="' + (expOk ? '' : 'is-warn') + '">' + c.yrs + ' years experience</li><li>' + esc(c.exp[0][0]) + '</li><li>Based in ' + c.loc + ', Germany</li></ul></div></div>' +
        '</section>' +
        '<section class="hd-panel"><p class="hd-panel__t hd-mb">Company Values &amp; Candidate Alignment</p>' +
          '<div class="hd-cmp"><div><p class="hd-h4">Company Culture</p><ul class="hd-checks">' +
            '<li>Safety first on site</li><li>Collaborative team structure</li><li>Results-oriented delivery</li><li>Continuous learning</li></ul></div>' +
          '<div><p class="hd-h4">Candidate Preferences</p><ul class="hd-checks">' +
            '<li>Structured, safe work</li><li>Team-based projects</li><li class="' + (c.wow[4] < 0 ? 'is-warn' : '') + '">Work-life balance</li><li>Recognition for results</li></ul></div></div>' +
        '</section>' +
      '</div>';
  }

  // =========================================================
  // 05 Workforce Alignment (Decision Impact)
  // =========================================================
  var ROLES = [
    ['hrx', 'HR Expert', 'Workforce recommendation'],
    ['hrd', 'HR Director', 'Current approval owner'],
    ['ops', 'Operations Lead', 'Delivery impact assessment'],
    ['fin', 'Finance Partner', 'Cost validation'],
    ['spo', 'Programme Sponsor', 'Final authorization']
  ];

  function gauge(p) {
    var gap = p.t - p.c, closed = gap > 0 ? Math.min(1, (p.m - p.c) / gap) : 1, len = Math.PI * 70;
    return '<article class="hd-gauge" style="--c:' + p.col + '">' +
      '<p class="hd-gauge__n">' + p.l + '</p><p class="hd-gauge__g">Target gap ' + gap + ' pp</p>' +
      '<svg viewBox="0 0 180 100" aria-hidden="true">' +
        '<path d="M20 90 A70 70 0 0 1 160 90" fill="none" stroke="#EEF0F3" stroke-width="14" stroke-linecap="round"/>' +
        '<path d="M20 90 A70 70 0 0 1 160 90" fill="none" stroke="' + p.col + '" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + (len * closed).toFixed(1) + ' ' + len.toFixed(1) + '"/>' +
      '</svg>' +
      '<p class="hd-gauge__v">' + signed(p.m - p.c, ' pp') + '</p>' +
      '<p class="hd-gauge__p">' + (p.m - p.c) + ' / ' + gap + ' planned points · ' + Math.round(closed * 100) + '% of gap closed</p>' +
      '<p class="hd-gauge__c">Current ' + p.c + ' · Modeled ' + p.m + ' · Target ' + p.t + '</p>' +
      '<span class="hd-gauge__bar"><i class="b1" style="width:' + p.c + '%"></i><i class="b2" style="left:' + p.c + '%;width:' + (p.m - p.c) + '%"></i><i class="b3" style="left:' + p.t + '%"></i></span>' +
      '<p class="hd-gauge__f' + (p.m >= p.t ? ' is-ok' : '') + '">' + (p.m >= p.t ? 'Target reached · 100% gap closed' : (p.t - p.m) + ' pp still to target') + '</p>' +
    '</article>';
  }

  function render5() {
    var el = $('#hd-5'); if (!el) return;
    var sel = PILLARS.filter(function (p) { return S.pillars.indexOf(p.k) !== -1; });
    var reached = sel.filter(function (p) { return p.m >= p.t; }).length;
    var ok = !!S.approved;

    var flow = ROLES.map(function (r) {
      var st, cls;
      if (r[0] === 'hrx') { st = 'Prepared'; cls = 'is-done'; }
      else if (r[0] === 'hrd') { st = ok ? 'Approved' : 'In review'; cls = ok ? 'is-done' : 'is-now'; }
      else if (r[0] === 'ops' || r[0] === 'fin') { st = ok ? 'In review' : 'Pending'; cls = ok ? 'is-now' : ''; }
      else { st = 'Pending'; cls = ''; }
      return '<li class="hd-role ' + cls + '"><span class="hd-role__dot" aria-hidden="true">' + (cls === 'is-done' ? '✓' : '') + '</span>' +
        '<span><b>' + r[1] + (r[0] === 'hrd' ? ' (you)' : '') + '</b><em>' + st + '</em><small>' + r[2] + '</small></span></li>';
    }).join('');

    var body =
      '<section class="hd-banner hd-banner--dec"><div><p class="hd-eyebrow">Decision WM-204981 / Your review</p>' +
        '<p class="hd-banner__big">Move 120 specialists. Close critical gaps.</p>' +
        '<p class="hd-banner__s">Converter Delivery · 12-month programme · 430 FTE capability gap</p></div>' +
        '<div class="hd-banner__acts"><div class="hd-actions hd-actions--start">' +
          '<button type="button" class="hd-btn hd-btn--ghost" data-act="adjust">Adjust Action Plan ↗</button>' +
          (ok ? '<button type="button" class="hd-btn hd-btn--done" data-act="unapprove">✓ HR Review approved</button>'
              : '<button type="button" class="hd-btn" data-act="approve">Approve HR Review →</button>') +
        '</div><button type="button" class="hd-link" data-go="4">View linked selection in Talent Pool ↗</button></div>' +
      '</section>' +
      '<div class="hd-panel__h hd-mt0"><div><p class="hd-panel__t hd-big2">Decision impact</p><p class="hd-muted">Expected progress toward your planned WoW</p></div>' +
        '<p class="hd-eyebrow">' + sel.length + ' selected · ' + reached + ' target' + (reached === 1 ? '' : 's') + ' reached</p></div>' +
      '<div class="hd-grid hd-grid--dec">' +
        (sel.length ? '<div class="hd-gauges">' + sel.map(gauge).join('') + '</div>' : '<section class="hd-panel hd-empty">Select at least one work type to model the impact.</section>') +
        '<section class="hd-panel"><p class="hd-panel__t">Select work type</p><p class="hd-muted hd-mb">Choose up to 6 dimensions</p>' +
          '<div class="hd-picks">' + PILLARS.map(function (p) {
            var on = S.pillars.indexOf(p.k) !== -1;
            return '<label class="hd-pick' + (on ? ' is-on' : '') + '"><input type="checkbox" data-pillar="' + p.k + '"' + (on ? ' checked' : '') + '>' +
              '<span class="hd-pick__l">' + p.l + '</span><span class="hd-pick__v">' + p.c + ' → ' + p.m + ' / ' + p.t + '</span>' +
              '<b style="color:' + (p.m > p.c ? (p.m >= p.t ? '#2563EB' : '#16A34A') : '#F59E0B') + '">' + signed(p.m - p.c, ' pp') + '</b></label>';
          }).join('') + '</div>' +
        '</section>' +
      '</div>' +
      '<div class="hd-panel__h hd-mt0"><p class="hd-panel__t">Business impact</p><p class="hd-muted">Expected outcomes · scenario assumptions</p></div>' +
      '<div class="hd-biz">' +
        [['Capability coverage', '28%', '120 / 430 FTE · gross coverage', ''], ['Time to readiness', '4 weeks', 'Assumed · pending validation', ''],
         ['Implementation cost', 'To validate', 'Finance estimate required', 'warn'], ['Quality impact', 'Review needed', 'Operations validation required', 'warn']].map(function (b) {
          return '<div class="hd-bizc"><span>' + b[0] + '</span><b class="' + (b[3] ? 'is-warn' : '') + '">' + b[1] + '</b><small>' + b[2] + '</small>' +
            '<button type="button" class="hd-link" data-act="assume">Review Assumptions ↗</button></div>';
        }).join('') +
        '<button type="button" class="hd-bizc hd-bizc--ai" data-act="aiwhatif"><span>Lessons learned</span><b>' + svg('spark') + 'Higherd AI</b><small>What if this decision goes wrong?</small><em>Ask Higherd AI ↗</em></button>' +
      '</div>' +
      '<section class="hd-panel">' +
        '<div class="hd-panel__h"><div><p class="hd-panel__t">Decision approval</p><p class="hd-muted">HR Expert prepared → HR Director in review → Operations &amp; Finance in parallel → Programme Sponsor</p></div>' +
          '<p class="hd-eyebrow">' + (ok ? 2 : 1) + ' of 5 roles completed</p></div>' +
        '<ol class="hd-flow">' + flow + '</ol>' +
      '</section>';

    el.innerHTML = frame(5, 'Hi, Gerd. How are you doing today?', 'Track, manage and view your company latest updates.', body);
  }

  // =========================================================
  // Candidate profile (full page in a dialog)
  // =========================================================
  function note(c) {
    return S.notes[c.id] != null ? S.notes[c.id] :
      'Clear and confident on ' + c.skills[0] + ' and ' + c.skills[1] + '. ' + (c.weeks <= 4 ? 'Can start soon.' : 'Needs ' + c.weeks + ' weeks notice.') + ' Strong fit for the commissioning team.';
  }

  function dialog() {
    var dlg = $('#hd-dialog');
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.id = 'hd-dialog';
    dlg.className = 'hd-dialog hd';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) { dlg.close(); return; }
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var a = b.getAttribute('data-act'), id = b.getAttribute('data-id');
      if (a === 'close') dlg.close();
      if (a === 'pool') { togglePool(id); openProfile(id); }
      if (a === 'contact') toast('Contact Candidate is available on Core and Premium plans');
      if (a === 'editnote') openProfile(id, true);
      if (a === 'savenote') { S.notes[id] = $('#hd-note').value; save(); openProfile(id); toast('Note saved'); }
      if (a === 'report') { dlg.close(); S.report = id; save(); render4(); goTo(4); }
    });
    return dlg;
  }

  function openProfile(id, editing) {
    var c = cand(id); if (!c) return;
    var dlg = dialog();
    dlg.innerHTML =
      '<div class="hd-ptop"><button type="button" class="hd-back" data-act="close" aria-label="Back">' + svg('back') + '</button><p class="hd-top__title">Candidates Profile</p>' +
        '<button type="button" class="hd-x" data-act="close" aria-label="Close">×</button></div>' +
      '<div class="hd-pbody">' +
        '<p class="hd-upsell"><span aria-hidden="true">!</span>Contact Candidate feature is only available for Core and Premium subscribers.</p>' +
        '<section class="hd-panel hd-phead">' +
          '<div class="hd-phead__l"><span class="hd-av" aria-hidden="true">' + svg('user') + '</span>' +
            '<div><p class="hd-phead__t">' + c.id + '</p><p class="hd-muted">Expert · P&amp;C Commissioning Engineer <span class="hd-mini">' + c.match + '%</span></p></div></div>' +
          '<div class="hd-actions hd-actions--start">' + poolBtn(c) +
            '<button type="button" class="hd-btn hd-btn--ghost" data-act="contact">Contact Candidate</button>' +
            (inPool(c.id) ? '<button type="button" class="hd-btn hd-btn--ghost" data-act="report" data-id="' + c.id + '">View Full Report</button>' : '') + '</div>' +
          '<div class="hd-phead__s"><p class="hd-h4">Professional Summary</p><p class="hd-copy">' + c.sum + '</p>' +
            '<div class="hd-skills"><span class="hd-skill hd-skill--plain">Experience: ' + c.yrs + ' years</span><span class="hd-skill hd-skill--plain">Location: ' + c.loc + '</span>' +
            '<span class="hd-skill hd-skill--plain">Available in ' + c.weeks + ' weeks</span></div></div>' +
        '</section>' +
        '<section class="hd-panel"><p class="hd-panel__t">Parsed CV <span class="hd-muted hd-small">(Sensitive information hidden)</span></p>' +
          '<div class="hd-cmp hd-mt">' +
            '<div><p class="hd-h4">General Skills</p><div class="hd-skills">' + ['Commissioning planning', 'Team coordination', 'Test documentation', 'Site safety', 'Reporting'].map(function (s) { return '<span class="hd-skill">' + s + '</span>'; }).join('') + '</div></div>' +
            '<div><p class="hd-h4">Task-Related Skills</p><div class="hd-skills">' + c.skills.map(function (s) { return '<span class="hd-skill hd-skill--green">' + s + '</span>'; }).join('') + '</div></div>' +
          '</div>' +
          '<div class="hd-cmp hd-mt">' +
            '<div><p class="hd-h4">Experience</p><ul class="hd-exp">' + c.exp.map(function (x, i) {
              return '<li class="' + (i === 0 ? 'is-now' : '') + '"><b>' + x[0] + '</b><small>' + x[1] + '</small><span>' + x[2] + '</span></li>';
            }).join('') + '</ul></div>' +
            '<div><p class="hd-h4">Language</p><div class="hd-langs hd-langs--col">' +
              '<div><b>English</b>' + dots(c.en) + '<small>' + (c.en === 5 ? 'Fluent' : 'Professional') + '</small></div>' +
              '<div><b>German</b>' + dots(c.de) + '<small>' + (c.de === 5 ? 'Native' : 'Professional') + '</small></div></div></div>' +
          '</div>' +
        '</section>' +
        '<section class="hd-panel"><p class="hd-panel__t hd-mb">Notes</p>' +
          (editing
            ? '<label class="hd-sr" for="hd-note">Note</label><textarea id="hd-note" class="hd-notearea" rows="4">' + esc(note(c)) + '</textarea>' +
              '<div class="hd-actions"><button type="button" class="hd-btn hd-btn--ghost" data-act="editnote" data-id="' + c.id + '" hidden></button><button type="button" class="hd-btn" data-act="savenote" data-id="' + c.id + '">Save Note</button></div>'
            : '<div class="hd-note"><p><b>Gerd Doe</b><small>' + (S.notes[c.id] != null ? 'Just now' : '3 days ago') + '</small></p><p>' + esc(note(c)) + '</p></div>' +
              '<div class="hd-actions"><button type="button" class="hd-btn" data-act="editnote" data-id="' + c.id + '">Edit Note</button></div>') +
        '</section>' +
      '</div>';
    if (!dlg.open) dlg.showModal();
    var t = $('#hd-note'); if (t) t.focus();
  }

  function togglePool(id) {
    if (S.pool[id]) {
      delete S.pool[id];
      if (S.report === id) S.report = '';
      toast(id + ' removed from the Talent Pool');
    } else {
      S.pool[id] = { date: isoToday(), type: S.job.published ? 'applied' : 'saved', job: S.job.published, status: 'review' };
      toast(id + ' added to the Talent Pool');
    }
    save(); renderAll();
  }

  // =========================================================
  // Higherd AI assistant (suggested questions, sample answers)
  // =========================================================
  var AI_Q = {
    1: ['What needs my attention today?', 'Which gap is most critical?'],
    2: ['How should I close this gap?', 'Why is Employee Satisfaction so low?'],
    3: ['Write the job description for me', 'Which candidate closes the gap fastest?'],
    4: ['How does my Talent Pool change the team?', 'Who should I interview first?'],
    5: ['What if this decision goes wrong?', 'Which work types should I select?']
  };

  function fastest() { return CANDS.slice().sort(function (a, b) { return a.weeks - b.weeks || b.match - a.match; })[0]; }

  function aiAnswer(q) {
    var ids = poolIds(), M = modeled(ids), c;
    switch (q) {
      case 'What needs my attention today?':
        return 'GAP-042 is critical: Converter Delivery needs ' + num(S.job.fte) + ' FTE of protection engineering within ' + S.job.weeks + ' weeks, and no internal specialist is verified. Employee Satisfaction (20%) is also far below the other Ways of Working.';
      case 'Which gap is most critical?':
        return 'GAP-042, Protection & Control Engineer. Commissioning capability is at 38 of 90, the lowest of the three, and the milestone is ' + S.job.weeks + ' weeks away.';
      case 'How should I close this gap?':
        c = fastest();
        return 'Do both: post the job so it reaches new applicants, and add the best matches already in Higherd to your Talent Pool now. ' + c.id + ' can start in ' + c.weeks + ' weeks.';
      case 'Why is Employee Satisfaction so low?':
        return 'The team is short on specialists, so the same people cover commissioning and handovers. Candidates with a positive ESAT impact, like RK-113568, ease that load.';
      case 'Write the job description for me':
        S.mode = 'post'; S.job.view = 'form'; save();
        writeDesc();
        return 'Done. I wrote the job description from GAP-042 and put it in the job form. You can edit it before you publish.';
      case 'Which candidate closes the gap fastest?':
        c = fastest();
        return c.id + ': ' + c.match + '% match, covers ' + num(c.fte) + ' FTE and can start in ' + c.weeks + ' weeks. RK-113567 is the strongest match at 95%, available in 4 weeks.';
      case 'How does my Talent Pool change the team?':
        if (!ids.length) return 'Your Talent Pool is empty. Add candidates in step 03 and I will show how they move the barometers.';
        var ch = DIMS.filter(function (d) { return M[d.k] !== S.base[d.k]; }).map(function (d) { return d.n + ' ' + signed(M[d.k] - S.base[d.k]); });
        return 'With ' + ids.length + ' candidate' + (ids.length === 1 ? '' : 's') + ', the team changes: ' + (ch.length ? ch.join(', ') : 'no change yet') + '. Together they cover ' + num(cover()) + ' of ' + num(S.job.fte) + ' FTE. Open View Full Report for one candidate at a time.';
      case 'Who should I interview first?':
        if (!ids.length) return 'Add candidates to the Talent Pool first, then I can rank them for interviews.';
        c = ids.map(cand).sort(function (a, b) { return b.match - a.match; })[0];
        return 'Start with ' + c.id + ' (' + c.match + '% match, culture fit ' + cultureFit(c) + '%). Set the status to Interviewing in the Talent Pool when you book it.';
      case 'What if this decision goes wrong?':
        return 'The biggest risk is time: if the 120 specialists are not ready in 4 weeks, commissioning slips. Keep the Talent Pool candidates warm as a backup, and let Finance validate cost before the Programme Sponsor signs.';
      case 'Which work types should I select?':
        return 'Agility and Efficiency: both reach their targets (+16 pp and +14 pp). Adding L&D gives +8 pp but stays 10 pp below target, so it lowers the average.';
    }
    return 'In this demo Higherd AI answers the suggested questions. In the product it works with your own workforce data.';
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
      if (b.getAttribute('data-act') === 'aiclose') { p.hidden = true; return; }
      if (b.hasAttribute('data-q')) ask(b.getAttribute('data-q'));
    });
    p.addEventListener('submit', function (e) {
      e.preventDefault();
      var i = p.querySelector('input'), v = i.value.trim();
      if (v) ask(v);
    });
    return p;
  }

  function renderAI(typing) {
    var p = aiPanel(), step = currentStep();
    p.innerHTML =
      '<div class="hd-ai__h">' + svg('spark') + '<p><b>Higherd AI</b><small>Sample answers · demo data</small></p>' +
        '<button type="button" class="hd-x" data-act="aiclose" aria-label="Close Higherd AI">×</button></div>' +
      '<div class="hd-ai__log">' +
        (aiLog.length ? '' : '<p class="hd-ai__hello">Hi Gerd. Ask me about this screen.</p>') +
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
    }, 650);
  }

  function openAI(q) {
    var p = aiPanel();
    p.hidden = false;
    renderAI(false);
    if (q) ask(q);
    var i = p.querySelector('input'); if (i && !q) i.focus();
  }

  function writeDesc() {
    var J = S.job, many = J.fte !== 1;
    J.desc = 'We are looking for ' + (many ? num(J.fte) + ' ' + J.title + 's' : 'a ' + J.title) + ' for Converter Delivery, ' + J.loc.toLowerCase() + ', ready within ' + J.weeks + ' weeks. ' +
      'You will commission protection and control systems for the AC yard: relay configuration, protection testing, IED communications and SCADA interfaces. ' +
      'You bring ' + J.exp + ' of experience and skills in ' + J.skills.join(', ') + '. ' +
      'You join a team of 18 that wants faster technical handovers and clearer ownership between disciplines.';
    save();
    render3(); pulse();
  }

  // =========================================================
  // Pulse: marks the first thing to try in each step until used
  // =========================================================
  var PULSE = {
    1: '.hd-gap.is-live',
    2: '.hd-option[data-mode="post"]',
    3: '[data-act="writedesc"], [data-act="publish"], .hd-card [data-act="pool"][aria-pressed="false"]',
    4: '.a-report, .hd-emptystate .hd-btn',
    5: '[data-act="approve"]'
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
    if (!box || e.target.closest('[data-act="reset"], .hd-side, [data-act="ai"]')) return;
    var n = box.id.slice(3);
    if (!touched[n]) { touched[n] = true; setTimeout(pulse, 0); }
  }

  // ---------- confirmation message ----------
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

  // =========================================================
  // Events
  // =========================================================
  function renderAll() { render1(); render2(); render3(); render4(); render5(); pulse(); }

  function onClick(e) {
    var go = e.target.closest('[data-go]');
    if (go) {
      if (go.disabled) return;
      if (go.hasAttribute('data-mode')) { S.mode = go.getAttribute('data-mode'); save(); render3(); }
      if (go.getAttribute('data-go') === '4' && S.report) { S.report = ''; save(); render4(); }
      goTo(Number(go.getAttribute('data-go')));
      pulse();
      return;
    }
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act'), id = b.getAttribute('data-id'), J = S.job;

    switch (act) {
      case 'reset':
        if (!confirm('Reset the demo to the sample data?')) return;
        try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
        S = defaults(); aiLog = []; touched = {}; renderAll(); return;
      case 'ai': openAI(); return;
      case 'aiwhatif': openAI('What if this decision goes wrong?'); return;
      case 'period': S.period = b.getAttribute('data-v'); save(); render1(); pulse(); return;
      case 'gap':
        if (b.getAttribute('data-live') === '1') goTo(2); else toast('Only GAP-042 is part of this demo');
        return;
      case 'mode': S.mode = b.getAttribute('data-v'); save(); render3(); pulse(); scrollToApp(3); return;
      case 'fte': J.fte = Math.max(0.5, Math.min(10, J.fte + Number(b.getAttribute('data-d')))); save(); renderAll(); return;
      case 'rmskill': J.skills.splice(Number(b.getAttribute('data-i')), 1); save(); render3(); return;
      case 'writedesc': writeDesc(); toast('Higherd AI wrote the job description'); return;
      case 'publish':
        J.published = true; J.view = 'details'; J.tab = 'details'; J.posted = isoToday(); J.hired = false; J.deact = false;
        poolIds().forEach(function (pid) { S.pool[pid].job = true; });
        save(); render3(); render4(); pulse(); scrollToApp(3);
        toast('Job published on the Job Board · ' + CANDS.length + ' matching applicants');
        return;
      case 'saveedit': J.view = 'details'; save(); render3(); scrollToApp(3); toast('Job updated'); return;
      case 'jobview': J.view = b.getAttribute('data-v'); J.deact = false; save(); render3(); scrollToApp(3); return;
      case 'jobback': J.view = 'form'; save(); render3(); return;
      case 'jobtab': J.tab = b.getAttribute('data-v'); save(); render3(); return;
      case 'hired': J.hired = !J.hired; save(); render3(); if (J.hired) toast('Job marked as a successful hire'); return;
      case 'deact': J.deact = b.getAttribute('data-v') === '1'; save(); render3(); if (J.deact) { var r = $('#hd-reason'); if (r) r.focus(); } return;
      case 'deactivate':
        J.published = false; J.view = 'form'; J.deact = false; J.hired = false; save(); render3(); scrollToApp(3);
        toast('Job deactivated'); return;
      case 'profile': openProfile(id); return;
      case 'pool': togglePool(id); return;
      case 'report': S.report = id; save(); render4(); scrollToApp(4); return;
      case 'reportback': S.report = ''; save(); render4(); scrollToApp(4); return;
      case 'contact': toast('Contact Candidate is available on Core and Premium plans'); return;
      case 'assign':
        if (S.pool[id].job) { toast(id + ' is already assigned to JOB-042'); return; }
        S.pool[id].job = true; S.pool[id].type = 'applied'; save(); render4(); toast(id + ' assigned to JOB-042'); return;
      case 'visa': toast(id + ' added to the Visa Board'); return;
      case 'clearpool':
        if (!confirm('Remove all candidates from the Talent Pool?')) return;
        S.pool = {}; S.report = ''; save(); renderAll(); toast('Talent Pool cleared'); return;
      case 'approve':
        var d = new Date(); S.approved = pad(d.getHours()) + ':' + pad(d.getMinutes()); save(); render5(); pulse();
        toast('HR Review approved · sent to Operations and Finance'); return;
      case 'unapprove': S.approved = ''; save(); render5(); return;
      case 'adjust': toast('In the product this opens the action plan for WM-204981'); return;
      case 'assume': toast('In the product this opens the scenario assumptions'); return;
    }
  }

  function onInput(e) {
    var t = e.target;
    if (t.id === 'hd-q') { S.q = t.value; save(); renderResults(); pulse(); return; }
    if (t.id === 'hd-pq') {
      S.pq = t.value; save(); render4();
      var again = $('#hd-pq'); if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
      return;
    }
    if (t.hasAttribute('data-job')) { S.job[t.getAttribute('data-job')] = t.value; save(); }
  }

  function onChange(e) {
    var t = e.target;
    if (t.hasAttribute('data-jobsel')) {
      var k = t.getAttribute('data-jobsel');
      S.job[k] = k === 'weeks' ? Number(t.value) : t.value;
      save(); renderAll(); return;
    }
    if (t.hasAttribute('data-status')) {
      var id = t.getAttribute('data-status');
      S.pool[id].status = t.value; save();
      toast(id + ' moved to ' + t.options[t.selectedIndex].text);
      render1(); render4(); pulse();
      return;
    }
    if (t.hasAttribute('data-pillar')) {
      var k2 = t.getAttribute('data-pillar'), i = S.pillars.indexOf(k2);
      if (t.checked && i === -1) S.pillars.push(k2);
      if (!t.checked && i !== -1) S.pillars.splice(i, 1);
      save(); render5(); pulse();
    }
  }

  function onSubmit(e) {
    var f = e.target.closest('[data-form="skill"]');
    if (!f) return;
    e.preventDefault();
    var v = f.querySelector('input').value.trim();
    if (v && S.job.skills.indexOf(v) === -1) { S.job.skills.push(v); save(); render3(); }
    var again = $('#hd-skill'); if (again) again.focus();
  }

  var host = document.getElementById('journey');
  if (!host) return;
  host.addEventListener('pointerdown', touch);
  host.addEventListener('keydown', touch);
  host.addEventListener('click', onClick);
  host.addEventListener('input', onInput);
  host.addEventListener('change', onChange);
  host.addEventListener('submit', onSubmit);

  // ---------- draggable Ways of Working bars (dashboard) ----------
  function poolDelta(k) {
    var i = DIMS.map(function (d) { return d.k; }).indexOf(k), sum = 0;
    poolIds().forEach(function (id) { sum += cand(id).wow[i]; });
    return sum;
  }

  function setBaro(track, k, v) {
    var P = poolDelta(k);
    var base = Math.max(0, Math.min(100, Math.round(v) - P));
    var shown = Math.max(0, Math.min(100, base + P));
    S.base[k] = base;
    var fill = track.querySelector('.hd-baro__fill'), knob = track.querySelector('.hd-baro__knob'), b = track.querySelector('.hd-baro__base');
    fill.style.height = shown + '%';
    knob.style.bottom = shown + '%';
    if (b) b.style.height = base + '%';
    track.setAttribute('aria-valuenow', shown);
    var label = track.parentNode.querySelector('.hd-baro__v');
    label.innerHTML = shown + '%' + (P ? '<em class="' + (P > 0 ? 'is-up' : 'is-down') + '">' + signed(P) + '</em>' : '');
  }

  var drag = null;
  function dragTo(y) {
    var r = drag.t.getBoundingClientRect();
    setBaro(drag.t, drag.k, (r.bottom - y) / r.height * 100);
  }
  function endDrag() {
    if (!drag) return;
    var k = drag.k;
    drag = null;
    save(); renderAll();
    var t = document.querySelector('#hd-1 .hd-baro__track[data-baro="' + k + '"]');
    if (t) t.focus({ preventScroll: true });
  }

  host.addEventListener('pointerdown', function (e) {
    var t = e.target.closest('.hd-baro__track[data-baro]');
    if (!t) return;
    e.preventDefault();
    drag = { t: t, k: t.getAttribute('data-baro') };
    t.classList.add('is-drag');
    try { t.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    dragTo(e.clientY);
  });
  host.addEventListener('pointermove', function (e) { if (drag) dragTo(e.clientY); });
  host.addEventListener('pointerup', endDrag);
  host.addEventListener('pointercancel', endDrag);

  host.addEventListener('keydown', function (e) {
    var t = e.target.closest && e.target.closest('.hd-baro__track[data-baro]');
    if (!t) return;
    var step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
    if (!step) return;
    e.preventDefault();
    var k = t.getAttribute('data-baro');
    setBaro(t, k, Number(t.getAttribute('aria-valuenow')) + step);
    save(); renderAll();
    var again = document.querySelector('#hd-1 .hd-baro__track[data-baro="' + k + '"]');
    if (again) again.focus({ preventScroll: true });
  });
  // Keep the assistant's suggestions in step with the visible screen
  host.addEventListener('click', function (e) {
    if (e.target.closest('[role="tab"], [data-step], [data-go]')) {
      setTimeout(function () { var p = $('#hd-ai'); if (p && !p.hidden) renderAI(false); }, 0);
    }
  });
  renderAll();
})();
