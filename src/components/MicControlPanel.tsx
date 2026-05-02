import React from 'react';
import { Mic, MicOff, Waves, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  volume: number;
  onVolumeChange: (val: number) => void;
  isEnabled: boolean;
  onToggle: () => void;
  isEchoEnabled: boolean;
  onToggleEcho: () => void;
}

export const MicControlPanel: React.FC<Props> = ({
  volume,
  onVolumeChange,
  isEnabled,
  onToggle,
  isEchoEnabled,
  onToggleEcho
}) => {
  return (
    <div className="studio-card p-4 bg-studio-panel/20 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${isEnabled ? 'bg-studio-error shadow-[0_0_10px_#f87171]' : 'bg-studio-border'}`}>
            {isEnabled ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-studio-text-dim" />}
          </div>
          <span className="text-xs font-mono uppercase tracking-wider font-bold">Microfone</span>
        </div>
        <div className="flex items-center gap-2">
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isEnabled ? 'bg-studio-error text-white' : 'bg-studio-border text-studio-text-dim opacity-50'}`}>
            {isEnabled ? 'LIVE' : 'MUTE'}
          </span>
        </div>
      </div>

      {/* Mic Main Toggle */}
      <button
        onClick={onToggle}
        className={`w-full py-3 rounded-md font-bold text-xs uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2
          ${isEnabled 
            ? 'bg-studio-error text-white shadow-lg active:scale-95' 
            : 'bg-studio-panel border border-studio-border text-studio-text-dim hover:bg-studio-border'
          }`}
      >
        {isEnabled ? 'Desligar Microfone' : 'Ativar Microfone'}
      </button>

      {/* Mic Gain Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono opacity-50 uppercase">
          <span>Ganho de Entrada</span>
          <span>{Math.round(volume * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <Volume2 className="w-3 h-3 opacity-30" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 accent-studio-error"
          />
        </div>
      </div>

      {/* Effects Section */}
      <div className="mt-2 pt-3 border-t border-studio-border/50">
        <h4 className="text-[10px] font-mono opacity-40 uppercase mb-2">Efeitos de Voz</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onToggleEcho}
            disabled={!isEnabled}
            className={`p-2 rounded border flex items-center justify-center gap-2 transition-all disabled:opacity-20
              ${isEchoEnabled && isEnabled
                ? 'bg-studio-accent/20 border-studio-accent text-studio-accent' 
                : 'bg-studio-panel/50 border-studio-border text-studio-text-dim'}
            `}
          >
            <Waves className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase">Eco / Delay</span>
          </button>
          
          <button
            disabled
            className="p-2 rounded border border-studio-border bg-studio-panel/20 text-studio-text-dim opacity-30 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="text-[10px] font-bold uppercase">Compressor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
