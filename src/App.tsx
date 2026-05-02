/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { Radio, Settings, Shield, User, Monitor, Activity, Zap, Layers, Grid, RotateCcw, Eye, Layout, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Soundboard } from './components/Soundboard';
import { Playlist } from './components/Playlist';
import { MainPlayer } from './components/MainPlayer';
import { MicControlPanel } from './components/MicControlPanel';
import { MixerStrip } from './components/MixerStrip';
import { NewsWidget } from './components/NewsWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { PlaylistBuilder } from './components/PlaylistBuilder';
import { DraggableWindow } from './components/DraggableWindow';
import { useAudioEngine } from './hooks/useAudioEngine';
import { PlaylistEntry, AudioFile } from './types';

type WindowID = 'playlist' | 'mixer' | 'news' | 'soundboard' | 'vst' | 'automation' | 'weather' | 'stats';

interface WindowState {
  id: WindowID;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isVisible: boolean;
  zIndex: number;
}

const DEFAULT_WINDOWS: WindowState[] = [
  { id: 'soundboard', title: 'SOUNDBOARD / PADS', x: 10, y: 55, width: 1580, height: 120, isVisible: true, zIndex: 10 },
  { id: 'automation', title: 'AO VIVO / PLAYER PRINCIPAL', x: 10, y: 185, width: 380, height: 620, isVisible: true, zIndex: 11 },
  { id: 'playlist', title: 'PLAYLIST / HISTÓRICO / FILA', x: 400, y: 185, width: 840, height: 620, isVisible: true, zIndex: 12 },
  { id: 'news', title: 'CENTRAL DE NOTÍCIAS E FEED', x: 1250, y: 185, width: 340, height: 620, isVisible: true, zIndex: 13 },
  { id: 'mixer', title: 'CONSOLE DE ÁUDIO (MIXER)', x: 10, y: 815, width: 1580, height: 170, isVisible: true, zIndex: 14 },
  { id: 'weather', title: 'CLIMA', x: 1350, y: 65, width: 230, height: 100, isVisible: false, zIndex: 9 },
];

