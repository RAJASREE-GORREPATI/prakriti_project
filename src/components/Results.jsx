import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import doshaProfiles from '../data/dosha_profiles.json';
import { calculatePrakriti, DOSHA_COLORS } from '../utils/doshaUtils';

const DOSHA_LABELS = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' };

function CustomLabel({ cx, cy, dominant, prakritiType }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} dy="-8" className="font-serif" fontSize="22" fill="#2d2418" fontFamily="Georgia, serif">
        {DOSHA_LABELS[dominant] || 'Sama'}
      </tspan>
      <tspan x={cx} dy="22" fontSize="10" fill="#9c8660" fontFamily="sans-serif" letterSpacing="2">
        {prakritiType === 'tridoshic' ? 'TRIDOSHIC' : prakritiType === 'dual' ? 'DUAL DOSHA' : 'DOMINANT'}
      </tspan>
    </text>
  );
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-white border border-[#e8dcc8] rounded-xl px-4 py-2 text-sm font-sans shadow-sm">
        <span className="text-[#2d2418] font-medium">{DOSHA_LABELS[name]}</span>
        <span className="text-[#9c8660] ml-2">{value}%</span>
      </div>
    );
  }
  return null;
}

export default function Results({ scores, onViewGuide, onRetake, onCoach }) {
  const prakriti = calculatePrakriti(scores);
  if (!prakriti) return null;

  const { dominant, dual, type, percentages } = prakriti;

  const profile =
    type === 'tridoshic'
      ? doshaProfiles.tridoshic
      : type === 'dual'
      ? doshaProfiles.dualDoshaProfiles[`${dominant}-${dual}`] ||
        doshaProfiles.doshaProfiles[dominant]
      : doshaProfiles.doshaProfiles[dominant];

  const primaryProfile = doshaProfiles.doshaProfiles[dominant];

  const chartData = Object.entries(percentages).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  const dominantColor = DOSHA_COLORS[dominant];

  return (
    <div className="min-h-screen bg-[#faf7f2] px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#9c8660] text-xs font-sans uppercase tracking-widest mb-3">
            Your Prakriti
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#2d2418] mb-2">
            {type === 'tridoshic'
              ? 'Tridoshic'
              : type === 'dual'
              ? `${DOSHA_LABELS[dominant]}-${DOSHA_LABELS[dual]}`
              : DOSHA_LABELS[dominant]}
          </h1>
          <p className="text-[#9c8660] text-sm font-sans">
            {type === 'tridoshic' ? 'Sama Prakriti' : type === 'dual' ? 'Dual Dosha Constitution' : 'Dominant Dosha Constitution'}
          </p>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-3xl border border-[#e8dcc8] p-8 mb-6">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={DOSHA_COLORS[entry.name]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-2">
            {chartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: DOSHA_COLORS[entry.name] }}
                />
                <span className="text-xs font-sans text-[#5c4d33]">
                  {DOSHA_LABELS[entry.name]} {entry.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div
          className="rounded-3xl border p-7 mb-5"
          style={{ backgroundColor: DOSHA_COLORS[dominant] + '18', borderColor: DOSHA_COLORS[dominant] + '50' }}
        >
          <p className="font-sans text-[#5c4d33] leading-relaxed text-sm">{profile.summary}</p>
          {type === 'dual' && profile.balancingFocus && (
            <p className="font-sans text-[#9c8660] text-xs mt-3 italic">
              Balancing focus: {profile.balancingFocus}
            </p>
          )}
        </div>

        {/* Key traits grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#e8dcc8] p-6">
            <h3 className="font-serif text-[#2d2418] text-base mb-3">Physical Traits</h3>
            <ul className="space-y-1.5">
              {primaryProfile.physicalTraits.map((t, i) => (
                <li key={i} className="text-xs font-sans text-[#5c4d33] flex gap-2">
                  <span style={{ color: dominantColor }}>·</span> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-[#e8dcc8] p-6">
            <h3 className="font-serif text-[#2d2418] text-base mb-3">Mental Traits</h3>
            <ul className="space-y-1.5">
              {primaryProfile.mentalTraits.map((t, i) => (
                <li key={i} className="text-xs font-sans text-[#5c4d33] flex gap-2">
                  <span style={{ color: dominantColor }}>·</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Balanced / Imbalanced */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-[#e8dcc8] p-6">
            <h3 className="font-serif text-[#2d2418] text-base mb-3">When Balanced</h3>
            <p className="text-xs font-sans text-[#5c4d33] leading-relaxed">
              {primaryProfile.balancedState}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#e8dcc8] p-6">
            <h3 className="font-serif text-[#2d2418] text-base mb-3">Signs of Imbalance</h3>
            <ul className="space-y-1.5">
              {primaryProfile.imbalancedSigns.slice(0, 5).map((s, i) => (
                <li key={i} className="text-xs font-sans text-[#5c4d33] flex gap-2">
                  <span className="text-[#c0704a]">·</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Elements & Qualities */}
        <div className="bg-white rounded-2xl border border-[#e8dcc8] p-6 mb-8">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] text-[#9c8660] font-sans uppercase tracking-widest mb-2">Elements</p>
              <div className="flex gap-2">
                {primaryProfile.elements.map((el) => (
                  <span
                    key={el}
                    className="text-xs font-sans px-3 py-1 rounded-full border"
                    style={{ color: dominantColor, borderColor: dominantColor + '50', backgroundColor: dominantColor + '15' }}
                  >
                    {el}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-[#9c8660] font-sans uppercase tracking-widest mb-2">Qualities</p>
              <div className="flex flex-wrap gap-1.5">
                {primaryProfile.qualities.map((q) => (
                  <span key={q} className="text-xs font-sans px-3 py-1 rounded-full bg-[#f3ede0] text-[#5c4d33] border border-[#e8dcc8]">
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onViewGuide}
            className="flex-1 bg-[#2d2418] text-[#faf7f2] py-4 rounded-full text-xs font-sans uppercase tracking-widest hover:bg-[#5c4d33] transition-colors cursor-pointer"
          >
            View Lifestyle Guide →
          </button>
          <button
            onClick={onCoach}
            className="flex-1 bg-[#c0704a] text-white py-4 rounded-full text-xs font-sans uppercase tracking-widest hover:bg-[#a85e3d] transition-colors cursor-pointer"
          >
            PRAKRITI AI 🌿🤖
          </button>
          <button
            onClick={onRetake}
            className="flex-1 border border-[#d4c4a8] text-[#5c4d33] py-4 rounded-full text-xs font-sans uppercase tracking-widest hover:border-[#9c8660] transition-colors cursor-pointer"
          >
            Retake
          </button>
        </div>
      </div>
    </div>
  );
}
