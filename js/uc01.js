/* =========================================================
   Higherd – UC01 demo page: hero gallery (two BIM views, with credit line)
   and the Explore live demo button (the demo itself is in js/uc01-demo.js)
   ========================================================= */

/* Hero photo gallery: clicking a small photo shows it in the large frame */
(function () {
  var root = document.querySelector('[data-gallery]');
  if (!root) return;
  var main = root.querySelector('[data-gallery-main]');
  var thumbs = Array.prototype.slice.call(root.querySelectorAll('.uc-gallery__thumb'));
  var credit = root.querySelector('[data-gallery-credit]');

  main.addEventListener('load', function () { main.classList.remove('is-loading'); });

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      if (thumb.getAttribute('aria-pressed') === 'true') return;
      thumbs.forEach(function (t) { t.setAttribute('aria-pressed', t === thumb ? 'true' : 'false'); });
      main.classList.add('is-loading');
      main.width = Number(thumb.getAttribute('data-w'));
      main.height = Number(thumb.getAttribute('data-h'));
      main.alt = thumb.getAttribute('data-alt');
      main.src = thumb.getAttribute('data-src');
      if (credit) credit.textContent = thumb.getAttribute('data-credit');
    });
  });
})();

/* "Explore live demo": slide Gherd's avatar to the right, spin its ring, then open the demo */
(function () {
  var btn = document.querySelector('[data-live-demo]');
  if (!btn) return;
  var orb = btn.querySelector('.uc-live__orb');
  var target = document.getElementById('journey');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var busy = false;

  function go() {
    if (target) target.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#journey');
  }

  btn.addEventListener('click', function (e) {
    if (!target) return;
    e.preventDefault();
    if (reduce) { go(); return; }
    if (busy) return;
    busy = true;
    var pad = parseFloat(getComputedStyle(btn).paddingLeft) || 0;
    btn.style.setProperty('--travel', (btn.clientWidth - orb.offsetWidth - pad * 2) + 'px');
    btn.classList.add('is-launching');
    setTimeout(go, 650);
    // Put the button back once the page has moved on, ready for the next visit
    setTimeout(function () { btn.classList.remove('is-launching'); busy = false; }, 1600);
  });
})();
