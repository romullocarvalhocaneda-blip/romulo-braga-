import React from 'react';
import { Power } from 'lucide-react';

interface MixerStripProps {
  label: string;
  volume: number;
  onVolumeChange: (val: number) => void;
  isEnabled: boolean;
  onToggle: () => void;
  color?: string;
}

export const MixerStrip: React.FC<MixerStripProps> = ({ 
  label, 
  volume, 
  onVolumeChange, 
  isEnabled, 
  onToggle,
  color = "var(--color-studio-accent)"
}) => {
  return (
    <div className="flex flex-col items-center bg-studio-panel/20 border border-studio-border rounded-lg p-2 w-16 h-full gap-3 shadow-inner">
      {/* VU Meter Mock */}
      <div className="w-2 flex-1 bg-black/40 rounded-full flex flex-col justify-end overflow-hidden p-[1px]">
        <div 
          className="w-full rounded-full transition-all duration-75"
          style={{ 
            height: isEnabled ? `${volume * 100}%` : '0%',
            backgroundColor: color,
            opacity: isEnabled ? 0.8 : 0.2,
            boxShadow: `0 0 10px ${color}`
          }}
        />
      </div>

      {/* Vertical Slider */}
      <div className="relative h-32 w-1.5 bg-studio-border/30 rounded-full flex justify-center">
        <input 
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          style={{
            appearance: 'none',
            background: 'transparent',
            width: '120px',
            height: '2px',
            transform: 'rotate(-90deg)',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-1px',
            marginLeft: '-60px',
            cursor: 'ns-resize'
          }}
          className="mixer-fader"
        />
        <style>{`
          .mixer-fader::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 12px;
            background: #e2e8f0;
            border: 2px solid #64748b;
            border-radius: 2px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
        `}</style>
      </div>

      {/* Label and Info */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[7.5px] font-mono font-bold text-studio-text-dim uppercase tracking-tighter text-center h-4 flex items-center">
          {label}
        </span>
        <div className="text-[8px] font-mono font-bold bg-black/40 px-1 rounded tabular-nums">
          {Math.round(volume * 100)}
        </div>
      </div>

      {/* Big ON/OFF Button */}
      <button 
        onClick={onToggle}
        className={`w-full aspect-square rounded flex items-center justify-center transition-all shadow-md group ${
          isEnabled 
            ? 'bg-studio-accent text-white shadow-studio-accent/20' 
            : 'bg-black/40 text-studio-border hover:bg-black/60'
        }`}
      >
        <Power size={12} className={isEnabled ? "animate-pulse" : ""} />
      </button>
    </div>
  );
};
