import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { calculatePrakriti, DOSHA_COLORS } from '../utils/doshaUtils';
import { askCoach } from '../utils/coachApi';

const DOSHA_LABELS = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' };

const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-[#2d2418]">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h3 className="font-serif text-base text-[#2d2418] mt-3 mb-1.5">{children}</h3>,
  h2: ({ children }) => <h3 className="font-serif text-base text-[#2d2418] mt-3 mb-1.5">{children}</h3>,
  h3: ({ children }) => <h4 className="font-serif text-sm font-semibold text-[#2d2418] mt-2 mb-1">{children}</h4>,
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-2 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-2 last:mb-0">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-[#c0704a]">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-2 last:mb-0 rounded-lg border border-[#e8dcc8]">
      <table className="min-w-full text-left border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-[#f3ede0]">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-[#e8dcc8] last:border-0">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2 text-xs font-sans font-semibold text-[#2d2418] uppercase tracking-wide">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
};

export default function Coach({ scores, onBack }) {
  const prakriti = calculatePrakriti(scores);
  const accentColor = prakriti ? DOSHA_COLORS[prakriti.dominant] : '#9c8660';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const prakritiLabel = !prakriti
    ? null
    : prakriti.type === 'tridoshic'
    ? 'Tridoshic'
    : prakriti.type === 'dual'
    ? `${DOSHA_LABELS[prakriti.dominant]}-${DOSHA_LABELS[prakriti.dual]}`
    : DOSHA_LABELS[prakriti.dominant];

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const reply = await askCoach({
        messages: nextMessages,
        prakriti: prakriti
          ? {
              dominant: prakriti.dominant,
              dual: prakriti.dual,
              type: prakriti.type,
              percentages: prakriti.percentages,
            }
          : null,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#faf7f2] border-b border-[#e8dcc8]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-sans text-[#9c8660] hover:text-[#5c4d33] transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <div className="text-center">
            <p className="text-[10px] font-sans text-[#9c8660] uppercase tracking-widest">AI Coach</p>
            {prakritiLabel && (
              <p className="font-serif text-[#2d2418] text-sm">{prakritiLabel}</p>
            )}
          </div>
          <div className="w-12" />
        </div>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#e8dcc8] p-5">
              <p className="text-sm font-sans text-[#5c4d33] leading-relaxed">
                Ask me anything about your Ayurvedic routine, diet, seasonal habits, or exercise
                {prakritiLabel ? (
                  <>
                    {' '}
                    — your answers are personalised to your <strong style={{ color: accentColor }}>{prakritiLabel}</strong> constitution.
                  </>
                ) : (
                  '.'
                )}
              </p>
              {!prakritiLabel && (
                <p className="text-xs font-sans text-[#9c8660] mt-2">
                  Tip: take the assessment first for answers personalised to your dosha.
                </p>
              )}
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-sans leading-relaxed ${
                m.role === 'user'
                  ? 'self-end bg-[#2d2418] text-[#faf7f2]'
                  : 'self-start bg-white border border-[#e8dcc8] text-[#5c4d33]'
              }`}
            >
              {m.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {m.content}
                </ReactMarkdown>
              ) : (
                m.content
              )}
            </div>
          ))}

          {loading && (
            <div className="self-start max-w-[85%] px-4 py-3 rounded-2xl text-sm font-sans bg-white border border-[#e8dcc8] text-[#9c8660]">
              Thinking…
            </div>
          )}

          {error && (
            <div className="self-start max-w-[85%] px-4 py-3 rounded-2xl text-sm font-sans bg-[#fdf6f2] border border-[#e8b49a] text-[#7a3a1e]">
              {error}
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Disclaimer + input */}
      <div className="border-t border-[#e8dcc8] bg-[#faf7f2]">
        <div className="max-w-2xl mx-auto px-6 pt-3">
          <p className="text-[10px] font-sans text-[#9c8660] leading-relaxed">
            General educational guidance, not a substitute for professional care — consult a qualified
            Ayurvedic practitioner before starting any herbal protocol. Key principles: <strong>moderation</strong> and{' '}
            <strong>body awareness</strong>.
          </p>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-4 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI Coach a question…"
            className="flex-1 px-4 py-3 rounded-full border border-[#d4c4a8] bg-white text-sm font-sans text-[#2d2418] placeholder:text-[#9c8660] focus:outline-none focus:border-[#9c8660]"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-full text-xs font-sans uppercase tracking-widest bg-[#2d2418] text-[#faf7f2] hover:bg-[#5c4d33] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
