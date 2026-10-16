// Shape functions of the morphing objects, as pure functions of local progress p (0..1).
// The timeline and the unit tests use exactly these functions.

import { inOut2, inOut3, makeWrap, stagedLerp, window01, type Pt } from './geometry';
import { N_GLASS, type Layout } from '../story/layouts';

export function shapesFor(L: Layout) {
  const unwrap = makeWrap({ from: L.org.axis.from, to: L.org.axis.to, neg: L.idea.glassHalves.neg, pos: L.idea.glassHalves.pos, n: N_GLASS });
  const frameWrap = makeWrap({ from: L.org.axis.from, to: L.org.axis.to, neg: L.site.frameHalves.neg, pos: L.site.frameHalves.pos, n: N_GLASS });
  const launch = L.org.milestones[2];
  const cardWrap = makeWrap({ from: [launch.x, launch.top], to: [launch.x, launch.base], neg: L.site.cardHalves.neg, pos: L.site.cardHalves.pos, n: 96 });

  return {
    /** T1: the bulb unrolls onto the ground; its free ends splay outwards rather than crossing. */
    glassToAxis(p: number): Pt[] {
      const w = 1 - inOut3(p);
      return unwrap(w, inOut2(p), Math.min(1, (1 - w) * 5));
    },
    /** T2: the axis winds up into the browser frame from its centre. */
    axisToFrame(p: number): Pt[] {
      return frameWrap(inOut3(p), 1 - inOut3(window01(p, 0, 0.45)));
    },
    /** T2: the launch milestone winds itself into the hero card. */
    milestoneToCard(p: number): Pt[] {
      return cardWrap(inOut3(p), 1 - inOut3(window01(p, 0, 0.4)));
    },
    /** T1: the filament is pulled out, left to right, into the critical path. */
    filamentToCritical(p: number): Pt[] {
      return stagedLerp(L.idea.filament, L.org.critical, p, (u) => u * 0.35, 0.65);
    },
    /** T2: the critical path settles into the hero chart. */
    criticalToChart(p: number): Pt[] {
      return stagedLerp(L.org.critical, L.site.chart, p, (u) => u * 0.3, 0.7);
    },
  };
}
