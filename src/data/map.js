// map.js — zone profiles for the delivered 60x86 tilemap.
//
// The world geometry (tiles, collision, encounter/gate/start positions, and the zone
// RECTANGLES) all live in the delivered map now (public/assets/map/world.tmj, loaded via
// MapLoader.js). This file only holds the per-zone PRESENTATION profile the engine still
// needs: the camera background color and the music track.
//
// Lighting is a single constant ambient warm tint defined in WorldScene (AMBIENT_TINT) —
// there is NO phased or per-zone lighting.
//
// Keys match MapLoader's zone ordering (bottom->top by Y):
//   threshold -> meadow -> park -> city -> home

export const ZONE_PROFILES = {
  threshold: { bg: "#1e2230", music: "meadow" }, // Quiet Street (pre-dawn); music swells in
  meadow:    { bg: "#2a3020", music: "meadow" }, // Neighborhood (morning)
  park:      { bg: "#2a2230", music: "shore"  }, // Park & Bayfront (dusk)
  city:      { bg: "#141026", music: "city"   }, // Downtown (night)
  home:      { bg: "#2a2018", music: "finale" }, // Home (sunrise)
};
