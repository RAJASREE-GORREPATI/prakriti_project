export default function Intro({ onStart, onCoach }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-2xl mx-auto">
        <p className="text-[#9c8660] tracking-[0.35em] uppercase text-xs font-sans mb-6">
          Ayurveda · Prakriti Assessment
        </p>

        <h1 className="text-5xl md:text-6xl font-serif text-[#2d2418] leading-tight mb-4">
          Know Your
        </h1>
        <h1 className="text-5xl md:text-6xl font-serif italic text-[#c0704a] leading-tight mb-8">
          Dosha
        </h1>

        <p className="text-[#5c4d33] text-base md:text-lg leading-relaxed mb-3 font-sans max-w-lg mx-auto">
          Your <strong>Prakriti</strong> is the unique combination of the three biological energies
          that shape your body, mind, and behaviour from birth.
        </p>
        <p className="text-[#9c8660] text-sm leading-relaxed mb-12 font-sans max-w-md mx-auto">
          Answer 35 honest questions and receive a personalised lifestyle guide rooted in classical Ayurveda.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-12 max-w-sm mx-auto">
          {[
            { name: 'Vata', sub: 'Air · Space', color: '#7c9eb2', bg: '#eef4f8' },
            { name: 'Pitta', sub: 'Fire · Water', color: '#c0704a', bg: '#f9ede6' },
            { name: 'Kapha', sub: 'Water · Earth', color: '#6b8f71', bg: '#edf3ee' },
          ].map((d) => (
            <div
              key={d.name}
              className="rounded-2xl p-4 text-center border"
              style={{ backgroundColor: d.bg, borderColor: d.color + '40' }}
            >
              <div
                className="w-8 h-8 rounded-full mx-auto mb-2"
                style={{ backgroundColor: d.color }}
              />
              <p className="font-serif text-[#2d2418] text-sm font-medium">{d.name}</p>
              <p className="text-[10px] text-[#9c8660] font-sans mt-0.5">{d.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="bg-[#2d2418] text-[#faf7f2] px-10 py-4 rounded-full text-sm font-sans font-medium tracking-widest uppercase hover:bg-[#5c4d33] transition-colors duration-200 cursor-pointer"
          >
            Begin Assessment
          </button>
          <button
            onClick={onCoach}
            className="border border-[#d4c4a8] text-[#5c4d33] px-8 py-4 rounded-full text-sm font-sans font-medium tracking-widest uppercase hover:border-[#9c8660] hover:bg-[#f3ede0] transition-colors duration-200 cursor-pointer"
          >
            Prakriti AI 🌿🤖
          </button>
        </div>

        <p className="text-[#9c8660] text-xs font-sans mt-5">
          35 questions · 10–15 minutes · No sign-up required
        </p>
      </div>
    </div>
  );
}
