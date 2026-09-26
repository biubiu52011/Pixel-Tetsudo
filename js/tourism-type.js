/*
 * Tourism Type Helper
 * One source of truth for routing tourism entries to event / shop / spot pages.
 */
(function () {
  "use strict";

  var VALID_TYPES = { event: 1, shop: 1, spot: 1 };
  var SHOP_TAGS = {
    food: 1,
    restaurant: 1,
    cafe: 1,
    sweets: 1,
    drink: 1,
    bar: 1,
    bakery: 1,
    local_specialty: 1,
    shopping: 1,
    shop: 1,
    hotel: 1,
    play: 1
  };

  function normalizeType(value) {
    value = String(value || "").trim().toLowerCase();
    if (value === "sight" || value === "sights" || value === "landmark") return "spot";
    if (value === "store" || value === "restaurant" || value === "gourmet") return "shop";
    return VALID_TYPES[value] ? value : "";
  }

  function getSpotType(spot) {
    if (!spot) return "spot";
    var explicit = normalizeType(spot.tourismType || spot.category || spot.type || spot.kind);
    if (explicit) return explicit;

    var tags = spot.tags || [];
    if (tags.indexOf("event") >= 0) return "event";
    for (var i = 0; i < tags.length; i++) {
      if (SHOP_TAGS[tags[i]]) return "shop";
    }
    return "spot";
  }

  function partitionSpots(spots) {
    var buckets = { event: [], shop: [], spot: [] };
    (spots || []).forEach(function (spot) {
      buckets[getSpotType(spot)].push(spot);
    });
    return buckets;
  }

  window.TourismType = {
    getSpotType: getSpotType,
    partitionSpots: partitionSpots
  };
})();
