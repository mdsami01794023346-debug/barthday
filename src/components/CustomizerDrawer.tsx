import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookmarkCheck,
  Check,
  Layers,
  Play,
  Plus,
  QrCode,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  CakeStyle,
  CatPosition,
  COLOR_PALETTES,
  DEFAULT_CAT_SURPRISE,
  DEFAULT_SCENE_CONFIG,
  DoodleStyle,
  FlowDirection,
  FontPreset,
  MusicPreset,
  ParticleTheme,
  QUICK_SYMBOLS,
  SCENE_PRESETS,
  SceneConfig,
} from '../types/scene';
import { SavedSceneItem } from '../utils/storage';

interface CustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: SceneConfig;
  onUpdateConfig: (partial: Partial<SceneConfig>) => void;
  onResetDefaults: () => void;
  onOpenQr: () => void;
  onPreviewCatSurprise: () => void;
  savedCards: SavedSceneItem[];
  onSaveCard: () => void;
  onLoadSavedCard: (item: SavedSceneItem) => void;
  onDeleteSavedCard: (id: string) => void;
  justSaved: boolean;
}

export const CustomizerDrawer: React.FC<CustomizerDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onResetDefaults,
  onOpenQr,
  onPreviewCatSurprise,
  savedCards,
  onSaveCard,
  onLoadSavedCard,
  onDeleteSavedCard,
  justSaved,
}) => {
  const [activeInputIndex, setActiveInputIndex] = useState<number>(0);
  const [bulkMode, setBulkMode] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleMessageChange = (index: number, value: string) => {
    const updated = [...config.messages];
    updated[index] = value;
    onUpdateConfig({ messages: updated });
  };

  const handleAddMessage = () => {
    const next = [...config.messages, ''];
    onUpdateConfig({ messages: next });
    setActiveInputIndex(next.length - 1);
  };

  const handleRemoveMessage = (index: number) => {
    if (config.messages.length <= 1) {
      onUpdateConfig({ messages: [''] });
      return;
    }
    const next = config.messages.filter((_, idx) => idx !== index);
    onUpdateConfig({ messages: next });
    setActiveInputIndex(Math.max(0, Math.min(activeInputIndex, next.length - 1)));
  };

  const handleInsertSymbol = (symbol: string) => {
    if (bulkMode) {
      const lines = [...config.messages];
      const lastIdx = Math.max(0, lines.length - 1);
      lines[lastIdx] = `${lines[lastIdx] ?? ''}${symbol}`;
      onUpdateConfig({ messages: lines });
      return;
    }
    const targetIdx = Math.max(0, Math.min(activeInputIndex, config.messages.length - 1));
    const updated = [...config.messages];
    const current = updated[targetIdx] ?? '';
    updated[targetIdx] = current.length > 0 && !current.endsWith(' ') ? `${current} ${symbol}` : `${current}${symbol}`;
    onUpdateConfig({ messages: updated });
  };

  const handleBulkChange = (rawText: string) => {
    const lines = rawText.split('\n');
    onUpdateConfig({ messages: lines.length > 0 ? lines : [''] });
  };

  const applyPreset = (presetId: string) => {
    const found = SCENE_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    onUpdateConfig({
      ...found.config,
      direction: found.config.direction ?? config.direction,
    });
  };

  const catCfg = config.catSurprise ?? DEFAULT_CAT_SURPRISE;
  const updateCatSurprise = (partial: Partial<typeof catCfg>) => {
    onUpdateConfig({
      catSurprise: { ...catCfg, ...partial },
    });
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] bg-zinc-950/90 backdrop-blur-xl border-l border-white/10 text-white flex flex-col shadow-2xl"
      aria-label="Scene Customizer Studio"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white">
            Customize Scene
          </h2>
          <p className="text-xs text-zinc-400">
            Live 3D preview updates as you edit
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onResetDefaults}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset to defaults"
            aria-label="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close customizer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto studio-scroll px-5 py-5 space-y-6">
        {/* Saved Designs List (persists across reloads & visits) */}
        {savedCards.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <BookmarkCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Saved Wishes ({savedCards.length})</span>
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {savedCards.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center rounded-lg bg-white/6 border border-white/10 overflow-hidden max-w-full"
                >
                  <button
                    type="button"
                    onClick={() => onLoadSavedCard(item)}
                    className="px-2.5 py-1.5 text-xs text-zinc-200 hover:text-white hover:bg-white/10 transition-colors truncate max-w-[180px]"
                    title={`Load "${item.title}"`}
                  >
                    {item.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSavedCard(item.id)}
                    className="px-1.5 py-1.5 text-zinc-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    aria-label={`Delete ${item.title}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 1. Occasion Presets */}
        <section>
          <h3 className="text-xs font-semibold text-zinc-400 mb-2.5">
            Occasion Templates
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {SCENE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/6 hover:bg-white/14 text-zinc-200 border border-white/10 transition-colors whitespace-nowrap shrink-0"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Messages Editor (Multiple Lines) */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <h3 className="text-xs font-semibold text-zinc-400">
              Floating Messages ({config.messages.filter((m) => m.trim()).length})
            </h3>
            <button
              type="button"
              onClick={() => setBulkMode((prev) => !prev)}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors whitespace-nowrap"
            >
              {bulkMode ? 'Row Editor' : 'Multi-line Paste'}
            </button>
          </div>

          {bulkMode ? (
            <textarea
              rows={5}
              value={config.messages.join('\n')}
              onChange={(e) => handleBulkChange(e.target.value)}
              placeholder="Write one phrase per line..."
              className="w-full rounded-xl bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 resize-y"
            />
          ) : (
            <div className="space-y-2">
              {config.messages.map((msg, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={msg}
                    onFocus={() => setActiveInputIndex(idx)}
                    onChange={(e) => handleMessageChange(idx, e.target.value)}
                    placeholder={`Message line ${idx + 1}...`}
                    className="flex-1 min-w-0 rounded-xl bg-white/5 border border-white/12 px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMessage(idx)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-white/8 transition-colors shrink-0"
                    aria-label={`Remove line ${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddMessage}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/18 hover:border-rose-500/60 hover:bg-rose-500/8 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Message</span>
              </button>
            </div>
          )}

          {/* Quick Symbols Bar */}
          <div className="mt-2.5">
            <span className="block text-[11px] text-zinc-500 mb-1.5">
              Tap to append symbol to active line
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SYMBOLS.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleInsertSymbol(sym)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/6 hover:bg-white/16 border border-white/10 text-sm transition-colors"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Flow Direction */}
        <section>
          <h3 className="text-xs font-semibold text-zinc-400 mb-2.5">
            Text Flow Direction
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'rtl', label: 'Right → Left', icon: ArrowLeft },
                { id: 'ttb', label: 'Top → Bottom', icon: ArrowDown },
                { id: 'btt', label: 'Bottom → Top', icon: ArrowUp },
                { id: 'drift', label: '3D Zoom Drift', icon: Layers },
              ] as { id: FlowDirection; label: string; icon: React.ComponentType<{ className?: string }> }[]
            ).map((dir) => {
              const Icon = dir.icon;
              const active = config.direction === dir.id;
              return (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() => onUpdateConfig({ direction: dir.id })}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{dir.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Typography & Glow Palette */}
        <section className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2.5">
              Typography Style
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'rounded', label: 'Neon Rounded' },
                  { id: 'serif', label: 'Romantic Serif' },
                  { id: 'script', label: 'Handwritten' },
                  { id: 'display', label: 'Clean Modern' },
                ] as { id: FontPreset; label: string }[]
              ).map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onUpdateConfig({ fontPreset: font.id })}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                    config.fontPreset === font.id
                      ? 'bg-white text-black border-white'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-2.5">
              Text &amp; Glow Color
            </h3>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_PALETTES.map((pal) => {
                const selected =
                  config.glowColor.toLowerCase() === pal.glow.toLowerCase() &&
                  config.textColor.toLowerCase() === pal.text.toLowerCase();
                return (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() =>
                      onUpdateConfig({ textColor: pal.text, glowColor: pal.glow })
                    }
                    title={pal.label}
                    aria-label={pal.label}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      selected ? 'border-rose-500 scale-110' : 'border-white/25 hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: pal.text,
                      boxShadow: `0 0 12px ${pal.glow}`,
                    }}
                  />
                );
              })}
              <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer ml-auto">
                <span>Custom</span>
                <input
                  type="color"
                  value={config.glowColor}
                  onChange={(e) =>
                    onUpdateConfig({ glowColor: e.target.value, textColor: '#ffffff' })
                  }
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  aria-label="Custom glow color"
                />
              </label>
            </div>
          </div>
        </section>

        {/* 5. Line-Art Text Doodles (IMG_0759 style) */}
        <section>
          <h3 className="text-xs font-semibold text-zinc-400 mb-2.5">
            Glowing White Line Icons
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'love-doodles', label: 'Love Icons (🫶🤍🩹)' },
                { id: 'birthday-doodles', label: 'Birthday Icons' },
                { id: 'ribbon-skull', label: 'Bow & Skull' },
                { id: 'none', label: 'Text Only' },
              ] as { id: DoodleStyle; label: string }[]
            ).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => onUpdateConfig({ doodleStyle: d.id })}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                  config.doodleStyle === d.id
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* 6. Floating Particles */}
        <section>
          <h3 className="text-xs font-semibold text-zinc-400 mb-2.5">
            Floating 3D Particles
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'crimson-hearts', label: 'Red Hearts' },
                { id: 'pink-hearts', label: 'Pink Hearts' },
                { id: 'ribbon-skull', label: 'Ribbon & Skull 🎀☠️' },
                { id: 'gold-stars', label: 'Golden Stars ✨' },
                { id: 'none', label: 'Stars Only' },
              ] as { id: ParticleTheme; label: string }[]
            ).map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => onUpdateConfig({ particleTheme: theme.id })}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                  config.particleTheme === theme.id
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </section>

        {/* 6.5 Background Music Tune */}
        <section>
          <h3 className="text-xs font-semibold text-zinc-400 mb-2.5">
            Background Music Tune
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'birthday', label: 'Happy Birthday 🎂' },
                { id: 'romantic', label: 'Romantic 💖' },
              ] as { id: MusicPreset; label: string }[]
            ).map((tune) => (
              <button
                key={tune.id}
                type="button"
                onClick={() => onUpdateConfig({ musicPreset: tune.id })}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                  config.musicPreset === tune.id
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {tune.label}
              </button>
            ))}
          </div>
        </section>

        {/* 7. Motion & 3D Depth Sliders */}
        <section className="space-y-4 pt-1 border-t border-white/10">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-300 font-medium">Text Size</span>
              <span className="text-zinc-400 font-mono tabular-nums">
                {Math.round(config.textScale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.45"
              max="1.4"
              step="0.05"
              value={config.textScale}
              onChange={(e) => onUpdateConfig({ textScale: parseFloat(e.target.value) })}
              className="w-full studio-slider"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-300 font-medium">Flow Speed</span>
              <span className="text-zinc-400 font-mono tabular-nums">
                {config.speed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="4.0"
              step="0.1"
              value={config.speed}
              onChange={(e) => onUpdateConfig({ speed: parseFloat(e.target.value) })}
              className="w-full studio-slider"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-300 font-medium">Text Density</span>
              <span className="text-zinc-400 font-mono tabular-nums">
                {config.density} lines
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="180"
              step="5"
              value={config.density}
              onChange={(e) => onUpdateConfig({ density: parseInt(e.target.value, 10) })}
              className="w-full studio-slider"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-300 font-medium">3D Perspective Tilt</span>
              <span className="text-zinc-400 font-mono tabular-nums">
                {config.tiltAngle}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="26"
              step="1"
              value={config.tiltAngle}
              onChange={(e) => onUpdateConfig({ tiltAngle: parseInt(e.target.value, 10) })}
              className="w-full studio-slider"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-300 font-medium">Neon Glow Intensity</span>
              <span className="text-zinc-400 font-mono tabular-nums">
                {Math.round(config.glowStrength * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.8"
              step="0.1"
              value={config.glowStrength}
              onChange={(e) => onUpdateConfig({ glowStrength: parseFloat(e.target.value) })}
              className="w-full studio-slider"
            />
          </div>
        </section>
        {/* 8. Cute Cat Surprise Controls */}
        <section className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">
                🐱 Cute Cat Surprise
              </h3>
              <p className="text-[11px] text-zinc-400">
                Delayed two-kitten cake push surprise
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={catCfg.enabled}
              onClick={() => updateCatSurprise({ enabled: !catCfg.enabled })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                catCfg.enabled
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-white/6 border-white/15 text-zinc-300 hover:bg-white/12'
              }`}
            >
              {catCfg.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Animation Delay (1-30s) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-300 font-medium">Animation Delay</span>
              <span className="text-zinc-400 font-mono tabular-nums">
                {catCfg.delaySeconds}s
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={catCfg.delaySeconds}
              onChange={(e) =>
                updateCatSurprise({ delaySeconds: parseInt(e.target.value, 10) })
              }
              className="w-full studio-slider"
            />
          </div>

          {/* Animation Size */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-300 font-medium">Animation Size</span>
              <span className="text-zinc-400 font-mono tabular-nums">
                {Math.round(catCfg.scale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.65"
              max="1.45"
              step="0.05"
              value={catCfg.scale}
              onChange={(e) =>
                updateCatSurprise({ scale: parseFloat(e.target.value) })
              }
              className="w-full studio-slider"
            />
          </div>

          {/* Cat Position */}
          <div>
            <span className="block text-xs text-zinc-300 font-medium mb-2">
              Cat Position
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'bottom-center', label: 'Bottom Center' },
                  { id: 'bottom-left', label: 'Bottom Left' },
                  { id: 'bottom-right', label: 'Bottom Right' },
                  { id: 'center', label: 'Center Stage' },
                ] as { id: CatPosition; label: string }[]
              ).map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => updateCatSurprise({ position: pos.id })}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                    catCfg.position === pos.id
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Birthday Cake Style */}
          <div>
            <span className="block text-xs text-zinc-300 font-medium mb-2">
              Birthday Cake Style
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'strawberry', label: 'Strawberry Pink' },
                  { id: 'chocolate', label: 'Choco Fudge' },
                  { id: 'matcha', label: 'Matcha Cream' },
                  { id: 'galaxy', label: 'Starlight Berry' },
                ] as { id: CakeStyle; label: string }[]
              ).map((cake) => (
                <button
                  key={cake.id}
                  type="button"
                  onClick={() => updateCatSurprise({ cakeStyle: cake.id })}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                    catCfg.cakeStyle === cake.id
                      ? 'bg-white text-black border-white'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {cake.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Animation Button */}
          <button
            type="button"
            disabled={!catCfg.enabled}
            onClick={() => {
              onPreviewCatSurprise();
              if (typeof window !== 'undefined' && window.innerWidth < 640) {
                onClose();
              }
            }}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
              catCfg.enabled
                ? 'bg-white/12 hover:bg-white/20 border-white/20 text-white'
                : 'bg-white/4 border-white/8 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5 shrink-0" />
            <span>
              {catCfg.enabled ? 'Preview Animation' : 'Enable Above to Preview'}
            </span>
          </button>
        </section>
      </div>

      {/* Footer CTA inside Drawer */}
      <div className="p-4 border-t border-white/10 bg-black/40 shrink-0 grid grid-cols-[auto_1fr] gap-2">
        <button
          type="button"
          onClick={onSaveCard}
          className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap ${
            justSaved
              ? 'bg-emerald-600/25 border-emerald-400/50 text-emerald-200'
              : 'bg-white/10 hover:bg-white/18 border-white/15 text-white'
          }`}
        >
          {justSaved ? (
            <>
              <Check className="w-4 h-4 shrink-0" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 shrink-0" />
              <span>Save</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onOpenQr}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-rose-600/20 whitespace-nowrap"
        >
          <QrCode className="w-4 h-4 shrink-0" />
          <span>Generate Pink QR</span>
        </button>
      </div>
    </aside>
  );
};

export { DEFAULT_SCENE_CONFIG };
