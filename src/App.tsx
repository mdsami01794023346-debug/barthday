import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  EyeOff,
  Music,
  QrCode,
  RotateCw,
  Save,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';
import { CustomizerDrawer } from './components/CustomizerDrawer';
import { CuteCatSurprise } from './components/CuteCatSurprise';
import { IntroCountdown } from './components/IntroCountdown';
import { QrShareModal } from './components/QrShareModal';
import { StarlightCanvas } from './components/StarlightCanvas';
import {
  buildShareUrl,
  decodeSceneFromParam,
  DEFAULT_SCENE_CONFIG,
  encodeSceneToParam,
  getSavedCustomShareOrigin,
  SceneConfig,
} from './types/scene';
import { ambientPlayer, CountdownCue } from './utils/audio';
import {
  deleteSavedCard,
  loadActiveDraftAsync,
  loadActiveDraftSync,
  loadSavedCardsAsync,
  loadSavedCardsSync,
  saveActiveDraft,
  saveCardToLibrary,
  SavedSceneItem,
} from './utils/storage';

function readDraftFromHash(): SceneConfig | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash || '';
  if (!hash.startsWith('#draft=')) return null;
  const param = hash.slice('#draft='.length);
  return param ? decodeSceneFromParam(param) : null;
}

function writeDraftToHash(config: SceneConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const encoded = encodeSceneToParam(config);
    const cleanUrl = `${window.location.pathname}#draft=${encoded}`;
    window.history.replaceState(null, '', cleanUrl);
  } catch {
    // Ignore history errors in restricted environments
  }
}

function getInitialState(): { config: SceneConfig; isRecipient: boolean } {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const sharedParam = params.get('s');
    if (sharedParam) {
      const decoded = decodeSceneFromParam(sharedParam);
      if (decoded) {
        return { config: decoded, isRecipient: true };
      }
    }
    const fromHash = readDraftFromHash();
    if (fromHash) {
      return { config: fromHash, isRecipient: false };
    }
    const fromStorage = loadActiveDraftSync();
    if (fromStorage) {
      return { config: fromStorage, isRecipient: false };
    }
  }
  return { config: DEFAULT_SCENE_CONFIG, isRecipient: false };
}

