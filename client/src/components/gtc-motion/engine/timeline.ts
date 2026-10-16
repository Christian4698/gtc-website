// Master timeline. Every tween is a fromTo with explicit start values, so any time can be
// reached directly with seek() in either direction and always renders the same frame.

import gsap from 'gsap';
import { toPath, type Rect, type Seg } from './geometry';
import { shapesFor } from './shapes';
import { DURATION, EASE, LABELS, TITLE_SWAPS } from './motion';
import { buildChapters } from './chapters';
import type { ChaptersLayout } from '../story/chaptersLayout';
import { TODAY_WINDOW, todayPassTime, type Bar, type Layout, type SiteRole } from '../story/layouts';
import { C } from '../story/palette';

type Attrs = Record<string, string | number>;

export type TimelineHooks = {
  /** Called on every render with the current time, in seconds. */
  onUpdate?: (t: number) => void;
  /** Titles then bodies of every chapter, swapped through a mask in the DOM. */
  titles?: HTMLElement[];
  /** Official logo shown in the DOM copy for the Impact chapter. */
  logo?: HTMLElement | null;
};

const segD = (s: Seg) => `M${s.x1} ${s.y1}L${s.x2} ${s.y2}`;
const pointD = (x: number, y1: number, y2: number) => `M${x} ${y1}L${x} ${y2}`;

