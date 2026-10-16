import { forwardRef } from 'react';
import { CHAPTERS } from './story/copy';
import { DURATION } from './engine/motion';

export type ControlsProps = {
  playing: boolean;
  compact?: boolean;
  onToggle: () => void;
  onReplay: () => void;
  onScrub: (t: number) => void;
  onChapter: (index: number) => void;
};

export type ControlsRefs = { range: HTMLInputElement | null; clock: HTMLSpanElement | null };

/** Playback controls. The range and clock are updated through refs, never through React state. */
export const MotionControls = forwardRef<ControlsRefs, ControlsProps>(function MotionControls({ playing, compact = false, onToggle, onReplay, onScrub, onChapter }, ref) {
  const refs = ref as React.MutableRefObject<ControlsRefs>;
  return (
    <div className="gm-controls">
      <button type="button" className="gm-btn gm-btn-primary" onClick={onToggle} aria-label={playing ? 'Mettre en pause' : 'Lire l’animation'}>
        <span aria-hidden="true" className={playing ? 'gm-icon-pause' : 'gm-icon-play'} />
        {playing ? 'Pause' : 'Lecture'}
      </button>
      <button type="button" className="gm-btn" onClick={onReplay}>
        Rejouer
      </button>
      <input
        ref={(el) => { refs.current.range = el; }}
        className="gm-range"
        type="range"
        min={0}
        max={DURATION}
        step={0.01}
        defaultValue={0}
        aria-label="Position dans l’animation, en secondes"
        onInput={(e) => onScrub(Number((e.target as HTMLInputElement).value))}
      />
      <span className="gm-clock" ref={(el) => { refs.current.clock = el; }} aria-hidden="true" hidden={compact}>
        0,0 s
      </span>
      {!compact && (
        <div className="gm-chapters" role="group" aria-label="Chapitres">
          {CHAPTERS.map((c, i) => (
            <button key={c.short} type="button" className="gm-chip" onClick={() => onChapter(i)}>
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')} </span>
              {c.short}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
