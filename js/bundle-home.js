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
})();
