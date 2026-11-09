import React, { useState } from 'react';
import {
  Gift,
  Heart,
  Plus,
  Sparkles,
  CreditCard,
  Check,
  CheckCircle2,
  Share2,
  DollarSign,
  Compass,
  X,
  MessageCircle,
} from 'lucide-react';
import { RegistryItem, RegistryItemContribution } from '../../types/wedding';
import confetti from 'canvas-confetti';

interface GiftRegistryProps {
  registryItems: RegistryItem[];
  coupleNames: string;
  onAddRegistryItem: (item: Omit<RegistryItem, 'id' | 'contributedAmount' | 'contributions'>) => void;
  onContributeGift: (itemId: string, contributorName: string, amount: number, message: string) => void;
  activeRole: string;
}

export const GiftRegistry: React.FC<GiftRegistryProps> = ({
  registryItems,
  coupleNames,
  onAddRegistryItem,
  onContributeGift,
  activeRole,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItemForContribution, setSelectedItemForContribution] = useState<RegistryItem | null>(null);
  const [contributorName, setContributorName] = useState('');
  const [contributionAmount, setContributionAmount] = useState('200');
  const [contributionMessage, setContributionMessage] = useState('');

  // Add Item Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RegistryItem['category']>('Honeymoon Experience');
  const [newTarget, setNewTarget] = useState('1000');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const totalTarget = registryItems.reduce((sum, item) => sum + item.targetAmount, 0);
  const totalContributed = registryItems.reduce((sum, item) => sum + item.contributedAmount, 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalContributed / totalTarget) * 100) : 0;

  const handleMakeContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForContribution || !contributorName.trim() || !contributionAmount) return;

    onContributeGift(
      selectedItemForContribution.id,
      contributorName.trim(),
      parseFloat(contributionAmount) || 0,
      contributionMessage.trim() || 'Wishing you a lifetime of joy and unforgettable travels!'
    );

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#5A1E2D', '#D9C3B0', '#FAF8F5'],
    });

    setSelectedItemForContribution(null);
    setContributorName('');
    setContributionAmount('200');
    setContributionMessage('');
  };

  const handleCreateRegistryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddRegistryItem({
      title: newTitle.trim(),
      category: newCategory,
      targetAmount: parseFloat(newTarget) || 500,
      description: newDescription.trim() || 'A meaningful wedding memory experience.',
      imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    });

    setNewTitle('');
    setNewDescription('');
    setNewImageUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <Gift className="w-3.5 h-3.5" />
              <span>Digital Honeymoon Fund & Wishing Well</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              Gift Registry & Honeymoon Experiences
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Curated experiences, bespoke homeware, and historical conservation funds for {coupleNames}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Registry Wishlist Item</span>
            </button>
          </div>
        </div>

        {/* Global Registry Progress Bar */}
        <div className="mt-6 p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1]">
          <div className="flex justify-between items-center text-xs font-semibold text-[#23211F] mb-2">
            <span>Overall Wishing Well Progress</span>
            <span className="text-[#5A1E2D]">
              ${totalContributed.toLocaleString()} contributed of ${totalTarget.toLocaleString()} goal ({overallPercentage}%)
            </span>
          </div>
          <div className="w-full h-3 bg-[#EFE8DF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5A1E2D] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. REGISTRY CARDS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registryItems.map((item) => {
          const percent = Math.min(100, Math.round((item.contributedAmount / item.targetAmount) * 100));
          const isFulfilled = item.contributedAmount >= item.targetAmount;

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-[#E5DAD1] overflow-hidden shadow-xs hover:border-[#C5A880] transition flex flex-col justify-between"
            >
              <div>
                <div className="aspect-16/10 overflow-hidden bg-gray-200 relative">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#5A1E2D] shadow-xs">
                    {item.category}
                  </span>
                  {isFulfilled && (
                    <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> Fully Gifted
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-serif text-xl text-[#23211F] font-medium leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6D5D55] mt-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Fund Progress */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between text-xs text-[#7A6B65]">
                      <span>Raised: <strong className="text-[#23211F]">${item.contributedAmount.toLocaleString()}</strong></span>
                      <span>Target: ${item.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-[#EFE8DF] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFulfilled ? 'bg-emerald-600' : 'bg-[#5A1E2D]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Contributor Notes Preview */}
                  {item.contributions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#F0EAE3] space-y-2">
                      <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider block">
                        Recent Contributions ({item.contributions.length}):
                      </span>
                      {item.contributions.slice(0, 2).map((c: RegistryItemContribution) => (
                        <div key={c.id} className="text-[11px] bg-[#FAF8F5] p-2 rounded-lg text-[#55463E]">
                          <span className="font-bold text-[#23211F]">{c.contributorName}</span> (${c.amount}):
                          <p className="italic text-[#7A6B65] line-clamp-1">"{c.message}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedItemForContribution(item)}
                  className={`w-full py-2.5 rounded-full text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs ${
                    isFulfilled
                      ? 'border border-[#D9C3B0] bg-[#FAF8F5] text-[#5A1E2D] hover:bg-[#F5EFE9]'
                      : 'bg-[#5A1E2D] hover:bg-[#471522] text-white'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>{isFulfilled ? 'Add Bonus Contribution' : 'Contribute to Experience'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MODAL: CONTRIBUTE TO REGISTRY */}
      {selectedItemForContribution && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative">
            <button
              onClick={() => setSelectedItemForContribution(null)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] uppercase tracking-widest text-[#8C7A72] font-semibold">
              Wishing Well Contribution
            </span>
            <h3 className="font-serif text-2xl text-[#23211F] mt-1 mb-1">
              {selectedItemForContribution.title}
            </h3>
            <p className="text-xs text-[#7A6B65] mb-6">
              Send a gift contribution and a warm congratulatory note to {coupleNames}.
            </p>

            <form onSubmit={handleMakeContribution} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Sterling"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Contribution Amount ($ USD)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {['100', '200', '500', '1000'].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setContributionAmount(amt)}
                      className={`py-2 rounded-xl border text-xs font-semibold ${
                        contributionAmount === amt
                          ? 'bg-[#5A1E2D] text-white border-[#5A1E2D]'
                          : 'bg-white border-[#D9C3B0] text-[#23211F]'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Congratulatory Message / Blessing</label>
                <textarea
                  rows={3}
                  placeholder="Wishing you a lifetime of joy, laughter, and sunsets over Lake Como..."
                  value={contributionMessage}
                  onChange={(e) => setContributionMessage(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForContribution(null)}
                  className="px-4 py-2 border border-[#D9C3B0] bg-white rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2 rounded-full font-medium"
                >
                  Send Gift Blessing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: ADD REGISTRY ITEM */}
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
              Registry Catalog
            </span>
            <h3 className="font-serif text-2xl text-[#23211F] mt-1 mb-4">
              Add New Registry Experience or Item
            </h3>

            <form onSubmit={handleCreateRegistryItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wine Tasting in Barolo & Vineyard Picnic"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  >
                    <option value="Honeymoon Experience">Honeymoon Experience</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Cash Wishing Well">Cash Wishing Well</option>
                    <option value="Conservation Charity">Conservation Charity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Target Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain why this experience means so much to you both..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
