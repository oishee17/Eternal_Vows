import React, { useState } from 'react';
import {
  Music,
  Radio,
  ThumbsUp,
  Plus,
  Play,
  CheckCircle2,
  Ban,
  Clock,
  Sparkles,
  Heart,
  X,
  Headphones,
} from 'lucide-react';
import { SongRequest } from '../../types/wedding';
import confetti from 'canvas-confetti';

interface MusicJukeboxProps {
  songs: SongRequest[];
  onAddSongRequest: (song: Omit<SongRequest, 'id' | 'upvotes' | 'status'>) => void;
  onUpvoteSong: (songId: string) => void;
  onUpdateSongStatus: (songId: string, status: SongRequest['status']) => void;
  activeRole: string;
}

export const MusicJukebox: React.FC<MusicJukeboxProps> = ({
  songs,
  onAddSongRequest,
  onUpvoteSong,
  onUpdateSongStatus,
  activeRole,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterMoment, setFilterMoment] = useState<string>('All');

  // Form State
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [requestedBy, setRequestedBy] = useState('Wedding Guest');
  const [ceremonyMoment, setCeremonyMoment] = useState<SongRequest['ceremonyMoment']>('Evening Party');
  const [dedicationMessage, setDedicationMessage] = useState('');

  const moments: Array<SongRequest['ceremonyMoment'] | 'All'> = [
    'All',
    'Cocktail Hour',
    'First Dance',
    'Dinner Banquet',
    'Evening Party',
    'Late Night Dance',
  ];

  const handleSaveSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !artist.trim()) return;

    onAddSongRequest({
      songTitle: songTitle.trim(),
      artist: artist.trim(),
      requestedBy: requestedBy.trim() || 'Wedding Guest',
      ceremonyMoment,
      dedicationMessage: dedicationMessage.trim() || undefined,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#5A1E2D', '#D9C3B0'],
    });

    setSongTitle('');
    setArtist('');
    setDedicationMessage('');
    setShowAddModal(false);
  };

  const filteredSongs = songs
    .filter((s) => filterMoment === 'All' || s.ceremonyMoment === filterMoment)
    .sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <Radio className="w-3.5 h-3.5" />
              <span>Collaborative Band & DJ Jukebox</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              Wedding Playlist & Guest Song Requests
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Guests request meaningful tracks with custom dedications; upvote your favorites for the evening dance floor.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request a Song</span>
            </button>
          </div>
        </div>

        {/* First Dance Feature Spotlight */}
        <div className="mt-6 p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5A1E2D] text-white flex items-center justify-center font-serif text-xl shrink-0 shadow-xs">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C7A72] tracking-wider block">
                Official First Dance
              </span>
              <h3 className="font-serif text-2xl text-[#23211F]">
                "La Vie En Rose" — Louis Armstrong
              </h3>
              <p className="text-xs text-[#7A6B65] mt-0.5">
                Arranged exclusively by Sinfonia Strings Quartet & Jazz Trio for the Loggia terrace entrance.
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-4 py-2 rounded-full bg-white text-[#5A1E2D] border border-[#D9C3B0] self-start sm:self-auto shadow-2xs">
            18 Upvotes • Locked in Setlist
          </span>
        </div>

        {/* Moment Filter Chips */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
          {moments.map((moment) => (
            <button
              key={moment}
              onClick={() => setFilterMoment(moment)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filterMoment === moment
                  ? 'bg-[#5A1E2D] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#55463E] border border-[#E5DAD1] hover:bg-[#F3ECE5]'
              }`}
            >
              {moment}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SONGS LIST */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredSongs.map((song) => {
          const isQueued = song.status === 'queued';
          const isPlayed = song.status === 'played';
          const isBlacklisted = song.status === 'blacklisted';

          return (
            <div
              key={song.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                isBlacklisted
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : isPlayed
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-white border-[#E5DAD1] hover:border-[#C5A880] shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#5A1E2D] tracking-wider block">
                      {song.ceremonyMoment}
                    </span>
                    <h4 className="font-serif text-xl text-[#23211F] font-medium leading-tight">
                      {song.songTitle}
                    </h4>
                    <p className="text-xs text-[#6D5D55]">{song.artist}</p>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={() => onUpvoteSong(song.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#D9C3B0] text-[#5A1E2D] hover:bg-[#FAF1EE] transition shadow-2xs text-xs font-bold"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{song.upvotes}</span>
                  </button>
                </div>

                {song.dedicationMessage && (
                  <p className="text-xs text-[#7A6B65] mt-3 italic bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE2D8]">
                    "{song.dedicationMessage}" — <span className="font-medium text-[#23211F]">{song.requestedBy}</span>
                  </p>
                )}
              </div>

              {/* Status and DJ Controls */}
              <div className="mt-4 pt-3 border-t border-[#F0EAE3] flex items-center justify-between text-xs">
                <span
                  className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                    isPlayed
                      ? 'bg-emerald-100 text-emerald-800'
                      : isQueued
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : isBlacklisted
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-[#FAF8F5] text-[#55463E]'
                  }`}
                >
                  {isPlayed ? '✓ Played' : isQueued ? '🎵 In DJ Queue' : isBlacklisted ? 'Blacklisted' : 'Requested'}
                </span>

                {(activeRole === 'couple' || activeRole === 'vendor') && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      onClick={() => onUpdateSongStatus(song.id, 'queued')}
                      className="hover:text-[#5A1E2D] underline px-1"
                    >
                      Queue
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => onUpdateSongStatus(song.id, 'played')}
                      className="hover:text-emerald-700 underline px-1"
                    >
                      Mark Played
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => onUpdateSongStatus(song.id, 'blacklisted')}
                      className="hover:text-rose-700 underline px-1"
                    >
                      Blacklist
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MODAL: REQUEST SONG */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] uppercase tracking-widest text-[#8C7A72] font-semibold">
              DJ Setlist Request
            </span>
            <h3 className="font-serif text-2xl text-[#23211F] mt-1 mb-4">
              Add Song to Wedding Jukebox
            </h3>

            <form onSubmit={handleSaveSong} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Song Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fly Me to the Moon"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Artist / Band</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frank Sinatra"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Ceremony Moment</label>
                  <select
                    value={ceremonyMoment}
                    onChange={(e) => setCeremonyMoment(e.target.value as any)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  >
                    <option value="Cocktail Hour">Cocktail Hour</option>
                    <option value="First Dance">First Dance</option>
                    <option value="Dinner Banquet">Dinner Banquet</option>
                    <option value="Evening Party">Evening Party</option>
                    <option value="Late Night Dance">Late Night Dance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Dedication Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. To celebrate our high school memories with Evelyn!"
                  value={dedicationMessage}
                  onChange={(e) => setDedicationMessage(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#D9C3B0] bg-white rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2 rounded-full font-medium"
                >
                  Submit Song
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
