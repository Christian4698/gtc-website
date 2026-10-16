// Geometry of the three states (Idée, Organisation, Création) for each composition.
// Desktop and mobile share object identities; only positions, scale and arrangement differ.

import { cubicChain, resample, roundedRectHalves, type Pt, type Rect, type Seg } from '../engine/geometry';

export const N_GLASS = 160;
export const N_THREAD = 72;

export type SiteRole = 'placeholder' | 'cta' | 'container' | 'field' | 'button' | 'burger';

export type Bar = {
  id: string;
  lane: number;
  label: string;
  critical: boolean;
  /** Seconds at which the "today" marker passes the end of the task, or null if still open. */
  doneAt: number | null;
  org: Rect;
  site: Rect;
  role: SiteRole;
};

export type TextSpec = { x: number; y: number; size: number; text: string; anchor?: 'start' | 'middle' | 'end' };

export type Layout = {
  kind: 'desktop' | 'mobile';
  vb: readonly [number, number];
  grid: { step: number; r: number; area: Rect };
  idea: {
    glass: Pt[];
    glassHalves: { neg: Pt[]; pos: Pt[] };
    filament: Pt[];
    seed: { x: number; y: number; r: number };
    sockets: Seg[];
    rays: Seg[];
    tips: Pt[];
    stroke: number;
  };
  org: {
    axis: { from: Pt; to: Pt };
    ticks: Seg[];
    lanes: { y: number; guide: Seg; label: TextSpec }[];
    milestones: { x: number; top: number; base: number; label: TextSpec }[];
    diamond: number;
    critical: Pt[];
    deps: { org: string; site: string; siteWidth: number }[];
    seedStart: Pt;
    seedToday: Pt;
    todayTop: number;
    bars: Bar[];
    barText: number;
    showBarLabels: boolean;
  };
  site: {
    frame: Rect;
    frameHalves: { neg: Pt[]; pos: Pt[] };
    toolbar: string;
    dots: Pt[];
    dotR: number;
    address: Seg[];
    addressWidth: number;
    url: TextSpec;
    borders: Seg[];
    logo: { x: number; y: number; r: number };
    brand: TextSpec;
    navTexts: TextSpec[];
    curtain: Rect;
    headline: { x: number; size: number; lines: { y: number; text: string }[] };
    sub: TextSpec;
    cta: TextSpec & { arrow: Pt };
    card: Rect;
    cardHalves: { neg: Pt[]; pos: Pt[] };
    cardTexts: TextSpec[];
    chart: Pt[];
    services: { icon: Rect; title: TextSpec; body: TextSpec | null; glyph: number }[];
    formTitle: TextSpec | null;
    fieldTexts: TextSpec[];
    annotations: TextSpec[];
    sectionClips: { nav: Rect; hero: Rect; card: Rect; services: Rect; form: Rect };
  };
};

const LANE_NAMES = ['Planification', 'Objectifs', 'Processus', 'Ressources'];
const MILESTONES = ['Cadrage', 'Maquette', 'Lancement'];

// ---------------------------------------------------------------- bulb, in local units
// Origin = centre of the bottom of the glass neck; y grows downwards.
const GLASS_LEFT: [Pt, Pt, Pt][] = [
  [[-40, -50], [-118, -90], [-118, -180]],
  [[-118, -250], [-65, -298], [0, -298]],
];
const GLASS_RIGHT: [Pt, Pt, Pt][] = [
  [[65, -298], [118, -250], [118, -180]],
  [[118, -90], [40, -50], [40, 0]],
];
const FILAMENT: Pt[] = [[-20, 0], [-14, -118], [-9, -150], [-4, -130], [0, -152], [4, -130], [9, -150], [14, -118], [20, 0]];
const SOCKETS = [[18, 42], [34, 38], [50, 30]] as const; // [y, half width]
const RAY_ANGLES = [200, 340, 20, 160]; // lanes A..D: upper-left, upper-right, lower-right, lower-left
const RAY_CENTRE: Pt = [0, -190];

