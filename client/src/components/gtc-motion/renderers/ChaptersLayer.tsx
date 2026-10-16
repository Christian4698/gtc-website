// Scene elements introduced by chapters 4–8. Everything is invisible until the chapter that
// needs it, so the validated 0–9 s pilot renders exactly as before.

import type { Rect } from '../engine/geometry';
import type { ChaptersLayout } from '../story/chaptersLayout';
import type { TextSpec } from '../story/layouts';
import { C } from '../story/palette';

function Label({ id, spec, fill, weight = 600, family = 'body' }: { id: string; spec: TextSpec; fill: string; weight?: number; family?: 'body' | 'display' }) {
  return (
    <text data-obj={id} x={spec.x} y={spec.y} fontSize={spec.size} fontWeight={weight} fill={fill} textAnchor={spec.anchor ?? 'start'} className={family === 'display' ? 'f-display' : 'f-body'} opacity={0}>
      {spec.text}
    </text>
  );
}

/** Line icons for the three process stations, drawn in the station icon square. */
function stationGlyph(k: number, r: Rect): string {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, u = r.w / 34;
  if (k === 0) return `M${cx - 9 * u} ${cy}h${18 * u}M${cx} ${cy - 9 * u}v${18 * u}M${cx - 6 * u} ${cy - 6 * u}l${12 * u} ${12 * u}M${cx + 6 * u} ${cy - 6 * u}l${-12 * u} ${12 * u}`;
  if (k === 1) return `M${cx - 8 * u} ${cy - 6 * u}h${16 * u}v${12 * u}h${-16 * u}ZM${cx - 8 * u} ${cy - 2 * u}h${16 * u}M${cx - 8 * u} ${cy + 2 * u}h${16 * u}`;
  return `M${cx - 7 * u} ${cy}l${5 * u} ${5 * u}l${9 * u} ${-10 * u}`;
}

