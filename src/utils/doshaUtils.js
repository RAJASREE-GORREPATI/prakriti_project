export const DOSHA_COLORS = {
  vata: '#4A78A8',
  pitta: '#C06830',
  kapha: '#3A7A50',
};

export const DOSHA_BG = {
  vata: '#E0EAF6',
  pitta: '#F5E6D5',
  kapha: '#DAF0E3',
};

export const DOSHA_BORDER = {
  vata: '#80B0D8',
  pitta: '#D8A870',
  kapha: '#68B882',
};

export function calculatePrakriti(scores) {
  const total = scores.vata + scores.pitta + scores.kapha;
  if (total === 0) return null;

  const raw = {
    vata: (scores.vata / total) * 100,
    pitta: (scores.pitta / total) * 100,
    kapha: (scores.kapha / total) * 100,
  };

  const percentages = {
    vata: Math.round(raw.vata),
    pitta: Math.round(raw.pitta),
    kapha: 100 - Math.round(raw.vata) - Math.round(raw.pitta),
  };

  const sorted = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
  const [first, second, third] = sorted;

  if (first[1] - third[1] <= 10) {
    return { type: 'tridoshic', dominant: 'vata', dual: null, prakriti: 'tridoshic', percentages };
  }

  if (first[1] - second[1] <= 15) {
    return {
      type: 'dual',
      dominant: first[0],
      dual: second[0],
      prakriti: `${first[0]}-${second[0]}`,
      percentages,
    };
  }

  return {
    type: 'single',
    dominant: first[0],
    dual: null,
    prakriti: first[0],
    percentages,
  };
}
