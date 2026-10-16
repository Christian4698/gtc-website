// Geometry of chapters 4–8 (Digitalisation → Impact), ported from the validated C1 storyboard.
// The validated pilot geometry (layouts.ts) is not modified: everything here starts from its
// final Création state.

import { resample, roundedRectHalves, cubicChain, arc, type Pt, type Rect, type Seg } from '../engine/geometry';
import { N_GLASS, N_THREAD, type Layout, type TextSpec } from './layouts';

export type Funnel = { cx: number; ys: number[]; hws: number[] };

export type ChaptersLayout = {
  ts: number;
  // ---- 4 Digitalisation
  F4: Rect;
  site: { s: number; tx: number; ty: number; map: (x: number, y: number) => Pt };
  stations: Rect[];
  stIcon: Rect[];
  stTitle: TextSpec[];
  trBars: Rect[];
  dataRows: Seg[];
  suivi: { box: Rect; line: Rect; status: TextSpec }[];
  pipes: Seg[];
  busNote: TextSpec;
  signalRoute: Pt[];
  // ---- 5 Optimisation
  F5: Rect;
  header: Rect;
  seed5: { x: number; y: number; r: number };
  brand5: TextSpec | null;
  title5: TextSpec;
  cta5: Rect;
  ctaLabel5: TextSpec;
  side: Rect[];
  sideLabels: TextSpec[];
  tiles: Rect[];
  tileLabels: TextSpec[];
  tileValues: TextSpec[];
  tileLights: Pt[];
  panel: Rect;
  panelTitle: TextSpec;
  panelNote: TextSpec;
  chart: Pt[];
  grid5: Seg[];
  table: Seg[];
  // ---- 6 Acquisition
  funnel: Funnel;
  levels: Seg[];
  title6: TextSpec;
  counters: Rect[];
  counterTexts: TextSpec[];
  counterLights: Pt[];
  cta6: Rect;
  ctaLabel6: TextSpec;
  crm: Rect;
  crmTitle: TextSpec;
  crmFields: Rect[];
  crmLabels: TextSpec[];
  slots: Pt[];
  conv: Pt[];
  hist: Seg[];
  note6: TextSpec;
  park: (level: number, j: number) => Pt;
  visitorR: number;
  // ---- 7 Croissance
  axis: { from: Pt; to: Pt };
  months: Seg[];
  barX: number[];
  barW: number;
  barH: number[];
  base: number;
  curveLift: number;
  grid7: Seg[];
  ms: number[];
  msLabels: TextSpec[];
  launch: { x: number; top: number; base: number };
  pill: Rect;
  pillText: TextSpec;
  chips: Rect[];
  chipLabels: TextSpec[];
  chipValues: TextSpec[];
  gaugeTrack: Rect[];
  gaugeFill: Rect[];
  legend: Rect;
  legendText: TextSpec;
  note7: TextSpec;
  // ---- 8 Impact
  G: Pt;
  mods: Rect[];
  /** Outline halves of the Croissance module, which the launch milestone line wraps into. */
  modHalvesGrowth: { neg: Pt[]; pos: Pt[] };
  modLabels: TextSpec[];
  modIcons: string[];
  spokes: Seg[];
  arc8: Pt[];
  tagline: TextSpec;
  projDots: Pt[];
  avatars: Pt[];
  miniBars: Seg[];
  miniCurve: Pt[];
  modGaugeTrack: Rect[];
  modGaugeFill: Rect[];
};

const T = (x: number, y: number, size: number, text: string, anchor?: TextSpec['anchor']): TextSpec => ({ x, y, size, text, anchor });
const GAUGE = [0.64, 0.4, 0.72];
const VALS = [0.18, 0.22, 0.2, 0.31, 0.36, 0.33, 0.45, 0.52, 0.49, 0.6, 0.68, 0.66, 0.78, 0.84];
const MOD_NAMES = ['Projet', 'Site web', 'Automatisation', 'Tableau de bord', 'Utilisateurs', 'Croissance'];

