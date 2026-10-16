// Pure geometry helpers. Every function here is deterministic and free of DOM access,
// so the shapes used by the timeline can be unit-tested and reproduced frame by frame.

export type Pt = readonly [number, number];
export type Rect = { x: number; y: number; w: number; h: number; rx: number };
export type Seg = { x1: number; y1: number; x2: number; y2: number };

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const window01 = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/** Cubic in-out, the default "both ends soft" transformation curve. */
export const inOut3 = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const inOut2 = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 24): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    out.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]);
  }
  return out;
}

/** Chain of cubic segments starting at `start`; each segment is [c1, c2, end]. */
export function cubicChain(start: Pt, segs: ReadonlyArray<readonly [Pt, Pt, Pt]>, n = 32): Pt[] {
  const out: Pt[] = [start];
  let from = start;
  for (const [c1, c2, end] of segs) {
    out.push(...cubic(from, c1, c2, end, n).slice(1));
    from = end;
  }
  return out;
}

export function arc(cx: number, cy: number, r: number, a0: number, a1: number, n = 10): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

export function cumulative(poly: ReadonlyArray<Pt>): number[] {
  const d = [0];
  for (let i = 1; i < poly.length; i++) d.push(d[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  return d;
}

export const lengthOf = (poly: ReadonlyArray<Pt>) => cumulative(poly)[poly.length - 1];

/** Point and unit tangent at arc length `s` along a polyline (clamped to its ends). */
export function sampleAt(poly: ReadonlyArray<Pt>, cum: number[], s: number): { p: Pt; t: Pt } {
  const total = cum[cum.length - 1];
  const target = Math.max(0, Math.min(total, s));
  let j = 1;
  while (j < cum.length - 1 && cum[j] < target) j++;
  const a = poly[j - 1], b = poly[j];
  const segLen = cum[j] - cum[j - 1] || 1;
  const u = (target - cum[j - 1]) / segLen;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return { p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], t: [dx / len, dy / len] };
}

/** Evenly spaced resampling to `n` points, so two shapes can be paired point by point. */
export function resample(poly: ReadonlyArray<Pt>, n: number): Pt[] {
  const cum = cumulative(poly);
  const total = cum[cum.length - 1];
  const out: Pt[] = [];
  for (let k = 0; k < n; k++) out.push(sampleAt(poly, cum, (total * k) / (n - 1)).p);
  return out;
}

export function line(a: Pt, b: Pt, n: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) out.push([lerp(a[0], b[0], i / (n - 1)), lerp(a[1], b[1], i / (n - 1))]);
  return out;
}

export function toPath(pts: ReadonlyArray<Pt>, closed = false): string {
  let d = '';
  for (let i = 0; i < pts.length; i++) d += (i ? 'L' : 'M') + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1);
  return closed ? d + 'Z' : d;
}

/**
 * The two halves of a rounded rectangle's outline, both starting at the midpoint of one side
 * (`anchor`) and meeting at the midpoint of the opposite side. `neg` runs counter-clockwise on
 * screen (towards the left of a bottom anchor), `pos` clockwise.
 */
export function roundedRectHalves(r: Rect, anchor: 'bottom' | 'right'): { neg: Pt[]; pos: Pt[] } {
  const { x: l, y: t, w, h, rx } = r;
  const R = l + w, b = t + h, mx = l + w / 2, my = t + h / 2;
  if (anchor === 'bottom') {
    const neg: Pt[] = [[mx, b], [l + rx, b], ...arc(l + rx, b - rx, rx, 90, 180), [l, t + rx], ...arc(l + rx, t + rx, rx, 180, 270), [mx, t]];
    const pos: Pt[] = [[mx, b], [R - rx, b], ...arc(R - rx, b - rx, rx, 90, 0), [R, t + rx], ...arc(R - rx, t + rx, rx, 360, 270), [mx, t]];
    return { neg, pos };
  }
  const neg: Pt[] = [[R, my], [R, t + rx], ...arc(R - rx, t + rx, rx, 360, 270), [l + rx, t], ...arc(l + rx, t + rx, rx, 270, 180), [l, my]];
  const pos: Pt[] = [[R, my], [R, b - rx], ...arc(R - rx, b - rx, rx, 0, 90), [l + rx, b], ...arc(l + rx, b - rx, rx, 90, 180), [l, my]];
  return { neg, pos };
}

