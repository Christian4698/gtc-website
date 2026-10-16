// Chapters 4–8 of the master timeline (9 → 24 s): Digitalisation, Optimisation, Acquisition,
// Croissance, Impact. Every tween starts from the exact state the validated pilot reaches at
// 9 s (taken from layouts.ts and shapes.ts), so the first 9 seconds render unchanged.

import { inOut2, inOut3, lerp, makeWrap, resample, roundedRectHalves, stagedLerp, toPath, window01, type Pt, type Rect, type Seg } from './geometry';
import { shapesFor } from './shapes';
import { EASE, PILOT_END } from './motion';
import { N_GLASS, N_THREAD, type Layout } from '../story/layouts';
import type { ChaptersLayout } from '../story/chaptersLayout';
import { C } from '../story/palette';

type Attrs = Record<string, string | number>;
const ID = 'matrix(1 0 0 1 0 0)';
/** Visitor fates: 3 = converts; 0, 1, 2 = leaves the funnel at that level. */
const FATE = [3, 0, 3, 1, 3, 2, 0, 3, 2, 1, 2, 0];
const VALUE_FACTOR = 103; // illustrative: each visitor stands for ~103 visits

const sineIO = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const backOut = (t: number, s = 1.2) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
const fmt = (n: number) => (n >= 1000 ? `${Math.floor(n / 1000)} ${String(n % 1000).padStart(3, '0')}` : String(n));
function along(route: Pt[], u: number): Pt {
  const d = [0];
  for (let i = 1; i < route.length; i++) d.push(d[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]));
  const s = d[d.length - 1] * Math.max(0, Math.min(1, u));
  let j = 1;
  while (j < d.length - 1 && d[j] < s) j++;
  const t = (s - d[j - 1]) / (d[j] - d[j - 1] || 1);
  return [lerp(route[j - 1][0], route[j][0], t), lerp(route[j - 1][1], route[j][1], t)];
}

