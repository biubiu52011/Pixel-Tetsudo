/*
 * Pixel Tetsudo - Security Utilities
 * Input validation, URL sanitization, and security helpers.
 */
(function() {
  "use strict";

  // API key format: alphanumeric + hyphens + underscores, 10-128 chars
  var API_KEY_RE = /^[A-Za-z0-9_-]{10,128}$/;

  /**
   * Validate an ODPT API key format.
   * Returns true if the key matches expected pattern.
   */
  window.validateApiKey = function(key) {
    if (typeof key !== "string") return false;
    return API_KEY_RE.test(key.trim());
  };

  /**
   * Sanitize a URL: only allow https:// or same-origin relative paths.
   * Rejects javascript:, data:, and protocol-relative URLs.
   */
  window.sanitizeUrl = function(url) {
    if (typeof url !== "string" || !url) return "";
    var trimmed = url.trim();
    if (!trimmed) return "";
    // Reject dangerous protocols
    if (/^javascript:/i.test(trimmed)) return "";
    if (/^data:/i.test(trimmed)) return "";
    if (/^vbscript:/i.test(trimmed)) return "";
    // Allow https:// and relative paths
    if (/^https:\/\//.test(trimmed)) return trimmed;
    if (/^\/\//.test(trimmed)) return "";
    if (/^[a-z][a-z0-9+.-]*:/.test(trimmed)) return "";
    // Allow relative URLs (same-origin)
    if (/^[\?#\w\.\/\-]/.test(trimmed)) return trimmed;
    return "";
  };

  /**
   * Sanitize an image URL for <img src>.
   * Allows https://, http://, data: (for inline SVG), and relative paths.
   */
  window.sanitizeImageUrl = function(url) {
    if (typeof url !== "string" || !url) return "";
    var trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//.test(trimmed) || /^data:image\//.test(trimmed)) return trimmed;
    if (/^\/\//.test(trimmed)) return "";
    if (/^[a-z][a-z0-9+.-]*:/.test(trimmed)) return "";
    if (/^[\w\.\/\-]/.test(trimmed)) return trimmed;
    return "";
  };

  /**
   * Generate a random nonce string for future CSRF protection.
   */
  window.generateNonce = function(length) {
    length = length || 32;
    var arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return btoa(String.fromCharCode.apply(null, arr)).replace(/[+/=]/g, "");
  };

  /**
   * Check if Web Crypto API is available (required for key encryption).
   */
  window.isCryptoAvailable = function() {
    return typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined";
  };

})();