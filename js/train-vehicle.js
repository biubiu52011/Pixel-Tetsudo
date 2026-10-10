/* Pixel Tetsudo — unified vehicle identity + PNG artwork runtime.
 * Position sources remain independent; artwork resolution has one authority.
 * Unknown models and failed artwork use a neutral gallery PNG, never
 * a generated SVG vehicle or another model's PNG.
 */
(function() {
  "use strict";

var CANONICAL_VEHICLES = {
  "new-shuttle-2000-01": { displayName: "埼玉新都市交通2000系（01編成）", iconName: "埼玉新都市交通2000系（01編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_01編成_レッドパープル.png", aliases: ["2000系（01編成）","埼玉新都市交通2000系（01編成）"] },
  "new-shuttle-2000-02": { displayName: "埼玉新都市交通2000系（02編成）", iconName: "埼玉新都市交通2000系（02編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_02編成_オレンジ.png", aliases: ["2000系（02編成）","埼玉新都市交通2000系（02編成）"] },
  "new-shuttle-2000-03": { displayName: "埼玉新都市交通2000系（03編成）", iconName: "埼玉新都市交通2000系（03編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_03編成_グリーン.png", aliases: ["2000系（03編成）","埼玉新都市交通2000系（03編成）"] },
  "new-shuttle-2000-04": { displayName: "埼玉新都市交通2000系（04編成）", iconName: "埼玉新都市交通2000系（04編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_04編成_イエロー.png", aliases: ["2000系（04編成）","埼玉新都市交通2000系（04編成）"] },
  "new-shuttle-2000-05": { displayName: "埼玉新都市交通2000系（05編成）", iconName: "埼玉新都市交通2000系（05編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_05編成_ブルー.png", aliases: ["2000系（05編成）","埼玉新都市交通2000系（05編成）"] },
  "new-shuttle-2000-06": { displayName: "埼玉新都市交通2000系（06編成）", iconName: "埼玉新都市交通2000系（06編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_06編成_レッド.png", aliases: ["2000系（06編成）","埼玉新都市交通2000系（06編成）"] },
  "new-shuttle-2000-07": { displayName: "埼玉新都市交通2000系（07編成）", iconName: "埼玉新都市交通2000系（07編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_07編成_さくら色.png", aliases: ["2000系（07編成）","埼玉新都市交通2000系（07編成）"] },

  "keikyu-1500": { displayName: "京急1500形", iconName: "京急1500形", asset: "../images/列车/京浜急行電鉄/京浜急行電鉄_1500形.png", aliases: ["京急1500形","京浜急行電鉄1500形"] },
  "keikyu-600": { displayName: "京急600形", iconName: "京急600形", asset: "../images/列车/京浜急行電鉄/京浜急行電鉄_600形.png", aliases: ["京急600形","京浜急行電鉄600形"] },
  "keisei-3000": { displayName: "京成3000形", iconName: "京成3000形", asset: "../images/列车/京成電鉄/京成電鉄_3000形.png", aliases: ["京成3000形","京成電鉄3000形"] },
  "keisei-3100": { displayName: "京成3100形", iconName: "京成3100形", asset: "../images/列车/京成電鉄/京成電鉄_3100形.png", aliases: ["京成3100形","京成電鉄3100形"] },
  "keisei-3400": { displayName: "京成3400形", iconName: "京成3400形", asset: "../images/列车/京成電鉄/京成電鉄_3400形.png", aliases: ["京成3400形","京成電鉄3400形"] },
  "keisei-3700": { displayName: "京成3700形", iconName: "京成3700形", asset: "../images/列车/京成電鉄/京成電鉄_3700形.png", aliases: ["京成3700形","京成電鉄3700形"] },
  "keio-5000": { displayName: "京王5000系", iconName: "京王5000系", asset: "../images/列车/京王電鉄/京王電鉄_5000系.png", aliases: ["京王5000系","京王電鉄5000系"] },
  "odakyu-4000": { displayName: "小田急4000形", iconName: "小田急4000形", asset: "../images/列车/小田急電鉄/小田急電鉄_4000形_標準色.png", aliases: ["小田急4000形","小田急電鉄4000形"] },
  "metro-07-10": { displayName: "東京メトロ07系", iconName: "東京メトロ07系", asset: "../images/列车/東京メトロ/東京メトロ_07系.png", aliases: ["東京メトロ07系(10両)","東京メトロ07系"] },
  "metro-15000-10": { displayName: "東京メトロ15000系", iconName: "東京メトロ15000系", asset: "../images/列车/東京メトロ/東京メトロ_15000系.png", aliases: ["東京メトロ15000系(10両)","東京メトロ15000系"] },
  "tokyu-2020-10": { displayName: "東急2020系", iconName: "東急2020系", asset: "../images/列车/東急電鉄/東急電鉄_2020系.png", aliases: ["東急2020系(10両)","東急2020系"] },
  "tokyu-5080": { displayName: "東急5080系", iconName: "東急5080系", asset: "../images/列车/東急電鉄/東急電鉄_5080系.png", aliases: ["東急5080系"] },
  "tokyu-6020": { displayName: "東急6020系", iconName: "東急6020系", asset: "../images/列车/東急電鉄/東急電鉄_6020系.png", aliases: ["東急6020系(5両)","東急6020系(7両)","東急6020系"] },
  "tokyu-7000": { displayName: "東急7000系", iconName: "東急7000系", asset: "../images/列车/東急電鉄/東急電鉄_7000系.png", aliases: ["東急7000系"] },
  "tobu-50000-10": { displayName: "東武50000系", iconName: "東武50000系", asset: "../images/列车/東武鉄道/東武鉄道_50000型.png", aliases: ["東武50000系(10両)","東武50000系"] },
  "tobu-50050-10": { displayName: "東武50050系", iconName: "東武50050系", asset: "../images/列车/東武鉄道/東武鉄道_50050型.png", aliases: ["東武50050系(10両)","東武50050系"] },
  "tobu-70090": { displayName: "東武70090型", iconName: "東武70090型", asset: "../images/列车/東武鉄道/東武鉄道_70090型.png", aliases: ["東武70090型","東武70090系"] },
  "sotetsu-12000-10": { displayName: "相鉄12000系", iconName: "相鉄12000系", asset: "../images/列车/相模鉄道/相模鉄道_12000系_YOKOHAMA_NAVYBLUE.png", aliases: ["相鉄12000系(10両)"] },
  "sotetsu-13000-8": { displayName: "相鉄13000系", iconName: "相鉄13000系", asset: "../images/列车/相模鉄道/相模鉄道_13000系_YOKOHAMA_NAVYBLUE.png", aliases: ["相鉄13000系(8両)","相鉄13000系"] },
  "sotetsu-20000-10": { displayName: "相鉄20000系", iconName: "相鉄20000系", asset: "../images/列车/相模鉄道/相模鉄道_20000系_YOKOHAMA_NAVYBLUE.png", aliases: ["相鉄20000系(10両)"] },
  "sotetsu-21000": { displayName: "相鉄21000系", iconName: "相鉄21000系", asset: "../images/列车/相模鉄道/相模鉄道_21000系.png", aliases: ["相鉄21000系"] },

  "jr-east-209-500-keiyo": {
    displayName: "209系500番台（京葉線）",
    iconName: "209系500番台（京葉線）",
    asset: "../images/列车/JR東日本/JR東日本_209系_500番台_京葉線.png",
    aliases: ["209系500番台（京葉線）", "JR 209系500番台", "JR東日本209系500番台"]
  },
  "sotetsu-12000": {
    displayName: "相模鉄道12000系",
    iconName: "相模鉄道12000系",
    asset: "../images/列车/相模鉄道/相模鉄道_12000系_YOKOHAMA_NAVYBLUE.png",
    aliases: ["相模鉄道12000系", "相鉄12000系"]
  },
  "odakyu-5000": {
    displayName: "小田急5000形",
    iconName: "小田急5000形",
    asset: "../images/列车/小田急電鉄/小田急電鉄_5000形_標準色.png",
    aliases: ["小田急5000形", "小田急電鉄5000形"]
  },
  "jr-east-e235-0-yamanote": {
    displayName: "E235系0番台（山手線）",
    iconName: "E235系山手線",
    asset: "../images/列车/JR東日本/JR東日本_E235系_0番台.png",
    aliases: ["E235系0番台（山手線）", "E235系山手線", "JR E235系0番台"]
  },
  "jr-east-e231-800-tozai-through": {
    displayName: "E231系800番台（東西線直通）",
    iconName: "E231系800番台（東西線直通）",
    asset: "../images/列车/JR東日本/JR東日本_E231系_800番台.png",
    aliases: ["E231系800番台（東西線直通）"]
  },
  "toyo-rapid-2000-tozai-through": {
    displayName: "東葉高速2000系",
    iconName: "東葉高速鉄道2000系",
    asset: "../images/列车/東葉高速鉄道/東葉高速鉄道_2000系.png",
    aliases: ["東葉高速2000系", "東葉高速鉄道2000系"]
  },
  "jr-east-e233-2000-joban-local-chiyoda": {
    displayName: "E233系2000番台",
    iconName: "E233系2000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系_2000番台.png",
    aliases: ["E233系2000番台"]
  },
  "jr-east-e531-joban-medium": {
    displayName: "E531系",
    iconName: "E531系",
    asset: "../images/列车/JR東日本/JR東日本_E531系.png",
    aliases: ["E531系"]
  },
  "jr-east-e231-0-joban-rapid": {
    displayName: "E231系0番台",
    iconName: "E231系0番台",
    asset: "../images/列车/JR東日本/JR東日本_E231系_0番台.png",
    aliases: ["E231系0番台"]
  },
  "jr-east-e231-0-joban-rapid-led": {
    displayName: "E231系0番台（常磐快速線・LED）",
    iconName: "E231系0番台（常磐快速線・LED）",
    asset: "../images/列车/JR東日本/JR東日本_E231系_0番台_常磐快速線.png",
    aliases: ["E231系0番台（常磐快速線・LED）"]
  },
  "jr-east-e233-7000-saikyo": {
    displayName: "E233系7000番台",
    iconName: "E233系7000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系_7000番台.png",
    aliases: ["E233系7000番台", "JR E233系7000番台", "JR東日本E233系7000番台"]
  },
  "twr-70-000-rinkai": {
    displayName: "東京臨海高速鉄道70-000形",
    iconName: "東京臨海高速鉄道70-000形",
    asset: "../images/列车/東京臨海高速鉄道/東京臨海高速鉄道_70-000形.png",
    aliases: ["東京臨海高速鉄道70-000形", "70-000形"]
  },
  "twr-71-000-rinkai": {
    displayName: "東京臨海高速鉄道71-000形",
    iconName: "東京臨海高速鉄道71-000形",
    asset: "../images/列车/東京臨海高速鉄道/東京臨海高速鉄道_71-000形.png",
    aliases: ["東京臨海高速鉄道71-000形", "71-000形"]
  },
  "jr-east-209-3500-hachiko-kawagoe": {
    displayName: "209系3500番台",
    iconName: "209系3500番台（八高・川越線）",
    asset: "../images/列车/JR東日本/JR東日本_209系_3500番台.png",
    aliases: ["209系3500番台", "209系3500番台（八高・川越線）"]
  },
  "jr-east-209-3000-hachiko-kawagoe": {
    displayName: "209系3000番台",
    iconName: "209系3000番台（八高・川越線）",
    asset: null,
    aliases: ["209系3000番台", "209系3000番台（八高・川越線）"]
  },
  "jr-east-209-3100-kawagoe": {
    displayName: "209系3100番台",
    iconName: "209系3100番台（川越線）",
    asset: null,
    aliases: ["209系3100番台", "209系3100番台（川越線）"]
  },
  "jr-east-209-2000-2100-boso-keiyo": {
    displayName: "209系2000番台 / 2100番台",
    iconName: "209系2000番台 / 2100番台",
    asset: "../images/列车/JR東日本/JR東日本_209系_2000・2100番台_房総地区.png",
    aliases: ["209系2000番台 / 2100番台"]
  },
  "jr-east-e233-5000-keiyo": {
    displayName: "E233系5000番台",
    iconName: "E233系5000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系5000番台.png",
    aliases: ["E233系5000番台", "JR E233系5000番台"]
  },
  "jr-east-e231-900-musashino": {
    displayName: "E231系900番台",
    iconName: "E231系900番台",
    asset: null,
    aliases: ["E231系900番台"]
  },
  "jr-east-e231-1000-shonan-shinjuku": {
    displayName: "E231系1000番台",
    iconName: "E231系1000番台",
    asset: "../images/列车/JR東日本/JR東日本_E231系_1000番台.png",
    aliases: ["E231系1000番台"]
  },
  "jr-east-e233-3000-shonan-shinjuku": {
    displayName: "E233系3000番台",
    iconName: "E233系3000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系3000番台.png",
    aliases: ["E233系3000番台"]
  },
  "jr-east-e257-2000-odoriko": {
    displayName: "E257系2000番台",
    iconName: "E257系2000番台",
    asset: "../images/列车/JR東日本/JR東日本_E257系_2000番台.png",
    aliases: ["E257系2000番台"]
  },
  "jr-east-e257-2500-odoriko-shonan": {
    displayName: "E257系2500番台",
    iconName: "E257系2500番台",
    asset: "../images/列车/JR東日本/JR東日本_E257系_2500番台.png",
    aliases: ["E257系2500番台"]
  },
  "jr-east-253-1000-nikko-kinugawa": {
    displayName: "253系（日光・きぬがわ）",
    iconName: "253系（日光・きぬがわ）",
    asset: "../images/列车/JR東日本/JR東日本_253系_1000番台.png",
    aliases: ["253系（日光・きぬがわ）", "E253系（日光・きぬがわ）"]
  }
};
var CANONICAL_VEHICLE_ALIAS_INDEX = {};
var CANONICAL_VEHICLE_ALIAS_CONFLICTS = {};
function _registerCanonicalVehicleAlias(alias, rec) {
  var key = String(alias || "").trim();
  if (!key || CANONICAL_VEHICLE_ALIAS_CONFLICTS[key]) return;
  var existing = CANONICAL_VEHICLE_ALIAS_INDEX[key];
  if (existing && existing.id !== rec.id) {
    delete CANONICAL_VEHICLE_ALIAS_INDEX[key];
    CANONICAL_VEHICLE_ALIAS_CONFLICTS[key] = true;
    return;
  }
  CANONICAL_VEHICLE_ALIAS_INDEX[key] = rec;
}
Object.keys(CANONICAL_VEHICLES).forEach(function(id) {
  var rec = CANONICAL_VEHICLES[id];
  rec.id = id;
  // Dated artwork is a factual claim and must carry provenance.
  // Invalid dated records are deliberately not registered, so they cannot resolve.
  if ((rec.validFrom || rec.validTo) && (!rec.evidenceSource || rec.evidenceGrade !== "A")) {
    return;
  }
  _registerCanonicalVehicleAlias(id, rec);
  _registerCanonicalVehicleAlias(rec.displayName, rec);
  _registerCanonicalVehicleAlias(rec.iconName, rec);
  (rec.aliases || []).forEach(function(alias) {
    _registerCanonicalVehicleAlias(alias, rec);
  });
});

function resolveCanonicalVehicle(name) {
  var n = String(name || "").trim();
  if (!n || CANONICAL_VEHICLE_ALIAS_CONFLICTS[n]) return null;
  return CANONICAL_VEHICLE_ALIAS_INDEX[n] || null;
}

// SQL supplies a vetted path allowlist. The canonical identity resolver remains
// the only vehicle selector: catalog rows cannot guess a train's type.
var _verifiedSqlArtworkPaths = null;
var _verifiedSqlArtworkByExactName = null;
var _verifiedSqlArtworkByExactFormation = null;
function hydrateVerifiedArtworkCatalog(rows) {
  if (!Array.isArray(rows)) return false;
  var paths = Object.create(null);
  var exact = Object.create(null);
  var formations = Object.create(null);
  rows.forEach(function(row) {
    var path = row && String(row.image_path || "");
    if (!(path.startsWith("images/列车/") && path.endsWith(".png") && path.split("/").length === 4)) return;
    var artwork = "../" + path;
    paths[artwork] = true;
    // Explicit formation evidence can identify a verified variant. Require the
    // operator-qualified type and exact formation; never infer from a bare series.
    var company = path.split("/")[2];
    var vehicle = String(row.vehicle_type || "").trim();
    var formation = String(row.formation_id || "").trim();
    if (company && company !== "共通" && vehicle && formation) {
      var qualifiedType = vehicle.indexOf(company) === 0 ? vehicle : company + vehicle;
      var formationLabel = formation + (/(?:F|編成)$/i.test(formation) ? "" : "編成");
      var identity = qualifiedType + "（" + formationLabel + "）";
      var validFrom = String(row.valid_from || "").slice(0, 10);
      var validTo = String(row.valid_to || "").slice(0, 10);
      if ((!validFrom || /^\d{4}-\d{2}-\d{2}$/.test(validFrom)) &&
          (!validTo || /^\d{4}-\d{2}-\d{2}$/.test(validTo)) &&
          (!validFrom || !validTo || validFrom <= validTo)) {
        if (!formations[identity]) formations[identity] = [];
        formations[identity].push({ artwork: artwork, from: validFrom, to: validTo });
      }
    }
    // A database type name is eligible only when one certified generic vehicle
    // artwork exists for that *exact* name. Formation/livery/theme variants
    // cannot be chosen from a train's type alone.
    if (row.formation_id || row.livery || row.theme) return;
    var name = String(row.vehicle_type || "").trim();
    if (!name) return;
    if (!Object.prototype.hasOwnProperty.call(exact, name)) exact[name] = artwork;
    else if (exact[name] !== artwork) exact[name] = null;
  });
  _verifiedSqlArtworkPaths = paths;
  _verifiedSqlArtworkByExactName = exact;
  _verifiedSqlArtworkByExactFormation = formations;
  return true;
}
function refreshVerifiedArtworkCatalog() {
  if (typeof fetch !== "function") return Promise.resolve(false);
  return fetch("https://pnupwfmgbtxqhpzsrhfn.supabase.co/functions/v1/train-runs?catalog=vehicle-artwork",
    { credentials: "omit" }).then(function(res) {
      if (!res.ok) throw new Error("vehicle artwork catalog HTTP " + res.status);
      return res.json();
    }).then(function(body) {
      return body && body.ok === true && Array.isArray(body.assets)
        ? hydrateVerifiedArtworkCatalog(body.assets) : false;
    }).catch(function() { return false; });
}

function _canonicalVehicleIconPath(name, serviceDate) {
  var n = String(name || "").trim();
  if (!n) return null;
  var rec = resolveCanonicalVehicle(n);
  if (!rec) return null;
  if (rec.validFrom || rec.validTo) {
    var d = String(serviceDate || "").slice(0, 10);
    if (!d) return null;
    if (rec.validFrom && d < rec.validFrom) return null;
    if (rec.validTo && d > rec.validTo) return null;
  }
  // When SQL certifies the same canonical artwork, accept its path.
  // Otherwise keep the previously verified static mapping for offline use.
  if (_verifiedSqlArtworkPaths && _verifiedSqlArtworkPaths[rec.asset]) return rec.asset;
  return rec.asset;
}

// No line/operator default vehicle selector exists.

// Display-name normalization may only expand spelling variants within the same
  // canonical identity. It must never rewrite retired stock to a successor,
  // a generic family to a subseries, or an ambiguous candidate to one vehicle.
  function resolveVehicleDisplayName(vehicleIdentity) {
    if (!vehicleIdentity) return null;
    var parts = String(vehicleIdentity).split('/').map(function(s){ return s.trim(); }).filter(Boolean);
    if (parts.length !== 1) return parts.length ? parts.join(' / ') : null;
    var name = parts[0];
    var canonical = resolveCanonicalVehicle(name);
    return canonical ? canonical.displayName : name;
  }

  // Fleet/livery pools are asset catalogs only. A confirmed vehicle type does not
  // prove a concrete formation or livery, so never hash-pick one at runtime.
  // Single artwork mapper. Input is an already-resolved vehicle identity only.
  // Operational context (line/operator/train number/source) is intentionally absent.
  function resolveVehicleArtwork(vehicleIdentity, serviceDate) {
    return _resolveVehicleArtworkBase(vehicleIdentity, serviceDate);
  }
  function _resolveVehicleArtworkBase(vehicleIdentity, serviceDate) {
    if (!vehicleIdentity) return null;
    var parts = String(vehicleIdentity).split('/').map(function(s){ return s.trim(); }).filter(Boolean);
    // A candidate list is not a concrete identity.
    if (parts.length !== 1) return null;
    var name = parts[0];

    // Canonical aliases are allowed only when they resolve to the same registered
    // identity record. No line override, replacement vehicle, base-name stripping,
    // retired-stock substitution, or approximate alias may select artwork.
    // A certified exact formation takes precedence when the SQL catalog has
    // that identity. Static canonical artwork remains the offline fallback.
    // Canonical alias conflicts always block both paths.
    if (CANONICAL_VEHICLE_ALIAS_CONFLICTS[name]) return null;
    if (_verifiedSqlArtworkByExactFormation &&
        Object.prototype.hasOwnProperty.call(_verifiedSqlArtworkByExactFormation, name)) {
      var verified = _verifiedSqlArtworkByExactFormation[name];
      var date = String(serviceDate || "").slice(0, 10);
      var uniqueArtwork = null;
      for (var i = 0; i < verified.length; i++) {
        var candidate = verified[i];
        if ((candidate.from || candidate.to) && !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
        if (candidate.from && date < candidate.from) continue;
        if (candidate.to && date > candidate.to) continue;
        if (uniqueArtwork && uniqueArtwork !== candidate.artwork) return null;
        uniqueArtwork = candidate.artwork;
      }
      return uniqueArtwork;
    }
    var canonical = _canonicalVehicleIconPath(name, serviceDate);
    if (canonical) return canonical;
    // A confirmed upstream vehicle type may use a SQL-certified PNG only on
    // exact, unambiguous type identity (never line-based fleet guessing).
    // Bare series numbers are shared by many operators. A unique row in the
    // currently certified subset is not proof of a unique railway identity.
    if (/^[0-9]{2,5}(?:-[0-9]+)?(?:系|形|型)$/.test(name)) return null;
    if (_verifiedSqlArtworkByExactName &&
        Object.prototype.hasOwnProperty.call(_verifiedSqlArtworkByExactName, name)) {
      return _verifiedSqlArtworkByExactName[name] || null;
    }
    return null;
  }

  window.TrainIcons = {
    resolveVehicleArtwork: resolveVehicleArtwork,
    resolveVehicleDisplayName: resolveVehicleDisplayName,
    resolveCanonicalVehicle: resolveCanonicalVehicle,
    CANONICAL_VEHICLES: CANONICAL_VEHICLES,
    hydrateVerifiedArtworkCatalog: hydrateVerifiedArtworkCatalog,
    refreshVerifiedArtworkCatalog: refreshVerifiedArtworkCatalog
  };

  // Fire once after the canonical registry exists. The request is read-only,
  // never blocks rendering, and never grants identity to an UNKNOWN train.
  if (typeof fetch === "function") refreshVerifiedArtworkCatalog();

  // Normalize operator labels only for metadata carried by explicit evidence.
  function normOp(op) {
    if (!op) return '';
    if (window.TransitConstants && typeof window.TransitConstants.normalizeOp === 'function') {
      return window.TransitConstants.normalizeOp(op);
    }
    return String(op).replace(/^odpt\.Operator:/, '');
  }

  // 候选串 "A / B / C" → 去重数组 ["A","B","C"]
  function splitCandidates(str) {
    var out = [];
    if (!str) return out;
    String(str).split('/').forEach(function(s) {
      var c = s.trim();
      if (c && out.indexOf(c) < 0) out.push(c);
    });
    return out;
  }

  // 图标库反查（S0–S3 候选 → 图标路径）
  function resolveArtworkForIdentity(name, formationId, serviceDate) {
    if (!name) return '';
    var identity = name;
    if (formationId && !/編成/.test(identity)) {
      var fid = String(formationId).trim();
      identity = name + '（' + fid + (/(?:F|編成)$/i.test(fid) ? '' : '編成') + '）';
    }
    // Same module, same canonical map; no global legacy icon resolver hop.
    return resolveVehicleArtwork(identity, serviceDate) || '';
  }

  // ============================================================
  // Main decision: one source-priority arbitration path.
  // ============================================================
  function resolve(ctx) {
    ctx = ctx || {};
    var assignmentOperator = normOp(ctx.assignmentOperator || ctx.operationOperator || '');

    // 1) Collect only already-admitted evidence from the upstream canonical
    // resolver/runtime feed. This module arbitrates source priority; it does not
    // independently infer identity from line/operator defaults.
    var pool = {};
    var orderArr = [];
    function addFrom(str, src) {
      splitCandidates(str).forEach(function(candidate) {
        if (!pool[candidate]) {
          pool[candidate] = { sources: [], count: 0 };
          orderArr.push(candidate);
        }
        if (pool[candidate].sources.indexOf(src) < 0) pool[candidate].sources.push(src);
        pool[candidate].count++;
      });
    }
    addFrom(ctx.realtimeVehicleType, 'realtime');
    addFrom(ctx.realtimeDerivedVehicleType, 'realtime-derived');
    addFrom(ctx.timetableVehicleType, 'timetable');

    // 2) Uniqueness decision. There is no source-priority fallback:
    // every admitted explicit source must converge on exactly one identity.
    var chosen = '';
    var chosenSrc = '';
    var _timetableCands = splitCandidates(ctx.timetableVehicleType);
    var _derivedCands = splitCandidates(ctx.realtimeDerivedVehicleType);
    var _realtimeCands = splitCandidates(ctx.realtimeVehicleType);
    var _admitted = [];
    [
      { source:'realtime', values:_realtimeCands },
      { source:'realtime-derived', values:_derivedCands },
      { source:'timetable', values:_timetableCands }
    ].forEach(function(group) {
      group.values.forEach(function(value) {
        _admitted.push({ source:group.source, value:value });
      });
    });
    var _uniqueIdentities = [];
    _admitted.forEach(function(item) {
      if (_uniqueIdentities.indexOf(item.value) < 0) _uniqueIdentities.push(item.value);
    });
    if (_uniqueIdentities.length === 1) {
      chosen = _uniqueIdentities[0];
      var _chosenSources = [];
      _admitted.forEach(function(item) {
        if (item.value === chosen && _chosenSources.indexOf(item.source) < 0) _chosenSources.push(item.source);
      });
      chosenSrc = _chosenSources.join('+');
    }

    var confidence = chosen ? 'high' : 'none';

    // 4) Artwork is a strict projection of the already-exact vehicle identity.
    // Missing artwork stays missing; never substitute another candidate, line,
    // operator, retired replacement, or rule-derived vehicle.
    var _formationCandidates = Array.isArray(ctx.formationCandidates)
      ? ctx.formationCandidates.map(function(v){ return String(v || '').trim(); }).filter(Boolean)
      : [];
    _formationCandidates = _formationCandidates.filter(function(v,i,a){ return a.indexOf(v) === i; });
    var _formationId = String(ctx.formationId || '').trim();
    var _formationConstrained = _formationCandidates.length > 0 || !!_formationId;
    var _formationUnique = _formationCandidates.length === 1
      && !!_formationId
      && _formationCandidates[0] === _formationId;
    var iconPath = '';
    if (chosen) {
      if (_formationConstrained) {
        // Formation evidence is authoritative only when both fields agree on one value.
        // Ambiguous, missing, or contradictory formation evidence blocks artwork entirely.
        iconPath = _formationUnique ? resolveArtworkForIdentity(chosen, _formationId, ctx.serviceDate) : '';
      } else {
        iconPath = resolveArtworkForIdentity(chosen, '', ctx.serviceDate);
      }
    }

    // Display-name normalization is presentation-only and must never rewrite the
    // resolved identity: name keeps the exact evidence string, artwork projection
    // already happened above against the raw identity.

    // B0 vehicle-identity contract:
    // EXACT     = one concrete vehicle is supported by train-level/explicit evidence,
    //             or the applicable timetable fleet itself has only one possible type.
    // NARROWED  = timetable/owner evidence reduced the fleet but still leaves >1 type.
    // UNKNOWN   = no usable vehicle evidence exists.
    var identityStatus = 'UNKNOWN';
    var identityReason = 'no-vehicle-evidence';
    var effectiveCandidates = orderArr.slice();
    if (chosen) {
      identityStatus = 'EXACT';
      // Timetable-derived exact vehicles retain their timetable identity reason
      // so downstream diagnostics can distinguish the evidence channel.
      if (chosenSrc === 'timetable') {
        identityReason = 'timetable-vehicle-evidence';
      } else {
        identityReason = 'unique-converged-vehicle-evidence';
      }
    } else if (effectiveCandidates.length > 0) {
      identityStatus = 'NARROWED';
      identityReason = 'non-decisive-vehicle-candidates';
    }

    // B0 hard invariant: unresolved multi-candidate identity must never leak a
    // candidate-specific vehicle/formation/livery image. Rendering can use its
    // neutral marker outside this resolver.
    if (identityStatus !== 'EXACT') iconPath = '';

    return {
      name: chosen,                                  // EXACT vehicle only; empty while ambiguous
      candidates: effectiveCandidates,               // admitted evidence candidates
      allCandidates: orderArr,                        // admitted evidence pool for diagnostics
      identityStatus: identityStatus,                 // EXACT / NARROWED / UNKNOWN
      identityReason: identityReason,
      assignmentOperator: assignmentOperator,
      sources: chosen ? (pool[chosen] ? pool[chosen].sources.slice() : (chosenSrc ? [chosenSrc] : [])) : [],
      source: chosenSrc,                             // decision source; empty when unresolved
      confidence: confidence,
      iconPath: iconPath,
      // 兼容原 vehicleType 候选串格式（"A / B / C"，稳定顺序）
      // v4.3.1007b: 加权随机映射已确定单一车型时,vehicleTypeStr 与 name 一致(title 不再显示候选串)
      vehicleTypeStr: chosen || ''
    };
  }

  // Daily formation evidence. This layer never guesses a formation:
  // it only propagates a dated, externally confirmed formation along an
  // already-resolved physical runningChainId.
  var _formationEvidence = {};
  function _formationServiceDate(d) {
    var x = d instanceof Date ? d : new Date(d || Date.now());
    return x.getFullYear() + "-" + String(x.getMonth()+1).padStart(2,"0") + "-" + String(x.getDate()).padStart(2,"0");
  }
  function _normalizeFormation(lineId, formationId) {
    if (lineId !== "NewShuttle") return null;
    var id = String(formationId == null ? "" : formationId).replace(/[^0-9]/g,"");
    if (/^0[1-7]$/.test(id)) return { id:id, vehicleName:"埼玉新都市交通2000系（"+id+"編成）" };
    if (/^2[1-6]$/.test(id)) return { id:id, vehicleName:"2020系（"+id+"編成）" };
    return null;
  }
  function registerFormationEvidence(anchor) {
    if (!anchor || !anchor.runningChainId) return false;
    var f = anchor.formationId ? _normalizeFormation(anchor.lineId, anchor.formationId) : null;
    var explicitVehicle = String(anchor.vehicleName || anchor.vehicleType || "").trim();
    var vehicleName = f ? f.vehicleName : explicitVehicle;
    if (!vehicleName) return false;
    // Evidence admission must never depend on whether artwork exists. A dated,
    // explicit vehicle identity may be stored even when the gallery has no image;
    // artwork is resolved only when the evidence is later projected for display.
    var date = anchor.serviceDate || _formationServiceDate(anchor.observedAt);
    var evidenceKey = date+"|"+anchor.runningChainId;
    var existing = _formationEvidence[evidenceKey];
    if (existing && existing.vehicleName && existing.vehicleName !== vehicleName) {
      // Two incompatible explicit identities on one physical chain are a data
      // conflict, never permission to let the latest segment silently win.
      _formationEvidence[evidenceKey] = {
        lineId:anchor.lineId, runningChainId:anchor.runningChainId, serviceDate:date,
        formationId:"", vehicleName:"", conflict:true,
        conflictingVehicles:[existing.vehicleName, vehicleName].filter(function(v,i,a){return v && a.indexOf(v)===i;}),
        evidenceSource:"conflicting-explicit-vehicle-evidence",
        evidenceDetail:{ previous:existing.evidenceDetail || null, incoming:anchor.evidenceDetail || null },
        observedAt:anchor.observedAt || existing.observedAt || null
      };
      return false;
    }
    if (existing && existing.conflict) return false;
    _formationEvidence[evidenceKey] = {
      lineId:anchor.lineId, runningChainId:anchor.runningChainId, serviceDate:date,
      formationId:f ? f.id : "",
      vehicleName:vehicleName,
      evidenceSource:anchor.evidenceSource || (f ? "daily-observation" : "official-timetable-vehicle"),
      evidenceDetail:anchor.evidenceDetail || null,
      observedAt:anchor.observedAt || null
    };
    return true;
  }
  function resolveFormationEvidence(ctx) {
    if (!ctx || !ctx.runningChainId) return null;
    var date = ctx.serviceDate || _formationServiceDate(ctx.at);
    var a = _formationEvidence[date+"|"+ctx.runningChainId];
    if (!a || a.conflict) return null;
    var icon = resolveArtworkForIdentity(a.vehicleName, a.formationId, date);
    if (!icon) return null;
    return {
      formationId:a.formationId, vehicleName:a.vehicleName, iconPath:icon,
      serviceDate:a.serviceDate, source:"formation-evidence", confidence:"high",
      identityStatus:"EXACT", identityReason:"dated-running-chain-vehicle-evidence",
      evidenceSource:a.evidenceSource, evidenceDetail:a.evidenceDetail || null, observedAt:a.observedAt,
      propagatedByRunningChain:true
    };
  }
  function clearFormationEvidenceOtherDates(date) {
    var keep = date || _formationServiceDate();
    Object.keys(_formationEvidence).forEach(function(k) {
      if (k.indexOf(keep+"|") !== 0) delete _formationEvidence[k];
    });
  }

  // ============================================================
  // Public API
  // ============================================================
  // Single artwork authority for both ODPT real-time and timetable estimates.
  // No model may be inferred from a line, train number or rendering context.
  // Single vehicle-artwork authority. Both ODPT realtime and timetable
  // estimates choose an existing gallery PNG; unknown trains get a neutral PNG.
  // Never synthesize a railway-specific model or draw an SVG vehicle.
  var NEUTRAL_TRAIN_PNG = "../images/列车/共通/共通_形式未確認.png";
  function isGalleryPng(path) {
    var src = String(path || "");
    return src.startsWith("../images/列车/") &&
      src.endsWith(".png") && src.split("/").length === 5;
  }
  function selectMarkerArtwork(p, artworkFailed) {
    var iconSrc = p && p.vehicleResolvedUpstream === true ? (p.vehicleIconPath || "") : "";
    if (!iconSrc && p && p.vehicleResolvedUpstream === true &&
        p.vehicleType && !p.vehicleFormationId &&
        (!p.vehicleFormationCandidates || !p.vehicleFormationCandidates.length)) {
      iconSrc = resolveVehicleArtwork(p.vehicleType) || "";
    }
    if (artworkFailed === true || !isGalleryPng(iconSrc)) {
      return { kind: "generic", iconSrc: NEUTRAL_TRAIN_PNG };
    }
    return { kind: "vehicle", iconSrc: iconSrc };
  }

  window.TrainVehicle = {
    version: '4.3.1102',
    resolve: resolve,
    selectMarkerArtwork: selectMarkerArtwork,
    registerFormationEvidence: registerFormationEvidence,
    resolveFormationEvidence: resolveFormationEvidence,
    clearFormationEvidenceOtherDates: clearFormationEvidenceOtherDates,
  };

  console.debug('[TrainVehicle] v4.3.1102 initialized（canonical EXACT/NARROWED/UNKNOWN vehicle identity contract）');
})();
