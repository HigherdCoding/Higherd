/* =========================================================
   Higherd – UC05 demo page: guided tour of the product screens (English by default, German version on request)
   Chapter tabs (arrow keys, Home/End), screen dots, Previous / Next / Restart
   ========================================================= */
(function () {
  var IMG = '/assets/img/uc05/';
  var IMG_EN = IMG + 'en/';
  // One entry per screen in tour order: en = English frame, file = German reference frame
  var SCREENS = [
    { ch: 1, en: '01-my-overview', enH: 1610, file: '01-meine-uebersicht', h: 1611, de: '01 · Meine Übersicht', title: 'My overview',
      line: 'See the work waiting for coordination: document packages, preparation status and Gerda’s responsibilities in the workflow.' },
    { ch: 2, en: '02-all-files', enH: 1397, file: '02-alle-dateien', h: 1397, de: '02 · Alle Dateien', title: 'Document manager: all files',
      line: 'Select the source revision before deriving new outputs. Source documents and revision IDs stay unchanged.' },
    { ch: 3, en: '03-pdf-creator-mapping', enH: 1397, file: '03-pdf-creator-mapping', h: 1397, de: '03 · PDF Creator – Mapping', title: 'PDF Creator: field mapping',
      line: 'Map project data to the uploaded target template, directly on the PDF. PDF Creator sits under Document manager › Integrations.' },
    { ch: 3, en: '04-pdf-creator-comparison', enH: 1397, file: '04-pdf-creator-vergleich', h: 1397, de: '04 · PDF Creator – Dokumentvergleich', title: 'Compare document layouts',
      line: 'Check the output against the original before proceeding: same project data, two client layouts.' },
    { ch: 3, en: '05-target-documents', enH: 1397, file: '05-zielunterlagen', h: 1397, de: '05 · Zielunterlagen', title: 'Target documents',
      line: 'Keep the six outputs linked to their source revision and template version.' },
    { ch: 4, en: '06-select-workflow', enH: 1397, file: '06-workflow-auswaehlen', h: 1397, de: '06 · Workflow auswählen', title: 'Select workflow',
      line: 'Select the right review route for rail and road: choose an existing workflow, duplicate one, or create a new one from a template or from scratch.' },
    { ch: 4, en: '07-workflow-editor', enH: 1391, file: '07-workflow-editor', h: 1392, de: '07 · Workflow-Editor', title: 'Workflow editor',
      line: 'See responsibilities and dependencies in context. Each task menu sets roles, duration, previous and next phase, parallel review and links.' },
    { ch: 4, en: '07a-inline-assignment', enH: 1391, file: '07a-inline-zuordnung', h: 1392, de: '07a · Inline-Zuordnung', title: 'Inline assignment',
      line: 'Assign the role and duration inside the same workflow. Apply updates the task; Cancel restores it.' },
    { ch: 4, en: '09-workflow-library', enH: 1397, file: '09-workflow-bibliothek', h: 1397, de: '09 · Workflow-Bibliothek', title: 'Workflow library',
      line: 'Reuse a suitable workflow, then check project-specific roles. A duplicate copies phases and dependencies, never completed approvals or signatures.' },
    { ch: 4, en: '10-new-workflow', enH: 1397, file: '10-neuer-workflow', h: 1397, de: '10 · Neuen Workflow erstellen', title: 'Create new workflow',
      line: 'Define a draft process where a suitable template is unavailable. The draft keeps the selected documents until it is saved.' },
    { ch: 4, en: '10a-inline-draft-assignment', enH: 1397, file: '10a-inline-zuordnung-entwurf', h: 1397, de: '10a · Inline-Zuordnung – Entwurf', title: 'Inline draft assignment',
      line: 'Set ownership and dependencies before starting the draft. Saving a draft is not a submission, signature or approval.' },
    { ch: 5, en: '08-workflow-tasks', enH: 1397, file: '08-workflowaufgaben', h: 1397, de: '08 · Workflowaufgaben', title: 'Workflow tasks',
      line: 'See who needs to act next and which documents are affected. The same status appears in the document manager and on the dashboard.' }
  ];

  var root = document.querySelector('[data-tour]');
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
  var panel = root.querySelector('[role="tabpanel"]');
  var $ = function (sel) { return root.querySelector(sel); };
  var img = $('[data-tour-img]'), full = $('[data-tour-full]'), frame = $('[data-tour-frame]');
  var title = $('[data-tour-title]'), line = $('[data-tour-line]');
  var count = $('[data-tour-count]'), dots = $('[data-tour-dots]');
  var prev = $('[data-tour-step="-1"]'), next = $('[data-tour-step="1"]');
  var restart = $('[data-tour-restart]'), end = $('[data-tour-end]');
  var langBtns = Array.prototype.slice.call(root.querySelectorAll('[data-tour-lang]'));
  var lang = 'en';
  var current = 0;

  // Preload the screens so switching feels instant
  function srcOf(s, l) { return l === 'de' ? IMG + s.file + '.webp' : IMG_EN + s.en + '.webp'; }
  function preload(l) { SCREENS.forEach(function (s) { var i = new Image(); i.src = srcOf(s, l); }); }
  preload('en');

  function firstOf(ch) {
    for (var i = 0; i < SCREENS.length; i++) if (SCREENS[i].ch === ch) return i;
    return 0;
  }

  function show(index, focusTab) {
    current = index;
    var s = SCREENS[index];
    var src = srcOf(s, lang);

    img.src = src;
    img.height = lang === 'de' ? s.h : s.enH;
    img.alt = lang === 'de' ? s.de + ' (German Higherd Bau screen): ' + s.title : 'Higherd Bau screen: ' + s.title;
    full.href = src;
    full.setAttribute('aria-label', 'Open ' + s.title + ' in full size (new tab)');
    frame.scrollLeft = 0;

    title.textContent = s.title;
    line.textContent = s.line;
    count.textContent = 'Screen ' + (index + 1) + ' of ' + SCREENS.length;

    tabs.forEach(function (tab) {
      var active = Number(tab.getAttribute('data-chapter')) === s.ch;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      if (active) {
        panel.setAttribute('aria-labelledby', tab.id);
        if (focusTab) tab.focus();
        tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    });

    // Dots for the screens of this chapter (hidden when the chapter has one screen)
    dots.innerHTML = '';
    var inChapter = [];
    SCREENS.forEach(function (x, i) { if (x.ch === s.ch) inChapter.push(i); });
    dots.hidden = inChapter.length < 2;
    inChapter.forEach(function (i, n) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tour__dot';
      b.textContent = SCREENS[i].file.split('-')[0];
      b.setAttribute('aria-label', 'Screen ' + (n + 1) + ' of ' + inChapter.length + ': ' + SCREENS[i].title);
      if (i === index) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', function () { show(i, false); });
      li.appendChild(b);
      dots.appendChild(li);
    });

    var last = index === SCREENS.length - 1;
    prev.disabled = index === 0;
    restart.disabled = index === 0;
    next.hidden = last;
    end.hidden = !last;
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { show(firstOf(Number(tab.getAttribute('data-chapter'))), false); });
    tab.addEventListener('keydown', function (e) {
      var to = null;
      if (e.key === 'ArrowRight') to = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') to = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = tabs.length - 1;
      if (to === null) return;
      e.preventDefault();
      show(firstOf(Number(tabs[to].getAttribute('data-chapter'))), true);
    });
  });

  // Previous / next: keep the chapter list in view so the change is visible
  [prev, next].forEach(function (btn) {
    btn.addEventListener('click', function () {
      var to = current + Number(btn.getAttribute('data-tour-step'));
      if (to < 0 || to >= SCREENS.length) return;
      show(to, false);
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  restart.addEventListener('click', function () {
    show(0, false);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    tabs[0].focus({ preventScroll: true });
  });

  // Screen language: English by default, German as the second version
  var preloadedDe = false;
  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      lang = btn.getAttribute('data-tour-lang');
      langBtns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      frame.setAttribute('aria-label', (lang === 'de' ? 'German' : 'English') + ' product screen (scrollable)');
      if (lang === 'de' && !preloadedDe) { preload('de'); preloadedDe = true; }
      show(current, false);
    });
  });

  // The frame scrolls sideways on phones: make it reachable by keyboard
  frame.tabIndex = 0;
  frame.setAttribute('role', 'region');
  frame.setAttribute('aria-label', 'English product screen (scrollable)');

  show(0, false);
})();
