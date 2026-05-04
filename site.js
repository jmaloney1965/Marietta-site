/* ============================================================
   Marietta Research Solutions — site.js
   v=20260504
   Provides:
   - Active nav highlighting
   - Back-to-top button
   - FAQ accordion (data-faq-item)
   - Services task filter (data-task-filter / data-task-card)
   - Soft form submit overlay
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    activeNav();
    backToTop();
    initFAQ();
    initTaskFilter();
    initFormOverlay();
  }

  /* ---------- Active nav ---------- */
  function activeNav() {
    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!path) path = 'index.html';
    var links = document.querySelectorAll('.site-nav a');
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute('href') || '').toLowerCase();
      if (href === path) links[i].classList.add('nav-active');
    }
  }

  /* ---------- Back-to-top ---------- */
  function backToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    function onScroll() {
      btn.style.display = window.scrollY > 400 ? 'block' : 'none';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  }

  /* ---------- FAQ accordion ----------
     Markup pattern:
     <div class="faq-item" data-faq-item>
       <button class="faq-q" type="button" aria-expanded="false">
         <span>Question text</span>
         <span class="faq-toggle" aria-hidden="true">+</span>
       </button>
       <div class="faq-a"><p>Answer.</p></div>
     </div>
  */
  function initFAQ() {
    var items = document.querySelectorAll('[data-faq-item]');
    items.forEach(function (item) {
      var q = item.querySelector('.faq-q');
      if (!q) return;
      q.setAttribute('aria-expanded', 'false');
      q.addEventListener('click', function () {
        var open = item.classList.toggle('is-open');
        q.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  /* ---------- Services task filter ----------
     Markup pattern:
     <div data-task-filter>
       <button class="task-chip is-active" data-task="all">Everything</button>
       <button class="task-chip" data-task="design">Design a new antenna</button>
       ...
     </div>
     <div data-task-grid>
       <div class="capability-card" data-tasks="design simulate">...</div>
       ...
     </div>
     <span data-task-shown></span> of <span data-task-total></span>
  */
  function initTaskFilter() {
    var filter = document.querySelector('[data-task-filter]');
    if (!filter) return;
    var grid = document.querySelector('[data-task-grid]');
    if (!grid) return;
    var chips = filter.querySelectorAll('[data-task]');
    var cards = grid.querySelectorAll('[data-tasks]');
    var shown = document.querySelector('[data-task-shown]');
    var total = document.querySelector('[data-task-total]');
    if (total) total.textContent = String(cards.length);

    function apply(taskId) {
      var n = 0;
      cards.forEach(function (card) {
        var tasks = (card.getAttribute('data-tasks') || '').split(/\s+/);
        var match = (taskId === 'all') || tasks.indexOf(taskId) >= 0;
        card.style.display = match ? '' : 'none';
        if (match) n++;
      });
      if (shown) shown.textContent = String(n);
      chips.forEach(function (c) {
        c.classList.toggle('is-active', c.getAttribute('data-task') === taskId);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        apply(chip.getAttribute('data-task'));
      });
    });

    var initial = filter.querySelector('.is-active');
    apply((initial && initial.getAttribute('data-task')) || 'all');
  }

  /* ---------- Form submit overlay ----------
     Adds .is-sending to button + shows overlay if present
  */
  function initFormOverlay() {
    var forms = document.querySelectorAll('form[data-overlay]');
    var overlay = document.querySelector('.form-overlay');
    forms.forEach(function (f) {
      f.addEventListener('submit', function () {
        var btn = f.querySelector('button[type="submit"]');
        if (btn) {
          btn.classList.add('is-sending');
          btn.disabled = true;
        }
        if (overlay) overlay.style.display = 'flex';
      });
    });
  }
})();
