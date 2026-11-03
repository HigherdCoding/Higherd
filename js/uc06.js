/* =========================================================
   Higherd – UC06 demo page
   Accessible tabs (arrow keys, Home/End) + previous/next step buttons
   ========================================================= */
(function () {
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var prev = root.querySelector('[data-step="-1"]');
    var next = root.querySelector('[data-step="1"]');
    var current = 0;

    function select(index, focus) {
      current = index;
      tabs.forEach(function (tab, i) {
        var active = i === index;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      });
      if (focus) tabs[index].focus();
      tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === tabs.length - 1;
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (e) {
        var to = null;
        if (e.key === 'ArrowRight') to = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') to = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = tabs.length - 1;
        if (to === null) return;
        e.preventDefault();
        select(to, true);
      });
    });

    // Previous/next: keep the step list in view so the change is visible
    [prev, next].forEach(function (btn) {
      if (!btn) return;
      btn.addEventListener('click', function () {
        var to = current + Number(btn.getAttribute('data-step'));
        if (to < 0 || to >= tabs.length) return;
        select(to, false);
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    if (prev) prev.disabled = true;
  });
})();
