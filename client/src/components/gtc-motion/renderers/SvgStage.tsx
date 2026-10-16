// Static SVG scene: one element per persistent object, rendered once in its initial state
// (time 0). The GSAP timeline then animates attributes in place; React never re-renders it
// during playback.

import { forwardRef } from 'react';
import { toPath, type Rect, type Seg } from '../engine/geometry';
import type { Layout, TextSpec } from '../story/layouts';
import { C } from '../story/palette';
import { ChaptersLayer } from './ChaptersLayer';
import type { ChaptersLayout } from '../story/chaptersLayout';

const segD = (s: Seg) => `M${s.x1} ${s.y1}L${s.x2} ${s.y2}`;

function Txt({ spec, id, fill, weight = 600, family = 'body', clip }: { spec: TextSpec; id?: string; fill: string; weight?: number; family?: 'body' | 'display'; clip?: string }) {
  return (
    <text
      data-obj={id}
      x={spec.x}
      y={spec.y}
      fontSize={spec.size}
      fontWeight={weight}
      fill={fill}
      textAnchor={spec.anchor ?? 'start'}
      className={family === 'display' ? 'f-display' : 'f-body'}
      clipPath={clip ? `url(#${clip})` : undefined}
    >
      {spec.text}
    </text>
  );
}

const ClipRect = ({ id, r, objId }: { id: string; r: Rect; objId: string }) => (
  <clipPath id={id}>
    <rect data-obj={objId} x={r.x} y={r.y} width={0} height={r.h} />
  </clipPath>
);

/** Small line icons for the three service cards, drawn in the icon square. */
function glyph(k: number, r: Rect): string {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, u = r.w / 36;
  if (k === 0) return `M${cx - 10 * u} ${cy - 7 * u}h${20 * u}v${14 * u}h${-20 * u}Z M${cx - 10 * u} ${cy - 2 * u}h${20 * u}`;
  if (k === 1) return `M${cx - 6 * u} ${cy - 10 * u}h${12 * u}v${20 * u}h${-12 * u}Z M${cx - 2 * u} ${cy + 6 * u}h${4 * u}`;
  return `M${cx - 9 * u} ${cy}a${9 * u} ${9 * u} 0 0 1 ${15 * u} ${-6.5 * u} M${cx + 9 * u} ${cy}a${9 * u} ${9 * u} 0 0 1 ${-15 * u} ${6.5 * u} M${cx + 6 * u} ${cy - 9.5 * u}l${0.2 * u} ${3.4 * u}l${-3.4 * u} ${0.4 * u} M${cx - 6 * u} ${cy + 9.5 * u}l${-0.2 * u} ${-3.4 * u}l${3.4 * u} ${-0.4 * u}`;
}

