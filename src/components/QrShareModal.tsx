import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, ExternalLink, Eye, FileDown, Heart, Link2, RotateCcw, X } from 'lucide-react';
import {
  getDefaultShareBaseUrl,
  getSavedCustomShareOrigin,
  isAiStudioDevHost,
  QrStyle,
  saveCustomShareOrigin,
  SceneConfig,
} from '../types/scene';
import { downloadStandaloneGiftHtml } from '../utils/exportHtml';

interface QrShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  config: SceneConfig;
  onUpdateConfig: (partial: Partial<SceneConfig>) => void;
  onPreviewRecipient: () => void;
  onBaseUrlChange: (nextBaseUrl: string) => void;
}

function getSafeHostname(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return rawUrl || 'Invalid URL';
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawHeartIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.translate(cx, cy - size * 0.35);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.25);
  ctx.bezierCurveTo(-size * 0.05, -size * 0.15, -size * 0.9, -size * 0.15, -size * 0.9, size * 0.3);
  ctx.bezierCurveTo(-size * 0.9, size * 0.72, -size * 0.2, size * 0.98, 0, size * 1.22);
  ctx.bezierCurveTo(size * 0.2, size * 0.98, size * 0.9, size * 0.72, size * 0.9, size * 0.3);
  ctx.bezierCurveTo(size * 0.9, -size * 0.15, size * 0.05, -size * 0.15, 0, size * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function renderQrCardToCanvas(
  canvas: HTMLCanvasElement,
  url: string,
  style: QrStyle,
  caption: string,
  sizePx: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = sizePx;
  canvas.height = sizePx;

  // 1. Blush pink pastel gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, sizePx * 0.2, sizePx);
  bgGrad.addColorStop(0, '#fcc2dd');
  bgGrad.addColorStop(0.45, '#fde4f0');
  bgGrad.addColorStop(1, '#f9b9d8');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, sizePx, sizePx);

  const radial = ctx.createRadialGradient(
    sizePx * 0.5,
    sizePx * 0.5,
    sizePx * 0.05,
    sizePx * 0.5,
    sizePx * 0.5,
    sizePx * 0.6
  );
  radial.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
  radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, sizePx, sizePx);

  // 2. Crisp pure-white square card in center (clean quiet zone guaranteed)
  const cardMargin = sizePx * 0.115;
  const cardSize = sizePx - cardMargin * 2;
  const hasCaption = caption.trim().length > 0;
  const cardY = hasCaption ? cardMargin * 0.78 : cardMargin;

  ctx.save();
  ctx.shadowColor = 'rgba(214, 30, 108, 0.16)';
  ctx.shadowBlur = sizePx * 0.04;
  ctx.shadowOffsetY = sizePx * 0.012;
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, cardMargin, cardY, cardSize, cardSize, sizePx * 0.025);
  ctx.fill();
  ctx.restore();

  // 3. Build 100% intact QR matrix:
  //    - ECC 'M' for intact styles -> bigger, crisper modules that scan instantaneously on mobile cameras
  //    - ECC 'H' for 'heart-frame' -> safe 30% error recovery for center heart icon
  const eccLevel = style === 'heart-frame' ? 'H' : 'M';
  const safeTarget = url && url.trim().length > 0 ? url.trim() : window.location.href;
  const qr = QRCode.create(safeTarget, { errorCorrectionLevel: eccLevel });
  const n = qr.modules.size;
  const data = qr.modules.data;

  // Enforce >= 4-module pure white quiet zone around the QR matrix
  const qrPadding = cardSize * 0.115;
  const qrArea = cardSize - qrPadding * 2;
  const cellSize = qrArea / n;
  const startX = cardMargin + qrPadding;
  const startY = cardY + qrPadding;
  // Deep berry-magenta pink (#B80046) maximizes scanner contrast against white
  const pink = '#B80046';

  // Decorative pastel hearts strictly OUTSIDE the white quiet zone
  if (style === 'heart-silhouette' || style === 'heart-frame') {
    const outerHearts: [number, number, number, string][] = [
      [cardMargin + cardSize * 0.5, cardY - sizePx * 0.04, sizePx * 0.028, '#ec4899'],
      [cardMargin - sizePx * 0.042, cardY + cardSize * 0.5, sizePx * 0.022, '#f472b6'],
      [cardMargin + cardSize + sizePx * 0.042, cardY + cardSize * 0.5, sizePx * 0.022, '#f472b6'],
    ];
    for (const [hx, hy, hs, hc] of outerHearts) {
      drawHeartIcon(ctx, hx, hy, hs, hc);
    }
  }

  const drawFinder = (fr: number, fc: number) => {
    const fx = startX + fc * cellSize;
    const fy = startY + fr * cellSize;
    const fSize = 7 * cellSize;

    ctx.fillStyle = pink;
    if (style === 'classic-pink') {
      ctx.fillRect(fx, fy, fSize, fSize);
    } else {
      drawRoundedRect(ctx, fx, fy, fSize, fSize, cellSize * 0.75);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    if (style === 'classic-pink') {
      ctx.fillRect(fx + cellSize, fy + cellSize, 5 * cellSize, 5 * cellSize);
    } else {
      drawRoundedRect(
        ctx,
        fx + cellSize,
        fy + cellSize,
        5 * cellSize,
        5 * cellSize,
        cellSize * 0.45
      );
      ctx.fill();
    }

    ctx.fillStyle = pink;
    if (style === 'classic-pink') {
      ctx.fillRect(fx + 2 * cellSize, fy + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    } else {
      drawRoundedRect(
        ctx,
        fx + 2 * cellSize,
        fy + 2 * cellSize,
        3 * cellSize,
        3 * cellSize,
        cellSize * 0.45
      );
      ctx.fill();
    }
  };

  const isFinderRegion = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

  // Small center heart emblem cutout ONLY for 'heart-frame' (< 2.5% area, safe for ECC-H)
  const centerR = (n - 1) / 2;
  const centerC = (n - 1) / 2;
  const logoRadiusCells = style === 'heart-frame' ? 2.1 : 0;

  ctx.fillStyle = pink;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (isFinderRegion(r, c)) continue;

      if (logoRadiusCells > 0) {
        const dr = Math.abs(r - centerR);
        const dc = Math.abs(c - centerC);
        if (dr <= logoRadiusCells && dc <= logoRadiusCells) continue;
      }

      const isDark = Boolean(data[r * n + c]);
      if (!isDark) continue;

      const x = startX + c * cellSize;
      const y = startY + r * cellSize;
      // Solid, gapless connected squares guarantee instant mobile camera recognition
      ctx.fillRect(x, y, cellSize + 0.55, cellSize + 0.55);
    }
  }

  drawFinder(0, 0);
  drawFinder(0, n - 7);
  drawFinder(n - 7, 0);

  if (style === 'heart-frame') {
    const cx = startX + (n / 2) * cellSize;
    const cy = startY + (n / 2) * cellSize;
    drawHeartIcon(ctx, cx, cy, cellSize * 1.9, pink);
  }

  if (hasCaption) {
    ctx.fillStyle = '#9d174d';
    ctx.font = `600 ${Math.round(sizePx * 0.036)}px "Plus Jakarta Sans", "Hind Siliguri", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      caption.trim(),
      sizePx / 2,
      cardY + cardSize + (sizePx - (cardY + cardSize)) * 0.5
    );
  }
}

export const QrShareModal: React.FC<QrShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  config,
  onUpdateConfig,
  onPreviewRecipient,
  onBaseUrlChange,
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const linkInputRef = useRef<HTMLInputElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [showUrlSettings, setShowUrlSettings] = useState(false);
  const [customOriginInput, setCustomOriginInput] = useState(() => getSavedCustomShareOrigin());
  const inDevPreview = isAiStudioDevHost();

  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current) return;
    try {
      renderQrCardToCanvas(
        previewCanvasRef.current,
        shareUrl,
        config.qrStyle,
        config.qrCaption,
        720
      );
    } catch (err) {
      console.error('QR render failed:', err);
    }
  }, [isOpen, shareUrl, config.qrStyle, config.qrCaption]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const exportCanvas = document.createElement('canvas');
    renderQrCardToCanvas(exportCanvas, shareUrl, config.qrStyle, config.qrCaption, 1080);

    const triggerLink = (href: string, revokeAfter: boolean) => {
      const link = document.createElement('a');
      link.download = 'starlight-wishes-qr.png';
      link.href = href;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (revokeAfter) {
        window.setTimeout(() => URL.revokeObjectURL(href), 2000);
      }
    };

    if (exportCanvas.toBlob) {
      exportCanvas.toBlob((blob) => {
        if (blob) {
          triggerLink(URL.createObjectURL(blob), true);
        } else {
          triggerLink(exportCanvas.toDataURL('image/png'), false);
        }
      }, 'image/png');
    } else {
      triggerLink(exportCanvas.toDataURL('image/png'), false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const target = linkInputRef.current;
      if (target) {
        target.focus();
        target.select();
        target.setSelectionRange(0, shareUrl.length);
        document.execCommand('copy');
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const safeHostname = getSafeHostname(shareUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-950/95 border border-white/12 p-5 sm:p-6 shadow-2xl text-white max-h-[92dvh] overflow-y-auto studio-scroll">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 shrink-0" />
            <h2 id="qr-modal-title" className="text-lg font-semibold tracking-tight">
              Share Pink QR Card
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close QR modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Canvas Preview */}
        <div className="flex justify-center mb-4">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-xl overflow-hidden shadow-lg shadow-rose-500/10 border border-white/10">
            <canvas
              ref={previewCanvasRef}
              className="w-full h-full block"
              aria-label="Scannable Pink QR Code"
            />
          </div>
        </div>

        {/* QR Style Switcher */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              QR Card Style
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
              {(
                [
                  { id: 'heart-silhouette', label: 'Heart Pink' },
                  { id: 'heart-frame', label: 'Heart Center' },
                  { id: 'classic-pink', label: 'Classic Pink' },
                ] as { id: QrStyle; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateConfig({ qrStyle: opt.id })}
                  className={`px-2.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    config.qrStyle === opt.id
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Card Caption */}
          <div>
            <label htmlFor="qr-caption-input" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Card Caption (Optional)
            </label>
            <input
              id="qr-caption-input"
              type="text"
              maxLength={36}
              value={config.qrCaption}
              onChange={(e) => onUpdateConfig({ qrCaption: e.target.value })}
              placeholder="e.g. Scan for a surprise 🎀"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Direct Selectable Share Link */}
          <div>
            <label htmlFor="qr-share-link" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Shareable QR Link
            </label>
            <input
              id="qr-share-link"
              ref={linkInputRef}
              type="text"
              readOnly
              value={shareUrl}
              onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Save PNG</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium border border-white/10 transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Copied Link</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Actions: Preview & Offline HTML Gift */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onPreviewRecipient}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-zinc-300 hover:text-white text-xs font-medium border border-white/10 transition-colors whitespace-nowrap shrink-0"
            >
              <Eye className="w-4 h-4 shrink-0" />
              <span>Preview View</span>
            </button>
            <button
              type="button"
              onClick={() => downloadStandaloneGiftHtml(config)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/6 hover:bg-white/12 text-zinc-200 hover:text-white text-xs font-medium border border-white/10 transition-colors whitespace-nowrap shrink-0"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              <span>HTML Gift File</span>
            </button>
          </div>

          {/* Public Link / 403 & 404 Info */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-zinc-400 truncate">
                QR Target: {safeHostname}
              </span>
              <button
                type="button"
                onClick={() => setShowUrlSettings((prev) => !prev)}
                className="flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 transition-colors whitespace-nowrap shrink-0"
              >
                <Link2 className="w-3.5 h-3.5 shrink-0" />
                <span>{showUrlSettings ? 'Hide Link' : 'Edit Domain'}</span>
              </button>
            </div>

            {inDevPreview && !customOriginInput && (
              <p className="mt-1.5 text-[11px] leading-relaxed text-amber-300/90">
                গুরুত্বপূর্ণ: বাইরের ফোনে QR স্ক্যান করে লিংক খুলতে হলে AI Studio-র উপরের <span className="text-white font-semibold">Share / Deploy</span> বাটন দিয়ে অ্যাপটি পাবলিক করুন (না হলে ৪0৪ দেখাতে পারে), অথবা <span className="text-white font-semibold">HTML Gift File</span> ডাউনলোড করে সরাসরি পাঠান।
              </p>
            )}

            {showUrlSettings && (
              <div className="mt-2.5 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customOriginInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomOriginInput(val);
                      saveCustomShareOrigin(val);
                      onBaseUrlChange(val);
                    }}
                    placeholder={getDefaultShareBaseUrl()}
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/5 border border-white/12 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomOriginInput('');
                      saveCustomShareOrigin('');
                      onBaseUrlChange('');
                    }}
                    title="Reset to default Shared URL"
                    className="p-2 rounded-lg bg-white/8 hover:bg-white/14 text-zinc-300 hover:text-white transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const pub = window.location.origin.replace('://ais-dev-', '://ais-pre-');
                      setCustomOriginInput(pub);
                      saveCustomShareOrigin(pub);
                      onBaseUrlChange(pub);
                    }}
                    className="px-2.5 py-1 rounded-md bg-white/8 hover:bg-white/15 text-[11px] text-zinc-200 transition-colors"
                  >
                    Use Public (ais-pre) URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = window.location.origin;
                      setCustomOriginInput(cur);
                      saveCustomShareOrigin(cur);
                      onBaseUrlChange(cur);
                    }}
                    className="px-2.5 py-1 rounded-md bg-white/8 hover:bg-white/15 text-[11px] text-zinc-200 transition-colors"
                  >
                    Use Current URL
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-600/80 hover:bg-rose-500 text-[11px] font-medium text-white transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Test Open</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
