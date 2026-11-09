import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Feather,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Copy,
  Check,
  Edit2,
  Trash2,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { VowOrSpeech } from '../../types/wedding';

interface VowSpeechStudioProps {
  vowsAndSpeeches: VowOrSpeech[];
  coupleNames: string;
  onSaveVowOrSpeech: (item: Omit<VowOrSpeech, 'id'>) => void;
  onDeleteVowOrSpeech: (id: string) => void;
}

export const VowSpeechStudio: React.FC<VowSpeechStudioProps> = ({
  vowsAndSpeeches,
  coupleNames,
  onSaveVowOrSpeech,
  onDeleteVowOrSpeech,
}) => {
  const [selectedType, setSelectedType] = useState<'vows' | 'toast'>('vows');
  const [speakerRole, setSpeakerRole] = useState<VowOrSpeech['role']>('Groom');
  const [speakerName, setSpeakerName] = useState('Julian Vance');
  const [recipientName, setRecipientName] = useState('Evelyn Montgomery');
  const [tone, setTone] = useState('Romantic, poetic, deeply grounded');
  const [keyMemories, setKeyMemories] = useState('First trip to Lake Como, making morning espresso, walking along Bellagio');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active Rehearsal Timer State
  const [activeSpeechForRehearsal, setActiveSpeechForRehearsal] = useState<VowOrSpeech | null>(vowsAndSpeeches[0] || null);
  const [rehearsalSeconds, setRehearsalSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setRehearsalSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/vows-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          speaker: speakerName,
          recipient: recipientName,
          tone,
          keyMemories,
          coupleNames,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedContent(data.speech);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToCollection = () => {
    if (!generatedContent.trim()) return;
    const words = generatedContent.split(/\s+/).filter(Boolean).length;
    onSaveVowOrSpeech({
      type: selectedType,
      speakerName,
      recipientName,
      role: speakerRole,
      tone,
      keyMemories,
      content: generatedContent,
      wordCount: words,
      estimatedMinutes: Math.round((words / 125) * 10) / 10,
      isRehearsed: false,
    });
    setGeneratedContent('');
    alert('Saved to your vows & toasts catalog!');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>AI Bridal Couture Speechwriter</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              AI Wedding Vows & Speech Writing Studio
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Craft deeply personal wedding vows and toasts for {coupleNames}, Maid of Honor, and Father of the Bride.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FAF8F5] text-[#5A1E2D] border border-[#E5DAD1]">
              {vowsAndSpeeches.length} Saved Speeches
            </span>
          </div>
        </div>

        {/* Studio Generator Form */}
        <div className="mt-8 grid lg:grid-cols-12 gap-8">
          {/* Controls Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedType('vows')}
                className={`py-2.5 rounded-xl font-semibold transition border ${
                  selectedType === 'vows'
                    ? 'bg-[#5A1E2D] text-white border-[#5A1E2D]'
                    : 'bg-[#FAF8F5] text-[#4A3B32] border-[#D9C3B0]'
                }`}
              >
                💍 Wedding Vows
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('toast')}
                className={`py-2.5 rounded-xl font-semibold transition border ${
                  selectedType === 'toast'
                    ? 'bg-[#5A1E2D] text-white border-[#5A1E2D]'
                    : 'bg-[#FAF8F5] text-[#4A3B32] border-[#D9C3B0]'
                }`}
              >
                🥂 Wedding Toast
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Speaker Role</label>
                <select
                  value={speakerRole}
                  onChange={(e) => setSpeakerRole(e.target.value as any)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-[#FAF8F5] focus:outline-hidden"
                >
                  <option value="Groom">Groom</option>
                  <option value="Bride">Bride</option>
                  <option value="Best Man">Best Man</option>
                  <option value="Maid of Honor">Maid of Honor</option>
                  <option value="Father of the Bride">Father of the Bride</option>
                  <option value="Mother of Groom">Mother of Groom</option>
                </select>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Speaker Name</label>
                <input
                  type="text"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-[#FAF8F5] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#4A3B32] font-medium mb-1">Addressing</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Evelyn Montgomery"
                className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-[#FAF8F5] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[#4A3B32] font-medium mb-1">Tone & Emotional Style</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-[#FAF8F5] focus:outline-hidden"
              >
                <option value="Romantic, poetic, deeply grounded">Romantic, poetic & heartfelt</option>
                <option value="Witty, humorous, playful but sincere">Witty, playful & humorous</option>
                <option value="Tear-jerker, deeply emotional & tender">Tear-jerker & poignant</option>
                <option value="Short, elegant & classical">Short, refined & understated</option>
              </select>
            </div>

            <div>
              <label className="block text-[#4A3B32] font-medium mb-1">
                Cherished Memories & Specific Anecdotes
              </label>
              <textarea
                rows={3}
                value={keyMemories}
                onChange={(e) => setKeyMemories(e.target.value)}
                placeholder="e.g. How we met, when I knew she was the one, funny road trips, mutual promises..."
                className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-[#FAF8F5] focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full bg-[#5A1E2D] hover:bg-[#471522] text-white py-3 rounded-full text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{isGenerating ? 'Gemini is composing...' : 'Generate Bespoke Script'}</span>
            </button>
          </div>

          {/* Generated Result Box (7 cols) */}
          <div className="lg:col-span-7 bg-[#FAF8F5] rounded-2xl border border-[#E5DAD1] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D8]">
                <div className="flex items-center gap-2">
                  <Feather className="w-4 h-4 text-[#5A1E2D]" />
                  <span className="font-serif text-lg text-[#23211F] font-medium">Draft Output</span>
                </div>
                {generatedContent && (
                  <span className="text-[11px] font-mono text-[#8C7A72]">
                    ~{generatedContent.split(/\s+/).filter(Boolean).length} words
                  </span>
                )}
              </div>

              {generatedContent ? (
                <div className="mt-4 p-4 rounded-xl bg-white border border-[#E8DFD8]">
                  <p className="font-serif text-base text-[#23211F] leading-relaxed italic whitespace-pre-line">
                    "{generatedContent}"
                  </p>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-[#8C7A72] italic">
                  Select your options on the left and click "Generate Bespoke Script" to create personalized vows or a wedding toast.
                </div>
              )}
            </div>

            {generatedContent && (
              <div className="pt-4 border-t border-[#EDE2D8] flex items-center justify-between gap-3">
                <button
                  onClick={() => handleCopyText(generatedContent)}
                  className="text-xs text-[#5A1E2D] hover:underline flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleSaveToCollection}
                  className="bg-[#5A1E2D] text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-[#471522]"
                >
                  Save to Catalog
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. REHEARSAL PODIUM & TIMER */}
      {activeSpeechForRehearsal && (
        <div className="bg-[#4A1521] text-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#642131]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#6B2435] gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#D8B4A6] font-semibold block">
                Speech Rehearsal Timer
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white mt-0.5">
                Practice Delivery: {activeSpeechForRehearsal.speakerName} ({activeSpeechForRehearsal.type === 'vows' ? 'Vows' : 'Toast'})
              </h3>
            </div>

            {/* Stopwatch Timer Display */}
            <div className="flex items-center gap-3 bg-[#3A1019] px-4 py-2 rounded-2xl border border-[#642131]">
              <span className="font-mono text-2xl font-bold text-[#D9C3B0]">
                {formatTimer(rehearsalSeconds)}
              </span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-2 rounded-full bg-[#5D1F2D] text-white hover:bg-[#752D3E]"
                title={isTimerRunning ? 'Pause timer' : 'Start rehearsal timer'}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setRehearsalSeconds(0);
                }}
                className="p-2 rounded-full bg-[#5D1F2D] text-white hover:bg-[#752D3E]"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="my-6 p-6 rounded-2xl bg-[#3A1019] border border-[#6B2435]">
            <p className="font-serif text-lg sm:text-xl text-[#FAF8F5] leading-relaxed italic">
              "{activeSpeechForRehearsal.content}"
            </p>
          </div>

          <div className="text-xs text-[#D8B4A6] flex justify-between items-center">
            <span>Estimated delivery speed: 125-135 words per minute for bridal poise</span>
            <span>Target: ~{activeSpeechForRehearsal.estimatedMinutes} minutes</span>
          </div>
        </div>
      )}

      {/* 3. SAVED VOWS & SPEECHES CATALOG */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <h3 className="font-serif text-2xl text-[#23211F] mb-6">Saved Speeches & Ceremonial Vows</h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vowsAndSpeeches.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSpeechForRehearsal(item)}
              className={`p-6 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
                activeSpeechForRehearsal?.id === item.id
                  ? 'border-[#5A1E2D] bg-[#FAF1EE]'
                  : 'border-[#E5DAD1] bg-[#FAF8F5] hover:border-[#C5A880]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D8]">
                  <span className="text-[10px] uppercase font-bold text-[#5A1E2D] tracking-wider">
                    {item.role} • {item.type}
                  </span>
                  <span className="text-[11px] font-mono text-[#8C7A72]">
                    {item.wordCount} words
                  </span>
                </div>

                <h4 className="font-serif text-xl text-[#23211F] font-medium mt-3">
                  {item.speakerName} to {item.recipientName}
                </h4>
                <p className="text-xs text-[#6D5D55] italic line-clamp-3 mt-2 leading-relaxed">
                  "{item.content}"
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#EDE2D8] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#7A6B65]">
                  ~{item.estimatedMinutes} min delivery
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyText(item.content);
                    }}
                    className="p-1 text-[#8C7A72] hover:text-[#5A1E2D]"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteVowOrSpeech(item.id);
                    }}
                    className="p-1 text-[#8C7A72] hover:text-rose-700"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
