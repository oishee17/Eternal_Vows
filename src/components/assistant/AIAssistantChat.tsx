import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Users,
  Compass,
  Heart,
  Bot,
} from 'lucide-react';
import { askGroundedAssistant, AIPlannerContext } from '../../services/aiService';

interface AIAssistantChatProps {
  context: AIPlannerContext;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ context }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: `Good day. I am your studio planning intelligence, grounded directly in your Lake Como celebration records ($${context.totalBudget.toLocaleString()} allocated budget, ${context.confirmedGuests} confirmed attendees, and active artisan bids). How may I assist your planning today?`,
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    'How much of our wedding budget is remaining?',
    'How many tables will we need for confirmed guests?',
    'Which photography proposals are within our budget?',
    'Suggest an ideal two-day Lake Como wedding itinerary',
    'Suggest romantic luxury honeymoon destinations tailored for autumn',
  ];

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || userInput;
    if (!textToSend.trim() || isLoading) return;

    const newHistory = [...messages, { sender: 'user' as const, text: textToSend.trim() }];
    setMessages(newHistory);
    setUserInput('');
    setIsLoading(true);

    try {
      const reply = await askGroundedAssistant(textToSend.trim(), context, newHistory);
      setMessages([...newHistory, { sender: 'assistant', text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newHistory,
        {
          sender: 'assistant',
          text: 'I encountered an issue verifying the wedding records. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#4A1521] text-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#642131]">
        {/* Header */}
        <div className="pb-6 border-b border-[#6B2435] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#D8B4A6] font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Studio Intelligence</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
              It reads your wedding. Not the internet’s.
            </h2>
            <p className="text-xs text-[#E1D1CA] mt-1 max-w-xl">
              Answers are grounded in your saved guest list ({context.confirmedGuests} confirmed), live financial commitments ($${context.totalSpent.toLocaleString()} spent), and verified artisan quotations.
            </p>
          </div>

          <div className="bg-[#3A1019] px-3.5 py-2 rounded-2xl border border-[#642131] text-[11px] text-[#D8B4A6] shrink-0">
            <span>Model: Gemini 3.8 Flash</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="my-6 space-y-4 max-h-[460px] overflow-y-auto pr-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#5D1F2D] border border-[#752D3E] flex items-center justify-center shrink-0 text-[#D8B4A6]">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-lg ${
                  msg.sender === 'user'
                    ? 'bg-[#D9C3B0] text-[#2F1B21] font-medium rounded-br-xs'
                    : 'bg-[#5D1F2D] text-[#FAF8F5] border border-[#752D3E] rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-line font-sans">{msg.text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#D8B4A6] pl-11">
              <Sparkles className="w-4 h-4 animate-spin text-[#D8B4A6]" />
              <span>Consulting verified wedding records...</span>
            </div>
          )}
          <div ref={threadEndRef} />
        </div>

        {/* Suggested Queries */}
        <div className="mb-4">
          <span className="text-[10px] uppercase font-semibold text-[#D8B4A6] tracking-wider block mb-2">
            Suggested Studio Queries:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {promptSuggestions.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="bg-[#3A1019] hover:bg-[#5D1F2D] border border-[#6F2838] px-3 py-1.5 rounded-full text-[11px] text-[#EADBD5] transition"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 pt-2"
        >
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask about your budget, seating count, vendor bids, or Lake Como schedule..."
            className="flex-1 bg-[#3A1019] border border-[#6F2838] rounded-full px-5 py-3 text-xs sm:text-sm text-[#FAF8F5] placeholder-[#B49A90] focus:outline-hidden focus:border-[#D9C3B0]"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isLoading}
            className={`px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
              userInput.trim() && !isLoading
                ? 'bg-[#D9C3B0] text-[#2F1B21] hover:bg-[#E5D4C5]'
                : 'bg-[#5D1F2D] text-[#B49A90] cursor-not-allowed'
            }`}
          >
            <span>Query</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
