/*
 * Key Manager Page Logic
 * Uses AES-GCM encryption via Web Crypto API with fixed passphrase.
 * Requires js/security.js and data/api/odpt-unified.js.
 */
(function() {
  "use strict";

  var ENCRYPTION_PASSPHRASE = "pixel-tetsudo-enc-key-v3";
  var STORAGE_KEY = "odpt_keys_enc";

  function setStatus(el, type, msg) {
    el.className = "status show " + type;
    el.textContent = msg;
  }

  function showClearButton(show) {
    document.getElementById("clearBtn").classList.toggle("hidden", !show);
  }

  window.saveKeys = async function() {
    var statusEl = document.getElementById("status");
    var centerKey = document.getElementById("centerKey").value.trim();
    var challengeKey = document.getElementById("challengeKey").value.trim();

    if (!centerKey || !challengeKey) {
      setStatus(statusEl, "error", "両方のキーを入力してください");
      return;
    }

    // Validate key format
    if (!window.validateApiKey(centerKey)) {
      setStatus(statusEl, "error", "Center キーの形式が正しくありません（半角英数字・-・_、10〜128文字）");
      return;
    }
    if (!window.validateApiKey(challengeKey)) {
      setStatus(statusEl, "error", "Challenge キーの形式が正しくありません（半角英数字・-・_、10〜128文字）");
      return;
    }

    if (typeof cryptoEncrypt !== "function") {
      setStatus(statusEl, "error", "システム読み込み中…もう一度押してください");
      return;
    }

    try {
      var plain = "ODPT_CENTER:" + centerKey + "|CHALLENGE_2026:" + challengeKey;
      var encoded = await cryptoEncrypt(plain, ENCRYPTION_PASSPHRASE);
      localStorage.setItem(STORAGE_KEY, encoded);
      localStorage.removeItem("odpt_keys_b64");
      setStatus(statusEl, "success", "キーを保存しました");
      showClearButton(true);
    } catch(e) {
      setStatus(statusEl, "error", "保存エラー: " + e.message);
    }
  };

  window.clearKeys = function() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("odpt_keys_b64");
    showClearButton(false);
    var statusEl = document.getElementById("status");
    setStatus(statusEl, "success", "キーを削除しました");
    document.getElementById("centerKey").value = "";
    document.getElementById("challengeKey").value = "";
  };

  window.addEventListener("DOMContentLoaded", function() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      showClearButton(true);
      try {
        // Decrypt with fixed passphrase to restore keys
        if (typeof cryptoDecrypt === "function") {
          var decrypted = cryptoDecrypt(stored, ENCRYPTION_PASSPHRASE);
          if (decrypted && decrypted.indexOf("ODPT_CENTER:") === 0) {
            decrypted.split("|").forEach(function(pair) {
              var idx = pair.indexOf(":");
              if (idx > 0) {
                var name = pair.substring(0, idx).trim();
                var value = pair.substring(idx + 1).trim();
                if (name === "ODPT_CENTER") document.getElementById("centerKey").value = value;
                if (name === "CHALLENGE_2026") document.getElementById("challengeKey").value = value;
              }
            });
          }
        }
      } catch(e) {
        // Ignore decrypt errors on load
      }
    }
  });
})();