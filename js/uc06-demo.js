/* =========================================================
   Higherd – UC06 clickable demo (front end only, sample data)
   Follows the Higherd company app flow from the Figma prototype:
   01 Dashboard → 02 Gap → 03 Post a job or Find candidate
   → 04 Talent Pool with the Ways of Working barometers.
   Higherd AI answers suggested questions on every screen.
   State is kept in localStorage so it survives a reload.
   ========================================================= */
(function () {
  var KEY = 'higherd-uc06-demo-v3';

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
    { id: 'RK-113567', yrs: 8, weeks: 4, loc: 'Hamburg, DE', fte: 1, match: 95, wow: [1, 0, 6, 1, -2, 0],
      sum: '8 years in AC-yard relay commissioning, IEC 61850 and FAT/SAT. Available in 4 weeks.',
      skills: ['Relays', 'IEC 61850', 'FAT/SAT', 'GOOSE', 'OMICRON', 'SCADA'] },
    { id: 'RK-113568', yrs: 5, weeks: 2, loc: 'Berlin, DE', fte: 1, match: 90, wow: [0, 2, 3, 4, 1, 0],
      sum: '5 years in HV-substation protection testing and grid interface work. Ready in 2 weeks.',
      skills: ['Relays', 'HV Grid', 'SCADA', 'FAT/SAT', 'Testing'] },
    { id: 'RK-113569', yrs: 12, weeks: 8, loc: 'Munich, DE', fte: 0.5, match: 86, wow: [0, 1, 2, 0, -1, 0],
      sum: '12 years in relay settings and protection design. SAT handover skills are limited.',
      skills: ['Settings', 'CT/VT', 'IEC 61850', 'Protection', 'Studies'] },
    { id: 'RK-113571', yrs: 6, weeks: 3, loc: 'Cologne, DE', fte: 0.5, match: 81, wow: [1, 0, 3, 1, -1, 0],
      sum: '6 years in IEC 61850 and RTU/SCADA interfaces. Relay setting experience to verify.',
      skills: ['IEC 61850', 'GOOSE', 'SCADA', 'RTU', 'Signals'] },
    { id: 'RK-113570', yrs: 3, weeks: 6, loc: 'Leipzig, DE', fte: 0.5, match: 73, wow: [0, 3, -1, -4, 0, 0],
      sum: '3 years in secondary-injection testing and protection IED diagnostics. Needs supervision.',
      skills: ['OMICRON', 'Injection', 'IED', 'Testing', 'Relays'] },
    { id: 'RK-113572', yrs: 10, weeks: 5, loc: 'Stuttgart, DE', fte: 0.5, match: 68, wow: [0, 0, 4, -2, 0, 1],
      sum: '10 years of converter control integration. AC-yard protection commissioning is partial.',
      skills: ['HVDC', 'Control', 'Logic', 'Testing', 'SCADA'] }
  ];

  var STATUS = [
    ['saved', 'Saved', '#3B82F6'],
    ['applied', 'Applied', '#22C55E'],
    ['interviewing', 'Interviewing', '#F59E0B'],
    ['review', 'In review', '#E11D48']
  ];
  var POOL_BASE = { saved: 5, applied: 6, interviewing: 3, review: 3 };

  var PERIOD = { weekly: [12, 4, 14, 3], monthly: [18, 6, 21, 5], all: [31, 9, 26, 12] };
  var KPI = ['Projects in scope', 'Critical capability gaps', 'Days to readiness', 'Measures in progress'];

  var GAPS = [
    { id: 'GAP-042', t: 'Protection & Control Engineer', m: 'Converter Delivery · 2 FTE missing', s: 'Critical', live: true },
    { id: 'GAP-038', t: 'HV Commissioning Lead', m: 'Grid Connection · 1 FTE missing', s: 'Open' },
    { id: 'GAP-031', t: 'SCADA Specialist', m: 'Substation Upgrade · 1 FTE missing', s: 'Open' }
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
        desc: '', published: false
      },
      pool: {}
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
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  }

  // ---------- helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function signed(n) { return (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n); }
  function num(n) { return n % 1 ? n.toFixed(1) : String(n); }
  function cand(id) { for (var i = 0; i < CANDS.length; i++) if (CANDS[i].id === id) return CANDS[i]; return null; }
  function poolIds() { return CANDS.filter(function (c) { return S.pool[c.id]; }).map(function (c) { return c.id; }); }
  function inPool(id) { return !!S.pool[id]; }
  function cover() { var f = 0; poolIds().forEach(function (id) { f += cand(id).fte; }); return f; }

  // Team Ways of Working with the Talent Pool added
  function modeled() {
    var out = {};
    DIMS.forEach(function (d, i) {
      var v = BASE[d.k];
      poolIds().forEach(function (id) { v += cand(id).wow[i]; });
      out[d.k] = Math.max(0, Math.min(100, v));
    });
    return out;
  }

  function poolCounts() {
    var c = {};
    STATUS.forEach(function (s) { c[s[0]] = POOL_BASE[s[0]]; });
    poolIds().forEach(function (id) { c[S.pool[id]]++; });
    return c;
  }

  function goTo(step) {
    var tab = document.getElementById('flow-tab-' + step);
    if (!tab) return;
    tab.click();
    var root = tab.closest('[data-tabs]');
    if (root) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function currentStep() {
    for (var n = 1; n <= 4; n++) {
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
    moves: 'M7 17L17 7M9 7h8v8',
    commit: 'M5 12h14M12 5v14',
    measure: 'M21 12a9 9 0 1 1-9-9M21 3v6h-6',
    set: 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
    bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
    spark: 'M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z',
    search: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM21 21l-4.3-4.3'
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
  var NAV_WI = [['align', 'Workforce Alignment', 2], ['moves', 'Strategic Moves'], ['commit', 'Project Commitments'], ['measure', 'Measured Outcomes']];

  function activeNav(step) {
    if (step === 1) return 'dash';
    if (step === 2) return 'align';
    if (step === 3) return S.mode === 'post' ? 'jobs' : 'cands';
    return 'pool';
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

  function top(title, sub) {
    return '<header class="hd-top">' +
      '<div class="hd-top__t"><p class="hd-top__title">' + title + '</p><p class="hd-top__sub">' + sub + '</p></div>' +
      '<div class="hd-top__r">' +
        '<button type="button" class="hd-aibtn" data-act="ai">' + svg('spark') + '<span>Higherd AI</span></button>' +
        '<span class="hd-bell" aria-hidden="true">' + svg('bell') + '</span>' +
        '<span class="hd-user"><span class="hd-user__av" aria-hidden="true">GD</span>' +
          '<span class="hd-user__t"><b>Gerd Doe</b><small>HR Manager · Higherd</small></span></span>' +
      '</div>' +
    '</header>';
  }

  function frame(step, title, sub, body) {
    return '<div class="hd-chrome">' +
        '<span class="hd-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="hd-chrome__t">Higherd · demo data</span>' +
        '<button type="button" class="hd-link" data-act="reset">Reset demo</button>' +
      '</div>' +
      '<div class="hd-shell">' + side(step) +
        '<div class="hd-main">' + top(title, sub) + '<div class="hd-body">' + body + '</div></div>' +
      '</div>';
  }

  // =========================================================
  // Shared widgets
  // =========================================================
  function baros(values, showDelta) {
    return '<div class="hd-baros">' + DIMS.map(function (d) {
      var base = BASE[d.k], v = values[d.k], dv = v - base;
      return '<div class="hd-baro" title="' + d.n + '">' +
        '<span class="hd-baro__v">' + v + '%' +
          (showDelta && dv ? '<em class="' + (dv > 0 ? 'is-up' : 'is-down') + '">' + signed(dv) + '</em>' : '') + '</span>' +
        '<span class="hd-baro__track">' +
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

  // =========================================================
  // 01 Dashboard
  // =========================================================
  function render1() {
    var el = $('#hd-1'); if (!el) return;
    var k = PERIOD[S.period];
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
            (poolIds().length ? '<span class="hd-tag">With Talent Pool</span>' : '<span class="hd-tag hd-tag--soft">Team baseline</span>') + '</div>' +
          baros(modeled(), poolIds().length > 0) +
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
  // 02 Gap (Workforce Alignment)
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
              return '<div class="hd-wowline"><span>' + d.n + '</span><b>' + BASE[d.k] + '%</b>' +
                '<span class="hd-hbar__t"><i style="width:' + BASE[d.k] + '%;background:' + d.c + '"></i></span></div>';
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
      '</div>' +

      '<ol class="hd-process">' + ['Direction', 'Capture', 'Gaps', 'Moves', 'Decision', 'Measure'].map(function (p, i) {
        return '<li class="' + (i === 2 ? 'is-on' : i < 2 ? 'is-done' : '') + '"><span>0' + (i + 1) + '</span>' + p + '</li>';
      }).join('') + '</ol>';

    el.innerHTML = frame(2, 'Workforce Alignment', 'Workforce Intelligence / Alignment · GAP-042', body);
  }

  // =========================================================
  // 03 Post a job or Find candidate
  // =========================================================
  function opt(list, val, fmt) {
    return list.map(function (o) {
      return '<option value="' + o + '"' + (String(o) === String(val) ? ' selected' : '') + '>' + (fmt ? fmt(o) : o) + '</option>';
    }).join('');
  }

  function render3() {
    var el = $('#hd-3'); if (!el) return;
    var J = S.job, body;
    var seg = '<div class="hd-switch" role="group" aria-label="How to close the gap">' +
      '<button type="button" data-act="mode" data-v="post" aria-pressed="' + (S.mode === 'post') + '">' + svg('jobs') + 'Post a job</button>' +
      '<button type="button" data-act="mode" data-v="find" aria-pressed="' + (S.mode === 'find') + '">' + svg('search') + 'Find candidate</button>' +
    '</div>';

    if (S.mode === 'post') {
      body = seg +
        (J.published
          ? '<section class="hd-notice"><p><b>Published on the Job Board.</b> Higherd found ' + CANDS.length + ' matching candidates for this job.</p>' +
              '<button type="button" class="hd-btn" data-act="mode" data-v="find">See matching candidates →</button></section>'
          : '') +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Post New Job</p><span class="hd-tag hd-tag--soft">From GAP-042</span></div>' +
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
              ? '<span class="hd-ok">✓ Published</span><button type="button" class="hd-link" data-act="unpublish">Unpublish</button>'
              : '<button type="button" class="hd-btn" data-act="publish">Publish job</button>') +
          '</div>' +
        '</section>';
    } else {
      body = seg +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Matching candidates</p>' +
            '<label class="hd-search">' + svg('search') + '<span class="hd-sr">Search candidates</span><input type="search" id="hd-q" placeholder="Search by skill" value="' + esc(S.q) + '"></label></div>' +
          '<div id="hd-results"></div>' +
        '</section>' +
        '<section class="hd-coverbar" id="hd-coverbar"></section>';
    }

    el.innerHTML = frame(3, S.mode === 'post' ? 'Job Board' : 'Candidates',
      S.mode === 'post' ? 'Post a job for GAP-042 · ' + num(J.fte) + ' FTE' : 'Matched to ' + esc(J.title) + ' · anonymized IDs', body);
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
  // 04 Talent Pool + barometers
  // =========================================================
  function statusColor(k) { for (var i = 0; i < STATUS.length; i++) if (STATUS[i][0] === k) return STATUS[i][2]; return '#94A3B8'; }

  function render4() {
    var el = $('#hd-4'); if (!el) return;
    var ids = poolIds(), M = modeled(), f = cover();
    var lifted = DIMS.filter(function (d) { return M[d.k] > BASE[d.k]; })
      .sort(function (a, b) { return (M[b.k] - BASE[b.k]) - (M[a.k] - BASE[a.k]); });
    var body;

    if (!ids.length) {
      body = '<section class="hd-panel hd-emptystate">' + svg('pool', 'hd-emptystate__i') +
        '<p class="hd-panel__t">Your Talent Pool is empty</p>' +
        '<p class="hd-muted">Add candidates in step 03 and see how they change the team&#39;s Ways of Working.</p>' +
        '<button type="button" class="hd-btn" data-go="3" data-mode="find">Find candidates</button></section>';
    } else {
      body =
        '<div class="hd-grid hd-grid--pool">' +
          '<section class="hd-panel">' +
            '<div class="hd-panel__h"><p class="hd-panel__t">Ways of Working with your Talent Pool</p><span class="hd-tag">Modeled</span></div>' +
            baros(M, true) +
            '<p class="hd-foot">The light part of each bar is the team today. The colour is the team with the ' + ids.length + ' candidate' + (ids.length === 1 ? '' : 's') + ' in your Talent Pool.</p>' +
          '</section>' +
          '<section class="hd-panel hd-sumcard">' +
            '<p class="hd-eyebrow">GAP-042 coverage</p>' +
            '<p class="hd-big">' + num(f) + ' <span>/ ' + num(S.job.fte) + ' FTE</span></p>' +
            '<span class="hd-hbar__t"><i style="width:' + Math.min(100, f / S.job.fte * 100) + '%;background:#16A34A"></i></span>' +
            '<p class="hd-muted">' + (f >= S.job.fte ? 'The gap is covered.' : num(S.job.fte - f) + ' FTE still open.') + '</p>' +
            '<p class="hd-sub">Biggest lift</p>' +
            '<p class="hd-lift">' + (lifted.length ? lifted.slice(0, 2).map(function (d) {
              return '<span><b>' + signed(M[d.k] - BASE[d.k]) + '</b> ' + d.n + '</span>';
            }).join('') : '<span>No lift yet</span>') + '</p>' +
          '</section>' +
        '</div>' +
        '<section class="hd-panel">' +
          '<div class="hd-panel__h"><p class="hd-panel__t">Talent Pool · ' + ids.length + ' candidate' + (ids.length === 1 ? '' : 's') + '</p>' +
            '<button type="button" class="hd-link" data-go="3" data-mode="find">Add more</button></div>' +
          '<div class="hd-tablewrap"><table class="hd-table hd-table--pool">' +
            '<thead><tr><th>Candidate</th><th>Match</th><th>Covers</th><th>Status</th><th>Impact on WoW</th><th><span class="hd-sr">Remove</span></th></tr></thead>' +
            '<tbody>' + ids.map(function (id) {
              var c = cand(id);
              return '<tr><td><button type="button" class="hd-idlink" data-act="profile" data-id="' + id + '">' + id + '</button></td>' +
                '<td class="hd-match">' + c.match + '%</td><td>' + num(c.fte) + ' FTE</td>' +
                '<td><label class="hd-sr" for="st-' + id + '">Status of ' + id + '</label><select id="st-' + id + '" class="hd-status" data-status="' + id + '" style="--c:' + statusColor(S.pool[id]) + '">' +
                  STATUS.map(function (s) { return '<option value="' + s[0] + '"' + (S.pool[id] === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') +
                '</select></td>' +
                '<td>' + impactChips(c) + '</td>' +
                '<td><button type="button" class="hd-x" data-act="pool" data-id="' + id + '" aria-label="Remove ' + id + ' from the Talent Pool">×</button></td></tr>';
            }).join('') + '</tbody></table></div>' +
        '</section>';
    }

    el.innerHTML = frame(4, 'Talent Pool', ids.length ? 'Candidates for GAP-042 and their effect on the team' : 'Candidates you saved for GAP-042', body);
  }

  // =========================================================
  // Profile dialog
  // =========================================================
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
      if (b.getAttribute('data-act') === 'close') dlg.close();
      if (b.getAttribute('data-act') === 'pool') { togglePool(b.getAttribute('data-id')); openProfile(b.getAttribute('data-id')); }
    });
    return dlg;
  }

  function openProfile(id) {
    var c = cand(id); if (!c) return;
    var dlg = dialog();
    dlg.innerHTML =
      '<div class="hd-dialog__h"><div><p class="hd-eyebrow">Candidate profile · anonymized</p><p class="hd-dialog__t">' + c.id + '</p>' +
        '<p class="hd-muted">P&amp;C Commissioning Engineer · ' + c.yrs + ' years · ' + c.loc + '</p></div>' +
        '<button type="button" class="hd-x" data-act="close" aria-label="Close">×</button></div>' +
      '<p class="hd-dialog__p">' + c.sum + '</p>' +
      '<div class="hd-stats"><div><span>Match</span><b>' + c.match + '%</b></div><div><span>Covers</span><b>' + num(c.fte) + ' FTE</b></div><div><span>Available</span><b>' + c.weeks + ' weeks</b></div></div>' +
      '<p class="hd-sub">Impact on the team&#39;s Ways of Working</p>' +
      '<div class="hd-tablewrap"><table class="hd-table"><thead><tr>' + DIMS.map(function (d) { return '<th class="hd-imp">' + d.l + '</th>'; }).join('') + '</tr></thead>' +
        '<tbody><tr>' + impactCells(c) + '</tr></tbody></table></div>' +
      '<p class="hd-sub">Skills</p><div class="hd-skills">' + c.skills.map(function (s) { return '<span class="hd-skill">' + s + '</span>'; }).join('') + '</div>' +
      '<div class="hd-actions">' + poolBtn(c) + '</div>';
    if (!dlg.open) dlg.showModal();
  }

  function togglePool(id) {
    if (S.pool[id]) { delete S.pool[id]; toast(id + ' removed from the Talent Pool'); }
    else { S.pool[id] = 'saved'; toast(id + ' added to the Talent Pool'); }
    save(); renderAll();
  }

  // =========================================================
  // Higherd AI assistant (suggested questions, sample answers)
  // =========================================================
  var AI_Q = {
    1: ['What needs my attention today?', 'Which gap is most critical?'],
    2: ['How should I close this gap?', 'Why is Employee Satisfaction so low?'],
    3: ['Write the job description for me', 'Which candidate closes the gap fastest?'],
    4: ['How does my Talent Pool change the team?', 'Who should I interview first?']
  };

  function fastest() { return CANDS.slice().sort(function (a, b) { return a.weeks - b.weeks || b.match - a.match; })[0]; }

  function aiAnswer(q) {
    var ids = poolIds(), M = modeled(), c;
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
        if (S.mode !== 'post') { S.mode = 'post'; save(); }
        writeDesc();
        return 'Done. I wrote the job description from GAP-042 and put it in the Post New Job form. You can edit it before you publish.';
      case 'Which candidate closes the gap fastest?':
        c = fastest();
        return c.id + ': ' + c.match + '% match, covers ' + num(c.fte) + ' FTE and can start in ' + c.weeks + ' weeks. RK-113567 is the strongest match at 95%, available in 4 weeks.';
      case 'How does my Talent Pool change the team?':
        if (!ids.length) return 'Your Talent Pool is empty. Add candidates in step 03 and I will show how they move the barometers.';
        var ch = DIMS.filter(function (d) { return M[d.k] !== BASE[d.k]; }).map(function (d) { return d.n + ' ' + signed(M[d.k] - BASE[d.k]); });
        return 'With ' + ids.length + ' candidate' + (ids.length === 1 ? '' : 's') + ', the team changes: ' + (ch.length ? ch.join(', ') : 'no change yet') + '. Together they cover ' + num(cover()) + ' of ' + num(S.job.fte) + ' FTE.';
      case 'Who should I interview first?':
        if (!ids.length) return 'Add candidates to the Talent Pool first, then I can rank them for interviews.';
        c = ids.map(cand).sort(function (a, b) { return b.match - a.match; })[0];
        return 'Start with ' + c.id + ' (' + c.match + '% match). Set the status to Interviewing in the Talent Pool when you book it.';
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

  function openAI() {
    var p = aiPanel();
    p.hidden = false;
    renderAI(false);
    var i = p.querySelector('input'); if (i) i.focus();
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
    3: '[data-act="writedesc"], .hd-card [data-act="pool"][aria-pressed="false"]',
    4: '.hd-status, .hd-emptystate .hd-btn'
  };
  var touched = {};

  function pulse() {
    for (var n = 1; n <= 4; n++) {
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
  function renderAll() { render1(); render2(); render3(); render4(); pulse(); }

  function onClick(e) {
    var go = e.target.closest('[data-go]');
    if (go) {
      if (go.disabled) return;
      if (go.hasAttribute('data-mode')) { S.mode = go.getAttribute('data-mode'); save(); render3(); }
      goTo(Number(go.getAttribute('data-go')));
      pulse();
      return;
    }
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');

    if (act === 'reset') {
      if (!confirm('Reset the demo to the sample data?')) return;
      try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
      S = defaults(); aiLog = []; touched = {}; renderAll(); return;
    }
    if (act === 'ai') { openAI(); return; }
    if (act === 'period') { S.period = b.getAttribute('data-v'); save(); render1(); pulse(); return; }
    if (act === 'gap') {
      if (b.getAttribute('data-live') === '1') goTo(2);
      else toast('Only GAP-042 is part of this demo');
      return;
    }
    if (act === 'mode') { S.mode = b.getAttribute('data-v'); save(); render3(); pulse(); return; }
    if (act === 'fte') { S.job.fte = Math.max(0.5, Math.min(10, S.job.fte + Number(b.getAttribute('data-d')))); save(); renderAll(); return; }
    if (act === 'rmskill') { S.job.skills.splice(Number(b.getAttribute('data-i')), 1); save(); render3(); return; }
    if (act === 'writedesc') { writeDesc(); toast('Higherd AI wrote the job description'); return; }
    if (act === 'publish') {
      S.job.published = true; save(); render3(); pulse();
      toast('Job published on the Job Board · ' + CANDS.length + ' matching candidates');
      return;
    }
    if (act === 'unpublish') { S.job.published = false; save(); render3(); return; }
    if (act === 'profile') { openProfile(b.getAttribute('data-id')); return; }
    if (act === 'pool') { togglePool(b.getAttribute('data-id')); return; }
  }

  function onInput(e) {
    var t = e.target;
    if (t.id === 'hd-q') { S.q = t.value; save(); renderResults(); pulse(); return; }
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
      S.pool[id] = t.value; save();
      toast(id + ' moved to ' + t.options[t.selectedIndex].text);
      render1(); render4(); pulse();
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
  // Keep the assistant's suggestions in step with the visible screen
  host.addEventListener('click', function (e) {
    if (e.target.closest('[role="tab"], [data-step], [data-go]')) {
      setTimeout(function () { var p = $('#hd-ai'); if (p && !p.hidden) renderAI(false); }, 0);
    }
  });
  renderAll();
})();
