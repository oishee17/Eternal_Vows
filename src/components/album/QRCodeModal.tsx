import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, ExternalLink, Check, Copy, Sparkles, X } from 'lucide-react';
import { WeddingMeta } from '../../data/initialData';

interface QRCodeModalProps {
  meta: WeddingMeta;
  onClose: () => void;
  onOpenGuestPortal: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ meta, onClose, onOpenGuestPortal }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Direct guest portal URL (using the unique token)
  const portalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#guest?token=${meta.qrAccessToken}`
    : `https://eternalvows.studio/guest?token=${meta.qrAccessToken}`;

  useEffect(() => {
    QRCode.toDataURL(portalUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#5A1E2D', // Deep burgundy QR modules
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [portalUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `EternalVows-Venue-QRCode-${meta.partnerOne}-${meta.partnerTwo}.png`;
    link.click();
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center border border-[#D9C3B0] shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8C7B73] hover:text-[#23211F] rounded-full hover:bg-black/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Monogram */}
        <div className="w-12 h-12 rounded-full bg-[#5A1E2D] text-white flex items-center justify-center font-serif text-xl mx-auto mb-3 shadow-xs">
          E
        </div>

        <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C7A72] font-semibold">
          Venue Table Standee & Digital Dropzone
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl text-[#23211F] mt-1">
          Scan. Shoot. Shared.
        </h3>
        <p className="text-xs text-[#7B6E67] mt-1 mb-6 max-w-sm mx-auto">
          Display this card on reception tables. Guests scan with any smartphone camera to upload photos and short videos without downloading an app.
        </p>

        {/* Printable Standee Card Preview */}
        <div
          id="printable-standee"
          className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#E3D7CE] inline-block shadow-md mb-6 max-w-sm w-full mx-auto text-center"
        >
          <div className="border border-[#D4C3B5] p-5 rounded-xl bg-[#FFFDFB]">
            <span className="font-serif italic text-lg text-[#5A1E2D] block">
              {meta.partnerOne} & {meta.partnerTwo}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#8C7A72] font-medium block mt-0.5">
              {meta.venueName} • {new Date(meta.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>

            {/* High Resolution QR Image */}
            <div className="my-5 p-2 bg-white rounded-lg border border-[#EDE2D8] inline-block shadow-xs">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Venue Upload QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain"
                />
              ) : (
                <div className="w-48 h-48 bg-[#F4EFEA] flex items-center justify-center text-xs text-[#7B6E67]">
                  Generating QR Code...
                </div>
              )}
            </div>

            <p className="font-serif text-sm text-[#23211F] font-medium">
              "We'd love to see the celebration through your eyes."
            </p>
            <p className="text-[11px] text-[#7A6A61] mt-1">
              Scan with your phone to upload photos & videos directly into our live album.
            </p>

            <div className="mt-4 pt-3 border-t border-[#F0EAE3] flex items-center justify-between text-[9px] font-mono text-[#8C7B73]">
              <span>EVENT PASS</span>
              <span>TOKEN: {meta.qrAccessToken}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2.5 justify-center">
            <button
              onClick={handleDownloadQR}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrintCard}
              className="border border-[#D9C3B0] bg-white hover:bg-[#F5EFE9] text-[#4A3B32] px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Table Standee</span>
            </button>
            <button
              onClick={onOpenGuestPortal}
              className="bg-[#D9C3B0] text-[#2C181D] hover:bg-[#E5D4C5] px-4 py-2.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test Guest View</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#7A6B65] pt-1">
            <span className="truncate max-w-[240px] font-mono text-[11px] bg-white px-3 py-1 rounded-full border border-[#E5DAD1]">
              {portalUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 hover:text-[#5A1E2D] text-[#8C7B73] rounded-full hover:bg-white"
              title="Copy guest link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