function bulb(ox: number, oy: number, s: number) {
  const T = (p: Pt): Pt => [ox + p[0] * s, oy + p[1] * s];
  const left = cubicChain(T([-40, 0]), GLASS_LEFT.map(([a, b, c]) => [T(a), T(b), T(c)] as const), 40);
  const right = cubicChain(T([0, -298]), GLASS_RIGHT.map(([a, b, c]) => [T(a), T(b), T(c)] as const), 40);
  const glass = resample([...left, ...right.slice(1)], N_GLASS);
  const glassHalves = { neg: [...left].reverse(), pos: right };
  const filament = resample(FILAMENT.map(T), N_THREAD);
  const sockets = SOCKETS.map(([y, hw]) => {
    const a = T([-hw, y]), b = T([hw, y]);
    return { x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
  });
  const c = T(RAY_CENTRE);
  const polar = (r: number, deg: number): Pt => [c[0] + r * s * Math.cos((deg * Math.PI) / 180), c[1] + r * s * Math.sin((deg * Math.PI) / 180)];
  const rays = RAY_ANGLES.map((a) => {
    const i = polar(150, a), o = polar(182, a);
    return { x1: i[0], y1: i[1], x2: o[0], y2: o[1] };
  });
  const tips = RAY_ANGLES.map((a) => polar(196, a));
  const seedP = T([0, -140]);
  return { glass, glassHalves, filament, sockets, rays, tips, seed: { x: seedP[0], y: seedP[1], r: 10 * s }, stroke: 3 * s };
}

// ---------------------------------------------------------------- project plan (desktop units)
type BarDef = { lane: number; label: string; x0: number; x1: number; critical: boolean };
const BARS: BarDef[] = [
  { lane: 0, label: 'Audit', x0: 730, x1: 840, critical: true },
  { lane: 0, label: 'Arborescence', x0: 850, x1: 1000, critical: false },
  { lane: 0, label: 'Planning', x0: 1010, x1: 1110, critical: false },
  { lane: 1, label: 'Message', x0: 890, x1: 1000, critical: true },
  { lane: 1, label: 'Arguments', x0: 1010, x1: 1120, critical: true },
  { lane: 1, label: 'Conversion', x0: 1150, x1: 1300, critical: false },
  { lane: 2, label: 'Conception', x0: 1135, x1: 1255, critical: true },
  { lane: 2, label: 'Développement', x0: 1265, x1: 1405, critical: true },
  { lane: 2, label: 'Tests', x0: 1415, x1: 1500, critical: true },
  { lane: 3, label: 'Contenus', x0: 740, x1: 880, critical: false },
  { lane: 3, label: 'Équipe', x0: 890, x1: 1000, critical: false },
  { lane: 3, label: 'Outils', x0: 1010, x1: 1120, critical: false },
];
const ROLES: SiteRole[] = ['placeholder', 'placeholder', 'placeholder', 'placeholder', 'placeholder', 'cta', 'container', 'container', 'container', 'field', 'field', 'button'];
const LANE_Y = [290, 400, 510, 620];
const CRITICAL: Pt[] = [[840, 290], [865, 290], [865, 400], [890, 400], [1120, 400], [1127, 400], [1127, 510], [1135, 510], [1500, 510]];
const DEPS: [Pt, Pt, Pt, Pt][] = [
  [[1110, 290], [1135, 290], [1125, 400], [1150, 400]],
  [[1120, 620], [1190, 620], [1195, 510], [1265, 510]],
];
const MILESTONE_X = [1005, 1260, 1410];
const TODAY_X = 1060;
// "Today" travels from the axis start to TODAY_X between these times (see timeline).
export const TODAY_WINDOW = [4.7, 5.35] as const;

/** Time at which the "today" marker (moved with sine.inOut) reaches plan position x. */
export function todayPassTime(x: number): number {
  const f = Math.min(1, Math.max(0, (x - 600) / (TODAY_X - 600)));
  const u = Math.acos(1 - 2 * f) / Math.PI;
  return TODAY_WINDOW[0] + u * (TODAY_WINDOW[1] - TODAY_WINDOW[0]);
}

function doneAt(endX: number): number | null {
  return endX > TODAY_X ? null : todayPassTime(endX);
}

const cubicD = (p: [Pt, Pt, Pt, Pt]) => `M${p[0][0]} ${p[0][1]}C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`;
const flatD = (x0: number, x1: number, y: number) => cubicD([[x0, y], [x0 + (x1 - x0) / 3, y], [x0 + (2 * (x1 - x0)) / 3, y], [x1, y]]);

// ---------------------------------------------------------------- desktop
function desktop(): Layout {
  const idea = bulb(1050, 520, 1);
  const axisFrom: Pt = [600, 700], axisTo: Pt = [1500, 700];
  const barH = 34;
  const navSites: Rect[] = [
    { x: 1220, y: 173, w: 60, h: 10, rx: 5 },
    { x: 1298, y: 173, w: 84, h: 10, rx: 5 },
    { x: 1400, y: 173, w: 58, h: 10, rx: 5 },
  ];
  const siteRects: Rect[] = [
    ...navSites,
    { x: 650, y: 240, w: 400, h: 72, rx: 8 },
    { x: 650, y: 330, w: 330, h: 14, rx: 7 },
    { x: 650, y: 368, w: 232, h: 50, rx: 25 },
    { x: 642, y: 500, w: 264, h: 124, rx: 12 },
    { x: 918, y: 500, w: 264, h: 124, rx: 12 },
    { x: 1194, y: 500, w: 264, h: 124, rx: 12 },
    { x: 642, y: 692, w: 300, h: 46, rx: 10 },
    { x: 954, y: 692, w: 300, h: 46, rx: 10 },
    { x: 1266, y: 692, w: 192, h: 46, rx: 23 },
  ];
  const frame: Rect = { x: 610, y: 110, w: 880, h: 680, rx: 16 };
  const card: Rect = { x: 1120, y: 236, w: 330, h: 214, rx: 16 };
  const lanes = LANE_Y.map((y, i) => ({
    y,
    guide: { x1: 730, y1: y, x2: 1500, y2: y },
    label: { x: 600, y: y + 5, size: 15, text: LANE_NAMES[i] },
  }));
  const bars: Bar[] = BARS.map((b, i) => ({
    id: `bar-${i}`,
    lane: b.lane,
    label: b.label,
    critical: b.critical,
    doneAt: doneAt(b.x1),
    org: { x: b.x0, y: LANE_Y[b.lane] - barH / 2, w: b.x1 - b.x0, h: barH, rx: 8 },
    site: siteRects[i],
    role: ROLES[i],
  }));
  const services = ['Sites web', 'Applications', 'Automatisation'].map((title, k) => {
    const r = siteRects[6 + k];
    return {
      icon: { x: r.x + 20, y: r.y + 20, w: 36, h: 36, rx: 10 },
      title: { x: r.x + 20, y: r.y + 82, size: 17, text: title },
      body: { x: r.x + 20, y: r.y + 104, size: 13, text: ['Conçus pour convertir.', 'Sur mesure, web et mobile.', 'Moins de tâches manuelles.'][k] },
      glyph: k,
    };
  });
  return {
    kind: 'desktop',
    vb: [1600, 900],
    grid: { step: 32, r: 1.3, area: { x: 560, y: 64, w: 1008, h: 800, rx: 0 } },
    idea,
    org: {
      axis: { from: axisFrom, to: axisTo },
      ticks: Array.from({ length: 12 }, (_, k) => ({ x1: 637.5 + 75 * k, y1: 700, x2: 637.5 + 75 * k, y2: 710 })),
      lanes,
      milestones: MILESTONE_X.map((x, k) => ({ x, top: 250, base: 700, label: { x, y: 734, size: 13, text: MILESTONES[k], anchor: 'middle' as const } })),
      diamond: 14,
      critical: resample(CRITICAL, N_THREAD),
      deps: [
        { org: cubicD(DEPS[0]), site: flatD(1150, 1270, 272), siteWidth: 12 },
        { org: cubicD(DEPS[1]), site: flatD(1150, 1230, 297), siteWidth: 8 },
      ],
      seedStart: axisFrom,
      seedToday: [TODAY_X, 700],
      todayTop: 250,
      bars,
      barText: 14,
      showBarLabels: true,
    },
    site: {
      frame,
      frameHalves: roundedRectHalves(frame, 'bottom'),
      toolbar: 'M610 150V126Q610 110 626 110H1474Q1490 110 1490 126V150Z',
      dots: [[636, 130], [656, 130], [676, 130]],
      dotR: 5,
      address: Array.from({ length: 12 }, (_, k) => ({ x1: 908 + 24 * k, y1: 130, x2: 928 + 24 * k, y2: 130 })),
      addressWidth: 16,
      url: { x: 1050, y: 134.5, size: 12, text: 'votre-entreprise.fr', anchor: 'middle' },
      borders: [
        { x1: 610, y1: 150, x2: 1490, y2: 150 },
        { x1: 642, y1: 206, x2: 1458, y2: 206 },
        { x1: 642, y1: 476, x2: 1458, y2: 476 },
        { x1: 642, y1: 646, x2: 1458, y2: 646 },
      ],
      logo: { x: 652, y: 178, r: 9 },
      brand: { x: 670, y: 183.5, size: 16, text: 'Votre entreprise' },
      navTexts: ['Services', 'Réalisations', 'Contact'].map((text, k) => ({ x: navSites[k].x, y: 182.5, size: 14, text })),
      curtain: { x: 611, y: 206, w: 878, h: 270, rx: 0 },
      headline: { x: 650, size: 30, lines: [{ y: 268, text: 'Votre croissance,' }, { y: 304, text: 'construite avec méthode.' }] },
      sub: { x: 650, y: 342, size: 15, text: 'Sites, applications et données réunis.' },
      cta: { x: 676, y: 398.5, size: 15, text: 'Parler de mon projet', arrow: [846, 393] },
      card,
      cardHalves: roundedRectHalves(card, 'right'),
      cardTexts: [
        { x: 1150, y: 277, size: 15, text: 'Activité du site' },
        { x: 1150, y: 300, size: 12, text: 'Données illustratives' },
      ],
      chart: resample([[1150, 420], [1196, 404], [1238, 410], [1288, 372], [1338, 362], [1380, 334], [1420, 318]], N_THREAD),
      services,
      formTitle: { x: 642, y: 676, size: 16, text: 'Parlons de votre projet' },
      fieldTexts: [
        { x: 662, y: 720, size: 14, text: 'Nom' },
        { x: 974, y: 720, size: 14, text: 'Email' },
        { x: 1362, y: 720.5, size: 15, text: 'Envoyer', anchor: 'middle' },
      ],
      annotations: [178, 341, 561, 718].map((y, i) => ({ x: 1508, y: y + 5, size: 13, text: LANE_NAMES[i] })),
      sectionClips: {
        nav: { x: 610, y: 110, w: 880, h: 96, rx: 0 },
        hero: { x: 640, y: 220, w: 470, h: 210, rx: 0 },
        card: { x: 1140, y: 255, w: 300, h: 60, rx: 0 },
        services: { x: 640, y: 500, w: 820, h: 130, rx: 0 },
        form: { x: 640, y: 650, w: 820, h: 100, rx: 0 },
      },
    },
  };
}

// ---------------------------------------------------------------- mobile (native 3:4 composition)
function mobile(): Layout {
  const idea = bulb(450, 840, 1.25);
  const X = (x: number) => 60 + ((x - 730) * 780) / 770;
  const laneY = [470, 600, 730, 860];
  const Y = (y: number) => laneY[LANE_Y.indexOf(y)];
  const axisFrom: Pt = [60, 1090], axisTo: Pt = [840, 1090];
  const barH = 46;
  const siteRects: Rect[] = [
    { x: 600, y: 346, w: 38, h: 6, rx: 3 },
    { x: 600, y: 357, w: 38, h: 6, rx: 3 },
    { x: 600, y: 368, w: 38, h: 6, rx: 3 },
    { x: 262, y: 424, w: 340, h: 116, rx: 10 },
    { x: 262, y: 556, w: 300, h: 20, rx: 10 },
    { x: 262, y: 596, w: 292, h: 62, rx: 31 },
    { x: 262, y: 840, w: 376, h: 50, rx: 12 },
    { x: 262, y: 898, w: 376, h: 50, rx: 12 },
    { x: 262, y: 956, w: 376, h: 50, rx: 12 },
    { x: 262, y: 1030, w: 184, h: 52, rx: 12 },
    { x: 454, y: 1030, w: 184, h: 52, rx: 12 },
    { x: 262, y: 1094, w: 376, h: 56, rx: 28 },
  ];
  const roles = ROLES.map((r, i) => (i < 3 ? 'burger' : r)) as SiteRole[];
  const frame: Rect = { x: 230, y: 270, w: 440, h: 900, rx: 44 };
  const card: Rect = { x: 262, y: 684, w: 376, h: 120, rx: 16 };
  const lanes = laneY.map((y, i) => ({
    y,
    guide: { x1: 60, y1: y, x2: 840, y2: y },
    label: { x: 60, y: y - 34, size: 26, text: LANE_NAMES[i] },
  }));
  const bars: Bar[] = BARS.map((b, i) => ({
    id: `bar-${i}`,
    lane: b.lane,
    label: b.label,
    critical: b.critical,
    doneAt: doneAt(b.x1),
    org: { x: X(b.x0), y: laneY[b.lane] - barH / 2, w: X(b.x1) - X(b.x0), h: barH, rx: 10 },
    site: siteRects[i],
    role: roles[i],
  }));
  const mapDep = (p: [Pt, Pt, Pt, Pt]): [Pt, Pt, Pt, Pt] => p.map(([x, y]) => [X(x), Y(y)] as Pt) as [Pt, Pt, Pt, Pt];
  const services = ['Sites web', 'Applications', 'Automatisation'].map((title, k) => {
    const r = siteRects[6 + k];
    return {
      icon: { x: r.x + 12, y: r.y + 11, w: 28, h: 28, rx: 8 },
      title: { x: r.x + 54, y: r.y + 33, size: 22, text: title },
      body: null,
      glyph: k,
    };
  });
  return {
    kind: 'mobile',
    vb: [900, 1200],
    grid: { step: 50, r: 2, area: { x: 30, y: 250, w: 840, h: 930, rx: 0 } },
    idea,
    org: {
      axis: { from: axisFrom, to: axisTo },
      ticks: Array.from({ length: 12 }, (_, k) => ({ x1: 60 + 65 * (k + 0.5), y1: 1090, x2: 60 + 65 * (k + 0.5), y2: 1104 })),
      lanes,
      milestones: MILESTONE_X.map((x, k) => ({ x: X(x), top: 420, base: 1090, label: { x: X(x), y: 1136, size: 22, text: MILESTONES[k], anchor: 'middle' as const } })),
      diamond: 20,
      critical: resample(CRITICAL.map(([x, y]) => [X(x), Y(y)] as Pt), N_THREAD),
      deps: [
        { org: cubicD(mapDep(DEPS[0])), site: flatD(284, 392, 712), siteWidth: 14 },
        { org: cubicD(mapDep(DEPS[1])), site: flatD(284, 344, 737), siteWidth: 10 },
      ],
      seedStart: axisFrom,
      seedToday: [X(TODAY_X), 1090],
      todayTop: 420,
      bars,
      barText: 22,
      showBarLabels: false,
    },
    site: {
      frame,
      frameHalves: roundedRectHalves(frame, 'bottom'),
      toolbar: 'M230 326V314Q230 270 274 270H626Q670 270 670 314V326Z',
      dots: [[268, 298], [290, 298], [312, 298]],
      dotR: 7,
      address: Array.from({ length: 12 }, (_, k) => ({ x1: 386 + 19 * k, y1: 298, x2: 398 + 19 * k, y2: 298 })),
      addressWidth: 22,
      url: { x: 496, y: 305, size: 19, text: 'votre-entreprise.fr', anchor: 'middle' },
      borders: [
        { x1: 230, y1: 326, x2: 670, y2: 326 },
        { x1: 262, y1: 396, x2: 638, y2: 396 },
        { x1: 262, y1: 820, x2: 638, y2: 820 },
        { x1: 262, y1: 1010, x2: 638, y2: 1010 },
      ],
      logo: { x: 276, y: 361, r: 13 },
      brand: { x: 300, y: 369, size: 23, text: 'Votre entreprise' },
      navTexts: [],
      curtain: { x: 231, y: 396, w: 438, h: 424, rx: 0 },
      headline: { x: 262, size: 32, lines: [{ y: 456, text: 'Votre croissance,' }, { y: 494, text: 'construite avec' }, { y: 532, text: 'méthode.' }] },
      sub: { x: 262, y: 573, size: 21, text: 'Sites, applications et données.' },
      cta: { x: 290, y: 634, size: 22, text: 'Parler de mon projet', arrow: [522, 627] },
      card,
      cardHalves: roundedRectHalves(card, 'right'),
      cardTexts: [
        { x: 284, y: 718, size: 20, text: 'Activité du site' },
        { x: 284, y: 742, size: 16, text: 'Données illustratives' },
      ],
      chart: resample([[284, 790], [340, 780], [392, 784], [448, 760], [500, 752], [552, 734], [614, 722]], N_THREAD),
      services,
      formTitle: null,
      fieldTexts: [
        { x: 282, y: 1063, size: 20, text: 'Nom' },
        { x: 474, y: 1063, size: 20, text: 'Email' },
        { x: 450, y: 1129.5, size: 22, text: 'Envoyer', anchor: 'middle' },
      ],
      annotations: [361, 608, 915, 1090].map((y, i) => ({ x: 690, y: y + 7, size: 22, text: LANE_NAMES[i] })),
      sectionClips: {
        nav: { x: 230, y: 270, w: 440, h: 126, rx: 0 },
        hero: { x: 250, y: 420, w: 400, h: 250, rx: 0 },
        card: { x: 270, y: 690, w: 360, h: 60, rx: 0 },
        services: { x: 262, y: 840, w: 376, h: 166, rx: 0 },
        form: { x: 262, y: 1030, w: 376, h: 120, rx: 0 },
      },
    },
  };
}

export const LAYOUTS = { desktop: desktop(), mobile: mobile() } as const;
export type LayoutKind = keyof typeof LAYOUTS;
