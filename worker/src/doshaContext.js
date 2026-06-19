import doshaProfiles from '../../src/data/dosha_profiles.json';
import dincharyaData from '../../src/data/dincharya.json';
import ritucharyaData from '../../src/data/ritucharya.json';
import dietData from '../../src/data/diet_recommendations.json';
import exerciseData from '../../src/data/exercise_recommendations.json';

const DOSHA_LABELS = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' };

const BASE_INSTRUCTIONS = [
  'You are an AI Ayurveda Coach inside an Ayurveda Prakriti (dosha) assessment app.',
  'Answer the user\'s question using ONLY the reference data provided below.',
  'Keep answers concise, warm, and practical. Prefer a few well-chosen points over exhaustive detail.',
  'Always note that herbal protocols need a qualified Ayurvedic practitioner\'s guidance, and that moderation and body awareness are the guiding principles.',
  'Do not invent Ayurvedic facts that are not supported by the reference data below.',
  'For weekly meal plans, routines, or schedules covering multiple days: summarize each day in 3-4 lines (a short bullet or table row), not a full paragraph per day.',
  'If a complete, fully-detailed answer would be very long (e.g. a full 7-day plan), do not try to fit it all into one response. Split it into parts instead — for example Monday-Wednesday, then Thursday-Saturday, then Sunday plus a short summary — and end that part by asking the user if they\'d like you to continue with the next part.',
  'Always finish on a complete sentence and a natural stopping point. Never end abruptly mid-sentence or mid-list — if you are running low on space, wrap up gracefully (even if that means shortening detail) rather than being cut off.',
];

export const GENERIC_SYSTEM_PROMPT = [
  ...BASE_INSTRUCTIONS,
  'The user has not taken the Prakriti assessment yet, so you have no personalised dosha data for them.',
  'Answer generally and suggest they take the assessment in the app for advice tailored to their own constitution.',
].join('\n\n');

function prakritiLabel({ dominant, dual, type }) {
  if (type === 'tridoshic') return 'Tridoshic (Sama Prakriti / balanced)';
  if (type === 'dual') return `${DOSHA_LABELS[dominant]}-${DOSHA_LABELS[dual]} (dual dosha)`;
  return `${DOSHA_LABELS[dominant]} (single dosha)`;
}

function ritucharyaForDosha(dosha) {
  return ritucharyaData.ritucharya.seasons.map((season) => ({
    name: season.name,
    months: season.months,
    climate: season.climate,
    agniStrength: season.agniStrength,
    recommendation: season.recommendations[dosha],
  }));
}

// Extracts only the sections relevant to the user's dominant dosha from each
// knowledge-base file, instead of sending the full files (~75KB) on every request.
export function buildDoshaContext({ dominant, dual, type, percentages }) {
  const pct = percentages
    ? `Vata ${percentages.vata}% / Pitta ${percentages.pitta}% / Kapha ${percentages.kapha}%`
    : 'not provided';

  const assessmentFacts = [
    'The user has ALREADY completed the Prakriti assessment. Their result is given below as fact — never ask the user what their dosha is, and never ask whether they have taken the assessment.',
    `User's Prakriti result: ${prakritiLabel({ dominant, dual, type })}.`,
    `User's dosha percentages: ${pct}.`,
    'Always use this provided Prakriti information automatically when answering — do not wait to be told it again.',
    'If the user asks about diet, sleep, exercise, or daily/seasonal routine, immediately give personalised recommendations using the reference data below — do not ask the user to confirm or restate their dosha first.',
    'Only ask a follow-up question when something genuinely cannot be inferred from the Prakriti result or the reference data — for example dietary preference (vegetarian/non-vegetarian), current season or location, allergies, or a specific health condition. Do not ask about anything the Prakriti result already answers.',
  ];

  const sections = [];

  if (type === 'tridoshic') {
    sections.push(
      'The user has a balanced (Sama Prakriti / tridoshic) constitution.',
      `Tridoshic profile: ${JSON.stringify(doshaProfiles.tridoshic)}`,
      'The single-dosha reference data below uses Vata as a general baseline only — recommend moderate, seasonally-appropriate choices rather than strict Vata-only protocols, and mention that Pitta- or Kapha-balancing options are equally valid depending on the season and the user\'s current state.'
    );
  }

  sections.push(`${DOSHA_LABELS[dominant]} profile: ${JSON.stringify(doshaProfiles.doshaProfiles[dominant])}`);

  if (type === 'dual' && dual) {
    const dualProfile =
      doshaProfiles.dualDoshaProfiles[`${dominant}-${dual}`] ||
      doshaProfiles.dualDoshaProfiles[`${dual}-${dominant}`];
    if (dualProfile) {
      sections.push(`Secondary (${DOSHA_LABELS[dual]}) influence: ${JSON.stringify(dualProfile)}`);
    }
  }

  sections.push(`Daily routine (Dincharya) for ${DOSHA_LABELS[dominant]}: ${JSON.stringify(dincharyaData.dincharya[dominant])}`);
  sections.push(`Seasonal routine (Ritucharya) for ${DOSHA_LABELS[dominant]}: ${JSON.stringify(ritucharyaForDosha(dominant))}`);
  sections.push(`Diet recommendations for ${DOSHA_LABELS[dominant]}: ${JSON.stringify(dietData.dietRecommendations[dominant])}`);
  sections.push(`Exercise recommendations for ${DOSHA_LABELS[dominant]}: ${JSON.stringify(exerciseData.exerciseRecommendations[dominant])}`);

  return [...BASE_INSTRUCTIONS, ...assessmentFacts, ...sections].join('\n\n');
}
