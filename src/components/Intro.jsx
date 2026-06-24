const DOSHAS = [
  {
    name: 'Vata',
    sub: 'Air · Space',
    color: '#4A78A8',
    bg: 'linear-gradient(145deg, #C8DCF0 0%, #E0EAF6 100%)',
    border: '#80B0D8',
    symbol: '✦',
    quality: 'Movement',
  },
  {
    name: 'Pitta',
    sub: 'Fire · Water',
    color: '#C06830',
    bg: 'linear-gradient(145deg, #F0CBB0 0%, #F5E6D5 100%)',
    border: '#D8A870',
    symbol: '◆',
    quality: 'Transformation',
  },
  {
    name: 'Kapha',
    sub: 'Water · Earth',
    color: '#3A7A50',
    bg: 'linear-gradient(145deg, #A8D8BC 0%, #DAF0E3 100%)',
    border: '#68B882',
    symbol: '●',
    quality: 'Stability',
  },
];

export default function Intro({ onStart, onCoach }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-2xl mx-auto">

        <p className="text-[#9c8660] tracking-[0.4em] uppercase text-[11px] font-sans mb-8">
          Ayurveda · Prakriti Assessment
        </p>

        <h1 className="font-serif text-[#2d2418] leading-none mb-1" style={{ fontSize: 'clamp(3.5rem, 10vw, 5.5rem)' }}>
          Know Your
        </h1>
        <h1 className="font-serif italic text-[#C06830] leading-none mb-6" style={{ fontSize: 'clamp(3.5rem, 10vw, 5.5rem)' }}>
          Dosha
        </h1>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 justify-center mb-8 max-w-xs mx-auto">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #d4c4a8)' }} />
          <span className="text-[#C06830] text-base leading-none select-none">✦</span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #d4c4a8)' }} />
        </div>

        <p className="text-[#5c4d33] text-base md:text-lg leading-relaxed mb-3 font-sans max-w-lg mx-auto">
          Your <strong>Prakriti</strong> is the unique combination of the three biological energies
          that shape your body, mind, and behaviour from birth.
        </p>
        <p className="text-[#9c8660] text-sm leading-relaxed mb-10 font-sans max-w-md mx-auto">
          Answer 35 honest questions and receive a personalised lifestyle guide rooted in classical Ayurveda.
        </p>

        {/* Dosha cards */}
        <div className="grid grid-cols-3 gap-3 mb-12 max-w-sm mx-auto">
          {DOSHAS.map((d) => (
            <div
              key={d.name}
              className="rounded-2xl p-4 text-center border"
              style={{ background: d.bg, borderColor: d.border }}
            >
              <div
                className="text-xl leading-none mb-2 font-serif"
                style={{ color: d.color }}
              >
                {d.symbol}
              </div>
              <p className="font-serif text-[#2d2418] text-sm font-medium">{d.name}</p>
              <p className="text-[10px] text-[#9c8660] font-sans mt-0.5">{d.sub}</p>
              <p
                className="text-[9px] font-sans mt-1.5 tracking-wider uppercase"
                style={{ color: d.color + 'cc' }}
              >
                {d.quality}
              </p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="bg-[#2d2418] text-[#faf7f2] px-10 py-4 rounded-full text-sm font-sans font-medium tracking-widest uppercase transition-all duration-200 cursor-pointer"
            style={{ boxShadow: '0 4px 20px rgba(45,36,24,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(45,36,24,0.38)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(45,36,24,0.25)'}
          >
            Begin Assessment
          </button>
          <button
            onClick={onCoach}
            className="border border-[#d4c4a8] text-[#5c4d33] px-8 py-4 rounded-full text-sm font-sans font-medium tracking-widest uppercase hover:border-[#9c8660] hover:bg-[#f3ede0] transition-all duration-200 cursor-pointer"
          >
            Prakriti AI Coach
          </button>
        </div>

        <p className="text-[#9c8660] text-xs font-sans mt-6 tracking-wide">
          35 questions · 10–15 minutes · No sign-up required
        </p>

      </div>
    </div>
  );
}
