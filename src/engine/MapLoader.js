// MapLoader — reads the delivered Tiled map (world.tmj) into plain data the engine uses.
//
// The delivered map (public/assets/map/world.tmj) is a 60x86, 16px orthogonal Tiled map.
// This module turns its object/collision layers into the structures WorldScene needs:
// spawn point, encounter/gate positions, per-zone rects, the collision rects (in PIXELS,
// for pixel-accurate player collision), and a blocked-cell TILE set (used here to compute
// gate spans; WorldScene uses the pixel colRects for actual collision).
//
// Coordinate convention: encounter/gate/zone/start data is in TILE COORDINATES (16px
// tiles); `colRects` are in PIXELS. Object markers are points (width/height 0); we floor
// their pixel position to a tile.
//
// Delivery quirks handled here (see HANDOFF.md):
//   - marker names may have stray whitespace (e.g. 'anim_fountain ') -> trimmed.
//   - gate:g3 has TWO markers -> both kept under id "g3" (one opener clears both).
//   - collision is an objectgroup of ~185 rects with FRACTIONAL sizes; the pixel rects are
//     kept as-is in colRects, and the tile `blocked` set uses a coverage threshold.
//   - `light` and `lily` markers are IGNORED (no per-zone lighting pass; no lily system).
//   - zones are 5 rects with human display names -> mapped to engine keys by story order
//     (bottom->top by Y): threshold, meadow, park, city, home.

export const TILE_PX = 16; // native tile size of the delivered map

// Zone engine-keys in story order, bottom (highest Y) -> top (lowest Y).
const ZONE_KEYS_BOTTOM_TO_TOP = ["threshold", "meadow", "park", "city", "home"];

const pxToTile = (v) => Math.floor(v / TILE_PX);
const pxToTileRound = (v) => Math.round(v / TILE_PX);

// Parse the tilemap JSON (already loaded via this.cache.tilemap) into engine data.
// `mapData` is the raw Tiled JSON object.
export function parseTiledMap(mapData) {
  const W = mapData.width, H = mapData.height;
  const layers = {};
  for (const L of mapData.layers) layers[L.name] = L;

  const objects = layers["objects"]?.objects || [];
  const zonesRaw = layers["zones"]?.objects || [];
  const collisionRaw = layers["collision"]?.objects || [];

  // ---- object markers ----
  let start = null;
  const encounters = {};   // id -> {x,y}
  const gatesById = {};    // id -> [{x,y}, ...]  (g3 can have 2)
  const anim = [];         // [{name,x,y}]

  for (const o of objects) {
    const name = (o.name || "").trim();
    const tx = pxToTileRound(o.x);
    const ty = pxToTileRound(o.y);
    if (name === "start") {
      start = { x: tx, y: ty };
    } else if (name.startsWith("encounter:")) {
      encounters[name.slice("encounter:".length)] = { x: tx, y: ty };
    } else if (name.startsWith("gate:")) {
      const id = name.slice("gate:".length);
      (gatesById[id] ||= []).push({ x: tx, y: ty });
    } else if (name.startsWith("anim")) {
      anim.push({ name, x: tx, y: ty });
    }
    // `light` and `lily` markers in the map are intentionally ignored (no per-zone
    // lighting pass and no lily/growth system).
  }

  // ---- collision -> blocked cell set ----
  // COVERAGE-BASED: a cell is blocked only if a collision rect covers at least
  // COVERAGE_MIN of the cell's area. The artist's rects have fractional sizes
  // that clip neighboring cells by tiny slivers; naive "round outward" blocking
  // turned every sliver into a full solid cell, producing "invisible walls" the
  // player snags on (esp. the park/bayfront, which is dense with small props).
  // Requiring meaningful coverage keeps real walls solid while dropping the
  // sliver fringe. Tune COVERAGE_MIN up (more permissive) / down (more solid).
  const COVERAGE_MIN = 0.35;
  const CELL_AREA = TILE_PX * TILE_PX;
  const blocked = new Set();
  // colRects: the collision rects in PIXEL space. The player tests its body box
  // against these directly (pixel-accurate), so small furniture no longer rounds
  // up to a full tile — footprints match the art. The `blocked` tile-set below is
  // kept only for (a) computing gate spans and (b) the runtime's per-tile dynamic
  // blocking (gates/markers/fountain), NOT for static furniture collision.
  const colRects = [];
  for (const r of collisionRaw) {
    const rw = r.width || 0, rh = r.height || 0;
    if (rw <= 0 || rh <= 0) continue;
    colRects.push({ x: r.x, y: r.y, w: rw, h: rh });
    const rx0 = r.x, ry0 = r.y;
    const rx1 = r.x + rw, ry1 = r.y + rh;
    const x0 = Math.floor(rx0 / TILE_PX);
    const y0 = Math.floor(ry0 / TILE_PX);
    const x1 = Math.ceil(rx1 / TILE_PX);
    const y1 = Math.ceil(ry1 / TILE_PX);
    for (let ty = Math.max(0, y0); ty < Math.min(H, y1); ty++) {
      for (let tx = Math.max(0, x0); tx < Math.min(W, x1); tx++) {
        const cellX0 = tx * TILE_PX, cellY0 = ty * TILE_PX;
        const cellX1 = cellX0 + TILE_PX, cellY1 = cellY0 + TILE_PX;
        // Area of overlap between this rect and this cell.
        const ovW = Math.min(rx1, cellX1) - Math.max(rx0, cellX0);
        const ovH = Math.min(ry1, cellY1) - Math.max(ry0, cellY0);
        if (ovW <= 0 || ovH <= 0) continue;
        if ((ovW * ovH) / CELL_AREA >= COVERAGE_MIN) blocked.add(`${tx},${ty}`);
      }
    }
  }

  // ---- zones: rects sorted bottom->top, mapped to engine keys by order ----
  const zoneRects = zonesRaw
    .map((z) => ({
      display: z.name,
      x: pxToTile(z.x), y: pxToTile(z.y),
      w: Math.round(z.width / TILE_PX), h: Math.round(z.height / TILE_PX),
    }))
    .sort((a, b) => b.y - a.y); // highest Y (bottom of world) first
  zoneRects.forEach((z, i) => {
    z.key = ZONE_KEYS_BOTTOM_TO_TOP[i] || `zone${i}`;
    z.yMin = z.y; z.yMax = z.y + z.h;
  });

  // ---- gates: derive a blocking span for each marker from the walkable run on its row ----
  // Each gate plugs its own opening: scan left/right from the marker until a blocked cell,
  // and block that contiguous run. If the marker's own row reads mostly blocked (collision
  // rounding on a 1-cell crosswalk gap, e.g. g1), fall back to marker cell +/-1.
  const gates = [];
  for (const [id, marks] of Object.entries(gatesById)) {
    for (const m of marks) {
      const span = walkableRunX(blocked, m.x, m.y, W);
      gates.push({ id, y: m.y, x: span });
    }
  }

  return { W, H, start, encounters, gates, anim, blocked, colRects, zoneRects };
}

// Find the contiguous walkable [lo, hi] run of x on row `y` that contains x=cx.
// Falls back to [cx-1, cx+1] (clamped) if the marker cell itself reads blocked.
function walkableRunX(blocked, cx, y, W) {
  const isOpen = (x) => x >= 0 && x < W && !blocked.has(`${x},${y}`);
  if (!isOpen(cx)) {
    return [Math.max(0, cx - 1), Math.min(W - 1, cx + 1)];
  }
  let lo = cx, hi = cx;
  while (isOpen(lo - 1)) lo--;
  while (isOpen(hi + 1)) hi++;
  return [lo, hi];
}