/** Small line icons for the six Impact modules, drawn in a 24-unit box at (x, y). */
function modIcon(k: number, x: number, y: number, u: number): string {
  const P = (dx: number, dy: number) => `${(x + dx * u).toFixed(1)} ${(y + dy * u).toFixed(1)}`;
  switch (k) {
    case 0: return `M${P(2, 18)}L${P(22, 18)}M${P(6, 18)}L${P(6, 8)}M${P(14, 18)}L${P(14, 4)}`; // milestones
    case 1: return `M${P(2, 4)}L${P(22, 4)}L${P(22, 20)}L${P(2, 20)}ZM${P(2, 9)}L${P(22, 9)}`; // browser
    case 2: return `M${P(5, 12)}A${7 * u} ${7 * u} 0 1 1 ${P(12, 19)}M${P(12, 19)}L${P(9, 16)}M${P(12, 19)}L${P(9, 22)}`; // loop
    case 3: return `M${P(3, 20)}L${P(21, 20)}M${P(6, 20)}L${P(6, 12)}M${P(12, 20)}L${P(12, 6)}M${P(18, 20)}L${P(18, 10)}`; // bars
    case 4: return `M${P(12, 10)}m${-4 * u} 0a${4 * u} ${4 * u} 0 1 0 ${8 * u} 0a${4 * u} ${4 * u} 0 1 0 ${-8 * u} 0M${P(4, 22)}Q${P(12, 12)} ${P(20, 22)}`; // person
    default: return `M${P(2, 20)}L${P(9, 13)}L${P(14, 16)}L${P(22, 6)}M${P(16, 6)}L${P(22, 6)}L${P(22, 12)}`; // growth
  }
}

function common(L: Layout, base: Omit<ChaptersLayout, 'site' | 'mods' | 'modHalvesGrowth' | 'modLabels' | 'modIcons' | 'spokes' | 'arc8' | 'projDots' | 'avatars' | 'miniBars' | 'miniCurve' | 'modGaugeTrack' | 'modGaugeFill'> & { card: [number, number]; R: number; labelSize: number; angles: number[] }): ChaptersLayout {
  const F3 = L.site.frame;
  const s = base.F4.w / F3.w;
  const tx = base.F4.x - F3.x * s, ty = base.F4.y - F3.y * s;
  const site = { s, tx, ty, map: (x: number, y: number): Pt => [tx + x * s, ty + y * s] };
  const [G0, G1] = base.G;
  const ANGLES = base.angles;
  const centres = ANGLES.map((a) => [G0 + base.R * Math.cos((a * Math.PI) / 180), G1 + base.R * Math.sin((a * Math.PI) / 180)] as Pt);
  const [cw, ch] = base.card;
  const mods = centres.map(([x, y]) => ({ x: x - cw / 2, y: y - ch / 2, w: cw, h: ch, rx: 12 * base.ts }));
  const u = base.ts;
  const desk = L.kind === 'desktop';
  // Desktop: icon and label on the first line, content below. Mobile: icon and content on the
  // first line, label below, so labels such as "Tableau de bord" fit the narrower cards.
  const modLabels = mods.map((m, k) => (desk ? T(m.x + 44, m.y + ch * 0.42, base.labelSize, MOD_NAMES[k]) : T(m.x + 16, m.y + ch - 14, base.labelSize, MOD_NAMES[k])));
  const modIcons = mods.map((m, k) => (desk ? modIcon(k, m.x + 14, m.y + ch * 0.42 - 16, 0.85) : modIcon(k, m.x + 14, m.y + 12, 1.5)));
  const box = (m: Rect) => (desk ? { x: m.x + 44, y: m.y + ch * 0.54, w: m.w - 58, h: ch * 0.36 } : { x: m.x + 66, y: m.y + 12, w: m.w - 80, h: 34 });
  const spokes = [1, 2, 3, 4].map((k) => {
    const [cx, cy] = centres[k];
    const d = Math.hypot(cx - G0, cy - G1), ux = (cx - G0) / d, uy = (cy - G1) / d;
    // stop at the edge of the card, whichever side the spoke reaches first
    const reach = Math.min(cw / 2 / Math.max(Math.abs(ux), 1e-6), ch / 2 / Math.max(Math.abs(uy), 1e-6)) + 4;
    return { x1: G0 + ux * 20 * u, y1: G1 + uy * 20 * u, x2: cx - ux * reach, y2: cy - uy * reach };
  });
  const inner = (m: Rect, fx: number, fy: number): Pt => { const b = box(m); return [b.x + b.w * fx, b.y + b.h * fy]; };
  const p0 = mods[0], p4 = mods[4], p5 = mods[5];
  const projDots = [0, 1, 2].map((k) => inner(p0, 0.1 + 0.3 * k, 0.5));
  const avatars = Array.from({ length: 12 }, (_, k) => inner(p4, 0.06 + 0.17 * (k % 6), 0.22 + 0.56 * Math.floor(k / 6)));
  const miniBars = Array.from({ length: 12 }, (_, k) => {
    const [x, y] = inner(p5, 0.04 + 0.075 * k, 1);
    return { x1: x, y1: y, x2: x, y2: y - box(p5).h * (0.2 + 0.055 * k) };
  });
  const miniCurve = resample(miniBars.map((b) => [b.x2, b.y2 - 4 * u] as Pt), N_THREAD);
  // gauges of the Croissance summaries end up in Automatisation, Utilisateurs and Tableau de bord
  const gaugeIn = [2, 4, 3].map((k) => mods[k]);
  const modGaugeTrack = gaugeIn.map((m, k) => { const b = box(m); return k === 0 ? { x: b.x, y: b.y + b.h * 0.4, w: b.w, h: 5 * u, rx: 2.5 * u } : { x: b.x, y: m.y + 6 * u, w: b.w, h: 4 * u, rx: 2 * u }; });
  const modGaugeFill = modGaugeTrack.map((r, k) => ({ ...r, w: r.w * GAUGE[k] }));
  return {
    ...base,
    site,
    mods,
    modHalvesGrowth: roundedRectHalves(mods[5], 'right'),
    modLabels,
    modIcons,
    spokes,
    arc8: resample(arc(G0, G1, base.R, ANGLES[0], ANGLES[ANGLES.length - 1], 120), N_GLASS),
    projDots,
    avatars,
    miniBars,
    miniCurve,
    modGaugeTrack,
    modGaugeFill,
  };
}

