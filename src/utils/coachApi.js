// Cloudflare Worker URL — set after running `wrangler deploy` (see worker/).
const COACH_API_URL = 'https://ayurveda-coach.prakriti-ai-assistant.workers.dev';

export async function askCoach({ messages, prakriti }) {
  const res = await fetch(COACH_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, prakriti }),
  });

  if (!res.ok) {
    throw new Error('The AI Coach is unavailable right now. Please try again in a moment.');
  }

  const data = await res.json();
  return data.reply;
}
