import Anthropic from '@anthropic-ai/sdk';
import { buildDoshaContext, GENERIC_SYSTEM_PROMPT } from './doshaContext';

const VALID_ROLES = new Set(['user', 'assistant']);
const MAX_HISTORY_MESSAGES = 20;

const ALLOWED_ORIGINS = new Set([
  'https://RAJASREE-GORREPATI.github.io',
  'https://rajasree-gorrepati.github.io',
  'http://localhost:5173',
]);

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers });
    }

    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response('Forbidden', { status: 403, headers });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const { messages, prakriti } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: '"messages" must be a non-empty array' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const cleanMessages = messages
      .filter((m) => VALID_ROLES.has(m?.role) && typeof m?.content === 'string' && m.content.trim())
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content }));

    if (cleanMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid messages provided' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const system = prakriti?.dominant ? buildDoshaContext(prakriti) : GENERIC_SYSTEM_PROMPT;

    const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    let reply;
    try {
      const completion = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        system,
        messages: cleanMessages,
      });
      const textBlock = completion.content.find((b) => b.type === 'text');
      reply = textBlock?.text ?? '';
      if (completion.stop_reason === 'max_tokens') {
        reply += '\n\n*(Response continues — ask me to continue and I\'ll pick up from here.)*';
      }
    } catch (err) {
      console.error('Anthropic API error:', err);
      return new Response(JSON.stringify({ error: 'The AI Coach failed to respond. Please try again.' }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  },
};