export default function App() {
  const initial = useMemo(() => getInitialState(), []);
  const [config, setConfig] = useState<SceneConfig>(initial.config);
  const [isRecipientMode, setIsRecipientMode] = useState<boolean>(initial.isRecipient);
  const [hudVisible, setHudVisible] = useState<boolean>(() => !initial.isRecipient);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [replayTrigger, setReplayTrigger] = useState<number>(0);
  const [countdownDone, setCountdownDone] = useState<boolean>(false);
  const [soundUnlocked, setSoundUnlocked] = useState<boolean>(false);
  const [catPreviewTrigger, setCatPreviewTrigger] = useState<number>(0);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [savedCards, setSavedCards] = useState<SavedSceneItem[]>(() => loadSavedCardsSync());
  const userMutedRef = useRef<boolean>(false);
  const userHasEditedRef = useRef<boolean>(false);
  const countdownDoneRef = useRef<boolean>(false);
  const countdownStepRef = useRef<CountdownCue>(3);
  const soundUnlockedRef = useRef<boolean>(false);
  const musicPresetRef = useRef(config.musicPreset);
  musicPresetRef.current = config.musicPreset;
  const [customShareOrigin, setCustomShareOrigin] = useState<string>(() =>
    getSavedCustomShareOrigin()
  );

  // Hydrate durable IndexedDB backup if localStorage & hash were cleared
  useEffect(() => {
    if (!initial.isRecipient && !readDraftFromHash() && !loadActiveDraftSync()) {
      void loadActiveDraftAsync().then((restored) => {
        if (restored && !userHasEditedRef.current) {
          setConfig(restored);
        }
      });
    }
    void loadSavedCardsAsync().then((cards) => {
      if (cards.length > 0) setSavedCards(cards);
    });
  }, [initial.isRecipient]);

  // Persist creator draft continuously across localStorage, IndexedDB, and URL hash
  useEffect(() => {
    if (isRecipientMode) return;
    saveActiveDraft(config);
    writeDraftToHash(config);
  }, [config, isRecipientMode]);

  // Keep selected music tune synced
  useEffect(() => {
    ambientPlayer.setPreset(config.musicPreset);
  }, [config.musicPreset]);

  // Auto-start countdown chime / music on first click or touchend (iOS Safari requires click/touchend rather than pointerdown)
  useEffect(() => {
    const startOnFirstGesture = () => {
      if (userMutedRef.current) return;
      if (!countdownDoneRef.current) {
        if (soundUnlockedRef.current) return;
        soundUnlockedRef.current = true;
        setSoundUnlocked(true);
        void ambientPlayer.unlockDuringCountdown(countdownStepRef.current, musicPresetRef.current);
        return;
      }
      if (ambientPlayer.getIsPlaying()) return;
      soundUnlockedRef.current = true;
      setSoundUnlocked(true);
      void ambientPlayer.start(musicPresetRef.current).then((started) => {
        if (started) setIsAudioOn(true);
      });
    };

    window.addEventListener('click', startOnFirstGesture, { capture: true, passive: true });
    window.addEventListener('touchend', startOnFirstGesture, { capture: true, passive: true });
    window.addEventListener('keydown', startOnFirstGesture, { passive: true });

    return () => {
      window.removeEventListener('click', startOnFirstGesture, { capture: true });
      window.removeEventListener('touchend', startOnFirstGesture, { capture: true });
      window.removeEventListener('keydown', startOnFirstGesture);
    };
  }, []);

  useEffect(() => {
    return () => {
      ambientPlayer.stop();
    };
  }, []);

  const handleUpdateConfig = (partial: Partial<SceneConfig>) => {
    userHasEditedRef.current = true;
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleResetDefaults = () => {
    userHasEditedRef.current = true;
    setConfig(DEFAULT_SCENE_CONFIG);
    setReplayTrigger((n) => n + 1);
  };

  const handleReplay = () => {
    setReplayTrigger((n) => n + 1);
  };

  const handleSaveCard = () => {
    const nextCards = saveCardToLibrary(config);
    setSavedCards(nextCards);
    writeDraftToHash(config);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2000);
  };

  const handleLoadSavedCard = (item: SavedSceneItem) => {
    userHasEditedRef.current = true;
    setConfig(item.config);
    saveActiveDraft(item.config);
    writeDraftToHash(item.config);
    setReplayTrigger((n) => n + 1);
  };

  const handleDeleteSavedCard = (id: string) => {
    setSavedCards(deleteSavedCard(id));
  };

  const handleToggleAudio = () => {
    if (isAudioOn) {
      userMutedRef.current = true;
      ambientPlayer.stop();
      setIsAudioOn(false);
    } else {
      userMutedRef.current = false;
      soundUnlockedRef.current = true;
      setSoundUnlocked(true);
      void ambientPlayer.start(config.musicPreset).then((started) => {
        setIsAudioOn(started);
      });
    }
  };

  const handleEnterRecipientPreview = () => {
    setIsQrModalOpen(false);
    setIsCustomizerOpen(false);
    setIsRecipientMode(true);
    setHudVisible(false);
    setReplayTrigger((n) => n + 1);
  };

  const handleExitRecipientMode = () => {
    setIsRecipientMode(false);
    setHudVisible(true);
    setIsCustomizerOpen(true);
    saveActiveDraft(config);
    writeDraftToHash(config);
  };

  const handleCountdownStep = useCallback((step: CountdownCue) => {
    countdownStepRef.current = step;
    if (userMutedRef.current) return;
    void ambientPlayer.playCountdownCue(step).then((played) => {
      if (played) {
        soundUnlockedRef.current = true;
        setSoundUnlocked(true);
      }
    });
  }, []);

  const handleCountdownComplete = useCallback(() => {
    countdownDoneRef.current = true;
    setCountdownDone(true);
    if (!userMutedRef.current && soundUnlockedRef.current) {
      void ambientPlayer.start(musicPresetRef.current).then((started) => {
        if (started) setIsAudioOn(true);
      });
    }
  }, []);

  const shareUrl = useMemo(
    () => buildShareUrl(config, customShareOrigin),
    [config, customShareOrigin]
  );

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-black text-white select-none">
      {/* Full-Viewport 3D Kinetic Canvas (holds pure black during 3-2-1 countdown) */}
      <StarlightCanvas
        config={config}
        replayTrigger={replayTrigger}
        started={countdownDone}
        onCanvasTap={() => {
          if (!countdownDone) return;
          if (isRecipientMode || !hudVisible) {
            setHudVisible((prev) => !prev);
          }
        }}
      />

      {/* Glowing 3 -> 2 -> 1 Black-Screen Intro Countdown (runs ONCE at initial load) */}
      {!countdownDone && (
        <IntroCountdown
          glowColor={config.glowColor}
          soundUnlocked={soundUnlocked}
          onStepChange={handleCountdownStep}
          onComplete={handleCountdownComplete}
        />
      )}

      {/* Delayed Two-Kitten Birthday Cake Surprise (delay counts after 3-2-1 finishes) */}
      <CuteCatSurprise
        config={config.catSurprise}
        previewTrigger={catPreviewTrigger}
        replayTrigger={replayTrigger}
        started={countdownDone}
      />

      {/* Tap-to-Enable Sound Prompt in Pure / Recipient View when audio hasn't started yet */}
      {countdownDone && (isRecipientMode || !hudVisible) && !isAudioOn && !isCustomizerOpen && !isQrModalOpen && (
        <button
          type="button"
          onClick={() => {
            userMutedRef.current = false;
            void ambientPlayer.start(config.musicPreset).then((started) => {
              setIsAudioOn(started);
            });
          }}
          className="fixed bottom-4 left-4 z-30 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-black/75 hover:bg-black/90 backdrop-blur-md border border-rose-400/40 text-rose-200 text-xs font-medium shadow-xl transition-colors whitespace-nowrap"
        >
          <Music className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
          <span>Tap for Sound</span>
        </button>
      )}

      {/* Compact Centered Bottom Dock (Creator Mode — Fits Cleanly on All Mobile Screens) */}
      {!isRecipientMode && hudVisible && !isCustomizerOpen && !isQrModalOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/12 shadow-2xl max-w-[calc(100vw-16px)]">
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`px-2.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${
              isAudioOn
                ? 'bg-rose-500/20 text-rose-200 border border-rose-400/35'
                : 'bg-white/6 hover:bg-white/14 text-zinc-200 hover:text-white border border-transparent'
            }`}
            aria-label={isAudioOn ? 'Mute soft melody' : 'Play soft melody'}
            title={isAudioOn ? 'Sound On (tap to mute)' : 'Sound Off (tap to play)'}
          >
            {isAudioOn ? (
              <Volume2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{isAudioOn ? 'Sound' : 'Sound'}</span>
          </button>

          <button
            type="button"
            onClick={handleReplay}
            className="p-2 rounded-xl bg-white/6 hover:bg-white/14 text-zinc-200 hover:text-white transition-colors shrink-0"
            aria-label="Replay entrance animation"
            title="Replay"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setHudVisible(false)}
            className="p-2 rounded-xl bg-white/6 hover:bg-white/14 text-zinc-200 hover:text-white transition-colors shrink-0"
            aria-label="Hide controls for pure preview"
            title="Pure fullscreen view"
          >
            <EyeOff className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSaveCard}
            className={`p-2 rounded-xl transition-colors shrink-0 ${
              justSaved
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                : 'bg-white/6 hover:bg-white/14 text-zinc-200 hover:text-white'
            }`}
            aria-label="Save wish persistently"
            title={justSaved ? 'Saved!' : 'Save wish'}
          >
            {justSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/18 text-white text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
            <span>Customize</span>
          </button>

          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-600/25 whitespace-nowrap shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 shrink-0" />
            <span>QR</span>
          </button>
        </div>
      )}

      {/* Discreet Tap-to-Show Pill in Pure / Recipient View Mode */}
      {(isRecipientMode || !hudVisible) && hudVisible && !isCustomizerOpen && !isQrModalOpen && (
        <div className="fixed bottom-4 right-4 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/65 backdrop-blur-md border border-white/12 shadow-xl">
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`px-2.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${
              isAudioOn ? 'bg-rose-500/20 text-rose-200' : 'hover:bg-white/10 text-zinc-200 hover:text-white'
            }`}
            aria-label={isAudioOn ? 'Mute melody' : 'Play melody'}
          >
            {isAudioOn ? (
              <Volume2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>Sound</span>
          </button>
          <button
            type="button"
            onClick={handleReplay}
            className="p-2 rounded-xl hover:bg-white/10 text-zinc-200 hover:text-white transition-colors"
            aria-label="Replay animation"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleExitRecipientMode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5 shrink-0" />
            <span>Edit / Create</span>
          </button>
        </div>
      )}

      {/* Slide-Over Customizer Studio */}
      <CustomizerDrawer
        isOpen={isCustomizerOpen && !isRecipientMode}
        onClose={() => setIsCustomizerOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onResetDefaults={handleResetDefaults}
        onOpenQr={() => setIsQrModalOpen(true)}
        onPreviewCatSurprise={() => {
          setCountdownDone(true);
          setCatPreviewTrigger((n) => n + 1);
        }}
        savedCards={savedCards}
        onSaveCard={handleSaveCard}
        onLoadSavedCard={handleLoadSavedCard}
        onDeleteSavedCard={handleDeleteSavedCard}
        justSaved={justSaved}
      />

      {/* Pink Heart QR Share Modal */}
      <QrShareModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        shareUrl={shareUrl}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onPreviewRecipient={handleEnterRecipientPreview}
        onBaseUrlChange={setCustomShareOrigin}
      />
    </div>
  );
}
