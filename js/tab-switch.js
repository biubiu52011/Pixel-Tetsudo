/*
 * Page tab switching with hash support
 */

(function() {
  'use strict';

  function initTabSwitching() {
    var btns = document.querySelectorAll('.tab-btn');
    var contents = document.querySelectorAll('.tab-content');

    btns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        var tabId = this.getAttribute('data-tab');

        contents.forEach(function(c) { c.classList.remove('active'); });
        btns.forEach(function(b) { b.classList.remove('active'); });

        this.classList.add('active');
        var target = document.getElementById('tab-' + tabId);
        if (target) {
          target.classList.add('active');
        }
      });
    });

    // Handle URL hash on page load
    var hash = window.location.hash;
    if (hash) {
      var tabId = hash.replace('#', '');
      var targetBtn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
      var targetContent = document.getElementById('tab-' + tabId);

      if (targetBtn && targetContent) {
        contents.forEach(function(c) { c.classList.remove('active'); });
        btns.forEach(function(b) { b.classList.remove('active'); });

        targetBtn.classList.add('active');
        targetContent.classList.add('active');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabSwitching);
  } else {
    initTabSwitching();
  }
})();
