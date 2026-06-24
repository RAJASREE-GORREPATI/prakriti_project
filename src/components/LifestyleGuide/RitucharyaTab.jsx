import { useState } from 'react';
import ritucharyaData from '../../data/ritucharya.json';
import { DOSHA_COLORS } from '../../utils/doshaUtils';

const SEASON_META = [
  { id: 'shishira', short: 'Shishira', sub: 'Late Winter',  color: '#6A9EC0', textColor: 'white' },
  { id: 'vasanta',  short: 'Vasanta',  sub: 'Spring',       color: '#6AAE78', textColor: 'white' },
  { id: 'grishma',  short: 'Grishma',  sub: 'Summer',       color: '#C8A030', textColor: 'white' },
  { id: 'varsha',   short: 'Varsha',   sub: 'Monsoon',      color: '#4E88A8', textColor: 'white' },
  { id: 'sharad',   short: 'Sharad',   sub: 'Autumn',       color: '#C87840', textColor: 'white' },
  { id: 'hemanta',  short: 'Hemanta',  sub: 'Early Winter', color: '#7888A8', textColor: 'white' },
];

function getCurrentSeasonIndex() {
  const now = new Date();
  const m = now.getMonth(); // 0-11
  const d = now.getDate();
  // Shishira: Jan15–Mar15, Vasanta: Mar15–May15, Grishma: May15–Jul15
  // Varsha: Jul15–Sep15, Sharad: Sep15–Nov15, Hemanta: Nov15–Jan15
  if ((m === 0 && d >= 15) || m === 1 || (m === 2 && d < 15)) return 0;
  if ((m === 2 && d >= 15) || m === 3 || (m === 4 && d < 15)) return 1;
  if ((m === 4 && d >= 15) || m === 5 || (m === 6 && d < 15)) return 2;
  if ((m === 6 && d >= 15) || m === 7 || (m === 8 && d < 15)) return 3;
  if ((m === 8 && d >= 15) || m === 9 || (m === 10 && d < 15)) return 4;
  return 5;
}

function polarXY(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSegmentPath(cx, cy, innerR, outerR, startDeg, endDeg) {
  const os = polarXY(cx, cy, outerR, startDeg);
  const oe = polarXY(cx, cy, outerR, endDeg);
  const is = polarXY(cx, cy, innerR, startDeg);
  const ie = polarXY(cx, cy, innerR, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${os.x.toFixed(2)} ${os.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)}`,
    `L ${ie.x.toFixed(2)} ${ie.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${is.x.toFixed(2)} ${is.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function SeasonWheel({ active, onSelect, currentSeasonIdx }) {
  const cx = 130, cy = 130;
  const innerR = 48, outerR = 100;
  const GAP = 2.5;

  return (
    <svg width="260" height="260" viewBox="0 0 260 260" style={{ display: 'block', margin: '0 auto' }}>
      {SEASON_META.map((s, i) => {
        const startDeg = i * 60 + GAP;
        const endDeg = (i + 1) * 60 - GAP;
        const midDeg = i * 60 + 30;
        const isActive = active === i;
        const isCurrent = i === currentSeasonIdx;

        // Text position at center of arc
        const textPos = polarXY(cx, cy, (innerR + outerR) / 2, midDeg);
        const subPos = polarXY(cx, cy, (innerR + outerR) / 2 + 10, midDeg);

        // Active segment extends outward
        const activeOuterR = isActive ? outerR + 10 : outerR;
        const path = donutSegmentPath(cx, cy, innerR, activeOuterR, startDeg, endDeg);

        return (
          <g key={s.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(i)}>
            <path
              d={path}
              fill={s.color}
              opacity={isActive ? 1 : 0.65}
              stroke="white"
              strokeWidth="2"
              style={{ transition: 'opacity 0.2s, d 0.2s' }}
            />
            {/* Season short name */}
            <text
              x={textPos.x}
              y={textPos.y - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8.5"
              fontFamily="'Cormorant Garamond', Georgia, serif"
              fontWeight="600"
              fill="white"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {s.short}
            </text>
            {/* Sub label */}
            <text
              x={textPos.x}
              y={textPos.y + 7}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="6.5"
              fontFamily="sans-serif"
              fill="rgba(255,255,255,0.85)"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {s.sub}
            </text>
            {/* "Now" dot for current season */}
            {isCurrent && (() => {
              const dotPos = polarXY(cx, cy, outerR - 10, midDeg);
              return (
                <>
                  <circle cx={dotPos.x} cy={dotPos.y} r="5" fill="white" opacity="0.95" style={{ pointerEvents: 'none' }} />
                  <text x={dotPos.x} y={dotPos.y} textAnchor="middle" dominantBaseline="middle" fontSize="5" fill={s.color} fontFamily="sans-serif" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                    ▸
                  </text>
                </>
              );
            })()}
          </g>
        );
      })}

      {/* Center */}
      <circle cx={cx} cy={cy} r={innerR - 3} fill="#faf7f2" />
      <text x={cx} y={cy - 7} textAnchor="middle" fontSize="9" fill="#9c8660" fontFamily="sans-serif" letterSpacing="1">
        SEASON
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="8" fill="#d4c4a8" fontFamily="'Cormorant Garamond', Georgia, serif" fontStyle="italic">
        Ritucharya
      </text>
    </svg>
  );
}

export default function RitucharyaTab({ dominant }) {
  const seasons = ritucharyaData.ritucharya.seasons;
  const currentSeasonIdx = getCurrentSeasonIndex();
  const [active, setActive] = useState(currentSeasonIdx);

  const color = DOSHA_COLORS[dominant];
  const season = seasons[active];
  const rec = season.recommendations[dominant];
  const activeMeta = SEASON_META[active];

  return (
    <div>
      {/* Season wheel */}
      <div className="mb-6">
        <SeasonWheel active={active} onSelect={setActive} currentSeasonIdx={currentSeasonIdx} />
        <p className="text-center text-[10px] font-sans text-[#9c8660] mt-2 uppercase tracking-widest">
          Tap a season to explore
          {active === currentSeasonIdx && (
            <span className="ml-2" style={{ color: activeMeta.color }}>· Current season</span>
          )}
        </p>
      </div>

      {/* Selected season header */}
      <div
        className="rounded-2xl p-5 mb-6 border"
        style={{ backgroundColor: activeMeta.color + '18', borderColor: activeMeta.color + '50' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeMeta.color }} />
          <h3 className="font-serif text-[#2d2418] text-lg">{season.name}</h3>
          {active === currentSeasonIdx && (
            <span
              className="text-[9px] font-sans uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: activeMeta.color, color: 'white' }}
            >
              Now
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-sans">
          {[
            { label: 'Months', value: season.months },
            { label: 'Climate', value: season.climate },
            { label: 'Agni', value: season.agniStrength },
            { label: 'Watch', value: season.dominantDosha },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[#9c8660] uppercase tracking-widest text-[9px] mb-0.5">{label}</p>
              <p className="text-[#2d2418]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {rec && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: 'Diet', text: rec.diet },
            { label: 'Lifestyle', text: rec.lifestyle },
            { label: 'Exercise', text: rec.exercise },
            { label: 'Herbs & Spices', text: rec.herbs },
          ].map(({ label, text }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#e8dcc8] p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: color }} />
                <h3 className="font-serif text-[#2d2418] text-sm">{label}</h3>
              </div>
              <p className="text-xs font-sans text-[#5c4d33] leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
