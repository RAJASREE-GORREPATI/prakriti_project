import { useState } from 'react';
import dietData from '../../data/diet_recommendations.json';
import { DOSHA_COLORS } from '../../utils/doshaUtils';

const CATEGORY_LABELS = {
  grains: 'Grains',
  legumes: 'Legumes',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  dairy: 'Dairy',
  oils: 'Oils & Fats',
  sweeteners: 'Sweeteners',
  nuts: 'Nuts & Seeds',
  spices: 'Spices',
  meats: 'Meats',
  beverages: 'Beverages',
};

const FAVOR_STYLE = {
  bg: '#DAF0E3',
  text: '#1E5A36',
  border: '#68B882',
  tick: '#3A7A50',
  label: '#3A7A50',
};

const AVOID_STYLE = {
  bg: '#F5E6D5',
  text: '#6A2E10',
  border: '#D8A870',
  tick: '#C06830',
  label: '#C06830',
};

export default function DietTab({ dominant }) {
  const data = dietData.dietRecommendations[dominant];
  if (!data) return null;

  const color = DOSHA_COLORS[dominant];
  const categories = Object.keys(data.foodCategories);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const catData = data.foodCategories[activeCategory];

  return (
    <div>
      {/* General principles */}
      <div
        className="rounded-2xl px-6 py-4 mb-6 border"
        style={{ backgroundColor: color + '15', borderColor: color + '40' }}
      >
        <p className="text-sm font-sans text-[#5c4d33] leading-relaxed">{data.generalPrinciples}</p>
      </div>

      {/* Tastes */}
      <div className="bg-white rounded-2xl border border-[#e8dcc8] p-5 mb-6">
        <h3 className="font-serif text-[#2d2418] text-base mb-4">Tastes (Rasa)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-widest mb-2" style={{ color: FAVOR_STYLE.label }}>Favour</p>
            <div className="flex flex-wrap gap-1.5">
              {data.tastes.favor.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sans border"
                  style={{ backgroundColor: FAVOR_STYLE.bg, color: FAVOR_STYLE.text, borderColor: FAVOR_STYLE.border }}
                >
                  <span style={{ color: FAVOR_STYLE.tick, fontWeight: 700 }}>✓</span> {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-sans uppercase tracking-widest mb-2" style={{ color: AVOID_STYLE.label }}>Reduce</p>
            <div className="flex flex-wrap gap-1.5">
              {data.tastes.reduce.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sans border"
                  style={{ backgroundColor: AVOID_STYLE.bg, color: AVOID_STYLE.text, borderColor: AVOID_STYLE.border }}
                >
                  <span style={{ color: AVOID_STYLE.tick, fontWeight: 700 }}>×</span> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Meal guidelines */}
      <div className="bg-white rounded-2xl border border-[#e8dcc8] p-5 mb-6">
        <h3 className="font-serif text-[#2d2418] text-base mb-4">Meal Guidelines</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {Object.entries(data.mealGuidelines).map(([meal, desc]) => (
            <div key={meal} className="flex gap-3">
              <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: color, minHeight: '16px' }} />
              <div>
                <p className="text-[10px] font-sans text-[#9c8660] uppercase tracking-widest mb-0.5 capitalize">{meal}</p>
                <p className="text-xs font-sans text-[#5c4d33] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Food categories */}
      <div className="bg-white rounded-2xl border border-[#e8dcc8] overflow-hidden">
        {/* Category tab pills */}
        <div className="border-b border-[#e8dcc8] px-5 py-3 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-sans uppercase tracking-wider transition-all cursor-pointer"
              style={
                activeCategory === cat
                  ? { backgroundColor: color, color: 'white' }
                  : { backgroundColor: '#f3ede0', color: '#5c4d33' }
              }
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {catData && (
          <div className="grid grid-cols-2 gap-0 divide-x divide-[#e8dcc8]">
            {/* Favor */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FAVOR_STYLE.tick }} />
                <p className="text-[10px] font-sans uppercase tracking-widest" style={{ color: FAVOR_STYLE.label }}>Favour</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {catData.favor?.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-sans border"
                    style={{ backgroundColor: FAVOR_STYLE.bg, color: FAVOR_STYLE.text, borderColor: FAVOR_STYLE.border }}
                  >
                    <span style={{ color: FAVOR_STYLE.tick, fontWeight: 700, fontSize: '10px' }}>✓</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Avoid */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: AVOID_STYLE.tick }} />
                <p className="text-[10px] font-sans uppercase tracking-widest" style={{ color: AVOID_STYLE.label }}>Avoid</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {catData.avoid?.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-sans border"
                    style={{ backgroundColor: AVOID_STYLE.bg, color: AVOID_STYLE.text, borderColor: AVOID_STYLE.border }}
                  >
                    <span style={{ color: AVOID_STYLE.tick, fontWeight: 700, fontSize: '10px' }}>×</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
