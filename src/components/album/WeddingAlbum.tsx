import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  QrCode,
  Sparkles,
  Heart,
  Download,
  Share2,
  Filter,
  Maximize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  ShieldCheck,
  Tag,
  UserCheck,
  Flag,
  Trash2,
  Video,
} from 'lucide-react';
import { AlbumMedia, AlbumCategory, Ceremony } from '../../types/wedding';
import { categorizeUploadedPhoto } from '../../services/aiService';

interface WeddingAlbumProps {
  photos: AlbumMedia[];
  ceremonies: Ceremony[];
  onUploadMedia: (media: Omit<AlbumMedia, 'id' | 'timestamp'>) => void;
  onToggleFavorite: (mediaId: string) => void;
  onFlagMedia: (mediaId: string) => void;
  onDeleteMedia: (mediaId: string) => void;
  onOpenQRModal: () => void;
  coupleNames: string;
}

export const WeddingAlbum: React.FC<WeddingAlbumProps> = ({
  photos,
  ceremonies,
  onUploadMedia,
  onToggleFavorite,
  onFlagMedia,
  onDeleteMedia,
  onOpenQRModal,
  coupleNames,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFace, setSelectedFace] = useState<string>('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [isSlideshowActive, setIsSlideshowActive] = useState<boolean>(false);
  const [consentEnabled, setConsentEnabled] = useState<boolean>(true);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Upload Form State
  const [uploaderName, setUploaderName] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [manualCategory, setManualCategory] = useState<AlbumCategory>('Candid moments');
  const [selectedCeremonyId, setSelectedCeremonyId] = useState<string>(ceremonies[0]?.id || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [detectedAITags, setDetectedAITags] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const categories: Array<AlbumCategory | 'All'> = [
    'All',
    'Couple portraits',
    'Wedding rituals',
    'Decorations',
    'Food and catering',
    'Candid moments',
    'Family photographs',
    'Friends',
    'Bride',
    'Groom',
  ];

  // Distinct faces detected across the album
  const allDetectedFaces = Array.from(
    new Set(photos.flatMap((p) => p.detectedFaces || []))
  );

  // Filtered Media
  const filteredPhotos = photos.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesFace = selectedFace === 'All' || (p.detectedFaces && p.detectedFaces.includes(selectedFace));
    return matchesCategory && matchesFace && !p.isFlagged;
  });

  // Handle File Input Selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      setPreviewImage(dataUrl);

      // Trigger server-side AI auto categorization
      setIsAnalyzingAI(true);
      try {
        const result = await categorizeUploadedPhoto(dataUrl, file.type, caption);
        setManualCategory(result.category as AlbumCategory);
        setDetectedAITags(result.tags || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzingAI(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Live Camera capture
  const handleStartCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraActive(false);
      alert('Camera access could not be established. Please upload a file instead.');
    }
  };

  const handleCaptureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreviewImage(dataUrl);

        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) stream.getTracks().forEach((track) => track.stop());
        setCameraActive(false);

        // Analyze
        setIsAnalyzingAI(true);
        categorizeUploadedPhoto(dataUrl, 'image/jpeg', 'Live reception snapshot')
          .then((res) => {
            setManualCategory(res.category as AlbumCategory);
            setDetectedAITags(res.tags);
          })
          .finally(() => setIsAnalyzingAI(false));
      }
    }
  };

  const handleFinishUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewImage) {
      alert('Please upload or take a photo first.');
      return;
    }

    onUploadMedia({
      url: previewImage,
      caption: caption.trim() || 'A golden memory from the celebration',
      uploaderName: uploaderName.trim() || 'Wedding Guest',
      uploaderRole: 'guest',
      category: manualCategory,
      tags: detectedAITags.length > 0 ? detectedAITags : ['Guest Upload', 'Wedding Memories'],
      detectedFaces: consentEnabled && manualCategory === 'Couple portraits' ? ['Julian Vance', 'Evelyn Montgomery'] : undefined,
      isFavorite: false,
      isFlagged: false,
      eventCeremonyId: selectedCeremonyId,
    });

    // Reset
    setPreviewImage(null);
    setCaption('');
    setUploaderName('');
    setDetectedAITags([]);
    setShowUploadModal(false);
  };

  // Lightbox & Slideshow logic
  const handleNextPhoto = () => {
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((activeLightboxIndex + 1) % filteredPhotos.length);
    }
  };

  const handlePrevPhoto = () => {
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((activeLightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  // Auto advance slideshow
  React.useEffect(() => {
    if (isSlideshowActive && activeLightboxIndex !== null) {
      const timer = setTimeout(() => {
        handleNextPhoto();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSlideshowActive, activeLightboxIndex]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER & QR CALLOUT */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>Live Collaborative Photography Stream</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              The Photographs Your Guests Captured
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Guests scan the reception QR code to upload instantly without an app. AI organizes moments by ceremony and ceremony category.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (filteredPhotos.length > 0) {
                  setActiveLightboxIndex(0);
                  setIsSlideshowActive(true);
                }
              }}
              className="border border-[#D9C3B0] bg-white hover:bg-[#FAF8F5] text-[#4A3B32] px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 text-[#5A1E2D]" />
              <span>Play Slideshow</span>
            </button>

            <button
              onClick={onOpenQRModal}
              className="border border-[#D9C3B0] bg-white hover:bg-[#FAF8F5] text-[#4A3B32] px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-[#5A1E2D]" />
              <span>Table QR Standee</span>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photos / Video</span>
            </button>
          </div>
        </div>

        {/* Smart Discovery / Facial Recognition Consent Controls (Module 4.4 specification) */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#23211F] block">
                Ethical Face Tagging & Smart Photo Discovery
              </span>
              <span className="text-[11px] text-[#7A6B65]">
                Consent-based discovery is {consentEnabled ? 'ACTIVE' : 'DISABLED'}. Guests can find photos containing their face or opt out anytime.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setConsentEnabled(!consentEnabled)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                consentEnabled
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {consentEnabled ? '✓ Consent Enabled' : 'Opt-Out Mode'}
            </button>
          </div>
        </div>

        {/* Filter Pills: Categories */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#5A1E2D] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#55463E] border border-[#E5DAD1] hover:bg-[#F3ECE5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Face Filter Chips (if consent enabled) */}
        {consentEnabled && allDetectedFaces.length > 0 && (
          <div className="mt-4 flex items-center gap-2 overflow-x-auto text-xs text-[#7A6B65]">
            <span className="text-[11px] font-semibold text-[#8C7A72] uppercase shrink-0">
              Filter by Person:
            </span>
            <button
              onClick={() => setSelectedFace('All')}
              className={`px-3 py-1 rounded-full text-[11px] transition ${
                selectedFace === 'All' ? 'bg-[#5A1E2D] text-white' : 'bg-white border border-[#D9C3B0]'
              }`}
            >
              Everyone
            </button>
            {allDetectedFaces.map((face) => (
              <button
                key={face}
                onClick={() => setSelectedFace(face)}
                className={`px-3 py-1 rounded-full text-[11px] transition ${
                  selectedFace === face ? 'bg-[#5A1E2D] text-white' : 'bg-white border border-[#D9C3B0]'
                }`}
              >
                {face}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. MASONRY STYLE GALLERY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative rounded-3xl overflow-hidden border border-[#E5DAD1] bg-white shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            {/* Image Container with Lightbox Trigger */}
            <div
              onClick={() => {
                setActiveLightboxIndex(index);
                setIsSlideshowActive(false);
              }}
              className="aspect-4/5 overflow-hidden bg-[#ECE3DA] cursor-pointer relative"
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              {/* Gradient Overlay & Category Badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                    {photo.category}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(photo.id);
                      }}
                      className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-xs transition"
                    >
                      <Heart
                        className={`w-4 h-4 ${photo.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`}
                      />
                    </button>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="font-semibold block">{photo.uploaderName}</span>
                  <span className="text-[10px] opacity-80">{photo.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Bottom Details Card */}
            <div className="p-4 bg-white border-t border-[#F0EAE3]">
              <div className="flex items-center justify-between text-[10px] font-semibold text-[#5A1E2D] tracking-wider uppercase mb-1">
                <span>{photo.category}</span>
                {photo.detectedFaces && photo.detectedFaces.length > 0 && (
                  <span className="text-[#8C7A72] lowercase">
                    {photo.detectedFaces.length} tagged
                  </span>
                )}
              </div>

              <p className="text-xs text-[#23211F] font-medium line-clamp-2 leading-relaxed">
                {photo.caption}
              </p>

              <div className="mt-3 pt-2 border-t border-[#F0EAE3] flex items-center justify-between text-[11px] text-[#7A6B65]">
                <span className="truncate max-w-[140px]">{photo.uploaderName}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = photo.url;
                      link.download = `EternalVows-${photo.id}.jpg`;
                      link.click();
                    }}
                    className="p-1 text-[#8C7A72] hover:text-[#5A1E2D]"
                    title="Download photo"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onFlagMedia(photo.id)}
                    className="p-1 text-[#8C7A72] hover:text-rose-700"
                    title="Report or flag photo"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteMedia(photo.id)}
                    className="p-1 text-[#8C7A72] hover:text-rose-700"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="p-16 text-center bg-white rounded-3xl border border-[#E5DAD1] text-xs text-[#8C7A72]">
          No photographs found in this category or person filter. Be the first to upload one!
        </div>
      )}

      {/* 3. LIGHTBOX & SLIDESHOW MODAL */}
      {activeLightboxIndex !== null && filteredPhotos[activeLightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            {/* Top Bar Controls */}
            <div className="w-full flex items-center justify-between text-white pb-3 px-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-serif italic text-lg text-[#D9C3B0]">{coupleNames}</span>
                <span>•</span>
                <span className="text-[11px] opacity-80">
                  {activeLightboxIndex + 1} of {filteredPhotos.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSlideshowActive(!isSlideshowActive)}
                  className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs flex items-center gap-1.5 transition"
                >
                  {isSlideshowActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSlideshowActive ? 'Pause' : 'Slideshow'}</span>
                </button>
                <button
                  onClick={() => setActiveLightboxIndex(null)}
                  className="p-2 text-white/80 hover:text-white rounded-full bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Image with Navigation Arrows */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center">
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 p-3 text-white bg-black/50 hover:bg-black/80 rounded-full transition z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <img
                src={filteredPhotos[activeLightboxIndex].url}
                alt={filteredPhotos[activeLightboxIndex].caption}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
              />

              <button
                onClick={handleNextPhoto}
                className="absolute right-2 p-3 text-white bg-black/50 hover:bg-black/80 rounded-full transition z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Caption Bar */}
            <div className="w-full text-center text-white mt-4 px-4">
              <p className="font-serif text-lg font-medium text-white">
                {filteredPhotos[activeLightboxIndex].caption}
              </p>
              <div className="text-xs text-[#D9C3B0] mt-1 flex items-center justify-center gap-3">
                <span>Uploaded by {filteredPhotos[activeLightboxIndex].uploaderName}</span>
                <span>•</span>
                <span>Category: {filteredPhotos[activeLightboxIndex].category}</span>
                {filteredPhotos[activeLightboxIndex].detectedFaces && (
                  <span>
                    • Faces: {filteredPhotos[activeLightboxIndex].detectedFaces?.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: UPLOAD MEDIA WITH CAMERA / FILE & GEMINI AUTO-CATEGORIZATION */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative my-8">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setPreviewImage(null);
                setCameraActive(false);
              }}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Auto-Tagger with Gemini Vision</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#23211F]">
              Share a Photo or Video
            </h3>
            <p className="text-xs text-[#7A6B65] mt-1 mb-6">
              Upload from your camera roll or take a live snapshot at the reception venue.
            </p>

            {/* Upload Area / Live Camera Preview */}
            <div className="border-2 border-dashed border-[#D4C3B5] rounded-2xl p-6 bg-white text-center mb-6 relative">
              {cameraActive ? (
                <div className="space-y-3">
                  <video ref={videoRef} className="w-full max-h-64 object-cover rounded-xl mx-auto" />
                  <canvas ref={canvasRef} className="hidden" />
                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    className="bg-[#5A1E2D] text-white px-5 py-2 rounded-full text-xs font-semibold"
                  >
                    Capture Snapshot
                  </button>
                </div>
              ) : previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-xl mx-auto shadow-xs"
                  />
                  {isAnalyzingAI && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center text-white text-xs font-medium gap-2">
                      <Sparkles className="w-4 h-4 text-[#C5A880] animate-spin" />
                      <span>Gemini is analyzing ceremony & lighting...</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="mt-2 text-xs text-[#5A1E2D] underline font-medium"
                  >
                    Choose another photo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E5DAD1] flex items-center justify-center mx-auto text-[#5A1E2D]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#23211F]">
                      Choose from device or take a snapshot
                    </p>
                    <p className="text-[11px] text-[#7A6B65] mt-0.5">
                      Supports JPG, PNG, HEIC, MP4 up to 50MB
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <label className="cursor-pointer bg-[#5A1E2D] hover:bg-[#471522] text-white px-4 py-2 rounded-full text-xs font-medium transition shadow-xs">
                      <span>Browse Files</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="border border-[#D9C3B0] bg-white hover:bg-[#FAF8F5] text-[#4A3B32] px-4 py-2 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Use Camera</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Form */}
            <form onSubmit={handleFinishUpload} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sophia Sterling"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Ceremony Event</label>
                  <select
                    value={selectedCeremonyId}
                    onChange={(e) => setSelectedCeremonyId(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  >
                    {ceremonies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Add a Caption / Toast</label>
                <input
                  type="text"
                  placeholder="e.g. Golden hour toast on Lake Como with the happy couple!"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">
                    Category (AI Detected / Correct)
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as AlbumCategory)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">AI Detected Tags</label>
                  <div className="border border-[#D9C3B0] rounded-xl px-3 py-1.5 bg-white min-h-[38px] flex flex-wrap gap-1 items-center">
                    {detectedAITags.length > 0 ? (
                      detectedAITags.map((tag, i) => (
                        <span key={i} className="text-[10px] bg-[#FAF1EE] text-[#5A1E2D] px-2 py-0.5 rounded-full font-medium">
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-[#8C7A72] italic">Auto-generated tags</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-[#D9C3B0] bg-white rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!previewImage}
                  className={`px-5 py-2 rounded-full font-medium transition ${
                    previewImage
                      ? 'bg-[#5A1E2D] hover:bg-[#471522] text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Publish to Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
