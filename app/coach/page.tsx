'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  sender: 'user' | 'coach';
  text: string;
  keyInsights?: string[];
  suggestedAction?: string;
  source?: string;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'coach',
      text: 'Hi, I’m your carbon coach. I answer using your saved footprint — your totals, your biggest sources, and your goal. Nothing I say needs the internet, and I never guess your numbers.',
      suggestedAction: 'Pick a question below, or type your own.',
      source: 'LOCAL_DETERMINISTIC',
    },
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presetQueries = [
    'Why is my footprint high?',
    'What is my largest emission source?',
    'How can I reach my target?',
    'What should I reduce first?',
    'Am I over my budget?',
    'How far over target am I?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (qText?: string) => {
    const textToSend = qText || query;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!qText) setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'coach',
            text: data.answer,
            keyInsights: data.keyInsights,
            suggestedAction: data.suggestedAction,
            source: data.source,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'coach',
            text: 'I couldn’t answer that just now. Check your connection and try again — or pick one of the suggested questions.',
            source: 'ERROR',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: 'Connection problem — I couldn’t reach your data. Your footprint is safe; please try again.',
          source: 'ERROR',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sourceLabel = (source?: string) => {
    if (source === 'GROQ_AI') return 'AI answer, based on your saved data';
    if (source === 'ERROR') return '';
    return 'Answer from your saved data';
  };

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary animate-pulse" aria-hidden="true"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            Coach · answers from your saved data
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            Works offline · no paid services needed
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold" role="status">
            {loading ? 'Thinking…' : 'Ready'}
          </span>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">smart_toy</span>
        </div>
      </section>

      {/* Main Body */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">

        {/* Header */}
        <div className="border-b border-on-surface pb-space-sm">
          <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
            Ask about your footprint
          </span>
          <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
            Carbon coach
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
            Ask about what drives your footprint and how to reach your goal. Answers come straight from your saved numbers — including the range we&apos;re confident about.
          </p>
        </div>

        {/* Preset Query Grid */}
        <div>
          <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant mb-space-sm">
            Try asking
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {presetQueries.map((pq, i) => (
              <button
                key={i}
                onClick={() => handleSend(pq)}
                className="p-space-sm border border-on-surface bg-surface-container-lowest text-left font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-none flex items-center justify-between gap-2"
              >
                <span>{pq}</span>
                <span className="material-symbols-outlined text-[16px] shrink-0" aria-hidden="true">arrow_forward</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Log */}
        <div className="border border-on-surface bg-surface-container-low">
          <div className="p-space-sm border-b border-on-surface flex items-center justify-between">
            <span className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface">
              Conversation
            </span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden="true">chat</span>
          </div>

          <div className="p-space-md space-y-space-md min-h-[380px] max-h-[560px] overflow-y-auto" aria-live="polite" aria-label="Coach conversation">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-space-sm ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 border border-on-surface flex items-center justify-center font-label-caps-sm font-bold shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-on-surface text-surface-container-lowest'
                      : 'bg-primary text-on-primary'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">person</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">smart_toy</span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`border border-on-surface p-space-sm max-w-2xl space-y-space-xs ${
                    msg.sender === 'user'
                      ? 'bg-on-surface text-surface-container-lowest'
                      : 'bg-surface-container-lowest text-on-surface'
                  }`}
                >
                  <p className="font-body-md text-body-md leading-relaxed">{msg.text}</p>

                  {msg.keyInsights && msg.keyInsights.length > 0 && (
                    <div className="border-t border-on-surface/20 pt-space-xs space-y-0.5">
                      <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-primary">
                        Key numbers
                      </div>
                      {msg.keyInsights.map((ins, i) => (
                        <div key={i} className="font-body-sm text-body-sm flex items-start gap-1">
                          <span className="font-bold">•</span>
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.suggestedAction && (
                    <div className="border-t border-on-surface/20 pt-space-xs font-label-caps-sm text-label-caps-sm uppercase font-bold text-primary">
                      Next step: {msg.suggestedAction}
                    </div>
                  )}

                  {sourceLabel(msg.source) && (
                    <div className="font-label-caps-sm text-xs uppercase text-on-surface-variant opacity-60 font-bold">
                      {sourceLabel(msg.source)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-space-sm">
                <div className="w-8 h-8 border border-on-surface flex items-center justify-center bg-primary text-on-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">smart_toy</span>
                </div>
                <div className="border border-on-surface p-space-sm bg-surface-container-lowest flex items-center space-x-space-xs">
                  <div className="w-2 h-2 bg-primary animate-pulse" aria-hidden="true"></div>
                  <div className="w-2 h-2 bg-primary animate-pulse [animation-delay:0.2s]" aria-hidden="true"></div>
                  <div className="w-2 h-2 bg-primary animate-pulse [animation-delay:0.4s]" aria-hidden="true"></div>
                  <span className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant ml-space-xs">
                    Reading your data…
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-stretch border border-on-surface"
        >
          <div className="flex items-center px-space-sm border-r border-on-surface bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant" aria-hidden="true">edit</span>
          </div>
          <input
            id="coach-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your footprint…"
            aria-label="Ask the coach a question"
            className="min-h-[44px] flex-1 px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="min-h-[44px] px-space-lg py-space-sm bg-on-surface text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase font-bold border-l border-on-surface hover:bg-primary transition-none disabled:opacity-40 flex items-center gap-space-xs"
          >
            <span>Send</span>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
