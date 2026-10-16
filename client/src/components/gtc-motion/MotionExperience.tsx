// GTC — « De l'idée à l'impact »: interactive motion design of the home page (8 steps, 24 s).
// One persistent SVG scene animated by a GSAP master timeline; React renders it once.
// Ported from the validated prototype (gtc-immersive-pilot, 88/100). Only the wiring to the
// site changed: no @gsap/react (gsap.context instead), the site's official logo, scoped CSS,
// and review parameters / test API limited to development builds.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { SvgStage } from './renderers/SvgStage';
import { MotionControls, type ControlsRefs } from './MotionControls';
import { buildTimeline } from './engine/timeline';
import { DURATION, LABELS, chapterAt, type LabelName } from './engine/motion';
import { LAYOUTS, type LayoutKind } from './story/layouts';
import { CHAPTERS, CHAPTER_TIMES, STAGE_DESCRIPTION } from './story/copy';
import { chaptersLayout } from './story/chaptersLayout';
import './gtc-motion.css';

const LOGO_URL = '/assets/images/logo_gtc.webp';
const MOBILE_QUERY = '(max-width: 720px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const PLAYED_KEY = 'gtc-home-motion-played';

export type MotionApi = {
  seek: (t: number) => void;
  seekLabel: (name: LabelName) => void;
  progress: (p: number) => void;
  play: () => void;
  pause: () => void;
  time: () => number;
  duration: number;
  labels: typeof LABELS;
  layout: LayoutKind;
  geometry: { chapters: ReturnType<typeof chaptersLayout> };
};

declare global {
  interface Window {
    __GTC_MOTION__?: MotionApi;
  }
}

// Review parameters (?t=, ?layout=) are honoured in development builds only.
const devParams = import.meta.env.DEV && typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const forcedLayout = devParams.get('layout') as LayoutKind | null;
const frozenAt = devParams.has('t') ? Math.min(DURATION, Math.max(0, Number(devParams.get('t')) || 0)) : null;

function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const update = () => setMatch(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return match;
}

const readPlayed = () => {
  try {
    return sessionStorage.getItem(PLAYED_KEY) === '1';
  } catch {
    return false;
  }
};
const markPlayed = () => {
  try {
    sessionStorage.setItem(PLAYED_KEY, '1');
  } catch {
    /* storage unavailable: autoplay simply repeats */
  }
};

export type MotionExperienceProps = {
  /** 'compact' keeps only Lecture/Pause, Rejouer and the progress bar (home page). */
  variant?: 'full' | 'compact';
  /** Play once per session when the section becomes visible (default true). */
  autoplay?: boolean;
};

