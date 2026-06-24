import { useState } from 'react';
import exerciseData from '../../data/exercise_recommendations.json';
import { DOSHA_COLORS } from '../../utils/doshaUtils';

const INTENSITY_SEGMENTS = [
  { label: 'Low',      color: '#3A7A50' },
  { label: 'Moderate', color: '#C06830' },
  { label: 'High',     color: '#A83828' },
];

function parseIntensityFill(str) {
  const s = str.toLowerCase();
  if (s.includes('low') && s.includes('high')) return [true, true, true];
  if (s.includes('low') && s.includes('moderate')) return [true, true, false];
  if (s.includes('moderate') && s.includes('high')) return [false, true, true];
  if (s.includes('vigorous') || s.includes('high')) return [false, false, true];
  if (s.includes('moderate')) return [false, true, false];
  if (s.includes('low')) return [true, false, false];
  return [false, false, false];
}

function IntensityGauge({ intensity, color }) {
  const filled = parseIntensityFill(intensity);
  return (
    <div className="bg-white rounded-2xl border border-[#e8dcc8] p-5 mb-6">
      <p className="text-[10px] font-sans uppercase tracking-widest text-[#9c8660] mb-3">Exercise Intensity</p>
      <div className="flex gap-2 mb-3">
        {INTENSITY_SEGMENTS.map((seg, i) => (
          <div key={seg.label} className="flex-1">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                backgroundColor: filled[i] ? seg.color : '#e8dcc8',
                opacity: filled[i] ? 1 : 0.5,
              }}
            />
            <p
              className="text-[9px] font-sans uppercase tracking-wide mt-1.5 text-center"
              style={{ color: filled[i] ? seg.color : '#9c8660' }}
            >
              {seg.label}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs font-sans text-[#5c4d33] italic">{intensity}</p>
    </div>
  );
}

export default function ExerciseTab({ dominant }) {
  const data = exerciseData.exerciseRecommendations[dominant];
  if (!data) return null;

  const color = DOSHA_COLORS[dominant];
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      {/* Principle banner */}
      <div
        className="rounded-2xl px-6 py-4 mb-6 border"
        style={{ backgroundColor: color + '15', borderColor: color + '40' }}
      >
        <p className="text-sm font-sans text-[#5c4d33] leading-relaxed italic">{data.principle}</p>
      </div>

      {/* Intensity gauge */}
      <IntensityGauge intensity={data.intensity} color={color} />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Frequency', value: data.frequency },
          { label: 'Best Time', value: data.bestTiming.split('.')[0] },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e8dcc8] p-4 text-center">
            <p className="text-[10px] font-sans text-[#9c8660] uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs font-sans text-[#2d2418] leading-snug">{value}</p>
          </div>
        ))}
      </div>

      {/* Capacity rule */}
      <div className="bg-white rounded-2xl border border-[#e8dcc8] p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-1 rounded-full flex-shrink-0 mt-1 self-stretch" style={{ backgroundColor: color }} />
          <div>
            <p className="text-[10px] font-sans text-[#9c8660] uppercase tracking-widest mb-1">Capacity Rule</p>
            <p className="text-xs font-sans text-[#5c4d33] leading-relaxed">{data.capacityRule}</p>
          </div>
        </div>
      </div>

      {/* Recommended activities — expandable cards */}
      <h3 className="font-serif text-[#2d2418] text-base mb-4">Recommended Activities</h3>
      <div className="space-y-3 mb-6">
        {data.recommended.map((item, i) => {
          const isOpen = expanded === i;
          return (
            <button
              key={i}
              onClick={() => setExpanded(isOpen ? null : i)}
              className="w-full text-left bg-white rounded-2xl border border-[#e8dcc8] p-5 transition-all cursor-pointer hover:border-[#d4c4a8]"
              style={isOpen ? { borderColor: color + '70', boxShadow: `0 2px 12px ${color}18` } : {}}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-[#2d2418] text-sm">{item.activity}</h4>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span
                    className="text-[10px] font-sans px-2.5 py-0.5 rounded-full"
                    style={{ color, backgroundColor: color + '20', border: `1px solid ${color}40` }}
                  >
                    {item.frequency}
                  </span>
                  <span
                    className="text-[10px] transition-transform duration-200"
                    style={{ color, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
                  >
                    ▾
                  </span>
                </div>
              </div>
              {isOpen && (
                <p className="text-xs font-sans text-[#5c4d33] leading-relaxed mt-3 pt-3 border-t border-[#e8dcc8]">
                  {item.details}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Avoid */}
      <div className="bg-white rounded-2xl border border-[#e8dcc8] p-5 mb-6">
        <h3 className="font-serif text-[#2d2418] text-base mb-4">Avoid</h3>
        <div className="flex flex-wrap gap-1.5">
          {data.avoid.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-sans border"
              style={{ backgroundColor: '#F5E6D5', color: '#6A2E10', borderColor: '#D8A870' }}
            >
              <span style={{ color: '#C06830', fontWeight: 700, fontSize: '10px' }}>×</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Yoga & Pranayama */}
      {data.yogaPranayama && (
        <div className="bg-white rounded-2xl border border-[#e8dcc8] p-5">
          <h3 className="font-serif text-[#2d2418] text-base mb-4">Yoga & Pranayama</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-sans text-[#9c8660] uppercase tracking-widest mb-2">Asanas</p>
              <div className="flex flex-wrap gap-1.5">
                {data.yogaPranayama.asanas.map((a) => (
                  <span key={a} className="text-xs font-sans px-3 py-1 rounded-full bg-[#f3ede0] text-[#5c4d33] border border-[#e8dcc8]">{a}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-sans text-[#9c8660] uppercase tracking-widest mb-2">Pranayama</p>
              <div className="flex flex-wrap gap-1.5">
                {data.yogaPranayama.pranayama.map((p) => (
                  <span key={p} className="text-xs font-sans px-3 py-1 rounded-full bg-[#f3ede0] text-[#5c4d33] border border-[#e8dcc8]">{p}</span>
                ))}
              </div>
            </div>
            {data.yogaPranayama.avoid && (
              <div>
                <p className="text-[10px] font-sans uppercase tracking-widest mb-2" style={{ color: '#C06830' }}>Avoid</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.yogaPranayama.avoid.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-sans border"
                      style={{ backgroundColor: '#F5E6D5', color: '#6A2E10', borderColor: '#D8A870' }}
                    >
                      <span style={{ color: '#C06830', fontWeight: 700 }}>×</span> {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
