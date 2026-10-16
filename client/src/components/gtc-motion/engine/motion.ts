// Shared motion language: every duration and ease in the pilot comes from here.

export const DURATION = 24;
/** End of the validated Gate B pilot (chapters 1–3). Nothing before this time may change. */
export const PILOT_END = 9;

/** Chapter boundaries of the master timeline, in seconds. */
export const LABELS = {
  idea: 0,
  t1: 2.2,
  organisation: 4.6,
  t2: 5.4,
  materialise: 7.4,
  digitalisation: 9.0,
  optimisation: 11.8,
  acquisition: 14.6,
  croissance: 17.4,
  impact: 20.2,
  end: DURATION,
} as const;

/** Start of each title swap in the DOM (outgoing title leaves, incoming arrives 0.42 s later). */
export const TITLE_SWAPS = [3.35, 6.55, 10.15, 12.95, 15.75, 18.55, 21.55];

export type LabelName = keyof typeof LABELS;

export const EASE = {
  draw: 'power2.inOut',
  // GSAP power2 is a cubic curve (peak speed 3x the average): soft ends without a rush in the middle.
  transform: 'power2.inOut',
  /** Long trips across the stage: sine keeps the peak speed close to the average. */
  travel: 'sine.inOut',
  arrive: 'expo.out',
  fall: 'power2.in',
  settle: 'back.out(2.2)',
  linear: 'none',
} as const;

const CHAPTER_STARTS = [3.6, 6.8, 10.4, 13.2, 16.0, 18.8, 21.8];

/** Chapter index (0 Idée … 7 Impact) shown in the DOM for a given time. */
export function chapterAt(t: number): number {
  let c = 0;
  while (c < CHAPTER_STARTS.length && t >= CHAPTER_STARTS[c]) c++;
  return c;
}
