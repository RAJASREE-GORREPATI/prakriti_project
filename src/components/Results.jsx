import { useState, useEffect } from 'react';
import doshaProfiles from '../data/dosha_profiles.json';
import { calculatePrakriti, DOSHA_COLORS } from '../utils/doshaUtils';

const DOSHA_LABELS = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' };

function ConstitutionBars({ percentages }) {
  const [pct, setPct] = useState({ vata: 0, pitta: 0, kapha: 0 });

  useEffect(() => {
    let frame = 0;
    const steps = 55;
    const timer = setInterval(() => {
      frame++;
      const eased = 1 - Math.pow(1 - frame / steps, 3);
      setPct({
        vata: percentages.vata * eased,
        pitta: percentages.pitta * eased,
        kapha: percentages.kapha * eased,
      });
      if (frame >= steps) clearInterval(timer);
    }, 1200 / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-5">
      {Object.entries(percentages).map(([key, target]) => {
        const color = DOSHA_COLORS[key];
        const displayed = pct[key];
        return (
          <div key={key}>
            <div className="flex justify-between items-baseline mb-2">
              <span
                className="font-serif italic text-lg leading-none"
                style={{ color }}
              >
                {DOSHA_LABELS[key]}
              </span>
              <span
                className="text-2xl font-serif leading-none tabular-nums"
                style={{ color }}
              >
                {Math.round(displayed)}%
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: color + '22' }}>
              <div
                className="h-3 rounded-full"
                style={{ width: `${displayed}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
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
  const dominantColor = DOSHA_COLORS[dominant];

  const prakritiTitle =
    type === 'tridoshic'
      ? 'Tridoshic'
      : type === 'dual'
      ? `${DOSHA_LABELS[dominant]}-${DOSHA_LABELS[dual]}`
      : DOSHA_LABELS[dominant];

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-12">

      {/* Gradient hero header */}
      <div
        className="px-6 pt-14 pb-10 text-center"
        style={{ background: `linear-gradient(180deg, ${dominantColor}22 0%, ${dominantColor}08 60%, transparent 100%)` }}
      >
        <p className="text-[#9c8660] text-xs font-sans uppercase tracking-widest mb-4">
          Your Prakriti
        </p>
        <h1
          className="font-serif text-[#2d2418] mb-2 leading-none"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 4.5rem)' }}
        >
          {prakritiTitle}
        </h1>
        <p className="text-[#9c8660] text-sm font-sans">
          {type === 'tridoshic'
            ? 'Sama Prakriti'
            : type === 'dual'
            ? 'Dual Dosha Constitution'
            : 'Dominant Dosha Constitution'}
        </p>

        <div className="flex items-center gap-4 justify-center mt-6 max-w-xs mx-auto">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${dominantColor}60)` }} />
          <span className="text-base leading-none" style={{ color: dominantColor }}>✦</span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${dominantColor}60)` }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6">

        {/* Constitution bars */}
        <div className="bg-white rounded-3xl border border-[#e8dcc8] p-8 mb-6" style={{ boxShadow: '0 2px 20px rgba(45,36,24,0.06)' }}>
          <p className="text-[10px] font-sans text-[#9c8660] uppercase tracking-widest mb-6">
            Constitution Breakdown
          </p>
          <ConstitutionBars percentages={percentages} />
        </div>

        {/* Summary */}
        <div
          className="rounded-3xl border p-7 mb-5"
          style={{
            backgroundColor: dominantColor + '14',
            borderColor: dominantColor + '45',
            borderLeftColor: dominantColor,
            borderLeftWidth: '3px',
          }}
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
          <div
            className="bg-white rounded-2xl border border-[#e8dcc8] p-6"
            style={{ borderLeftColor: dominantColor, borderLeftWidth: '3px' }}
          >
            <h3 className="font-serif text-[#2d2418] text-base mb-3">Physical Traits</h3>
            <ul className="space-y-1.5">
              {primaryProfile.physicalTraits.map((t, i) => (
                <li key={i} className="text-xs font-sans text-[#5c4d33] flex gap-2">
                  <span style={{ color: dominantColor }}>·</span> {t}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="bg-white rounded-2xl border border-[#e8dcc8] p-6"
            style={{ borderLeftColor: dominantColor, borderLeftWidth: '3px' }}
          >
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
          <div
            className="bg-white rounded-2xl border border-[#e8dcc8] p-6"
            style={{ borderLeftColor: '#3A7A50', borderLeftWidth: '3px' }}
          >
            <h3 className="font-serif text-[#2d2418] text-base mb-3">When Balanced</h3>
            <p className="text-xs font-sans text-[#5c4d33] leading-relaxed">{primaryProfile.balancedState}</p>
          </div>
          <div
            className="bg-white rounded-2xl border border-[#e8dcc8] p-6"
            style={{ borderLeftColor: '#C06830', borderLeftWidth: '3px' }}
          >
            <h3 className="font-serif text-[#2d2418] text-base mb-3">Signs of Imbalance</h3>
            <ul className="space-y-1.5">
              {primaryProfile.imbalancedSigns.slice(0, 5).map((s, i) => (
                <li key={i} className="text-xs font-sans text-[#5c4d33] flex gap-2">
                  <span className="text-[#C06830]">·</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Elements & Qualities */}
        <div className="bg-white rounded-2xl border border-[#e8dcc8] p-6 mb-8" style={{ boxShadow: '0 2px 12px rgba(45,36,24,0.05)' }}>
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
            className="flex-1 py-4 rounded-full text-xs font-sans uppercase tracking-widest text-[#faf7f2] transition-all cursor-pointer"
            style={{ backgroundColor: '#2d2418', boxShadow: '0 4px 18px rgba(45,36,24,0.28)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(45,36,24,0.42)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 18px rgba(45,36,24,0.28)'}
          >
            View Lifestyle Guide →
          </button>
          <button
            onClick={onCoach}
            className="flex-1 py-4 rounded-full text-xs font-sans uppercase tracking-widest text-white transition-all cursor-pointer"
            style={{ backgroundColor: '#C06830', boxShadow: '0 4px 18px rgba(192,104,48,0.32)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(192,104,48,0.48)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 18px rgba(192,104,48,0.32)'}
          >
            Prakriti AI Coach
          </button>
          <button
            onClick={onRetake}
            className="flex-1 border border-[#d4c4a8] text-[#5c4d33] py-4 rounded-full text-xs font-sans uppercase tracking-widest hover:border-[#9c8660] hover:bg-[#f3ede0] transition-all cursor-pointer"
          >
            Retake
          </button>
        </div>
      </div>
    </div>
  );
}