function desktop(L: Layout): ChaptersLayout {
  const ts = 1;
  const F4: Rect = { x: 580, y: 280, w: 340, h: 680 * (340 / 880), rx: 16 * (340 / 880) };
  const pipeY = 280 + (715 - 110) * (340 / 880); // the site's "Envoyer" button, once the site has shrunk
  const stations = [0, 1, 2].map((k) => ({ x: 990 + 190 * k, y: 290, w: 170, h: 260, rx: 12 }));
  const rows = [pipeY - 72, pipeY - 36, pipeY];
  const tiles = [0, 1, 2].map((k) => ({ x: 780 + 238 * k, y: 184, w: 222, h: 106, rx: 12 }));
  const cx = 1010, ys = [250, 360, 470, 580], hws = [250, 190, 130, 70];
  const bx = (k: number) => 637.5 + 75 * k;
  const barH = [46, 58, 66, 80, 104, 132, 160, 188, 214, 244, 272, 300];
  const chips = [0, 1, 2].map((k) => ({ x: 780 + 238 * k, y: 128, w: 222, h: 70, rx: 12 }));
  const gaugeTrack = chips.map((c) => ({ x: c.x + 112, y: c.y + 44, w: 94, h: 6, rx: 3 }));
  return common(L, {
    ts,
    F4,
    stations,
    stIcon: stations.map((r) => ({ x: r.x + 18, y: r.y + 18, w: 34, h: 34, rx: 10 })),
    stTitle: stations.map((r, k) => T(r.x + 18, r.y + 80, 16, ['Traitement', 'Données', 'Suivi'][k])),
    trBars: [0, 1, 2].map((j) => ({ x: stations[0].x + 18, y: rows[j] - 4, w: [118, 92, 104][j], h: 8, rx: 4 })),
    dataRows: Array.from({ length: 12 }, (_, k) => ({ x1: stations[1].x + 18, y1: 398 + 11 * k, x2: stations[1].x + 152, y2: 398 + 11 * k })),
    suivi: rows.map((y) => ({
      box: { x: stations[2].x + 18, y: y - 8, w: 16, h: 16, rx: 4 },
      line: { x: stations[2].x + 42, y: y - 3.5, w: 58, h: 7, rx: 3.5 },
      status: T(stations[2].x + 154, y + 4, 12, 'Auto', 'end'),
    })),
    pipes: [
      { x1: F4.x + F4.w, y1: pipeY, x2: stations[0].x, y2: pipeY },
      { x1: stations[0].x + 170, y1: pipeY, x2: stations[1].x, y2: pipeY },
      { x1: stations[1].x + 170, y1: pipeY, x2: stations[2].x, y2: pipeY },
      { x1: 750, y1: 604, x2: 1455, y2: 604 },
    ],
    busNote: T(1455, 628, 12, 'Retour d’information vers le site', 'end'),
    signalRoute: [[580 + (1362 - 610) * (340 / 880), pipeY], [stations[2].x + 26, pipeY]],
    F5: { x: 600, y: 110, w: 900, h: 680, rx: 16 },
    header: { x: 612, y: 120, w: 876, h: 44, rx: 12 },
    seed5: { x: 636, y: 142, r: 8 },
    brand5: T(652, 147, 14, 'Votre entreprise'),
    title5: T(800, 148, 17, 'Tableau de bord'),
    cta5: { x: 1366, y: 128, w: 110, h: 28, rx: 14 },
    ctaLabel5: T(1421, 146.5, 13, 'Exporter', 'middle'),
    side: Array.from({ length: 6 }, (_, k) => ({ x: 616, y: 188 + 40 * k, w: 140, h: 30, rx: 8 })),
    sideLabels: ['Vue globale', 'Clients', 'Rapports', 'Demandes', 'Automatisations', 'Paramètres'].map((t, k) => T(632, 208 + 40 * k, 13, t)),
    tiles,
    tileLabels: tiles.map((r, k) => T(r.x + 18, r.y + 30, 13, ['Demandes traitées', 'Délai moyen', 'Tâches automatisées'][k])),
    tileValues: tiles.map((r, k) => T(r.x + 18, r.y + 78, 28, ['128', '2,4 j', '72 %'][k])),
    tileLights: tiles.map((r) => [r.x + r.w - 20, r.y + 22] as Pt),
    panel: { x: 780, y: 306, w: 698, h: 300, rx: 14 },
    panelTitle: T(804, 338, 15, 'Activité'),
    panelNote: T(1454, 338, 12, 'Données illustratives', 'end'),
    chart: resample(VALS.map((v, i) => [812 + (i * 638) / (VALS.length - 1), 584 - v * 220] as Pt), N_THREAD),
    grid5: [400, 450, 500, 550].map((y) => ({ x1: 804, y1: y, x2: 1454, y2: y })),
    table: Array.from({ length: 12 }, (_, k) => ({ x1: 796 + 344 * (k % 2), y1: 640 + 24 * Math.floor(k / 2), x2: 1112 + 344 * (k % 2), y2: 640 + 24 * Math.floor(k / 2) })),
    funnel: { cx, ys, hws },
    levels: ys.map((y, L2) => ({ x1: cx - hws[L2], y1: y, x2: cx + hws[L2], y2: y })),
    title6: T(800, 148, 17, 'Acquisition'),
    counters: [0, 1, 2].map((L2) => ({ x: cx + hws[L2] + 16, y: ys[L2] - 19, w: 160, h: 38, rx: 19 })),
    counterTexts: [0, 1, 2].map((L2) => T(cx + hws[L2] + 32, ys[L2] + 5, 13, ['Visites', 'Interactions', 'Demandes'][L2])),
    counterLights: [0, 1, 2].map((L2) => [cx + hws[L2] + 160, ys[L2]] as Pt),
    cta6: { x: cx - 80, y: ys[1] - 15, w: 160, h: 30, rx: 15 },
    ctaLabel6: T(cx, ys[1] + 4.5, 12, 'Parler de mon projet', 'middle'),
    crm: { x: 1300, y: 500, w: 184, h: 200, rx: 14 },
    crmTitle: T(1316, 528, 14, 'Nouvelle demande'),
    crmFields: [{ x: 1316, y: 542, w: 152, h: 30, rx: 8 }, { x: 1316, y: 580, w: 152, h: 30, rx: 8 }, { x: 1316, y: 620, w: 152, h: 32, rx: 16 }],
    crmLabels: [T(1328, 562, 12, 'Nom : Claire M.'), T(1328, 600, 12, 'Email : c.m@…'), T(1392, 640.5, 13, 'Qualifier', 'middle')],
    slots: [0, 1, 2, 3].map((j) => [1330 + 30 * j, 678] as Pt),
    conv: resample(cubicChain([cx, ys[3]], [[[cx, 650], [1240, 650], [1300, 612]]], 40), N_THREAD),
    hist: Array.from({ length: 12 }, (_, k) => { const h = [8, 12, 10, 16, 14, 20, 18, 24, 22, 28, 26, 30][k]; return { x1: 1060 + 16 * k, y1: 156, x2: 1060 + 16 * k, y2: 156 - h }; }),
    note6: T(760, 770, 12, 'Données illustratives'),
    park: (lv, j) => [cx - hws[lv] - 30 - 24 * j, ys[lv] - 12],
    visitorR: 5,
    axis: { from: [600, 700], to: [1500, 700] },
    months: Array.from({ length: 12 }, (_, k) => ({ x1: bx(k), y1: 700, x2: bx(k), y2: 710 })),
    barX: Array.from({ length: 12 }, (_, k) => bx(k)),
    barW: 34,
    barH,
    base: 700,
    curveLift: 18,
    grid7: [600, 500, 400, 300].map((y) => ({ x1: 600, y1: y, x2: 1500, y2: y })),
    ms: [bx(0), bx(2), bx(4)],
    msLabels: [T(bx(0), 746, 12, 'Cadrage', 'middle'), T(bx(2), 746, 12, 'Maquette', 'middle')],
    launch: { x: bx(4), top: 262, base: 700 },
    pill: { x: bx(4) - 56, y: 230, w: 112, h: 28, rx: 14 },
    pillText: T(bx(4), 248.5, 12, 'Lancement', 'middle'),
    chips,
    chipLabels: chips.map((c, k) => T(c.x + 16, c.y + 28, 12, ['Demandes', 'Délai de réponse', 'Tâches automatisées'][k])),
    chipValues: chips.map((c, k) => T(c.x + 16, c.y + 54, 20, ['+64 %', '−40 %', '72 %'][k])),
    gaugeTrack,
    gaugeFill: gaugeTrack.map((r, k) => ({ ...r, w: r.w * GAUGE[k] })),
    legend: { x: 1330, y: 230, w: 160, h: 28, rx: 14 },
    legendText: T(1410, 248.5, 12, 'Opportunités / mois', 'middle'),
    note7: T(1500, 764, 12, 'Données illustratives', 'end'),
    G: [1060, 625],
    tagline: T(1060, 722, 24, 'Innover. Digitaliser. Réussir.', 'middle'),
    card: [176, 70],
    R: 330,
    labelSize: 14,
    angles: [190, 222, 254, 286, 318, 350],
  });
}