export function MotionExperience({ variant = 'compact', autoplay = true }: MotionExperienceProps) {
  const narrow = useMedia(MOBILE_QUERY);
  const reduced = useMedia(REDUCED_QUERY);
  const kind: LayoutKind = forcedLayout === 'desktop' || forcedLayout === 'mobile' ? forcedLayout : narrow ? 'mobile' : 'desktop';
  const layout = LAYOUTS[kind];
  const chapters = useMemo(() => chaptersLayout(layout), [layout]);
  const logoRef = useRef<HTMLImageElement>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const titleRefs = useRef<HTMLElement[]>([]);
  const controls = useRef<ControlsRefs>({ range: null, clock: null });
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const timeRef = useRef(frozenAt ?? 0);
  const resumeRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  const render = useCallback((t: number) => {
    timeRef.current = t;
    const c = controls.current;
    if (c.range) c.range.value = String(t);
    if (c.clock) c.clock.textContent = `${t.toFixed(1).replace('.', ',')} s`;
    const root = rootRef.current;
    const ch = String(chapterAt(t));
    if (root && root.dataset.chapter !== ch) root.dataset.chapter = ch;
  }, []);

  // Build the timeline for the current composition; everything it creates is reverted on change.
  useLayoutEffect(() => {
    if (!svgRef.current) return;
    let tl: gsap.core.Timeline | null = null;
    const ctx = gsap.context(() => {
      tl = buildTimeline(svgRef.current!, layout, chapters, { titles: titleRefs.current, logo: logoRef.current, onUpdate: render });
      tl.eventCallback('onComplete', () => setPlaying(false));
      const start = reduced && frozenAt === null ? DURATION : timeRef.current;
      tl.time(start, false);
      render(start);
    }, rootRef);
    tlRef.current = tl;
    return () => {
      if (tl) timeRef.current = (tl as gsap.core.Timeline).time();
      tlRef.current = null;
      ctx.revert();
    };
  }, [kind, reduced, layout, chapters, render]);

  const play = useCallback(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (tl.time() >= DURATION - 0.01) tl.time(0);
    tl.play();
    setPlaying(true);
  }, []);
  const pause = useCallback(() => {
    tlRef.current?.pause();
    resumeRef.current = false;
    setPlaying(false);
  }, []);
  const seek = useCallback((t: number) => {
    const tl = tlRef.current;
    if (!tl) return;
    tl.pause();
    tl.time(Math.min(DURATION, Math.max(0, t)), false);
    render(tl.time());
    setPlaying(false);
  }, [render]);

  // Autoplay once per session when at least 40 % of the scene is visible; pause off-screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const tl = tlRef.current;
        if (!tl) return;
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.4;
        if (!visible) {
          if (tl.isActive()) {
            tl.pause();
            resumeRef.current = true;
            setPlaying(false);
          }
          return;
        }
        if (resumeRef.current) {
          resumeRef.current = false;
          play();
          return;
        }
        if (autoplay && !reduced && frozenAt === null && !readPlayed()) {
          markPlayed();
          play();
        }
      },
      { threshold: [0, 0.4, 0.7] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [play, reduced, autoplay]);

  // Test and capture API, development builds only: nothing is exposed in production.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__GTC_MOTION__ = {
      seek,
      seekLabel: (name) => seek(LABELS[name]),
      progress: (p) => seek(p * DURATION),
      play,
      pause,
      time: () => tlRef.current?.time() ?? 0,
      duration: DURATION,
      labels: LABELS,
      layout: kind,
      geometry: { chapters },
    };
    return () => {
      delete window.__GTC_MOTION__;
    };
  }, [seek, play, pause, kind, chapters]);

  const setTitleRef = (i: number) => (el: HTMLElement | null) => {
    if (el) titleRefs.current[i] = el;
  };

  return (
    <div ref={rootRef} className="gm" data-layout={kind} data-variant={variant} data-chapter="0" role="region" aria-label="Animation : de l’idée à l’impact, en huit étapes">
      <p className="gm-sr">{STAGE_DESCRIPTION}</p>
      <div className="gm-stage">
        <SvgStage key={kind} ref={svgRef} layout={layout} chapters={chapters} />
        <div className="gm-copy" aria-hidden="true">
          <ol className="gm-steps">
            {CHAPTERS.map((c, i) => (
              <li key={c.short} data-step={i}>
                <span className="gm-step-num">{String(i + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}</span>
                {c.short}
              </li>
            ))}
          </ol>
          <p className="gm-title gm-mask">
            {CHAPTERS.map((c, i) => (
              <span key={c.short} ref={setTitleRef(i)}>
                {c.title}
              </span>
            ))}
          </p>
          <p className="gm-body gm-mask">
            {CHAPTERS.map((c, i) => (
              <span key={c.short} ref={setTitleRef(CHAPTERS.length + i)}>
                {c.body}
              </span>
            ))}
          </p>
          <img ref={logoRef} className="gm-logo" src={LOGO_URL} alt="" width={40} height={40} style={{ opacity: 0 }} />
        </div>
      </div>
      <p className="gm-caption" aria-hidden="true">
        {CHAPTERS.map((c, i) => (
          <span key={c.short} data-cap={i}>
            {c.body}
          </span>
        ))}
      </p>
      <MotionControls
        ref={controls}
        compact={variant === 'compact'}
        playing={playing}
        onToggle={() => (playing ? pause() : play())}
        onReplay={() => {
          seek(0);
          play();
        }}
        onScrub={seek}
        onChapter={(i) => seek(CHAPTER_TIMES[i])}
      />
    </div>
  );
}

export default MotionExperience;