export function buildTimeline(svg: SVGSVGElement, L: Layout, X: ChaptersLayout, hooks: TimelineHooks = {}): gsap.core.Timeline {
  const $ = (id: string) => {
    const el = svg.querySelector(`[data-obj="${id}"]`);
    if (!el) throw new Error(`Objet manquant dans la scène : ${id}`);
    return el as SVGElement;
  };
  const tl = gsap.timeline({
    paused: true,
    defaults: { immediateRender: false },
    onUpdate: () => hooks.onUpdate?.(tl.time()),
  });
  Object.entries(LABELS).forEach(([name, t]) => tl.addLabel(name, t));

  const A = (el: Element | object, from: Attrs, to: Attrs, at: number, dur: number, ease: string = EASE.transform) => {
    tl.fromTo(el, { attr: from }, { attr: to, duration: dur, ease }, at);
  };
  /** Rectangle move on a curved path: horizontal and vertical motion use different curves. */
  const rectMove = (el: Element, a: Rect, b: Rect, at: number, dur: number, ex: string = EASE.transform, ey = 'power1.inOut') => {
    A(el, { x: a.x, width: a.w }, { x: b.x, width: b.w }, at, dur, ex);
    A(el, { y: a.y, height: a.h, rx: a.rx }, { y: b.y, height: b.h, rx: b.rx }, at, dur, ey);
  };
  /** Shape morph driven by a pure function of local progress p (0..1). */
  const morph = (el: Element, shape: (p: number) => string, at: number, dur: number) => {
    const proxy = { p: 0 };
    tl.fromTo(proxy, { p: 0 }, { p: 1, duration: dur, ease: 'none', onUpdate: () => el.setAttribute('d', shape(proxy.p)) }, at);
  };

  const { idea, org, site } = L;
  const s = L.kind === 'desktop' ? 1 : 1.25;
  const hair = 1.5 * s;
  const shapes = shapesFor(L);
  const lanesFirst = org.lanes.map((_, lane) => org.bars.findIndex((b) => b.lane === lane));

  // ------------------------------------------------------------------ ACT 1 · Idée (0 – 2.2 s)
  const glass = $('glass');
  A(glass, { 'stroke-dashoffset': 1 }, { 'stroke-dashoffset': 0 }, 0.15, 1.2, EASE.draw);
  idea.sockets.forEach((_, k) => A($(`socket-${k}`), { 'stroke-dashoffset': 1 }, { 'stroke-dashoffset': 0 }, 0.75 + 0.1 * k, 0.4, EASE.draw));
  const filament = $('filament');
  A(filament, { 'stroke-dashoffset': 1 }, { 'stroke-dashoffset': 0 }, 0.95, 0.5, EASE.draw);
  const seed = $('seed');
  A(seed, { r: 0 }, { r: idea.seed.r }, 1.3, 0.5, EASE.settle);
  const halo = $('halo');
  A(halo, { r: idea.seed.r, opacity: 0.55 }, { r: idea.seed.r * 7, opacity: 0 }, 1.38, 1.1, 'power2.out');
  idea.rays.forEach((_, i) => A($(`ray-${i}`), { 'stroke-dashoffset': 1 }, { 'stroke-dashoffset': 0 }, 1.45 + 0.05 * i, 0.4, 'power2.out'));
  const tipRect = (lane: number, size: number): Rect => {
    const [x, y] = idea.tips[lane];
    return { x: x - size / 2, y: y - size / 2, w: size, h: size, rx: size / 2 };
  };
  lanesFirst.forEach((bi, lane) => rectMove($(org.bars[bi].id), tipRect(lane, 0), tipRect(lane, 12 * s), 1.72 + 0.05 * lane, 0.35, EASE.settle, EASE.settle));

  // ------------------------------------------------------------------ T1 · the bulb unrolls (2.2 – 4.6 s)
  morph(glass, (p) => toPath(shapes.glassToAxis(p)), 2.25, 1.5);
  A(glass, { 'stroke-width': idea.stroke }, { 'stroke-width': 2.2 * s }, 2.25, 1.5);

  org.milestones.forEach((m, k) => {
    const sock = $(`socket-${k}`);
    // The thread first lands on the ground line as a short mark, then stands up as a milestone.
    const landed = `M${m.x - 8 * s} ${m.base}L${m.x + 8 * s} ${m.base}`;
    A(sock, { d: segD(idea.sockets[k]), 'stroke-width': idea.stroke }, { d: landed, 'stroke-width': hair * 1.4 }, 2.5 + 0.08 * k, 0.75);
    A(sock, { d: landed, 'stroke-width': hair * 1.4 }, { d: pointD(m.x, m.base, m.top), 'stroke-width': hair }, 3.3 + 0.08 * k, 0.55, 'power3.out');
    A(sock, { stroke: C.gtc }, { stroke: C.milestone }, 3.3 + 0.08 * k, 0.5, 'power1.inOut');
    const d = org.diamond * s;
    rectMove($(`diamond-${k}`), { x: m.x, y: m.base, w: 0, h: 0, rx: 1.5 }, { x: m.x - d / 2, y: m.base - d / 2, w: d, h: d, rx: 1.5 }, 3.35 + 0.06 * k, 0.4, EASE.settle, EASE.settle);
    A($(`ms-label-clip-${k}`), { width: 0 }, { width: 140 * s }, 3.65 + 0.06 * k, 0.45, 'power2.out');
  });

  const guideEnds = org.lanes.map((ln, i) => {
    const r = idea.rays[i];
    const leftToRight = r.x1 < r.x2; // inner end on the left: keep that end on the left
    return leftToRight ? ln.guide : { x1: ln.guide.x2, y1: ln.guide.y2, x2: ln.guide.x1, y2: ln.guide.y1 };
  });
  idea.rays.forEach((r, i) => {
    const ray = $(`ray-${i}`);
    A(ray, { ...r }, { ...guideEnds[i] }, 2.4 + 0.05 * i, 0.95);
    A(ray, { stroke: C.sky, 'stroke-width': idea.stroke }, { stroke: C.lane, 'stroke-width': hair }, 2.55 + 0.05 * i, 0.8, 'power1.inOut');
    A($(`lane-label-clip-${i}`), { width: 0 }, { width: 190 * s }, 3.3 + 0.06 * i, 0.5, 'power2.out');
  });

  const orgStroke = (b: Bar) => (b.critical ? C.gtc : C.barStroke);
  org.bars.forEach((b, i) => {
    const el = $(b.id);
    const k = i - lanesFirst[b.lane];
    if (k === 0) {
      rectMove(el, tipRect(b.lane, 12 * s), b.org, 2.75 + 0.06 * b.lane, 0.75);
      A(el, { fill: C.sky, stroke: C.sky, 'stroke-width': 0 }, { fill: C.white, stroke: orgStroke(b), 'stroke-width': hair }, 2.85 + 0.06 * b.lane, 0.55, 'power1.inOut');
    } else {
      // Subdivision: the next task grows out of the end of the previous one.
      const prev = org.bars[i - 1].org;
      const start: Rect = { x: prev.x + prev.w, y: b.org.y, w: 0, h: b.org.h, rx: b.org.rx };
      const at = 3.4 + 0.06 * b.lane + 0.22 * (k - 1);
      rectMove(el, start, b.org, at, 0.45, 'power3.out', 'none');
      A(el, { fill: C.white, stroke: orgStroke(b), 'stroke-width': hair }, { fill: C.white, stroke: orgStroke(b), 'stroke-width': hair }, at, 0.01, 'none');
    }
  });

  morph(filament, (p) => toPath(shapes.filamentToCritical(p)), 3.05, 1.05);
  A(filament, { 'stroke-width': 1.6 * s }, { 'stroke-width': 2 * s }, 3.05, 1.05);
  org.deps.forEach((_, i) => A($(`dep-${i}`), { 'stroke-dashoffset': 1 }, { 'stroke-dashoffset': 0 }, 4.1 + 0.1 * i, 0.4, EASE.draw));
  org.ticks.forEach((t, k) => A($(`tick-${k}`), { y2: t.y1 }, { y2: t.y2 }, 3.75 + 0.025 * k, 0.3, 'power2.out'));

  A(seed, { cx: idea.seed.x }, { cx: org.seedStart[0] }, 2.45, 1.0, EASE.travel);
  A(seed, { cy: idea.seed.y }, { cy: org.seedStart[1] }, 2.45, 1.0, 'power1.in');
  A(seed, { r: idea.seed.r, fill: C.sky, 'stroke-width': 0 }, { r: 7 * s, fill: C.gtc, 'stroke-width': 2.5 * s }, 2.6, 0.7, 'power2.inOut');
  A($('grid-reveal'), { r: 0 }, { r: Math.max(...L.vb) * 1.25 }, 2.35, 1.9, 'power2.out');

  // ------------------------------------------------------------------ Organisation: the plan advances (4.6 – 5.4 s)
  const today = $('today');
  const [t0, t1] = TODAY_WINDOW;
  A(today, { y2: org.seedStart[1] }, { y2: org.todayTop }, 4.45, 0.3, 'power2.out');
  A(today, { x1: org.seedStart[0], x2: org.seedStart[0] }, { x1: org.seedToday[0], x2: org.seedToday[0] }, t0, t1 - t0, EASE.travel);
  A(seed, { cx: org.seedStart[0] }, { cx: org.seedToday[0] }, t0, t1 - t0, EASE.travel);
  org.bars.forEach((b) => {
    if (b.doneAt !== null) A($(b.id), { fill: C.white }, { fill: C.done }, b.doneAt, 0.25, 'power1.out');
  });
  const m1Pass = todayPassTime(1005);
  A($('diamond-0'), { fill: C.white }, { fill: C.gtc }, m1Pass, 0.2, 'power1.out');

  // ------------------------------------------------------------------ T2 · the plan folds into a page (5.4 – 7.4 s)
  if (org.showBarLabels) org.bars.forEach((b) => A($(`${b.id}-label`), { opacity: 1 }, { opacity: 0 }, 5.4, 0.2, 'power1.out'));
  A(today, { y2: org.todayTop }, { y2: org.seedStart[1] }, 5.4, 0.25, 'power2.in');
  org.milestones.forEach((_, k) => A($(`ms-label-clip-${k}`), { width: 140 * s }, { width: 0 }, 5.4, 0.25, 'power2.in'));

  morph(glass, (p) => toPath(shapes.axisToFrame(p)), 5.5, 1.25);
  A(glass, { 'stroke-width': 2.2 * s }, { 'stroke-width': 1.6 * s }, 5.5, 1.25);

  org.milestones.forEach((m, k) => {
    const sock = $(`socket-${k}`);
    const dot = site.dots[k];
    const d = org.diamond * s;
    if (k < 2) {
      A(sock, { d: pointD(m.x, m.base, m.top) }, { d: pointD(m.x, m.base, m.base) }, 5.45 + 0.05 * k, 0.35, 'power2.in');
    } else {
      // The launch milestone wraps itself into the hero card.
      morph(sock, (p) => toPath(shapes.milestoneToCard(p)), 6.0, 1.0);
      A(sock, { stroke: C.milestone }, { stroke: C.wire }, 6.0, 1.0, 'power1.inOut');
    }
    const r = site.dotR;
    const diamond = $(`diamond-${k}`);
    // Longer trips get more time, so no milestone streaks across the scene.
    const trip = 0.95 + 0.2 * k;
    rectMove(diamond, { x: m.x - d / 2, y: m.base - d / 2, w: d, h: d, rx: 1.5 }, { x: dot[0] - r, y: dot[1] - r, w: 2 * r, h: 2 * r, rx: r }, 5.65 + 0.07 * k, trip, EASE.travel, 'power1.inOut');
    A(diamond, { transform: `rotate(45 ${m.x} ${m.base})` }, { transform: `rotate(0 ${dot[0]} ${dot[1]})` }, 5.65 + 0.07 * k, trip, EASE.travel);
    A(diamond, { fill: k === 0 ? C.gtc : C.white, stroke: C.gtc, 'stroke-width': hair }, { fill: C.dot, stroke: C.dot, 'stroke-width': 0 }, 5.9 + 0.07 * k, 0.5, 'power1.inOut');
  });

  org.ticks.forEach((t, k) => {
    const a = site.address[k];
    const tick = $(`tick-${k}`);
    A(tick, { x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2 }, { x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2 }, 6.05 + 0.02 * k, 0.6);
    A(tick, { stroke: C.tick, 'stroke-width': hair }, { stroke: C.address, 'stroke-width': site.addressWidth }, 6.2 + 0.02 * k, 0.45, 'power1.inOut');
  });

  idea.rays.forEach((_, i) => {
    const ray = $(`ray-${i}`);
    const b = site.borders[i];
    const g = guideEnds[i];
    const to = g.x1 < g.x2 ? b : { x1: b.x2, y1: b.y2, x2: b.x1, y2: b.y1 };
    A(ray, { ...g }, { ...to }, 5.75 + 0.05 * i, 0.7);
    A(ray, { stroke: C.lane }, { stroke: C.wire }, 5.75 + 0.05 * i, 0.7, 'power1.inOut');
    const lbl = org.lanes[i].label;
    const an = site.annotations[i];
    A($(`lane-label-${i}`), { x: lbl.x, y: lbl.y, 'font-size': lbl.size, fill: C.muted }, { x: an.x, y: an.y, 'font-size': an.size, fill: C.annotation }, 5.55 + 0.05 * i, 0.6);
    A($(`lane-label-clip-${i}`), { x: lbl.x - 4, y: lbl.y - lbl.size * 1.2, height: lbl.size * 1.6 }, { x: an.x - 4, y: an.y - an.size * 1.2, height: an.size * 1.6 }, 5.55 + 0.05 * i, 0.6);
  });

  const wire = (role: SiteRole): Attrs => {
    switch (role) {
      case 'cta': return { fill: C.sky, stroke: C.sky, 'stroke-width': 0 };
      case 'container':
      case 'field': return { fill: C.white, stroke: C.wire, 'stroke-width': 1.2 * s };
      default: return { fill: C.placeholder, stroke: C.placeholder, 'stroke-width': 0 };
    }
  };
  org.bars.forEach((b, i) => {
    const el = $(b.id);
    const k = i - lanesFirst[b.lane];
    const at = 5.8 + 0.1 * b.lane + 0.04 * k;
    rectMove(el, b.org, b.site, at, 0.95, EASE.travel, 'power1.inOut');
    A(el, { fill: b.doneAt !== null ? C.done : C.white, stroke: orgStroke(b), 'stroke-width': hair }, wire(b.role), at + 0.1, 0.55, 'power1.inOut');
  });

  morph(filament, (p) => toPath(shapes.criticalToChart(p)), 6.15, 0.9);
  A(filament, { 'stroke-width': 2 * s }, { 'stroke-width': 2.6 * s }, 6.15, 0.9);
  org.deps.forEach((dep, i) => {
    const el = $(`dep-${i}`);
    A(el, { d: dep.org, 'stroke-width': hair }, { d: dep.site, 'stroke-width': dep.siteWidth }, 6.2 + 0.06 * i, 0.7);
    A(el, { stroke: C.gtc, 'stroke-opacity': 0.55 }, { stroke: C.placeholder, 'stroke-opacity': 1 }, 6.3 + 0.06 * i, 0.5, 'power1.inOut');
  });

  A(seed, { cx: org.seedToday[0] }, { cx: site.logo.x }, 5.5, 1.35, EASE.travel);
  A(seed, { cy: org.seedToday[1] }, { cy: site.logo.y }, 5.5, 1.35, 'power1.inOut');
  A(seed, { r: 7 * s, 'stroke-width': 2.5 * s }, { r: site.logo.r, 'stroke-width': 0 }, 5.9, 0.6, 'power2.inOut');

  // ------------------------------------------------------------------ Materialisation (7.4 – 8.2 s)
  A($('page-reveal'), { height: 0 }, { height: site.frame.h + 90 * s }, 7.4, 0.55);
  A($('page-shadow'), { 'flood-opacity': 0 }, { 'flood-opacity': 0.1 }, 7.45, 0.6, 'power1.out');
  A(glass, { stroke: C.gtc, 'stroke-width': 1.6 * s }, { stroke: C.wire, 'stroke-width': 1.2 * s }, 7.45, 0.5, 'power1.inOut');
  A($('curtain'), { height: 0 }, { height: site.curtain.h }, 7.5, 0.45);
  // The card's white surface is revealed by the same front as the curtain, so it stays white.
  A($('card-reveal'), { height: 0 }, { height: site.curtain.h }, 7.5, 0.45);

  // Text wipes; the grey placeholders are consumed exactly at the wipe front.
  const wipe = (name: keyof Layout['site']['sectionClips'], at: number, dur = 0.5) => {
    const r = site.sectionClips[name];
    A($(`wipe-${name}`), { width: 0 }, { width: r.w }, at, dur, 'none');
    return (x0: number, x1: number) => [at + (dur * (x0 - r.x)) / r.w, (dur * (x1 - x0)) / r.w] as const;
  };
  const navFront = wipe('nav', 7.6);
  const heroFront = wipe('hero', 7.68);
  const cardFront = wipe('card', 7.78, 0.4);
  wipe('services', 7.84);
  wipe('form', 7.92);
  org.bars.forEach((b) => {
    const el = $(b.id);
    if (b.role === 'placeholder') {
      const [at, dur] = (b.lane === 0 ? navFront : heroFront)(b.site.x, b.site.x + b.site.w);
      A(el, { x: b.site.x, width: b.site.w }, { x: b.site.x + b.site.w, width: 0 }, at, dur, 'none');
    } else if (b.role === 'burger') {
      A(el, { fill: C.placeholder }, { fill: C.ink }, 7.6, 0.3, 'power1.inOut');
    } else if (b.role === 'field') {
      A(el, { fill: C.white }, { fill: C.field }, 7.9, 0.3, 'power1.inOut');
    } else if (b.role === 'button') {
      A(el, { fill: C.placeholder, stroke: C.placeholder }, { fill: C.gtc, stroke: C.gtc }, 7.9, 0.3, 'power1.inOut');
    }
  });
  org.deps.forEach((dep, i) => {
    const xs = dep.site.match(/-?\d+(\.\d+)?/g)!.map(Number);
    const [at, dur] = cardFront(xs[0], xs[6]);
    A($(`dep-${i}`), { 'stroke-dashoffset': 0 }, { 'stroke-dashoffset': -1 }, at, dur, 'none');
  });

  // ------------------------------------------------------------------ Final hold: the interface is live
  const arrow = $('cta-arrow');
  A(arrow, { transform: 'translate(0 0)' }, { transform: `translate(${5 * s} 0)` }, 8.35, 0.25, 'power2.out');
  A(arrow, { transform: `translate(${5 * s} 0)` }, { transform: 'translate(0 0)' }, 8.62, 0.3, 'power2.inOut');

  // ------------------------------------------------------------------ DOM chapter titles
  const titles = hooks.titles ?? [];
  const n = titles.length / 2;
  if (n === TITLE_SWAPS.length + 1) {
    gsap.set(titles, { yPercent: 110 });
    gsap.set([titles[0], titles[n]], { yPercent: 0 });
    const swap = (outIdx: number[], inIdx: number[], at: number) => {
      outIdx.forEach((i, k) => tl.fromTo(titles[i], { yPercent: 0 }, { yPercent: -110, duration: 0.4, ease: 'power3.in' }, at + k * 0.05));
      inIdx.forEach((i, k) => tl.fromTo(titles[i], { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: 'power3.out' }, at + 0.42 + k * 0.06));
    };
    TITLE_SWAPS.forEach((at, c) => swap([c, n + c], [c + 1, n + c + 1], at));
  }

  // Chapters 4–8 continue from the validated state reached at 9 s.
  buildChapters(tl, svg, L, X, { logo: hooks.logo ?? null });

  tl.set({}, {}, DURATION);
  return tl;
}

