import dincharyaData from '../../data/dincharya.json';
import { DOSHA_COLORS } from '../../utils/doshaUtils';

function parseHour(timeStr) {
  if (!timeStr) return 6;
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 6;
  let h = parseInt(m[1]);
  const period = m[3].toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h;
}

function getSection(timeStr) {
  const h = parseHour(timeStr);
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 20) return 'Evening';
  return 'Night';
}

const SECTION_META = {
  Morning:   { label: 'Morning',   range: '6 AM – 12 PM',  symbol: '◎' },
  Afternoon: { label: 'Afternoon', range: '12 PM – 5 PM',  symbol: '◑' },
  Evening:   { label: 'Evening',   range: '5 PM – 8 PM',   symbol: '◐' },
  Night:     { label: 'Night',     range: '8 PM+',         symbol: '●' },
};

export default function DincharyaTab({ dominant }) {
  const data = dincharyaData.dincharya[dominant];
  if (!data) return null;

  const color = DOSHA_COLORS[dominant];

  // Group routine items by time-of-day section
  const grouped = [];
  let lastSection = null;
  data.routine.forEach((item) => {
    const section = getSection(item.time);
    if (section !== lastSection) {
      grouped.push({ section, items: [] });
      lastSection = section;
    }
    grouped[grouped.length - 1].items.push(item);
  });

  return (
    <div>
      <div
        className="rounded-2xl px-6 py-4 mb-8 border"
        style={{ backgroundColor: color + '15', borderColor: color + '40' }}
      >
        <p className="text-sm font-sans text-[#5c4d33] italic">{data.theme}</p>
      </div>

      <div className="space-y-8">
        {grouped.map(({ section, items }) => {
          const meta = SECTION_META[section];
          return (
            <div key={section}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-base leading-none" style={{ color }}>{meta.symbol}</span>
                <div>
                  <span className="text-xs font-sans font-semibold text-[#2d2418] uppercase tracking-widest">{meta.label}</span>
                  <span className="text-[10px] font-sans text-[#9c8660] ml-2">{meta.range}</span>
                </div>
                <div className="flex-1 h-px" style={{ backgroundColor: color + '30' }} />
              </div>

              {/* Timeline items in this section */}
              <div className="relative">
                <div
                  className="absolute left-[60px] top-0 bottom-0 w-px"
                  style={{ backgroundColor: color + '28' }}
                />
                <div className="space-y-6">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-6 relative">
                      <div className="w-[52px] flex-shrink-0 text-right">
                        <span className="text-[10px] font-sans text-[#9c8660] leading-none">{item.time}</span>
                      </div>
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-3 h-3 rounded-full mt-1 border-2 bg-[#faf7f2]"
                          style={{ borderColor: color }}
                        />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-baseline gap-3 mb-1">
                          <h3 className="font-serif text-[#2d2418] text-base">{item.activity}</h3>
                          {item.duration && (
                            <span className="text-[10px] font-sans text-[#9c8660] bg-[#f3ede0] px-2 py-0.5 rounded-full border border-[#e8dcc8]">
                              {item.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-sans text-[#5c4d33] leading-relaxed">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