export const SvgStage = forwardRef<SVGSVGElement, { layout: Layout; chapters: ChaptersLayout }>(function SvgStage({ layout: L, chapters: X }, ref) {
  const p = L.kind === 'desktop' ? 'd' : 'm';
  const [W, H] = L.vb;
  const { idea, org, site } = L;
  const s = L.kind === 'desktop' ? 1 : 1.25;
  const hairline = 1.5 * s;

  return (
    <svg ref={ref} className="stage-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false" data-layout={L.kind}>
      <defs>
        <pattern id={`${p}-grid`} width={L.grid.step} height={L.grid.step} patternUnits="userSpaceOnUse">
          <circle cx={L.grid.step / 2} cy={L.grid.step / 2} r={L.grid.r} fill={C.grid} />
        </pattern>
        <radialGradient id={`${p}-soft`}>
          <stop offset="0.82" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={`${p}-grid-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <circle data-obj="grid-reveal" cx={idea.seed.x} cy={idea.seed.y} r={0} fill={`url(#${p}-soft)`} />
        </mask>
        <clipPath id={`${p}-page-clip`}>
          <rect data-obj="page-reveal" x={site.frame.x - 80 * s} y={site.frame.y - 4} width={site.frame.w + 160 * s} height={0} />
        </clipPath>
        <clipPath id={`${p}-cardsurf-clip`}>
          <rect data-obj="card-reveal" x={site.card.x - 4} y={site.curtain.y} width={site.card.w + 8} height={0} />
        </clipPath>
        <filter id={`${p}-shadow`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow data-obj="page-shadow" dx="0" dy={14 * s} stdDeviation={22 * s} floodColor="#0A2A5C" floodOpacity={0} />
        </filter>
        {org.bars.map((b) => (
          <clipPath key={b.id} id={`${p}-clip-${b.id}`}>
            <use href={`#${p}-${b.id}`} />
          </clipPath>
        ))}
        {org.lanes.map((ln, i) => (
          <clipPath key={i} id={`${p}-lane-clip-${i}`}>
            <rect data-obj={`lane-label-clip-${i}`} x={ln.label.x - 4} y={ln.label.y - ln.label.size * 1.2} width={0} height={ln.label.size * 1.6} />
          </clipPath>
        ))}
        {org.milestones.map((m, i) => (
          <clipPath key={i} id={`${p}-ms-clip-${i}`}>
            <rect data-obj={`ms-label-clip-${i}`} x={m.x - 70 * s} y={m.label.y - m.label.size * 1.2} width={0} height={m.label.size * 1.6} />
          </clipPath>
        ))}
        <ClipRect id={`${p}-wipe-nav`} r={site.sectionClips.nav} objId="wipe-nav" />
        <ClipRect id={`${p}-wipe-hero`} r={site.sectionClips.hero} objId="wipe-hero" />
        <ClipRect id={`${p}-wipe-card`} r={site.sectionClips.card} objId="wipe-card" />
        <ClipRect id={`${p}-wipe-services`} r={site.sectionClips.services} objId="wipe-services" />
        <ClipRect id={`${p}-wipe-form`} r={site.sectionClips.form} objId="wipe-form" />
      </defs>

      <rect width={W} height={H} fill={C.bg} />
      <rect x={L.grid.area.x} y={L.grid.area.y} width={L.grid.area.w} height={L.grid.area.h} fill={`url(#${p}-grid)`} mask={`url(#${p}-grid-mask)`} />

      {/* Création surfaces, revealed only at materialisation */}
      <g data-obj="page" clipPath={`url(#${p}-page-clip)`}>
        <rect x={site.frame.x} y={site.frame.y} width={site.frame.w} height={site.frame.h} rx={site.frame.rx} fill={C.white} filter={`url(#${p}-shadow)`} />
        <path d={site.toolbar} fill={C.toolbar} />
      </g>
      <rect data-obj="curtain" x={site.curtain.x} y={site.curtain.y} width={site.curtain.w} height={0} rx={0} fill={C.navy} stroke={C.navy} strokeWidth={0} />
      <rect data-obj="card-surface" clipPath={`url(#${p}-cardsurf-clip)`} x={site.card.x} y={site.card.y} width={site.card.w} height={site.card.h} rx={site.card.rx} fill={C.white} />

      {/* Rays → lanes → section borders */}
      {idea.rays.map((r, i) => (
        <line key={i} data-obj={`ray-${i}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={C.sky} strokeWidth={idea.stroke} strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1} />
      ))}

      {/* Dependencies → hero card titles */}
      {org.deps.map((d, i) => (
        <path key={i} data-obj={`dep-${i}`} d={d.org} fill="none" stroke={C.gtc} strokeOpacity={0.55} strokeWidth={hairline} strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1} />
      ))}

      {/* Socket threads → milestones → window dots / hero card */}
      {idea.sockets.map((sk, i) => (
        <path key={i} data-obj={`socket-${i}`} d={segD(sk)} fill="none" stroke={C.gtc} strokeWidth={idea.stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1} />
      ))}

      <line data-obj="today" x1={org.seedStart[0]} y1={org.seedStart[1]} x2={org.seedStart[0]} y2={org.seedStart[1]} stroke={C.sky} strokeWidth={hairline} strokeLinecap="round" />

      {/* The glass: bulb → time axis → browser frame */}
      <path data-obj="glass" d={toPath(idea.glass)} fill="none" stroke={C.gtc} strokeWidth={idea.stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1} />

      {org.ticks.map((t, i) => (
        <line key={i} data-obj={`tick-${i}`} x1={t.x1} y1={t.y1} x2={t.x1} y2={t.y1} stroke={C.tick} strokeWidth={hairline} strokeLinecap="round" />
      ))}

      <ChaptersLayer X={X} part="mid" s={s} />

      {/* Filament → critical path → hero chart */}
      <path data-obj="filament" d={toPath(idea.filament)} fill="none" stroke={C.gtc} strokeWidth={1.6 * s} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1} />

      {/* Ray tips → tasks → website components */}
      {org.bars.map((b) => {
        const tip = idea.tips[b.lane];
        return <rect key={b.id} id={`${p}-${b.id}`} data-obj={b.id} x={tip[0]} y={tip[1]} width={0} height={0} rx={0} fill={C.sky} stroke={C.sky} strokeWidth={0} />;
      })}
      {org.showBarLabels &&
        org.bars.map((b) => (
          <text key={b.id} data-obj={`${b.id}-label`} x={b.org.x + 12} y={b.org.y + b.org.h / 2 + org.barText * 0.36} fontSize={org.barText} fontWeight={600} fill={b.critical ? C.gtc : C.muted} className="f-body" clipPath={`url(#${p}-clip-${b.id})`}>
            {b.label}
          </text>
        ))}

      {org.milestones.map((m, i) => (
        <rect key={i} data-obj={`diamond-${i}`} x={m.x} y={m.base} width={0} height={0} rx={1.5} fill={C.white} stroke={C.gtc} strokeWidth={hairline} transform={`rotate(45 ${m.x} ${m.base})`} />
      ))}

      <circle data-obj="halo" cx={idea.seed.x} cy={idea.seed.y} r={0} fill="none" stroke={C.sky} strokeWidth={2 * s} opacity={0} />
      <circle data-obj="seed" cx={idea.seed.x} cy={idea.seed.y} r={0} fill={C.sky} stroke={C.white} strokeWidth={0} />

      {org.lanes.map((ln, i) => (
        <Txt key={i} id={`lane-label-${i}`} spec={ln.label} fill={C.muted} clip={`${p}-lane-clip-${i}`} />
      ))}
      {org.milestones.map((m, i) => (
        <Txt key={i} id={`ms-label-${i}`} spec={m.label} fill={C.muted} weight={500} clip={`${p}-ms-clip-${i}`} />
      ))}

      {/* Site content, wiped in at materialisation over the placeholders it replaces */}
      <g data-obj="text-nav" clipPath={`url(#${p}-wipe-nav)`}>
        <Txt id="brand" spec={site.brand} fill={C.ink} family="display" />
        {site.navTexts.map((t, i) => (
          <Txt key={i} id={`nav-text-${i}`} spec={t} fill={C.muted} weight={500} />
        ))}
        <Txt id="url" spec={site.url} fill={C.annotation} weight={500} />
      </g>
      <g data-obj="text-hero" clipPath={`url(#${p}-wipe-hero)`}>
        <text data-obj="headline" x={site.headline.x} fontSize={site.headline.size} fontWeight={600} fill={C.white} className="f-display">
          {site.headline.lines.map((ln, i) => (
            <tspan key={i} x={site.headline.x} y={ln.y}>
              {ln.text}
            </tspan>
          ))}
        </text>
        <Txt id="sub" spec={site.sub} fill={C.sub} weight={500} />
        <Txt id="cta-label" spec={site.cta} fill={C.navy} />
        <g data-obj="cta-arrow">
          <path d={`M${site.cta.arrow[0]} ${site.cta.arrow[1]}h${16 * s}m${-6 * s} ${-6 * s}l${6 * s} ${6 * s}l${-6 * s} ${6 * s}`} fill="none" stroke={C.navy} strokeWidth={2 * s} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <g data-obj="text-card" clipPath={`url(#${p}-wipe-card)`}>
        <Txt id="card-text-0" spec={site.cardTexts[0]} fill={C.ink} />
        <Txt id="card-text-1" spec={site.cardTexts[1]} fill={C.annotation} weight={500} />
      </g>
      <g data-obj="text-services" clipPath={`url(#${p}-wipe-services)`}>
        {site.services.map((sv, k) => (
          <g key={k}>
            <rect data-obj={`svc-icon-${k}`} x={sv.icon.x} y={sv.icon.y} width={sv.icon.w} height={sv.icon.h} rx={sv.icon.rx} fill={C.skyTint} />
            <path data-obj={`svc-glyph-${k}`} d={glyph(sv.glyph, sv.icon)} fill="none" stroke={C.gtc} strokeWidth={1.6 * s} strokeLinecap="round" strokeLinejoin="round" />
            <Txt id={`svc-title-${k}`} spec={sv.title} fill={C.ink} family="display" />
            {sv.body && <Txt id={`svc-body-${k}`} spec={sv.body} fill={C.muted} weight={500} />}
          </g>
        ))}
      </g>
      <g data-obj="text-form" clipPath={`url(#${p}-wipe-form)`}>
        {site.formTitle && <Txt id="form-title" spec={site.formTitle} fill={C.ink} family="display" />}
        <Txt id="field-text-0" spec={site.fieldTexts[0]} fill={C.annotation} weight={500} />
        <Txt id="field-text-1" spec={site.fieldTexts[1]} fill={C.annotation} weight={500} />
        <Txt id="field-text-2" spec={site.fieldTexts[2]} fill={C.white} />
      </g>

      <ChaptersLayer X={X} part="top" s={s} />
    </svg>
  );
});
