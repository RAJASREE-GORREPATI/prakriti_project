import { useState } from 'react';
import questionsData from '../data/dosha_questions.json';

const CATEGORY_LABELS = {
  physical: 'Physical Traits',
  physiological: 'Physiological Traits',
  mental: 'Mental Traits',
  behavioral: 'Behavioral Patterns',
  emotional: 'Emotional Tendencies',
};

const CATEGORY_SHORT = {
  physical: 'Body',
  physiological: 'Health',
  mental: 'Mind',
  behavioral: 'Habits',
  emotional: 'Feelings',
};

// Sort questions so all questions of each category are grouped together,
// preserving the natural first-appearance order of categories.
const questions = (() => {
  const raw = questionsData.questions;
  const catOrder = [];
  const seen = new Set();
  raw.forEach(q => { if (!seen.has(q.category)) { catOrder.push(q.category); seen.add(q.category); } });
  return [...raw].sort((a, b) => catOrder.indexOf(a.category) - catOrder.indexOf(b.category));
})();

const categoryOrder = (() => {
  const seen = new Set();
  const order = [];
  questions.forEach(q => {
    if (!seen.has(q.category)) { seen.add(q.category); order.push(q.category); }
  });
  return order;
})();

export default function Quiz({ onComplete, onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);

  const question = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const isLast = current === questions.length - 1;
  const currentCatIndex = categoryOrder.indexOf(question.category);

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [question.id]: selected };
    setAnswers(newAnswers);
    if (isLast) {
      const scores = { vata: 0, pitta: 0, kapha: 0 };
      Object.values(newAnswers).forEach(({ dosha, score }) => { if (dosha in scores) scores[dosha] += score; });
      onComplete(scores);
    } else {
      const nextQ = questions[current + 1];
      setSelected(newAnswers[nextQ.id] || null);
      setCurrent(current + 1);
    }
  };

  const handleBack = () => {
    if (current === 0) { onBack(); return; }
    const prevQ = questions[current - 1];
    setSelected(answers[prevQ.id] || null);
    setCurrent(current - 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2]">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#faf7f2]/95 backdrop-blur-sm border-b border-[#e8dcc8]">
        <div className="max-w-xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-[#9c8660] font-sans uppercase tracking-widest">
              {CATEGORY_LABELS[question.category]}
            </span>
            <span className="text-[10px] text-[#9c8660] font-sans font-medium">
              {current + 1}&nbsp;/&nbsp;{questions.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#e8dcc8] rounded-full overflow-hidden mb-4">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #C06830 0%, #D4845F 100%)',
                boxShadow: '0 0 8px rgba(192,104,48,0.4)',
              }}
            />
          </div>

          {/* Category stepper */}
          <div className="flex items-center gap-0">
            {categoryOrder.map((cat, i) => {
              const isDone = i < currentCatIndex;
              const isActive = i === currentCatIndex;
              const isPending = i > currentCatIndex;
              return (
                <div key={cat} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-sans font-bold border-2 transition-all duration-300"
                      style={
                        isDone
                          ? { backgroundColor: '#C06830', borderColor: '#C06830', color: 'white' }
                          : isActive
                          ? { backgroundColor: 'white', borderColor: '#C06830', color: '#C06830' }
                          : { backgroundColor: 'white', borderColor: '#d4c4a8', color: '#d4c4a8' }
                      }
                    >
                      {isDone ? '✓' : i + 1}
                    </div>
                    <span
                      className="text-[8px] font-sans uppercase tracking-wide hidden sm:block"
                      style={{ color: isPending ? '#d4c4a8' : isActive ? '#C06830' : '#9c8660' }}
                    >
                      {CATEGORY_SHORT[cat]}
                    </span>
                  </div>
                  {i < categoryOrder.length - 1 && (
                    <div
                      className="flex-1 h-px mx-1 transition-all duration-300"
                      style={{ backgroundColor: isDone ? '#C06830' : '#e8dcc8' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question body */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full">
          <p className="text-[#9c8660] text-xs font-sans uppercase tracking-widest mb-4">
            Question {current + 1}
          </p>
          <h2 className="text-2xl md:text-3xl font-serif text-[#2d2418] leading-snug mb-8">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, i) => {
              const isActive = selected?.dosha === option.dosha;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(option)}
                  className="w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-150 font-sans text-sm leading-relaxed cursor-pointer flex items-center gap-3"
                  style={
                    isActive
                      ? { borderColor: '#C06830', backgroundColor: '#F5E0D0', color: '#2d2418', boxShadow: '0 2px 12px rgba(192,104,48,0.18)' }
                      : { borderColor: '#e8dcc8', backgroundColor: '#ffffff', color: '#5c4d33' }
                  }
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = '#d4c4a8'; e.currentTarget.style.backgroundColor = '#fdf9f5'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = '#e8dcc8'; e.currentTarget.style.backgroundColor = '#ffffff'; } }}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={isActive ? { borderColor: '#C06830', backgroundColor: '#C06830' } : { borderColor: '#d4c4a8', backgroundColor: '#ffffff' }}
                  >
                    {isActive && <span className="text-white text-[10px] leading-none font-bold">✓</span>}
                  </span>
                  {option.text}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between mt-10">
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-full text-xs font-sans uppercase tracking-widest text-[#9c8660] border border-[#d4c4a8] hover:border-[#9c8660] hover:text-[#5c4d33] transition-all cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!selected}
              className="px-8 py-3 rounded-full text-xs font-sans uppercase tracking-widest text-[#faf7f2] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: '#2d2418', boxShadow: selected ? '0 4px 16px rgba(45,36,24,0.25)' : 'none' }}
              onMouseEnter={e => { if (selected) e.currentTarget.style.boxShadow = '0 6px 22px rgba(45,36,24,0.38)'; }}
              onMouseLeave={e => { if (selected) e.currentTarget.style.boxShadow = '0 4px 16px rgba(45,36,24,0.25)'; }}
            >
              {isLast ? 'See Results' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