/** Arc length over which a free tail's direction is averaged (scene units). */
const LOOK_AHEAD = 90;

export type WrapSpec = {
  /** Straight segment that wraps onto (or unwraps from) the outline. */
  from: Pt;
  to: Pt;
  /** Outline halves starting at the shared anchor; `neg` receives the `from` side. */
  neg: ReadonlyArray<Pt>;
  pos: ReadonlyArray<Pt>;
  n: number;
};

/**
 * Rope model: a straight line is wound onto an outline from its centre outwards.
 * `w` (0..1) is the wound fraction. Points not yet wound continue along the outline's tangent
 * at the winding front, so the free ends swing like a real strand instead of travelling in a
 * straight line through the drawing. `offsetRemain` (0..1) is how much of the gap between the
 * line's centre and the anchor is still applied.
 */
export function makeWrap(spec: WrapSpec) {
  const negCum = cumulative(spec.neg), posCum = cumulative(spec.pos);
  const half = Math.min(negCum[negCum.length - 1], posCum[posCum.length - 1]);
  const lineHalf = Math.hypot(spec.to[0] - spec.from[0], spec.to[1] - spec.from[1]) / 2;
  const centre: Pt = [(spec.from[0] + spec.to[0]) / 2, (spec.from[1] + spec.to[1]) / 2];
  const anchor = spec.neg[0];
  const off: Pt = [centre[0] - anchor[0], centre[1] - anchor[1]];
  const outNeg: Pt = [(spec.from[0] - centre[0]) / lineHalf, (spec.from[1] - centre[1]) / lineHalf];
  const outPos: Pt = [-outNeg[0], -outNeg[1]];
  // The free tail shrinks as (1 - w)^power. With power >= half / lineHalf the strand never
  // grows longer than it already is before it starts to wind, so its ends stay in frame.
  const power = Math.max(1, half / lineHalf);
  /**
   * @param w wound fraction 0..1
   * @param offsetRemain share of the centre-to-anchor gap still applied
   * @param blend 0..1, steers free tails from the outline tangent towards the line direction
   */
  return function at(w: number, offsetRemain: number, blend = 0): Pt[] {
    const wound = half * w;
    const total = wound + lineHalf * Math.pow(1 - w, power);
    const out: Pt[] = [];
    for (let i = 0; i < spec.n; i++) {
      const f = (i / (spec.n - 1)) * 2 - 1;
      const negSide = f < 0;
      const side = negSide ? spec.neg : spec.pos;
      const cum = negSide ? negCum : posCum;
      const dist = Math.abs(f) * total;
      let p: Pt;
      if (dist <= wound) p = sampleAt(side, cum, dist).p;
      else {
        const front = sampleAt(side, cum, wound);
        // Direction of the free tail: a chord looking ahead along the outline rather than the
        // instantaneous tangent, so the tail turns progressively around corners instead of
        // snapping through 90 degrees.
        const sideLen = cum[cum.length - 1];
        const a = Math.min(wound, sideLen - LOOK_AHEAD);
        const pa = sampleAt(side, cum, Math.max(0, a)).p, pb = sampleAt(side, cum, Math.max(0, a) + LOOK_AHEAD).p;
        const cl = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) || 1;
        const tan: Pt = [(pb[0] - pa[0]) / cl, (pb[1] - pa[1]) / cl];
        const o = negSide ? outNeg : outPos;
        let dx = lerp(tan[0], o[0], blend), dy = lerp(tan[1], o[1], blend);
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        p = [front.p[0] + dx * (dist - wound), front.p[1] + dy * (dist - wound)];
      }
      out.push([p[0] + off[0] * offsetRemain, p[1] + off[1] * offsetRemain]);
    }
    return out;
  };
}

/**
 * Point-by-point interpolation where each point starts after a delay given by `delay(u)`
 * (u = index position 0..1). `span` is the share of the transition each point takes.
 */
export function stagedLerp(a: ReadonlyArray<Pt>, b: ReadonlyArray<Pt>, p: number, delay: (u: number) => number, span: number): Pt[] {
  const n = a.length;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const u = n > 1 ? i / (n - 1) : 0;
    const t = window01(p, delay(u), delay(u) + span);
    // x and y use different curves so each point travels on a slight arc, not a ruler line.
    out.push([lerp(a[i][0], b[i][0], inOut3(t)), lerp(a[i][1], b[i][1], inOut2(t))]);
  }
  return out;
}
