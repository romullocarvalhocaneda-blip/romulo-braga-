import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Play, Square, X } from 'lucide-react';
import { SoundPad, AudioFile } from '../types';

interface Props {
  pad: SoundPad;
  onUpdate: (pad: SoundPad) => void;
  onPlay: (pad: SoundPad) => void;
  onStop: (pad: SoundPad) => void;
  onRemove?: (pad: SoundPad) => void;
  onFileSelect?: (file: File) => void;
  isActive?: boolean;
}

export const SoundPadButton: React.FC<Props> = ({ pad, onUpdate, onPlay, onStop, onRemove, onFileSelect, isActive }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onFileSelect) {
        onFileSelect(file);
      } else {
        const url = URL.createObjectURL(file);
        const audioFile: AudioFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          url: url,
          type: 'fx'
        };
        onUpdate({ ...pad, label: file.name.split('.')[0], file: audioFile });
      }
    }
  };

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (pad.file) {
      onPlay(pad);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative group shrink-0">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleInteraction}
        className={`w-20 aspect-square flex flex-col items-center justify-center p-1 rounded border transition-all 
          ${pad.file 
            ? isActive
              ? 'bg-blue-600/40 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse'
              : 'bg-studio-panel border-studio-accent text-studio-text' 
            : 'bg-studio-panel/30 border-studio-border border-dashed text-studio-text-dim hover:border-studio-accent/50'
          }`}
      >
        {pad.file ? (
          <>
            <Play className="w-5 h-5 mb-1 text-studio-accent drop-shadow-[0_0_5px_rgba(255,51,0,0.5)]" />
            <span className="text-[9px] font-black text-center line-clamp-2 px-1 leading-none uppercase tracking-tighter text-white">
              {pad.label}
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
            <Upload size={14} className="mb-0.5" />
            <span className="text-[7px] font-mono font-bold uppercase text-center leading-tight">
              {pad.label}
            </span>
          </div>
        )}
      </motion.button>
      
      {pad.file && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove?.(pad); }}
            className="absolute -top-1 -left-1 p-0.5 bg-gray-600 hover:bg-studio-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
            title="Remover som"
          >
            <X className="w-2.5 h-2.5" />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onStop(pad); }}
            className="absolute -top-1 -right-1 p-0.5 bg-studio-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
            title="Parar áudio"
          >
            <Square className="w-2 h-2 fill-current" />
          </button>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
