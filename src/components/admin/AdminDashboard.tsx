import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
  Award,
  Layers,
  Users,
  Camera,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { VendorProfile, AlbumMedia, Guest } from '../../types/wedding';

interface AdminDashboardProps {
  vendors: VendorProfile[];
  media: AlbumMedia[];
  guests: Guest[];
  onToggleVerifyVendor: (vendorId: string) => void;
  onApproveMedia: (mediaId: string) => void;
  onRemoveFlaggedMedia: (mediaId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  vendors,
  media,
  guests,
  onToggleVerifyVendor,
  onApproveMedia,
  onRemoveFlaggedMedia,
}) => {
  const [activeTab, setActiveTab] = useState<'vendors' | 'moderation' | 'categories'>('vendors');

  const flaggedMedia = media.filter((m) => m.isFlagged);
  const totalVerifiedVendors = vendors.filter((v) => v.isVerified).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Administration & Content Moderation</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              Eternal Vows System Hub
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Verify artisanal vendors, moderate collaborative guest uploads, and review platform telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                activeTab === 'vendors' ? 'bg-[#5A1E2D] text-white' : 'bg-[#FAF8F5] text-[#4A3B32] border border-[#E5DAD1]'
              }`}
            >
              Vendor Verification
            </button>
            <button
              onClick={() => setActiveTab('moderation')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === 'moderation' ? 'bg-[#5A1E2D] text-white' : 'bg-[#FAF8F5] text-[#4A3B32] border border-[#E5DAD1]'
              }`}
            >
              <span>Moderation</span>
              {flaggedMedia.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-bold">
                  {flaggedMedia.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1]">
            <span className="text-[10px] uppercase font-bold text-[#8C7A72]">Registered Artisans</span>
            <p className="font-serif text-2xl text-[#23211F] mt-1">{vendors.length}</p>
            <span className="text-[10px] text-emerald-800 font-semibold">{totalVerifiedVendors} Verified</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1]">
            <span className="text-[10px] uppercase font-bold text-[#8C7A72]">Total Media Uploads</span>
            <p className="font-serif text-2xl text-[#23211F] mt-1">{media.length}</p>
            <span className="text-[10px] text-[#7A6B65]">{flaggedMedia.length} flagged reports</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1]">
            <span className="text-[10px] uppercase font-bold text-[#8C7A72]">Guests Onboarded</span>
            <p className="font-serif text-2xl text-[#23211F] mt-1">{guests.length}</p>
            <span className="text-[10px] text-emerald-800 font-semibold">100% token verified</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1]">
            <span className="text-[10px] uppercase font-bold text-[#8C7A72]">Active Workspace</span>
            <p className="font-serif text-2xl text-[#5A1E2D] mt-1">Julian & Evelyn</p>
            <span className="text-[10px] text-[#7A6B65]">Villa del Balbianello</span>
          </div>
        </div>
      </div>

      {/* VENDORS VERIFICATION TAB */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
          <h3 className="font-serif text-2xl text-[#23211F] mb-4">Vendor Verification Management</h3>
          <div className="divide-y divide-[#F0EAE3]">
            {vendors.map((v) => (
              <div key={v.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-lg text-[#23211F]">{v.businessName}</h4>
                    {v.isVerified ? (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                        ✓ Verified Artisan
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7A6B65] mt-0.5">
                    Category: {v.category} • Location: {v.location} • Contact: {v.email}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleVerifyVendor(v.id)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                      v.isVerified
                        ? 'border border-rose-300 text-rose-800 bg-rose-50 hover:bg-rose-100'
                        : 'bg-[#5A1E2D] text-white hover:bg-[#471522]'
                    }`}
                  >
                    {v.isVerified ? 'Revoke Verification' : 'Grant Verified Badge'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT MODERATION TAB */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
          <h3 className="font-serif text-2xl text-[#23211F] mb-1">Collaborative Media Moderation</h3>
          <p className="text-xs text-[#7A6B65] mb-6">
            Review reported images from guests to ensure venue and privacy compliance.
          </p>

          {flaggedMedia.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {flaggedMedia.map((m) => (
                <div key={m.id} className="rounded-2xl border border-rose-300 p-4 bg-rose-50/30 space-y-3">
                  <img src={m.url} alt={m.caption} className="w-full h-44 object-cover rounded-xl" />
                  <div>
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">Reported Content</span>
                    <p className="text-xs text-[#23211F] mt-1 font-medium">{m.caption}</p>
                    <span className="text-[10px] text-[#7A6B65]">Uploaded by {m.uploaderName}</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-rose-200">
                    <button
                      onClick={() => onApproveMedia(m.id)}
                      className="flex-1 bg-white border border-[#D9C3B0] py-1.5 rounded-full text-xs font-medium hover:bg-gray-50"
                    >
                      Approve Media
                    </button>
                    <button
                      onClick={() => onRemoveFlaggedMedia(m.id)}
                      className="flex-1 bg-rose-700 text-white py-1.5 rounded-full text-xs font-medium hover:bg-rose-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#8C7A72] italic bg-[#FAF8F5] rounded-2xl border border-[#E5DAD1]">
              ✓ No inappropriate content reported. The collaborative album is pristine!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