function mobile(L: Layout): ChaptersLayout {
  const ts = 1.45;
  const s = 170 / 440;
  const F4: Rect = { x: 100, y: 270, w: 170, h: 900 * s, rx: 44 * s };
  const map = (x: number, y: number): Pt => [F4.x + (x - 230) * s, F4.y + (y - 270) * s];
  const btn = map(450, 1122);
  const stations = [0, 1, 2].map((k) => ({ x: 60 + 275 * k, y: 700, w: 250, h: 300, rx: 14 }));
  const rows = [802, 826, 850];
  const tiles = [0, 1, 2].map((k) => ({ x: 90 + 245 * k, y: 362, w: 230, h: 120, rx: 14 }));
  const cx = 450, ys = [430, 550, 670, 790], hws = [330, 250, 170, 90];
  const bx = (k: number) => 92.5 + 65 * k;
  const barH = [60, 78, 90, 105, 140, 180, 225, 262, 300, 345, 395, 450];
  const chips = [0, 1, 2].map((k) => ({ x: 60 + 265 * k, y: 296, w: 250, h: 84, rx: 14 }));
  const gaugeTrack = chips.map((c) => ({ x: c.x + 16, y: c.y + 70, w: 218, h: 7, rx: 3.5 }));
  return common(L, {
    ts,
    F4,
    stations,
    stIcon: stations.map((r) => ({ x: r.x + 18, y: r.y + 18, w: 40, h: 40, rx: 11 })),
    stTitle: stations.map((r, k) => T(r.x + 18, r.y + 88, 26, ['Traitement', 'Données', 'Suivi'][k])),
    trBars: [0, 1, 2].map((j) => ({ x: stations[0].x + 18, y: rows[j] - 6, w: [190, 150, 170][j], h: 12, rx: 6 })),
    dataRows: Array.from({ length: 12 }, (_, k) => ({ x1: stations[1].x + 18 + 112 * (k % 2), y1: 800 + 22 * Math.floor(k / 2), x2: stations[1].x + 120 + 112 * (k % 2), y2: 800 + 22 * Math.floor(k / 2) })),
    suivi: rows.map((y) => ({
      box: { x: stations[2].x + 18, y: y - 9, w: 18, h: 18, rx: 4 },
      line: { x: stations[2].x + 46, y: y - 4, w: 90, h: 8, rx: 4 },
      status: T(stations[2].x + 232, y + 6, 17, 'Auto', 'end'),
    })),
    pipes: [
      { x1: btn[0], y1: F4.y + F4.h, x2: btn[0], y2: stations[0].y },
      { x1: stations[0].x + 250, y1: rows[2], x2: stations[1].x, y2: rows[2] },
      { x1: stations[1].x + 250, y1: rows[2], x2: stations[2].x, y2: rows[2] },
      { x1: 60, y1: 1050, x2: 840, y2: 1050 },
    ],
    busNote: T(840, 1084, 18, 'Retour d’information vers le site', 'end'),
    signalRoute: [btn, [btn[0], rows[2]], [stations[2].x + 27, rows[2]]],
    F5: { x: 60, y: 270, w: 780, h: 900, rx: 40 },
    header: { x: 72, y: 282, w: 756, h: 58, rx: 16 },
    seed5: { x: 104, y: 311, r: 10 },
    brand5: null,
    title5: T(128, 319, 24, 'Tableau de bord'),
    cta5: { x: 684, y: 292, w: 130, h: 38, rx: 19 },
    ctaLabel5: T(749, 317, 18, 'Exporter', 'middle'),
    side: Array.from({ length: 6 }, (_, k) => ({ x: 90 + 122 * k, y: 1100, w: 104, h: 44, rx: 12 })),
    sideLabels: ['Vue', 'Clients', 'Rapports', 'Demandes', 'Autom.', 'Réglages'].map((t, k) => T(142 + 122 * k, 1129, 19, t, 'middle')),
    tiles,
    tileLabels: tiles.map((r, k) => T(r.x + 18, r.y + 38, 20, ['Demandes', 'Délai moyen', 'Automatisé'][k])),
    tileValues: tiles.map((r, k) => T(r.x + 18, r.y + 92, 36, ['128', '2,4 j', '72 %'][k])),
    tileLights: tiles.map((r) => [r.x + r.w - 22, r.y + 24] as Pt),
    panel: { x: 90, y: 504, w: 720, h: 330, rx: 16 },
    panelTitle: T(114, 542, 20, 'Activité'),
    panelNote: T(786, 542, 15, 'Données illustratives', 'end'),
    chart: resample(VALS.map((v, i) => [120 + (i * 660) / (VALS.length - 1), 810 - v * 230] as Pt), N_THREAD),
    grid5: [620, 680, 740, 800].map((y) => ({ x1: 114, y1: y, x2: 786, y2: y })),
    table: Array.from({ length: 12 }, (_, k) => ({ x1: 110 + 360 * (k % 2), y1: 862 + 22 * Math.floor(k / 2), x2: 430 + 360 * (k % 2), y2: 862 + 22 * Math.floor(k / 2) })),
    funnel: { cx, ys, hws },
    levels: ys.map((y, L2) => ({ x1: cx - hws[L2], y1: y, x2: cx + hws[L2], y2: y })),
    title6: T(128, 319, 24, 'Acquisition'),
    counters: [0, 1, 2].map((L2) => ({ x: cx + hws[L2] - 240, y: ys[L2] - 56, w: 240, h: 42, rx: 21 })),
    counterTexts: [0, 1, 2].map((L2) => T(cx + hws[L2] - 224, ys[L2] - 28, 19, ['Visites', 'Interactions', 'Demandes'][L2])),
    counterLights: [0, 1, 2].map((L2) => [cx + hws[L2] - 18, ys[L2] - 34] as Pt),
    cta6: { x: cx - hws[1] + 10, y: ys[1] - 17, w: 210, h: 34, rx: 17 },
    ctaLabel6: T(cx - hws[1] + 115, ys[1] + 6, 16, 'Parler de mon projet', 'middle'),
    crm: { x: 240, y: 880, w: 420, h: 196, rx: 16 },
    crmTitle: T(266, 914, 22, 'Nouvelle demande'),
    crmFields: [{ x: 266, y: 930, w: 180, h: 40, rx: 10 }, { x: 454, y: 930, w: 180, h: 40, rx: 10 }, { x: 266, y: 982, w: 368, h: 40, rx: 20 }],
    crmLabels: [T(282, 956, 17, 'Nom : Claire M.'), T(470, 956, 17, 'Email : c.m@…'), T(450, 1008, 19, 'Qualifier', 'middle')],
    slots: [0, 1, 2, 3].map((j) => [290 + 32 * j, 1050] as Pt),
    conv: resample([[cx, ys[3]], [cx, 835], [cx, 880]], N_THREAD),
    hist: Array.from({ length: 12 }, (_, k) => { const h = [10, 16, 13, 20, 18, 26, 22, 30, 28, 34, 30, 38][k]; return { x1: 470 + 26 * k, y1: 330, x2: 470 + 26 * k, y2: 330 - h }; }),
    note6: T(840, 868, 15, 'Données illustratives', 'end'),
    park: (lv, j) => [cx - hws[lv] - 26 - 24 * j, ys[lv] - 12],
    visitorR: 7,
    axis: { from: [60, 1090], to: [840, 1090] },
    months: Array.from({ length: 12 }, (_, k) => ({ x1: bx(k), y1: 1090, x2: bx(k), y2: 1104 })),
    barX: Array.from({ length: 12 }, (_, k) => bx(k)),
    barW: 32,
    barH,
    base: 1090,
    curveLift: 22,
    grid7: [990, 890, 790, 690].map((y) => ({ x1: 60, y1: y, x2: 840, y2: y })),
    ms: [bx(0), bx(2), bx(4)],
    msLabels: [T(bx(0), 1140, 20, 'Cadrage', 'middle'), T(bx(2), 1140, 20, 'Maquette', 'middle')],
    launch: { x: bx(4), top: 600, base: 1090 },
    pill: { x: bx(4) - 80, y: 560, w: 160, h: 36, rx: 18 },
    pillText: T(bx(4), 584, 18, 'Lancement', 'middle'),
    chips,
    chipLabels: chips.map((c, k) => T(c.x + 16, c.y + 30, 20, ['Demandes', 'Délai', 'Automatisé'][k])),
    chipValues: chips.map((c, k) => T(c.x + 16, c.y + 61, 28, ['+64 %', '−40 %', '72 %'][k])),
    gaugeTrack,
    gaugeFill: gaugeTrack.map((r, k) => ({ ...r, w: r.w * GAUGE[k] })),
    legend: { x: 590, y: 560, w: 250, h: 36, rx: 18 },
    legendText: T(715, 584, 17, 'Opportunités / mois', 'middle'),
    note7: T(840, 1170, 16, 'Données illustratives', 'end'),
    // Mobile Impact: a horseshoe around the GTC point leaves room for wider, legible cards.
    G: [450, 715],
    tagline: T(450, 1100, 34, 'Innover. Digitaliser. Réussir.', 'middle'),
    card: [270, 92],
    R: 305,
    labelSize: 25,
    angles: [215, 180, 145, 35, 0, -35],
  });
}

export function chaptersLayout(L: Layout): ChaptersLayout {
  return L.kind === 'desktop' ? desktop(L) : mobile(L);
}
