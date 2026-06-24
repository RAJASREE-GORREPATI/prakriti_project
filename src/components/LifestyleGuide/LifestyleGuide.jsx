import { useState } from 'react';
import { calculatePrakriti, DOSHA_COLORS } from '../../utils/doshaUtils';
import { generateLifestyleGuidePDF } from '../../utils/generatePDF';
import DincharyaTab from './DincharyaTab';
import RitucharyaTab from './RitucharyaTab';
import DietTab from './DietTab';
import ExerciseTab from './ExerciseTab';

const TABS = [
  { id: 'dincharya', label: 'Daily Routine', sub: 'Dincharya' },
  { id: 'ritucharya', label: 'Seasonal', sub: 'Ritucharya' },
  { id: 'diet', label: 'Diet', sub: 'Ahara' },
  { id: 'exercise', label: 'Exercise', sub: 'Vyayama' },
];

const DOSHA_LABELS = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' };

export default function LifestyleGuide({ scores, onBack, onCoach }) {
  const [activeTab, setActiveTab] = useState('dincharya');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (dominant, dual, type, percentages) => {
    setDownloading(true);
    try {
      await generateLifestyleGuidePDF(dominant, dual, type, percentages);
    } finally {
      setDownloading(false);
    }
  };
  const prakriti = calculatePrakriti(scores);
  if (!prakriti) return null;

  const { dominant, dual, type, percentages } = prakriti;
  const color = DOSHA_COLORS[dominant];

  const prakritiLabel =
    type === 'tridoshic'
      ? 'Tridoshic'
      : type === 'dual'
      ? `${DOSHA_LABELS[dominant]}-${DOSHA_LABELS[dual]}`
      : DOSHA_LABELS[dominant];

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#faf7f2]/95 backdrop-blur-sm border-b border-[#e8dcc8]" style={{ boxShadow: '0 1px 12px rgba(45,36,24,0.06)' }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="text-xs font-sans text-[#9c8660] hover:text-[#5c4d33] transition-colors cursor-pointer flex-shrink-0"
          >
            ← Results
          </button>
          <div className="text-center">
            <p className="text-[10px] font-sans text-[#9c8660] uppercase tracking-widest">Lifestyle Guide</p>
            <p className="font-serif text-[#2d2418] text-sm">{prakritiLabel}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleDownload(dominant, dual, type, percentages)}
              disabled={downloading}
              title="Download PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sans uppercase tracking-wider border border-[#d4c4a8] text-[#5c4d33] hover:border-[#9c8660] hover:bg-[#f3ede0] transition-all cursor-pointer disabled:opacity-50"
            >
              {downloading ? '…' : '↓'} PDF
            </button>
            <button
              onClick={onCoach}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-sans uppercase tracking-wider bg-[#C06830] text-white hover:bg-[#a85e3d] transition-all cursor-pointer"
            >
              Coach
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-2xl mx-auto px-3 pb-2 flex gap-1 border-t border-[#e8dcc8] pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 text-center transition-all duration-200 cursor-pointer rounded-full"
              style={
                activeTab === tab.id
                  ? {
                      backgroundColor: color + '22',
                      color: color,
                      boxShadow: `0 1px 6px ${color}28`,
                    }
                  : { color: '#9c8660' }
              }
              onMouseEnter={e => {
                if (activeTab !== tab.id) e.currentTarget.style.color = '#5c4d33';
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.id) e.currentTarget.style.color = '#9c8660';
              }}
            >
              <p className="text-[10px] font-sans font-medium uppercase tracking-widest">
                {tab.label}
              </p>
              <p
                className="text-[9px] font-sans italic hidden sm:block"
                style={{ color: activeTab === tab.id ? color + 'aa' : '#9c8660' }}
              >
                {tab.sub}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Herb & practitioner warning */}
        <div className="mb-6 rounded-2xl border border-[#e8b49a] bg-[#fdf6f2] px-5 py-4 flex gap-3">
          <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="text-xs font-sans font-semibold text-[#7a3a1e] mb-1 uppercase tracking-wide">
              Please read before starting any herbal practice
            </p>
            <p className="text-xs font-sans text-[#5c4d33] leading-relaxed">
              The recommendations in this guide are for general educational purposes only and are not a substitute for professional medical advice.{' '}
              <strong>Consult a qualified Ayurvedic practitioner before beginning any herbal protocol</strong>, especially if you are pregnant, nursing, on medication, or managing a health condition.
              The key principles are <strong>moderation</strong> and <strong>body awareness</strong> — observe how your body responds and adjust accordingly.
            </p>
          </div>
        </div>

        {type === 'dual' && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-white border border-[#e8dcc8] text-xs font-sans text-[#9c8660]">
            Showing recommendations for your primary dosha <strong className="text-[#2d2418]">{DOSHA_LABELS[dominant]}</strong>.
            Your secondary dosha is <strong className="text-[#2d2418]">{DOSHA_LABELS[dual]}</strong> — refer to its guide for supplementary practices.
          </div>
        )}

        {activeTab === 'dincharya' && <DincharyaTab dominant={dominant} />}
        {activeTab === 'ritucharya' && <RitucharyaTab dominant={dominant} />}
        {activeTab === 'diet' && <DietTab dominant={dominant} />}
        {activeTab === 'exercise' && <ExerciseTab dominant={dominant} />}
      </div>
    </div>
  );
}
