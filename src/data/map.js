// map.js — zone profiles for the delivered 60x86 tilemap.
//
// The world geometry (tiles, collision, encounter/gate/start positions, and the zone
// RECTANGLES) all live in the delivered map now (public/assets/map/world.tmj, loaded via
// MapLoader.js). This file only holds the per-zone PRESENTATION profile the engine still
// needs: the camera background color. (Music is NO LONGER per-zone -- it's the mixtape
// model, one song per encounter, keyed in AudioManager; see encounters.js {music:"NN"}.)
//
// Lighting is a single constant ambient warm tint defined in WorldScene (AMBIENT_TINT) —
// there is NO phased or per-zone lighting.
//
// Keys match MapLoader's zone ordering (bottom->top by Y):
//   threshold -> meadow -> park -> city -> home

export const ZONE_PROFILES = {
  threshold: { bg: "#1e2230" }, // Quiet Street (pre-dawn)
  meadow:    { bg: "#2a3020" }, // Neighborhood (morning)
  park:      { bg: "#2a2230" }, // Park & Bayfront (dusk)
  city:      { bg: "#141026" }, // Downtown (night)
  home:      { bg: "#2a2018" }, // Home (sunrise)
};
