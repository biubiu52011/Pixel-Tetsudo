/*
 * Key Manager Page Logic
 */
(function() {
  "use strict";

  // Load ODPT module for cryptoEncrypt
  var _odptReady = false;
  function checkODPT() {
    if (typeof cryptoEncrypt === "function") { _odptReady = true; }
    else { setTimeout(checkODPT, 100); }
  }
  checkODPT();

  window.saveKeys = async function() {
    var centerKey = document.getElementById("centerKey").value.trim();
    var challengeKey = document.getElementById("challengeKey").value.trim();
    var statusEl = document.getElementById("status");
    if (!centerKey || !challengeKey) {
      statusEl.className = "status show error";
      statusEl.textContent = "両方のキーを入力してください";
      return;
    }
    if (!_odptReady) {
      statusEl.className = "status show error";
      statusEl.textContent = "システム読み込み中…もう一度押してください";
      return;
    }
    try {
      var plain = "ODPT_CENTER:" + centerKey + "|CHALLENGE_2026:" + challengeKey;
      var encoded = await cryptoEncrypt(plain, centerKey + challengeKey);
      localStorage.setItem("odpt_keys_enc", encoded);
      localStorage.removeItem("odpt_keys_b64");
      statusEl.className = "status show success";
      statusEl.textContent = "キーを保存しました";
      document.getElementById("clearBtn").style.display = "block";
    } catch(e) {
      statusEl.className = "status show error";
      statusEl.textContent = "保存エラー: " + e.message;
    }
  };

  window.clearKeys = function() {
    localStorage.removeItem("odpt_keys_b64");
    localStorage.removeItem("odpt_keys_enc");
    document.getElementById("clearBtn").style.display = "none";
    var statusEl = document.getElementById("status");
    statusEl.className = "status show success";
    statusEl.textContent = "キーを削除しました";
    document.getElementById("centerKey").value = "";
    document.getElementById("challengeKey").value = "";
  };

  window.addEventListener("DOMContentLoaded", function() {
    var stored = localStorage.getItem("odpt_keys_b64");
    if (stored) {
      document.getElementById("clearBtn").style.display = "block";
      try {
        var decoded = atob(stored);
        decoded.split("|").forEach(function(pair) {
          var idx = pair.indexOf(":");
          if (idx > 0) {
            var name = pair.substring(0, idx).trim();
            var value = pair.substring(idx + 1).trim();
            if (name === "ODPT_CENTER") document.getElementById("centerKey").value = value;
            if (name === "CHALLENGE_2026") document.getElementById("challengeKey").value = value;
          }
        });
      } catch(e) {}
    }
  });
})();