export default function App() {
  const [windows, setWindows] = useState<WindowState[]>(DEFAULT_WINDOWS);
  const [maxZ, setMaxZ] = useState(20);
  const [lastClosedWindowId, setLastClosedWindowId] = useState<WindowID | null>(null);
  
  const bringToFront = (id: WindowID) => {
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: newZ } : w));
  };

  const showAndFocusWindow = (id: WindowID) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isVisible: true } : w));
    bringToFront(id);
  };

  const toggleWindow = (id: WindowID) => {
    setWindows(prev => {
      const window = prev.find(w => w.id === id);
      if (window?.isVisible) {
        setLastClosedWindowId(id);
      }
      return prev.map(w => w.id === id ? { ...w, isVisible: !w.isVisible } : w);
    });
    
    // If we are opening it, bring to front
    const target = windows.find(w => w.id === id);
    if (!target?.isVisible) {
      bringToFront(id);
    }
  };

  const undoLastClose = () => {
    if (lastClosedWindowId) {
      toggleWindow(lastClosedWindowId);
      setLastClosedWindowId(null);
    }
  };

  const updateWindowPos = (id: WindowID, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const updateWindowSize = (id: WindowID, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  };

  const resetLayout = () => setWindows(DEFAULT_WINDOWS);

  const [queue, setQueue] = useState<PlaylistEntry[]>([]);
  const [history, setHistory] = useState<PlaylistEntry[]>([]);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    aux1Volume,
    setAux1Volume,
    aux2Volume,
    setAux2Volume,
    isAux1Enabled,
    setIsAux1Enabled,
    isAux2Enabled,
    setIsAux2Enabled,
    playTrack,
    togglePlay,
    seek,
    playPad,
    stopPad,
    activePadIds,
    micVolume,
    setMicVolume,
    isMicEnabled,
    toggleMic,
    isPlaybackEnabled,
    setIsPlaybackEnabled,
    isEchoEnabled,
    setIsEchoEnabled,
    playAux
  } = useAudioEngine();

  // ... previous handlers ...
  const [lastError, setLastError] = useState<string | null>(null);

  const handlePlayTrack = useCallback((track: AudioFile) => {
    if (!track.url) {
      setLastError(`Arquivo "${track.name}" está OFFLINE. Vincule-o na lista.`);
      return;
    }
    setLastError(null);
    playTrack(track);
    if (currentTrack?.id !== track.id) {
      setHistory(prev => {
        const item = prev.find(i => i.id === track.id) || track as PlaylistEntry;
        return [item, ...prev.filter(i => i.id !== track.id)].slice(0, 50);
      });
      setQueue(prev => prev.filter(i => i.id !== track.id));
    }
  }, [playTrack, currentTrack]);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    // Find first track with URL
    const nextTrack = queue.find(t => !!t.url);
    if (nextTrack) {
      handlePlayTrack(nextTrack);
    } else {
      setLastError("Nenhum arquivo disponível (ONLINE) na fila.");
    }
  }, [queue, handlePlayTrack]);

  const handlePrev = useCallback(() => {
    if (history.length <= 1) return;
    handlePlayTrack(history[1]);
  }, [history, handlePlayTrack]);

  const [time, setTime] = useState(new Date());
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSpeakTime = () => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    // Texto mais profissional para rádio
    const text = `Hora certa, confira agora! ${hours} horas e ${minutes} minutos.`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    
    // Tenta encontrar uma voz feminina e clara (especialmente as do Google que são melhores)
    const voices = window.speechSynthesis.getVoices();
    const preferableVoice = voices.find(v => 
      v.lang.includes('pt-BR') && 
      (v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Maria') || v.name.includes('Luciana') || v.name.includes('Francisca'))
    ) || voices.find(v => v.lang.includes('pt-BR'));
    
    if (preferableVoice) {
      utterance.voice = preferableVoice;
    }
    
    utterance.rate = 1.05; // Velocidade levemente aumentada para fluidez de rádio
    utterance.pitch = 1.1; // Tom levemente mais agudo para clareza feminina
    utterance.volume = 1.0;
    
    window.speechSynthesis.cancel(); // Para qualquer fala anterior
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const handleAutoNext = () => {
      if (queue.length > 0) {
        handleNext(); // Use handleNext to skip offline tracks
      }
    };

    const handleTrackError = (e: any) => {
      setLastError(`Erro: ${e.detail.name}. ${e.detail.message || ''}`);
      setTimeout(handleNext, 2000); // Try next one after a delay
    };

    const handleMicError = (e: any) => {
      setLastError(`Erro no Microfone: ${e.detail.message}`);
    };

    window.addEventListener('track-ended', handleAutoNext);
    window.addEventListener('track-error', handleTrackError);
    window.addEventListener('mic-error', handleMicError);
    return () => {
      window.removeEventListener('track-ended', handleAutoNext);
      window.removeEventListener('track-error', handleTrackError);
      window.removeEventListener('mic-error', handleMicError);
    };
  }, [queue, handleNext]);

  return (
    <div id="studio-root" className="h-screen w-screen flex flex-col bg-studio-bg text-studio-text overflow-hidden select-none">
      {/* Error Toast */}
      {lastError && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-studio-error text-white px-6 py-2 rounded-full shadow-2xl font-bold text-xs flex items-center gap-3 animate-bounce">
          <Shield size={16} />
          {lastError}
          <button onClick={() => setLastError(null)} className="ml-2 hover:opacity-70">×</button>
        </div>
      )}
      {/* Top Header */}
      <header className="h-10 border-b border-studio-border flex items-center justify-between px-4 bg-studio-card shrink-0">
        <div className="flex items-center gap-3">
          <Radio className="text-studio-accent w-4 h-4" />
          <h1 className="font-bold text-[10px] tracking-widest uppercase">YORU AUTOMATION <span className="text-studio-accent">WEB SYSTEM</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-[11px] font-mono font-bold tracking-tighter tabular-nums text-studio-accent bg-black/40 px-3 py-0.5 rounded border border-white/5 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <button 
                onClick={handleSpeakTime}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-studio-accent text-black rounded hover:bg-white transition-all transform active:scale-95"
                title="Falar Hora Certa"
              >
                <Volume2 size={10} />
                <span className="text-[8px] font-bold">HORA CERTA</span>
              </button>
            </div>
            
            {/* Desktop Manager Menu */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded transition-all border border-white/10 hover:border-studio-accent/40 group">
                <Layout size={10} className="text-studio-accent" />
                <span className="text-[9px] font-mono">WORKSPACE</span>
              </button>
              
              <div className="absolute right-0 top-full mt-1 w-48 bg-studio-card border border-studio-border rounded shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-[200]">
                <div className="p-2 border-b border-studio-border bg-studio-panel/40">
                  <span className="text-[8px] font-mono opacity-40 uppercase font-bold">Gerenciar Janelas</span>
                </div>
                <div className="p-1 space-y-0.5">
                  {windows.map(w => (
                    <button 
                      key={w.id}
                      onClick={() => showAndFocusWindow(w.id)}
                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-studio-accent/20 rounded transition-all group/item"
                    >
                      <div className="flex items-center gap-2">
                        {w.isVisible ? <Eye size={10} className="text-studio-success" /> : <Monitor size={10} className="opacity-20" />}
                        <span className={`text-[9px] font-bold ${w.isVisible ? 'text-white' : 'opacity-30'}`}>{w.title}</span>
                      </div>
                      <span className="text-[7px] bg-studio-accent/20 text-studio-accent px-1 rounded opacity-0 group-hover/item:opacity-100 transition-opacity">
                        {w.isVisible ? 'FOCAR' : 'ABRIR'}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="p-1 border-t border-studio-border mt-1 bg-black/20 flex flex-col gap-1">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setWindows(prev => prev.map(w => ({ ...w, isVisible: true })))}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 hover:bg-studio-accent/20 hover:text-studio-accent border border-transparent hover:border-studio-accent/30 rounded transition-colors"
                    >
                      <Grid size={10} />
                      <span className="text-[8px] font-bold">MOSTRAR TODOS</span>
                    </button>
                    <button 
                      onClick={() => setWindows(prev => prev.map(w => ({ ...w, isVisible: false })))}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 hover:bg-white/10 rounded transition-colors"
                    >
                      <Monitor size={10} className="opacity-40" />
                      <span className="text-[8px] font-bold">OCULTAR</span>
                    </button>
                  </div>
                </div>
                <div className="p-1 border-t border-studio-border bg-black/40 flex flex-col gap-1">
                  {lastClosedWindowId && (
                    <button 
                      onClick={undoLastClose}
                      className="w-full flex items-center gap-2 px-2 py-1.5 bg-studio-success/10 text-studio-success hover:bg-studio-success/20 rounded transition-all animate-pulse"
                    >
                      <RotateCcw size={10} />
                      <span className="text-[9px] font-bold">DESFAZER EXCLUSÃO</span>
                    </button>
                  )}
                  <button 
                    onClick={resetLayout}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-studio-error/10 hover:text-studio-error rounded transition-colors group/reset"
                  >
                    <RotateCcw size={10} className="group-hover/reset:rotate-[-45deg] transition-transform" />
                    <span className="text-[9px] font-bold">REDEFINIR POSIÇÕES</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4 opacity-40">
            <Activity size={14} />
            <Zap size={14} />
            <Layers size={14} />
            <Settings size={14} />
          </div>
        </div>
      </header>

      {/* Desktop Area */}
      <main className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
        <AnimatePresence>
          {windows.map(w => (
            <DraggableWindow
              key={w.id}
              id={w.id}
              title={w.title}
              isVisible={w.isVisible}
              x={w.x}
              y={w.y}
              width={w.width}
              height={w.height}
              zIndex={w.zIndex}
              onClose={() => toggleWindow(w.id)}
              onFocus={() => bringToFront(w.id)}
              onMove={(x, y) => updateWindowPos(w.id, x, y)}
              onResize={(width, height) => updateWindowSize(w.id, width, height)}
            >
              {w.id === 'playlist' && (
                <div className="p-3 h-full flex flex-col">
                  <Playlist 
                    queue={queue}
                    history={history}
                    currentTrack={currentTrack}
                    onSetQueue={setQueue}
                    onSetHistory={setHistory}
                    onPlayTrack={handlePlayTrack}
                    onOpenBuilder={() => setIsBuilderOpen(true)}
                  />
                </div>
              )}

              {w.id === 'news' && <NewsWidget />}

              {w.id === 'soundboard' && (
                <div className="h-full overflow-y-auto studio-scroll">
                  <Soundboard onPlayPad={playPad} onStopPad={stopPad} activePadIds={activePadIds} />
                </div>
              )}

              {w.id === 'mixer' && (
                <div className="h-full flex items-center justify-center bg-black/20 p-4">
                  <div className="flex gap-4 h-full overflow-x-auto no-scrollbar">
                    <MixerStrip label="Master" volume={volume} onVolumeChange={setVolume} isEnabled={isPlaybackEnabled} onToggle={() => setIsPlaybackEnabled(!isPlaybackEnabled)} color="var(--color-studio-accent)" />
                    <MixerStrip label="Mic" volume={micVolume} onVolumeChange={setMicVolume} isEnabled={isMicEnabled} onToggle={toggleMic} color="var(--color-studio-error)" />
                    <MixerStrip label="Aux 1" volume={aux1Volume} onVolumeChange={setAux1Volume} isEnabled={isAux1Enabled} onToggle={() => setIsAux1Enabled(!isAux1Enabled)} color="var(--color-studio-success)" />
                    <MixerStrip label="Aux 2" volume={aux2Volume} onVolumeChange={setAux2Volume} isEnabled={isAux2Enabled} onToggle={() => setIsAux2Enabled(!isAux2Enabled)} color="var(--color-studio-success)" />
                  </div>
                </div>
              )}

              {w.id === 'automation' && (
                <div className="p-3 h-full flex flex-col gap-3">
                   <MainPlayer 
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    volume={volume}
                    isPlaybackEnabled={isPlaybackEnabled}
                    onTogglePlayback={() => setIsPlaybackEnabled(!isPlaybackEnabled)}
                    onTogglePlay={() => {
                      if (!currentTrack && queue.length > 0) {
                        handlePlayTrack(queue[0]);
                      } else {
                        togglePlay();
                      }
                    }}
                    onSeek={seek}
                    onVolumeChange={setVolume}
                    onNext={handleNext}
                    onPrev={handlePrev}
                  />
                  <MicControlPanel isEnabled={isMicEnabled} onToggle={toggleMic} volume={micVolume} onVolumeChange={setMicVolume} isEchoEnabled={isEchoEnabled} onToggleEcho={() => setIsEchoEnabled(!isEchoEnabled)} />
                </div>
              )}

              {w.id === 'weather' && <WeatherWidget />}
            </DraggableWindow>
          ))}
        </AnimatePresence>

        {/* Workspace Quick Toggle (Desktop Icons Style) */}
        {!isBuilderOpen && (
          <div className="absolute top-4 left-4 grid grid-cols-1 gap-4">
            {windows.filter(w => !w.isVisible).map(w => (
              <button 
                key={w.id}
                onClick={() => toggleWindow(w.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 bg-studio-accent/20 rounded-lg flex items-center justify-center border border-studio-accent/20 group-hover:bg-studio-accent/40 group-hover:border-studio-accent transition-all">
                  <Monitor size={18} className="text-studio-accent" />
                </div>
                <span className="text-[7px] font-mono font-bold uppercase tracking-tighter text-white/50 group-hover:text-white transition-colors">{w.title}</span>
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="h-6 border-t border-studio-border bg-studio-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-6 text-[8px] font-mono uppercase opacity-30">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isPlaybackEnabled ? 'bg-studio-success animate-pulse' : 'bg-studio-border'}`} />
            <span>Master Output: Transmitting</span>
          </div>
          <span>Library: 204 FAixas</span>
          <span>Engine: Yoru Automation v1.0 [PRODUCTION MODE]</span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-10 bg-studio-panel rounded-full overflow-hidden">
              <div className="h-full bg-studio-accent w-1/4" />
            </div>
            <span className="text-[8px] font-mono opacity-20">CPU</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-10 bg-studio-panel rounded-full overflow-hidden">
              <div className="h-full bg-studio-success w-1/2" />
            </div>
            <span className="text-[8px] font-mono opacity-20">RAM</span>
          </div>
        </div>
      </footer>

      {isBuilderOpen && (
        <PlaylistBuilder 
          onClose={() => setIsBuilderOpen(false)} 
          onSendToPlayer={(items) => setQueue([...queue, ...items])}
        />
      )}
    </div>
  );
}

function LogStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-[10px]">
      <span className="opacity-40 italic">{label}</span>
      <span className="font-mono font-bold">{value}</span>
    </div>
  );
}