export function buildChapters(tl: gsap.core.Timeline, svg: SVGSVGElement, L: Layout, X: ChaptersLayout, dom: { logo: HTMLElement | null }) {
  const $ = (id: string) => {
    const el = svg.querySelector(`[data-obj="${id}"]`);
    if (!el) throw new Error(`Objet manquant dans la scène : ${id}`);
    return el as SVGElement;
  };
  const A = (el: Element | object, from: Attrs, to: Attrs, at: number, dur: number, ease: string = EASE.transform) => {
    tl.fromTo(el, { attr: from }, { attr: to, duration: dur, ease }, at);
  };
  const set = (el: Element, from: Attrs, to: Attrs, at: number) => A(el, from, to, at, 0.001, 'none');
  const R = (r: Rect) => ({ x: r.x, y: r.y, width: r.w, height: r.h, rx: r.rx });
  const rectMove = (el: Element, a: Rect, b: Rect, at: number, dur: number, ex: string = EASE.travel, ey = 'power1.inOut') => {
    A(el, { x: a.x, width: a.w }, { x: b.x, width: b.w }, at, dur, ex);
    A(el, { y: a.y, height: a.h, rx: a.rx }, { y: b.y, height: b.h, rx: b.rx }, at, dur, ey);
  };
  const morph = (el: Element, shape: (p: number) => string, at: number, dur: number) => {
    const proxy = { p: 0 };
    tl.fromTo(proxy, { p: 0 }, { p: 1, duration: dur, ease: 'none', onUpdate: () => el.setAttribute('d', shape(proxy.p)) }, at);
  };
  const fadeOut = (id: string, at: number, dur = 0.2) => A($(id), { opacity: 1 }, { opacity: 0 }, at, dur, 'power1.out');
  /** Labels arrive with a short rise once their object has stopped moving. */
  const arrive = (id: string, y: number, at: number) => A($(id), { opacity: 0, y: y + 8 * s }, { opacity: 1, y }, at, 0.45, 'power3.out');
  const lineMove = (el: Element, a: Seg, b: Seg, at: number, dur: number, ease: string = EASE.travel) => A(el, { ...a }, { ...b }, at, dur, ease);

  const { site, org, idea } = L;
  const s = L.kind === 'desktop' ? 1 : 1.25;
  const hair = 1.5 * s;
  const shapes = shapesFor(L);
  const siteM = `matrix(${X.site.s} 0 0 ${X.site.s} ${X.site.tx} ${X.site.ty})`;
  const [W, H] = L.vb;

  // ------------------------------------------------------------------ state reached at 9 s (validated pilot)
  const frame3 = shapes.axisToFrame(1);
  const card3 = shapes.milestoneToCard(1);
  const chart3 = shapes.criticalToChart(1);
  const barEnd = org.bars.map((b): Rect & { fill: string; stroke: string; sw: number } => {
    const r = b.site;
    switch (b.role) {
      case 'placeholder': return { x: r.x + r.w, y: r.y, w: 0, h: r.h, rx: r.rx, fill: C.placeholder, stroke: C.placeholder, sw: 0 };
      case 'burger': return { ...r, fill: C.ink, stroke: C.placeholder, sw: 0 };
      case 'cta': return { ...r, fill: C.sky, stroke: C.sky, sw: 0 };
      case 'container': return { ...r, fill: C.white, stroke: C.wire, sw: 1.2 * s };
      case 'field': return { ...r, fill: C.field, stroke: C.wire, sw: 1.2 * s };
      default: return { ...r, fill: C.gtc, stroke: C.gtc, sw: 0 };
    }
  });
  const rayEnd = idea.rays.map((r, i) => {
    const b = site.borders[i];
    return r.x1 < r.x2 ? b : { x1: b.x2, y1: b.y2, x2: b.x1, y2: b.y1 };
  });
  const orient = (from: Seg, to: Seg): Seg => ((from.x1 <= from.x2) === (to.x1 <= to.x2) ? to : { x1: to.x2, y1: to.y2, x2: to.x1, y2: to.y1 });
  const dotR = site.dotR;
  const dot3 = site.dots.map(([x, y]) => ({ x: x - dotR, y: y - dotR, w: 2 * dotR, h: 2 * dotR, rx: dotR, cx: x, cy: y }));

  const glass = $('glass'), page = $('page'), curtain = $('curtain'), card = $('socket-2'), filament = $('filament'), seed = $('seed');
  const bars = org.bars.map((b) => $(b.id));
  const diamonds = [0, 1, 2].map((k) => $(`diamond-${k}`));
  const ticks = org.ticks.map((_, k) => $(`tick-${k}`));
  const rays = [0, 1, 2, 3].map((i) => $(`ray-${i}`));
  const groups = ['text-nav', 'text-hero', 'text-card', 'text-form'].map($);
  const siteBars = [0, 1, 2, 3, 4, 5, 9, 10, 11];

  // ------------------------------------------------------------------ hand-over at 9.05 s (no visible change)
  const T0 = PILOT_END + 0.05;
  ['socket-0', 'socket-1', 'today'].forEach((id) => set($(id), { 'stroke-opacity': 1 }, { 'stroke-opacity': 0 }, T0));
  ['nav', 'hero', 'card', 'services', 'form'].forEach((n) => {
    const r = site.sectionClips[n as keyof typeof site.sectionClips];
    set($(`wipe-${n}`), { x: r.x, y: r.y, width: r.w, height: r.h }, { x: -W, y: -H, width: 3 * W, height: 3 * H }, T0);
  });
  set(card, { fill: 'none' }, { fill: C.white }, T0);
  set($('card-surface'), { opacity: 1 }, { opacity: 0 }, T0);
  set(glass, { 'vector-effect': 'none' }, { 'vector-effect': 'non-scaling-stroke' }, T0);

  // ================================================================== 4 · DIGITALISATION (9.0 – 11.2 s)
  // The whole site shrinks into the first station of a circuit.
  const shrink = [9.05, 1.2] as const;
  [glass, page, curtain, card, filament, seed, $('card-surface'), ...siteBars.map((i) => bars[i]), ...groups].forEach((el) => A(el, { transform: ID }, { transform: siteM }, shrink[0], shrink[1]));
  diamonds.forEach((el, k) => A(el, { transform: `${ID} rotate(0 ${dot3[k].cx} ${dot3[k].cy})` }, { transform: `${siteM} rotate(0 ${dot3[k].cx} ${dot3[k].cy})` }, shrink[0], shrink[1]));
  A(glass, { stroke: C.wire, 'stroke-width': 1.2 * s }, { stroke: C.gtc, 'stroke-width': 1.6 * s }, shrink[0], shrink[1], 'power1.inOut');
  org.lanes.forEach((_, i) => fadeOut(`lane-label-${i}`, 9.0, 0.35));
  fadeOut('url', 9.05, 0.25);

  // services leave the site and become the stations
  [0, 1, 2].forEach((k) => {
    const at = 9.55 + 0.12 * k;
    rectMove(bars[6 + k], barEnd[6 + k], X.stations[k], at, 1.0);
    rectMove($(`svc-icon-${k}`), site.services[k].icon, X.stIcon[k], at, 1.0);
    fadeOut(`svc-glyph-${k}`, 9.05, 0.25);
    fadeOut(`svc-title-${k}`, 9.05, 0.25);
    if (site.services[k].body) fadeOut(`svc-body-${k}`, 9.05, 0.25);
    A($(`st-glyph-${k}`), { opacity: 0 }, { opacity: 1 }, at + 1.0, 0.3, 'power1.out');
    arrive(`st-title-${k}`, X.stTitle[k].y, at + 1.0);
  });
  // address-bar segments become the records of the Données station
  ticks.forEach((el, k) => {
    const a = site.address[k];
    lineMove(el, a, X.dataRows[k], 9.75 + 0.02 * k, 0.85);
    A(el, { stroke: C.address, 'stroke-width': site.addressWidth }, { stroke: C.placeholder, 'stroke-width': 5 * s }, 9.75 + 0.02 * k, 0.85, 'power1.inOut');
  });
  // section borders become the pipes of the circuit
  rays.forEach((el, i) => {
    lineMove(el, rayEnd[i], orient(rayEnd[i], X.pipes[i]), 9.6 + 0.06 * i, 0.9);
    A(el, { stroke: C.wire, 'stroke-width': 1 * s }, { stroke: C.pipe, 'stroke-width': 2.4 * s }, 9.6 + 0.06 * i, 0.9, 'power1.inOut');
  });
  arrive('bus-note', X.busNote.y, 10.75);
  X.trBars.forEach((r, j) => A($(`tr-bar-${j}`), { width: 0 }, { width: r.w }, 10.7 + 0.08 * j, 0.5, 'power2.out'));
  X.suivi.forEach((row, j) => {
    A($(`suivi-box-${j}`), { opacity: 0 }, { opacity: 1 }, 10.75 + 0.08 * j, 0.3, 'power1.out');
    A($(`suivi-line-${j}`), { width: 0 }, { width: row.line.w }, 10.75 + 0.08 * j, 0.5, 'power2.out');
    A($(`suivi-status-${j}`), { opacity: 0 }, { opacity: 1 }, 10.85 + 0.08 * j, 0.3, 'power1.out');
  });
  // the signal: born at the button, carried by the shrinking site, then runs the circuit
  const btnRect = org.bars[11].site;
  const btn3: Pt = [btnRect.x + btnRect.w / 2, btnRect.y + btnRect.h / 2];
  const btn4 = X.site.map(btn3[0], btn3[1]);
  const signal = $('signal');
  const sig = { t: 0 };
  tl.fromTo(sig, { t: 9.05 }, {
    t: 12.9, duration: 3.85, ease: 'none', onUpdate: () => {
      const t = sig.t;
      let x: number, y: number, r: number;
      if (t < 10.45) {
        const e = inOut3(window01(t, shrink[0], shrink[0] + shrink[1]));
        x = lerp(btn3[0], btn4[0], e); y = lerp(btn3[1], btn4[1], e);
        r = 7 * s * inOut3(window01(t, 9.05, 9.35)) * lerp(1, 0.8, e);
      } else if (t < 11.8) {
        [x, y] = along(X.signalRoute, sineIO(window01(t, 10.45, 11.45)));
        r = 5.6 * s;
      } else {
        const end = X.chart[X.chart.length - 1], last = X.signalRoute[X.signalRoute.length - 1];
        const e = inOut3(window01(t, 11.9, 12.9));
        x = lerp(last[0], end[0], e); y = lerp(last[1], end[1], inOut2(e));
        r = 5.6 * s * (1 - window01(e, 0.7, 1));
      }
      signal.setAttribute('cx', x.toFixed(1)); signal.setAttribute('cy', y.toFixed(1)); signal.setAttribute('r', Math.max(0, r).toFixed(2));
    },
  }, 9.05);
  // the signal reaches the Suivi task: manual becomes automatic
  A($('suivi-box-2'), { fill: C.white, stroke: C.wire }, { fill: C.sky, stroke: C.sky }, 11.45, 0.2, 'power1.out');
  A($('suivi-check'), { opacity: 0 }, { opacity: 1 }, 11.5, 0.2, 'power1.out');
  fadeOut('suivi-status-2', 11.45, 0.15);
  A($('suivi-auto'), { opacity: 0 }, { opacity: 1 }, 11.55, 0.25, 'power1.out');

  // ================================================================== 5 · OPTIMISATION (11.8 – 14.0 s)
  // The site opens into the application window; stations become indicators.
  const open = [11.85, 1.0] as const;
  const F5poly = makeWrap({ from: org.axis.from, to: org.axis.to, neg: roundedRectHalves(X.F5, 'bottom').neg, pos: roundedRectHalves(X.F5, 'bottom').pos, n: N_GLASS })(1, 0);
  // the page surface stretches exactly onto the application window
  const F3 = site.frame, psx = X.F5.w / F3.w, psy = X.F5.h / F3.h, ptx = X.F5.x - F3.x * psx, pty = X.F5.y - F3.y * psy;
  const pageM = `matrix(${psx} 0 0 ${psy} ${ptx} ${pty})`;
  A(glass, { transform: siteM }, { transform: ID }, open[0], open[1]);
  A(page, { transform: siteM }, { transform: pageM }, open[0], open[1]);
  morph(glass, (p) => { const e = inOut2(p); return toPath(frame3.map((q, i) => [lerp(q[0], F5poly[i][0], e), lerp(q[1], F5poly[i][1], e)] as Pt), true); }, open[0], open[1]);
  A(glass, { stroke: C.gtc, 'stroke-width': 1.6 * s }, { stroke: C.wire, 'stroke-width': 1.2 * s }, open[0], open[1], 'power1.inOut');
  A(curtain, { transform: siteM }, { transform: ID }, open[0], open[1]);
  A(curtain, { ...R({ ...site.curtain, h: site.curtain.h, rx: 0 }) }, { ...R(X.header) }, open[0], open[1]);
  // stations → indicators (move in the same direction as the opening window)
  [0, 1, 2].forEach((k) => {
    const at = 12.0 + 0.08 * k;
    // shrink first, then travel: the stations never sweep across the opening window
    const st = X.stations[k], ti = X.tiles[k];
    A(bars[6 + k], { width: st.w, height: st.h, rx: st.rx }, { width: ti.w, height: ti.h, rx: ti.rx }, at, 0.55, 'power3.out');
    A(bars[6 + k], { x: st.x, y: st.y }, { x: ti.x, y: ti.y }, at, 0.85, EASE.travel);
    const tl0 = X.tiles[k];
    rectMove($(`svc-icon-${k}`), X.stIcon[k], { x: tl0.x + 18 * s, y: tl0.y + 18 * s, w: 0, h: 0, rx: 0 }, at, 0.5);
    fadeOut(`st-glyph-${k}`, 11.8, 0.2);
    fadeOut(`st-title-${k}`, 11.8, 0.2);
    arrive(`tile-label-${k}`, X.tileLabels[k].y, 12.95 + 0.06 * k);
    arrive(`tile-value-${k}`, X.tileValues[k].y, 13.0 + 0.06 * k);
  });
  X.trBars.forEach((r, j) => A($(`tr-bar-${j}`), { width: r.w }, { width: 0 }, 11.8, 0.3, 'power2.in'));
  X.suivi.forEach((_, j) => {
    fadeOut(`suivi-box-${j}`, 11.8);
    A($(`suivi-line-${j}`), { width: X.suivi[j].line.w }, { width: 0 }, 11.8, 0.3, 'power2.in');
    if (j < 2) fadeOut(`suivi-status-${j}`, 11.8);
  });
  fadeOut('suivi-auto', 11.8); fadeOut('suivi-check', 11.8); fadeOut('bus-note', 11.8);
  // count-up of the illustrative indicator values
  const count = { p: 0 };
  const values = [0, 1, 2].map((k) => $(`tile-value-${k}`));
  tl.fromTo(count, { p: 0 }, {
    p: 1, duration: 0.8, ease: 'power2.out', onUpdate: () => {
      values[0].textContent = String(Math.round(128 * count.p));
      values[1].textContent = `${(2.4 * count.p).toFixed(1).replace('.', ',')} j`;
      values[2].textContent = `${Math.round(72 * count.p)} %`;
    },
  }, 13.0);
  // the hero card opens into the main panel, the chart grows richer
  A(card, { transform: siteM }, { transform: ID }, 12.0, 0.9);
  const panelPoly = makeWrap({ from: [org.milestones[2].x, org.milestones[2].top], to: [org.milestones[2].x, org.milestones[2].base], ...roundedRectHalves(X.panel, 'right'), n: 96 })(1, 0);
  morph(card, (p) => { const e = inOut2(p); return toPath(card3.map((q, i) => [lerp(q[0], panelPoly[i][0], e), lerp(q[1], panelPoly[i][1], e)] as Pt), true); }, 12.0, 0.9);
  A(filament, { transform: siteM }, { transform: ID }, 12.3, 0.9);
  morph(filament, (p) => toPath(stagedLerp(chart3, X.chart, p, (u) => u * 0.25, 0.75)), 12.3, 0.9);
  arrive('panel-title', X.panelTitle.y, 13.1);
  arrive('panel-note', X.panelNote.y, 13.15);
  // the brand becomes the application logo
  A(seed, { transform: siteM }, { transform: ID }, 11.9, 0.9);
  A(seed, { cx: site.logo.x, cy: site.logo.y, r: site.logo.r, fill: C.gtc }, { cx: X.seed5.x, cy: X.seed5.y, r: X.seed5.r, fill: C.sky }, 11.9, 0.9);
  groups.forEach((g) => A(g, { transform: siteM }, { transform: ID }, open[0], open[1]));
  if (X.brand5) A($('brand'), { x: site.brand.x, y: site.brand.y, 'font-size': site.brand.size, fill: C.ink }, { x: X.brand5.x, y: X.brand5.y, 'font-size': X.brand5.size, fill: C.white }, open[0], open[1]);
  else fadeOut('brand', 11.8);
  site.navTexts.forEach((_, i) => fadeOut(`nav-text-${i}`, 11.8));
  ['headline', 'sub', 'cta-label', 'cta-arrow', 'card-text-0', 'card-text-1', 'field-text-0', 'field-text-1', 'field-text-2'].forEach((id) => fadeOut(id, 11.8));
  if (site.formTitle) fadeOut('form-title', 11.8);
  arrive('title5', X.title5.y, 12.75);
  // navigation and form fields become the sidebar (tab bar on mobile); the CTA becomes "Exporter"
  [0, 1, 2, 9, 10, 11].forEach((bi, k) => {
    const at = 12.35 + 0.06 * k;
    const b = barEnd[bi];
    A(bars[bi], { transform: siteM }, { transform: ID }, at, 0.8);
    rectMove(bars[bi], b, X.side[k], at, 0.8);
    A(bars[bi], { fill: b.fill, stroke: b.stroke, 'stroke-width': b.sw }, { fill: k === 0 ? C.skyTint : C.white, stroke: C.white, 'stroke-width': 0 }, at, 0.8, 'power1.inOut');
    arrive(`side-label-${k}`, X.sideLabels[k].y, at + 0.6);
  });
  [3, 4].forEach((bi) => A(bars[bi], { transform: siteM }, { transform: ID }, open[0], 0.01));
  A(bars[5], { transform: siteM }, { transform: ID }, 12.0, 1.15, EASE.travel);
  rectMove(bars[5], barEnd[5], X.cta5, 12.0, 1.15, EASE.travel, EASE.travel);
  arrive('cta5-label', X.ctaLabel5.y, 12.95);
  // window dots become the indicator lights
  diamonds.forEach((el, k) => {
    const [lx, ly] = X.tileLights[k], r = 5 * s;
    A(el, { transform: `${siteM} rotate(0 ${dot3[k].cx} ${dot3[k].cy})` }, { transform: `${ID} rotate(0 ${lx} ${ly})` }, 12.0 + 0.05 * k, 1.15, EASE.travel);
    rectMove(el, dot3[k], { x: lx - r, y: ly - r, w: 2 * r, h: 2 * r, rx: r }, 12.0 + 0.05 * k, 1.15, EASE.travel, EASE.travel);
    A(el, { fill: C.dot, stroke: C.dot }, { fill: C.sky, stroke: C.sky }, 12.0 + 0.05 * k, 1.15, 'power1.inOut');
  });
  // records become the table, pipes become the chart grid
  ticks.forEach((el, k) => lineMove(el, X.dataRows[k], X.table[k], 12.6 + 0.02 * k, 0.7));
  rays.forEach((el, i) => {
    const from = orient(rayEnd[i], X.pipes[i]);
    lineMove(el, from, orient(from, X.grid5[i]), 12.5 + 0.05 * i, 0.7);
    A(el, { stroke: C.pipe, 'stroke-width': 2.4 * s }, { stroke: C.gridLine, 'stroke-width': 1 * s }, 12.5 + 0.05 * i, 0.7, 'power1.inOut');
  });

  // ================================================================== 6 · ACQUISITION (14.6 – 16.8 s)
  // The grid forms a funnel first; visitors only leave the chart once it exists.
  fadeOut('title5', 14.6); arrive('title6', X.title6.y, 15.0);
  rays.forEach((el, i) => {
    const from = orient(orient(rayEnd[i], X.pipes[i]), X.grid5[i]);
    lineMove(el, from, orient(from, X.levels[i]), 14.65 + 0.05 * i, 0.7);
    A(el, { stroke: C.gridLine, 'stroke-width': 1 * s }, { stroke: C.gtc, 'stroke-width': 2.4 * s }, 14.65 + 0.05 * i, 0.7, 'power1.inOut');
  });
  [0, 1, 2].forEach((k) => {
    rectMove(bars[6 + k], X.tiles[k], X.counters[k], 14.75 + 0.06 * k, 0.7);
    fadeOut(`tile-label-${k}`, 14.6, 0.15); fadeOut(`tile-value-${k}`, 14.6, 0.15);
    arrive(`counter-text-${k}`, X.counterTexts[k].y, 15.35 + 0.05 * k);
    const [ax, ay] = X.tileLights[k], [bx, by] = X.counterLights[k], r = 5 * s;
    A(diamonds[k], { transform: `${ID} rotate(0 ${ax} ${ay})` }, { transform: `${ID} rotate(0 ${bx} ${by})` }, 14.8 + 0.05 * k, 0.7);
    rectMove(diamonds[k], { x: ax - r, y: ay - r, w: 2 * r, h: 2 * r, rx: r }, { x: bx - r, y: by - r, w: 2 * r, h: 2 * r, rx: r }, 14.8 + 0.05 * k, 0.7);
  });
  fadeOut('panel-title', 14.6, 0.15); fadeOut('panel-note', 14.6, 0.15);
  const crmPoly = makeWrap({ from: [org.milestones[2].x, org.milestones[2].top], to: [org.milestones[2].x, org.milestones[2].base], ...roundedRectHalves(X.crm, 'right'), n: 96 })(1, 0);
  morph(card, (p) => { const e = inOut2(p); return toPath(panelPoly.map((q, i) => [lerp(q[0], crmPoly[i][0], e), lerp(q[1], crmPoly[i][1], e)] as Pt), true); }, 14.85, 0.7);
  arrive('crm-title', X.crmTitle.y, 15.5);
  [9, 10, 11].forEach((bi, k) => {
    const at = 14.95 + 0.06 * k, btnK = k === 2;
    rectMove(bars[bi], X.side[3 + k], X.crmFields[k], at, 0.7);
    A(bars[bi], { fill: C.white, stroke: C.white, 'stroke-width': 0 }, { fill: btnK ? C.gtc : C.field, stroke: btnK ? C.gtc : C.wire, 'stroke-width': btnK ? 0 : 1.2 * s }, at, 0.7, 'power1.inOut');
    fadeOut(`side-label-${3 + k}`, 14.6, 0.15);
    arrive(`crm-label-${k}`, X.crmLabels[k].y, 15.6 + 0.05 * k);
  });
  rectMove(bars[5], X.cta5, X.cta6, 14.8, 0.7);
  fadeOut('cta5-label', 14.6, 0.15); arrive('cta6-label', X.ctaLabel6.y, 15.4);
  ticks.forEach((el, k) => {
    lineMove(el, X.table[k], X.hist[k], 14.8 + 0.02 * k, 0.6);
    A(el, { stroke: C.placeholder, 'stroke-width': 5 * s }, { stroke: C.skyMid, 'stroke-width': 6 * s }, 14.8 + 0.02 * k, 0.6, 'power1.inOut');
  });
  morph(filament, (p) => toPath(stagedLerp(X.chart, X.conv, p, (u) => u * 0.4, 0.6)), 15.3, 0.9);
  A(filament, { stroke: C.gtc, 'stroke-width': 2.6 * s }, { stroke: C.pipe, 'stroke-width': 2 * s }, 15.3, 0.9, 'power1.inOut');
  arrive('note6', X.note6.y, 15.5);

  // ================================================================== 7 · CROISSANCE (17.4 – 19.6 s)
  // The window unrolls into the time axis again; visitors fall into their month and grow.
  fadeOut('title6', 17.4);
  if (X.brand5) fadeOut('brand', 17.4);
  const unwrapF5 = makeWrap({ from: X.axis.from, to: X.axis.to, ...roundedRectHalves(X.F5, 'bottom'), n: N_GLASS });
  morph(glass, (p) => { const e = inOut3(p); return toPath(unwrapF5(1 - e, sineIO(e))); }, 17.5, 1.2);
  A(glass, { stroke: C.wire, 'stroke-width': 1.2 * s }, { stroke: C.gtc, 'stroke-width': 2.2 * s }, 17.5, 1.2, 'power1.inOut');
  const pr = site.frame;
  A($('page-reveal'), { y: pr.y - 4, height: pr.h + 90 * s }, { y: (X.base - pty) / psy, height: 0 }, 17.5, 1.1, 'power2.in');
  A($('page-shadow'), { 'flood-opacity': 0.1 }, { 'flood-opacity': 0 }, 17.5, 0.8, 'power1.out');
  rectMove(curtain, X.header, X.pill, 17.6, 0.8);
  arrive('pill-text', X.pillText.y, 19.0);
  const lineWrap = (target: { neg: Pt[]; pos: Pt[] }) => makeWrap({ from: [X.launch.x, X.launch.top], to: [X.launch.x, X.launch.base], ...target, n: 96 });
  // the lead card narrows into the vertical launch line (each point keeps its height order)
  const squeeze = (poly: Pt[], box: Rect): Pt[] => poly.map(([, y]) => [X.launch.x, X.launch.top + ((y - box.y) / box.h) * (X.launch.base - X.launch.top)]);
  const crmLine = squeeze(crmPoly, X.crm);
  morph(card, (p) => toPath(crmPoly.map((q, i) => { const ex = inOut3(window01(p, 0, 0.6)), ey = inOut2(window01(p, 0.2, 1)); return [lerp(q[0], crmLine[i][0], ex), lerp(q[1], crmLine[i][1], ey)] as Pt; }), true), 17.6, 1.0);
  A(card, { 'fill-opacity': 1, stroke: C.wire, 'stroke-width': 1.5 * s }, { 'fill-opacity': 0, stroke: C.milestone, 'stroke-width': 1.5 * s }, 17.6, 0.35, 'power1.out');
  fadeOut('crm-title', 17.4);
  [0, 1, 2].forEach((k) => {
    fadeOut(`crm-label-${k}`, 17.4); fadeOut(`counter-text-${k}`, 17.4); fadeOut(`side-label-${k}`, 17.4);
    // the summaries carry a small gauge: its track was a sidebar item, its fill a form field
    rectMove(bars[6 + k], X.counters[k], X.chips[k], 17.65 + 0.06 * k, 0.8);
    rectMove(bars[k], X.side[k], X.gaugeTrack[k], 17.75 + 0.06 * k, 0.8);
    A(bars[k], { fill: k === 0 ? C.skyTint : C.white }, { fill: C.placeholder }, 17.75 + 0.06 * k, 0.8, 'power1.inOut');
    rectMove(bars[9 + k], X.crmFields[k], X.gaugeFill[k], 17.8 + 0.06 * k, 0.8);
    A(bars[9 + k], { fill: k === 2 ? C.gtc : C.field, stroke: k === 2 ? C.gtc : C.wire, 'stroke-width': k === 2 ? 0 : 1.2 * s }, { fill: C.sky, stroke: C.sky, 'stroke-width': 0 }, 17.8 + 0.06 * k, 0.8, 'power1.inOut');
    arrive(`chip-label-${k}`, X.chipLabels[k].y, 18.7 + 0.05 * k);
    arrive(`chip-value-${k}`, X.chipValues[k].y, 18.75 + 0.05 * k);
    // indicator lights stand up as the milestones of the axis
    const [bx, by] = X.counterLights[k], r = 5 * s, d = (L.kind === 'desktop' ? 14 : 20);
    const mx = X.ms[k];
    A(diamonds[k], { transform: `${ID} rotate(0 ${bx} ${by})` }, { transform: `${ID} rotate(45 ${mx} ${X.base})` }, 18.25 + 0.06 * k, 1.15, EASE.travel);
    rectMove(diamonds[k], { x: bx - r, y: by - r, w: 2 * r, h: 2 * r, rx: r }, { x: mx - d / 2, y: X.base - d / 2, w: d, h: d, rx: 1.5 }, 18.25 + 0.06 * k, 1.15, EASE.travel, EASE.travel);
    A(diamonds[k], { fill: C.sky, stroke: C.sky, 'stroke-width': 0 }, { fill: k === 2 ? C.gtc : C.white, stroke: C.gtc, 'stroke-width': hair }, 18.25 + 0.06 * k, 1.15, 'power1.inOut');
  });
  X.msLabels.forEach((t, k) => arrive(`ms7-label-${k}`, t.y, 19.1 + 0.05 * k));
  ticks.forEach((el, k) => {
    lineMove(el, X.hist[k], X.months[k], 18.1 + 0.02 * k, 0.6);
    A(el, { stroke: C.skyMid, 'stroke-width': 6 * s }, { stroke: C.tick, 'stroke-width': hair }, 18.1 + 0.02 * k, 0.6, 'power1.inOut');
  });
  rays.forEach((el, i) => {
    const from = orient(orient(orient(rayEnd[i], X.pipes[i]), X.grid5[i]), X.levels[i]);
    lineMove(el, from, orient(from, X.grid7[i]), 17.6 + 0.04 * i, 0.7);
    A(el, { stroke: C.gtc, 'stroke-width': 2.4 * s }, { stroke: C.gridLine, 'stroke-width': 1 * s }, 17.6 + 0.04 * i, 0.7, 'power1.inOut');
  });
  rectMove(bars[5], X.cta6, X.legend, 17.7, 0.7);
  fadeOut('cta6-label', 17.4); arrive('legend-text', X.legendText.y, 18.9);
  fadeOut('note6', 17.4); arrive('note7', X.note7.y, 19.2);
  A(seed, { r: X.seed5.r, fill: C.sky, 'stroke-width': 0 }, { r: 7 * s, fill: C.gtc, 'stroke-width': 2.5 * s }, 18.2, 0.6, 'power1.inOut');

  // ---- visitors, growth bars, growth curve and the "today" marker: one procedural layer
  const fn = X.funnel;
  const starts = resample(X.chart, 12);
  const dropped = [0, 0, 0];
  let converted = 0;
  const plans = FATE.map((fate, k) => {
    const route: Pt[] = [starts[k], [fn.cx + (k - 5.5) * 36 * s, fn.ys[0] - 46 * s]];
    for (let lv = 0; lv <= Math.min(fate, 3); lv++) route.push([fn.cx + (k - 5.5) * (fn.hws[lv] / 6.6), fn.ys[lv] - 12 * s]);
    let end: Pt;
    if (fate === 3) { route.push(...X.conv.filter((_, i) => i % 12 === 0)); end = X.slots[converted++]; } else end = X.park(fate, dropped[fate]++);
    route.push(end);
    return { route: resample(route, 60), end, fate, t0: 15.2 + 0.09 * k, dur: 1.2 + (fate === 3 ? 0.3 : 0) };
  });
  const foot = (k: number): Pt => [X.barX[k], X.base];
  // fall into the month (sine, so long trips never streak), then rise once landed
  const FALL0 = 17.45, FALL = 1.1;
  const riseAt = (k: number) => FALL0 + 0.04 * k + FALL + 0.05;
  const headY = (k: number, t: number) => {
    const rise = window01(t, riseAt(k), riseAt(k) + 0.75);
    return X.base - X.barH[k] * backOut(rise, 1.15) * (rise > 0 ? 1 : 0);
  };
  const liveCurve = (t: number) => resample(X.barX.map((x, k) => [x, Math.min(X.base, headY(k, t)) - X.curveLift * s] as Pt), N_THREAD);
  const finalCurve = liveCurve(20.2);
  const curveEnd = finalCurve[finalCurve.length - 1];
  const vis = plans.map((_, k) => ({ g: $(`visitor-${k}`), head: $(`vhead-${k}`), sh: $(`vshoulder-${k}`), body: $(`vbody-${k}`) }));
  const counterEls = [0, 1, 2].map((k) => $(`counter-text-${k}`));
  const counterNames = X.counterTexts.map((t) => t.text);
  const vr = X.visitorR;
  const paint = (k: number, x: number, y: number, r: number, sh: number, col: string, op: number, body: { y: number; h: number } | null) => {
    const v = vis[k];
    v.g.setAttribute('opacity', op.toFixed(3));
    v.head.setAttribute('cx', x.toFixed(1)); v.head.setAttribute('cy', y.toFixed(1)); v.head.setAttribute('r', r.toFixed(2)); v.head.setAttribute('fill', col);
    const w = 1.9 * r * sh;
    v.sh.setAttribute('d', sh > 0.02 ? `M${(x - w).toFixed(1)} ${(y + 2.7 * r).toFixed(1)}Q${x.toFixed(1)} ${(y + 0.9 * r).toFixed(1)} ${(x + w).toFixed(1)} ${(y + 2.7 * r).toFixed(1)}` : 'M0 0');
    v.sh.setAttribute('stroke', col);
    v.sh.setAttribute('stroke-width', (0.75 * r).toFixed(2));
    v.body.setAttribute('y', (body ? body.y : X.base).toFixed(1));
    v.body.setAttribute('height', (body ? Math.max(0, body.h) : 0).toFixed(1));
  };
  // Three windows, each starting at its chapter, so that renders stay ordered when seeking:
  // a window always draws after the tweens that ended before it began.
  const visitorsAt = (t: number) => {
    const counts = [0, 0, 0];
    plans.forEach((pl, k) => {
      if (t < 17.4) {
        // Acquisition: down the funnel
        const u = sineIO(window01(t, pl.t0, pl.t0 + pl.dur));
        const [x, y] = along(pl.route, u);
        for (let lv = 0; lv < 3; lv++) if (pl.fate >= lv && u > 0.18 + 0.12 * lv) counts[lv]++;
        const done = u >= 1;
        paint(k, x, y, vr * s, window01(u, 0, 0.12), done ? (pl.fate === 3 ? C.gtc : C.milestone) : C.sky, t >= pl.t0 ? 1 : 0, null);
      } else if (t < 20.2) {
        // Croissance: fall into the month, then grow into its bar
        const a = window01(t, FALL0 + 0.04 * k, FALL0 + 0.04 * k + FALL);
        const [fx, fy] = foot(k);
        let x = lerp(pl.end[0], fx, sineIO(a)), y = lerp(pl.end[1], fy, a * a);
        const hy = headY(k, t);
        let body: { y: number; h: number } | null = null;
        if (t >= riseAt(k)) { x = fx; y = hy; body = { y: hy, h: X.base - hy }; }
        paint(k, x, y, vr * s, 1 - window01(a, 0, 0.4), C.sky, 1, body);
      } else {
        // Impact: each bar folds back and its visitor joins the Utilisateurs module
        const a = window01(t, 20.3 + 0.03 * k, 21.7 + 0.03 * k);
        const top = X.base - X.barH[k];
        const curY = lerp(top, X.base, inOut3(window01(a, 0, 0.35)));
        const [ax, ay] = X.avatars[k];
        const f = sineIO(window01(a, 0.25, 1));
        const x = lerp(X.barX[k], ax, f), y = lerp(curY, ay, f);
        paint(k, x, y, lerp(vr, vr * 0.5, f) * s, window01(a, 0.75, 1) * 0.7, C.sky, 1, a < 0.35 ? { y: curY, h: X.base - curY } : null);
      }
    });
    return counts;
  };
  const windowProxy = (t0: number, t1: number, draw: (t: number) => void) => {
    const w = { t: t0 };
    tl.fromTo(w, { t: t0 }, { t: t1, duration: t1 - t0, ease: 'none', onUpdate: () => draw(w.t) }, t0);
  };
  windowProxy(14.6, 17.4, (t) => {
    const counts = visitorsAt(t);
    counterEls.forEach((el, k) => (el.textContent = `${counterNames[k]} · ${fmt(counts[k] * VALUE_FACTOR)}`));
    seed.setAttribute('cx', String(X.seed5.x)); seed.setAttribute('cy', String(X.seed5.y));
  });
  windowProxy(17.4, 20.2, (t) => {
    visitorsAt(t);
    // the growth curve is drawn through the heads of the growing bars; the marker rides its end
    const b = inOut3(window01(t, 17.6, 18.6));
    const live = liveCurve(t);
    filament.setAttribute('d', toPath(X.conv.map((q, i) => [lerp(q[0], live[i][0], b), lerp(q[1], live[i][1], b)] as Pt)));
    const e = sineIO(window01(t, 17.6, 18.9)), end = live[live.length - 1];
    seed.setAttribute('cx', lerp(X.seed5.x, end[0], e).toFixed(1));
    seed.setAttribute('cy', lerp(X.seed5.y, end[1], e).toFixed(1));
  });
  windowProxy(20.2, 22.6, (t) => visitorsAt(t));
  A(filament, { stroke: C.pipe, 'stroke-width': 2 * s }, { stroke: C.gtc, 'stroke-width': 2.6 * s }, 17.8, 0.6, 'power1.inOut');

  // ================================================================== 8 · IMPACT (20.2 – 24 s)
  ['pill-text', 'legend-text', 'note7', 'ms7-label-0', 'ms7-label-1', 'chip-label-0', 'chip-label-1', 'chip-label-2', 'chip-value-0', 'chip-value-1', 'chip-value-2'].forEach((id) => fadeOut(id, 20.2));
  const axisPts = unwrapF5(0, 1);
  morph(glass, (p) => toPath(stagedLerp(axisPts, X.arc8, p, (u) => Math.abs(u - 0.5) * 0.3, 0.7)), 20.35, 1.15);
  A(glass, { stroke: C.gtc, 'stroke-width': 2.2 * s }, { stroke: C.pipe, 'stroke-width': 1.6 * s }, 20.35, 1.15, 'power1.inOut');
  // modules: Projet (the launch pill), Site web (the CTA), Automatisation / Utilisateurs / Tableau de bord (the summaries)
  const modCard = (el: Element, from: Rect, fromFill: string, fromStroke: string, fromSw: number, k: number, at: number) => {
    rectMove(el, from, X.mods[k], at, 0.9);
    A(el, { fill: fromFill, stroke: fromStroke, 'stroke-width': fromSw }, { fill: C.white, stroke: C.wire, 'stroke-width': 1.2 * s }, at, 0.9, 'power1.inOut');
  };
  modCard(curtain, X.pill, C.navy, C.navy, 0, 0, 20.4);
  modCard(bars[5], X.legend, C.sky, C.sky, 0, 1, 20.45);
  [2, 4, 3].forEach((mk, k) => modCard(bars[6 + k], X.chips[k], C.white, C.wire, 1.2 * s, mk, 20.5 + 0.06 * k));
  [0, 1, 2].forEach((k) => {
    rectMove(bars[k], X.gaugeTrack[k], X.modGaugeTrack[k], 20.6 + 0.06 * k, 0.8);
    rectMove(bars[9 + k], X.gaugeFill[k], X.modGaugeFill[k], 20.65 + 0.06 * k, 0.8);
    const [px, py] = X.projDots[k], pd = 9 * s, mx = X.ms[k], d = (L.kind === 'desktop' ? 14 : 20);
    A(diamonds[k], { transform: `${ID} rotate(45 ${mx} ${X.base})` }, { transform: `${ID} rotate(45 ${px} ${py})` }, 20.55 + 0.05 * k, 0.8);
    rectMove(diamonds[k], { x: mx - d / 2, y: X.base - d / 2, w: d, h: d, rx: 1.5 }, { x: px - pd / 2, y: py - pd / 2, w: pd, h: pd, rx: 1.5 }, 20.55 + 0.05 * k, 0.8);
  });
  // after the launch comes growth: the launch line opens into the Croissance module, which then
  // receives the months and the curve (drawn above it)
  const modPoly = lineWrap(X.modHalvesGrowth)(1, 0);
  const modLine = squeeze(modPoly, X.mods[5]);
  morph(card, (p) => toPath(modLine.map((q, i) => { const ey = inOut2(window01(p, 0, 0.7)), ex = inOut3(window01(p, 0.25, 1)); return [lerp(q[0], modPoly[i][0], ex), lerp(q[1], modPoly[i][1], ey)] as Pt; }), true), 20.5, 1.1);
  A(card, { 'fill-opacity': 0, stroke: C.milestone, 'stroke-width': 1.5 * s }, { 'fill-opacity': 1, stroke: C.wire, 'stroke-width': 1.2 * s }, 20.5, 1.1, 'power1.inOut');
  // months and the growth curve shrink into the Croissance module
  ticks.forEach((el, k) => {
    lineMove(el, X.months[k], X.miniBars[k], 20.6 + 0.02 * k, 0.7);
    A(el, { stroke: C.tick, 'stroke-width': hair }, { stroke: C.skyMid, 'stroke-width': 3 * s }, 20.6 + 0.02 * k, 0.7, 'power1.inOut');
  });
  morph(filament, (p) => toPath(stagedLerp(finalCurve, X.miniCurve, p, (u) => u * 0.3, 0.7)), 20.6, 1.0);
  A(filament, { 'stroke-width': 2.6 * s }, { 'stroke-width': 1.6 * s }, 20.6, 1.0);
  // grid lines become the four links from the GTC point, like the bulb's four rays
  rays.forEach((el, i) => {
    const from = orient(orient(orient(orient(rayEnd[i], X.pipes[i]), X.grid5[i]), X.levels[i]), X.grid7[i]);
    const sp = X.spokes[i];
    const to = from.x1 <= from.x2 === sp.x1 <= sp.x2 ? sp : { x1: sp.x2, y1: sp.y2, x2: sp.x1, y2: sp.y1 };
    lineMove(el, from, to, 20.8 + 0.05 * i, 0.75);
    A(el, { stroke: C.gridLine, 'stroke-width': 1 * s }, { stroke: C.pipe, 'stroke-width': 2 * s }, 20.8 + 0.05 * i, 0.75, 'power1.inOut');
  });
  // the "today" marker becomes the GTC point; the loop closes with the halo of the very first idea
  A(seed, { cx: curveEnd[0], cy: curveEnd[1], r: 7 * s, fill: C.gtc, 'stroke-width': 2.5 * s }, { cx: X.G[0], cy: X.G[1], r: 12 * s, fill: C.sky, 'stroke-width': 3 * s }, 21.2, 0.8);
  const halo = $('halo');
  set(halo, { cx: idea.seed.x, cy: idea.seed.y, r: idea.seed.r * 7, opacity: 0 }, { cx: X.G[0], cy: X.G[1], r: 12 * s, opacity: 0.55 }, 21.98);
  A(halo, { r: 12 * s, opacity: 0.55 }, { r: 84 * s, opacity: 0 }, 22.0, 1.2, 'power2.out');
  X.mods.forEach((_, k) => {
    A($(`mod-icon-${k}`), { opacity: 0 }, { opacity: 1 }, 21.55 + 0.07 * k, 0.4, 'power1.out');
    arrive(`mod-label-${k}`, X.modLabels[k].y, 21.6 + 0.07 * k);
  });
  arrive('tagline', X.tagline.y, 22.2);
  if (dom.logo) tl.fromTo(dom.logo, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 21.95);
}
