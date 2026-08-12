/**
 * Pixel Tetsudo - Home Bundle
 * Initializes all modules for the home page
 */
(function() {
  'use strict';

  // Sightseeing Module
  if (typeof window.SightseeingModule !== 'undefined') {
    window.SightseeingModule.init();
  }

  // Search UI
  if (typeof window.SearchUI !== 'undefined') {
    window.SearchUI.init();
  }

  // Tab switching
  if (typeof window.TabSwitch !== 'undefined') {
    window.TabSwitch.init();
  }

  // History module
  if (typeof window.SearchHistory !== 'undefined') {
    window.SearchHistory.init();
  }

  // Force single column for sm-grid based on viewport width
  function ensureSingleColumn() {
    const grid = document.getElementById('smGrid');
    if (grid) {
      grid.style.gridTemplateColumns = window.innerWidth <= 1000 ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))';
    }
  }
  ensureSingleColumn();
  window.addEventListener('resize', ensureSingleColumn);
})();