export function ChaptersLayer({ X, part, s }: { X: ChaptersLayout; part: 'mid' | 'top'; s: number }) {
  if (part === 'mid') {
    // Croissance: each visitor grows into its month's bar, beneath the growth curve.
    return (
      <g>
        {X.barX.map((x, k) => (
          <rect key={k} data-obj={`vbody-${k}`} x={x - X.barW / 2} y={X.base} width={X.barW} height={0} rx={4 * s} fill={C.skyTint} stroke="#9FD6FB" strokeWidth={1.2 * s} />
        ))}
      </g>
    );
  }
  const vr = X.visitorR;
  return (
    <g>
      {/* 4 · Digitalisation: station contents */}
      {X.stIcon.map((r, k) => (
        <path key={k} data-obj={`st-glyph-${k}`} d={stationGlyph(k, r)} fill="none" stroke={C.gtc} strokeWidth={1.8 * s} strokeLinecap="round" strokeLinejoin="round" opacity={0} />
      ))}
      {X.stTitle.map((t, k) => (
        <Label key={k} id={`st-title-${k}`} spec={t} fill={C.ink} family="display" />
      ))}
      {X.trBars.map((r, j) => (
        <rect key={j} data-obj={`tr-bar-${j}`} x={r.x} y={r.y} width={0} height={r.h} rx={r.rx} fill={j === 0 ? C.sky : C.placeholder} />
      ))}
      {X.suivi.map((row, j) => (
        <g key={j}>
          <rect data-obj={`suivi-box-${j}`} x={row.box.x} y={row.box.y} width={row.box.w} height={row.box.h} rx={row.box.rx} fill={C.white} stroke={C.wire} strokeWidth={1.2 * s} opacity={0} />
          <rect data-obj={`suivi-line-${j}`} x={row.line.x} y={row.line.y} width={0} height={row.line.h} rx={row.line.rx} fill={C.placeholder} />
          <text data-obj={`suivi-status-${j}`} x={row.status.x} y={row.status.y} fontSize={row.status.size} fontWeight={500} fill={C.annotation} textAnchor="end" className="f-body" opacity={0}>
            {j === 2 ? 'Manuel' : 'Auto'}
          </text>
        </g>
      ))}
      <text data-obj="suivi-auto" x={X.suivi[2].status.x} y={X.suivi[2].status.y} fontSize={X.suivi[2].status.size} fontWeight={600} fill={C.sky} textAnchor="end" className="f-body" opacity={0}>
        Automatique
      </text>
      <path data-obj="suivi-check" d={`M${X.suivi[2].box.x + 4 * s} ${X.suivi[2].box.y + 8 * s}l${3 * s} ${3 * s}l${6 * s} ${-6.5 * s}`} fill="none" stroke={C.white} strokeWidth={2 * s} strokeLinecap="round" strokeLinejoin="round" opacity={0} />
      <Label id="bus-note" spec={X.busNote} fill={C.annotation} weight={500} />

      {/* 5 · Optimisation */}
      <Label id="title5" spec={X.title5} fill={C.white} family="display" />
      <Label id="title6" spec={X.title6} fill={C.white} family="display" />
      <Label id="cta5-label" spec={X.ctaLabel5} fill={C.navy} />
      {X.sideLabels.map((t, k) => (
        <Label key={k} id={`side-label-${k}`} spec={t} fill={k === 0 ? C.gtc : C.muted} />
      ))}
      {X.tileLabels.map((t, k) => (
        <Label key={k} id={`tile-label-${k}`} spec={t} fill={C.muted} weight={500} />
      ))}
      {X.tileValues.map((t, k) => (
        <Label key={k} id={`tile-value-${k}`} spec={t} fill={C.ink} family="display" />
      ))}
      <Label id="panel-title" spec={X.panelTitle} fill={C.ink} />
      <Label id="panel-note" spec={X.panelNote} fill={C.annotation} weight={500} />

      {/* 6 · Acquisition */}
      {X.counterTexts.map((t, k) => (
        <Label key={k} id={`counter-text-${k}`} spec={t} fill={C.ink} />
      ))}
      <Label id="cta6-label" spec={X.ctaLabel6} fill={C.navy} />
      <Label id="crm-title" spec={X.crmTitle} fill={C.ink} family="display" />
      {X.crmLabels.map((t, k) => (
        <Label key={k} id={`crm-label-${k}`} spec={t} fill={k === 2 ? C.white : C.muted} weight={k === 2 ? 600 : 500} />
      ))}
      <Label id="note6" spec={X.note6} fill={C.annotation} weight={500} />

      {/* 7 · Croissance */}
      {X.msLabels.map((t, k) => (
        <Label key={k} id={`ms7-label-${k}`} spec={t} fill={C.muted} weight={500} />
      ))}
      <Label id="pill-text" spec={X.pillText} fill={C.white} />
      {X.chipLabels.map((t, k) => (
        <Label key={k} id={`chip-label-${k}`} spec={t} fill={C.muted} weight={500} />
      ))}
      {X.chipValues.map((t, k) => (
        <Label key={k} id={`chip-value-${k}`} spec={t} fill={C.gtc} family="display" />
      ))}
      <Label id="legend-text" spec={X.legendText} fill={C.navy} />
      <Label id="note7" spec={X.note7} fill={C.annotation} weight={500} />

      {/* visitors: points of the chart that become people */}
      {X.barX.map((_, k) => (
        <g key={k} data-obj={`visitor-${k}`} opacity={0}>
          <path data-obj={`vshoulder-${k}`} d="M0 0" fill="none" stroke={C.sky} strokeWidth={vr * 0.7} strokeLinecap="round" />
          <circle data-obj={`vhead-${k}`} cx={0} cy={0} r={vr} fill={C.sky} />
        </g>
      ))}
      <circle data-obj="signal" cx={0} cy={0} r={0} fill={C.sky} stroke={C.white} strokeWidth={2 * s} />

      {/* 8 · Impact */}
      {X.modIcons.map((d, k) => (
        <path key={k} data-obj={`mod-icon-${k}`} d={d} fill="none" stroke={C.gtc} strokeWidth={1.6 * s} strokeLinecap="round" strokeLinejoin="round" opacity={0} />
      ))}
      {X.modLabels.map((t, k) => (
        <Label key={k} id={`mod-label-${k}`} spec={t} fill={C.ink} family="display" />
      ))}
      <Label id="tagline" spec={X.tagline} fill={C.gtc} family="display" />
    </g>
  );
}
