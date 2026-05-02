import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Clock, Music, Music2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AudioFile } from '../types';
import { VUMeter } from './VUMeter';

interface Props {
  currentTrack: AudioFile | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isPlaybackEnabled: boolean;
  onTogglePlayback: () => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const MainPlayer: React.FC<Props> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isPlaybackEnabled,
  onTogglePlayback,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onNext,
  onPrev
}) => {
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 p-3 studio-card bg-studio-panel/40 border-studio-border">
      <div className="flex items-center gap-4">
        <div className="h-20 w-16 shrink-0">
          <VUMeter isPlaying={isPlaying && isPlaybackEnabled} volume={volume} />
        </div>
        
        <div className="flex-1 flex flex-col justify-between h-20">
          {/* Track Info */}
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1 pr-4">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`px-1 rounded text-[8px] font-bold uppercase ${isPlaying && isPlaybackEnabled ? 'bg-studio-success text-black' : 'bg-studio-border text-studio-text-dim'}`}>
                  {isPlaying && isPlaybackEnabled ? 'ON AIR' : 'STANDBY'}
                </span>
                <button 
                  onClick={onTogglePlayback}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all
                    ${isPlaybackEnabled ? 'bg-studio-accent/20 text-studio-accent' : 'bg-studio-panel text-studio-text-dim'}
                  `}
                >
                  {isPlaybackEnabled ? 'MASTER ON' : 'MASTER OFF'}
                </button>
              </div>
              <h2 className="text-lg font-bold truncate tracking-tight text-white leading-tight">
                {currentTrack ? currentTrack.name : 'SISTEMA EM ESPERA'}
              </h2>
              {currentTrack && !duration && isPlaying && (
                <p className="text-[10px] text-studio-accent animate-pulse font-bold">CARREGANDO...</p>
              )}
            </div>
            
            <div className="text-right shrink-0">
               {currentTrack && (
                <span className="text-[10px] font-mono text-studio-accent uppercase font-bold">
                  -{formatTime(duration - currentTime)}
                </span>
              )}
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-0.5">
            <div 
              className="h-1.5 w-full bg-studio-bg rounded-full overflow-hidden cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                onSeek((x / rect.width) * duration);
              }}
            >
              <div 
                className="h-full bg-studio-accent" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono opacity-40">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-studio-border/30 pt-2">
        <div className="flex items-center gap-3">
          <button onClick={onPrev} className="p-1 hover:text-studio-accent transition-colors"><SkipBack size={18} /></button>
          <button 
            onClick={onTogglePlay} 
            className="w-10 h-10 rounded-full bg-studio-accent flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
          >
            {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
          </button>
          <button onClick={onNext} className="p-1 hover:text-studio-accent transition-colors"><SkipForward size={18} /></button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3 h-3 opacity-40 shrink-0" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 accent-studio-accent"
            />
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-studio-accent">
              <Clock size={10} />
              <span className="text-[10px] font-mono font-bold tracking-tighter">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
