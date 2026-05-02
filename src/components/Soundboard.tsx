import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { SoundPadButton } from './SoundPadButton';
import { db } from '../services/db';
import { SoundPad } from '../types';
import { Database, Plus, RotateCcw } from 'lucide-react';

import { PRESET_SOUNDS } from '../constants/presets';

interface Props {
  onPlayPad: (padId: string | number, url: string, loop?: boolean) => void;
  onStopPad: (padId: string | number) => void;
  activePadIds?: Set<string | number>;
}

export const Soundboard: React.FC<Props> = ({ onPlayPad, onStopPad, activePadIds = new Set() }) => {
  const categories = [
    { id: 'musica', label: 'TRILHAS' },
    { id: 'show', label: 'APLAUSOS / RISADAS' },
    { id: 'memes', label: 'MEMES' },
    { id: 'radio', label: 'RÁDIO FX' },
    { id: 'vinheta', label: 'VINHETAS' }
  ];
  
  const [activeTab, setActiveTab] = useState(categories[0].id);
  const [hiddenPresetIds, setHiddenPresetIds] = useState<string[]>([]);
  
  const libraryFiles = useLiveQuery(
    () => db.library.where('category').equals(activeTab as any).toArray(),
    [activeTab]
  );

  const pads: SoundPad[] = React.useMemo(() => {
    // 1. Get Presets for this category
    const presetsForTab = PRESET_SOUNDS
      .filter(p => p.category === activeTab && !hiddenPresetIds.includes(p.id))
      .map(p => ({
        id: p.id,
        label: p.label,
        file: {
          id: p.id,
          name: p.label,
          url: p.url,
          type: 'fx' as const
        }
      }));

    // 2. Get User Files for this category
    const userPads = (libraryFiles || []).map((file, i) => ({
      id: `u-${file.id}`,
      label: file.name,
      file: {
        id: `u-${file.id}`,
        name: file.name,
        url: URL.createObjectURL(file.blob),
        type: 'fx' as const
      }
    }));

    // 3. Combine
    const combined = [...presetsForTab, ...userPads];

    // 4. Fill with placeholders if needed
    const suggestions = [
      'Aplauso Médio', 'Risada Coletiva', 'Gargalhada Solo', 'UEPA!', 'CAVALO!', 'RATINHOOO', 'PARE!',
      'Impacto Explosão', 'Laser Transition', 'Sirene Ar', 'Alerta Notícia', 'Relógio Tic Tac'
    ];
    
    const placeholders = Array.from({ length: Math.max(0, 16 - combined.length) }, (_, i) => ({
      id: `empty-${i}`,
      label: suggestions[i % suggestions.length] || `Vazio`
    }));

    return [...combined, ...placeholders];
  }, [libraryFiles, activeTab, hiddenPresetIds]);

  const saveFileToLibrary = async (file: File) => {
    await db.library.add({
      name: file.name.split('.')[0].toUpperCase(),
      category: activeTab as any,
      blob: file,
      type: file.type,
      createdAt: Date.now()
    });
  };

  const handleFileAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    for (const file of files) {
      await saveFileToLibrary(file);
    }
    // Reset file input
    e.target.value = '';
  };

  const handleRemovePad = async (pad: SoundPad) => {
    if (!pad.file) return;

    const idStr = String(pad.id);
    
    // If it's a user file (starts with u-)
    if (idStr.startsWith('u-')) {
      const dbId = parseInt(idStr.replace('u-', ''));
      if (!isNaN(dbId)) {
        await db.library.delete(dbId);
      }
    } else if (idStr.startsWith('p-')) {
      // It's a preset, add to hidden list
      setHiddenPresetIds(prev => [...prev, idStr]);
    }
    
    onStopPad(pad.id);
  };

  return (
    <div className="flex flex-col bg-studio-card/50 border-b border-studio-border shrink-0">
      <div className="flex bg-black/20 px-4 pt-1 gap-1 border-b border-studio-border justify-between items-center">
        <div className="flex gap-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest transition-all rounded-t-sm border-x border-t
                ${activeTab === cat.id 
                  ? 'bg-studio-panel border-studio-border text-studio-accent' 
                  : 'bg-transparent border-transparent text-studio-text-dim hover:text-white'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          {hiddenPresetIds.length > 0 && (
            <button 
              onClick={() => setHiddenPresetIds([])}
              className="text-[8px] font-bold uppercase text-studio-text-dim hover:text-white mr-2 flex items-center gap-1"
            >
              <RotateCcw size={10} />
              Resetar Pads
            </button>
          )}
          
          <label className="flex items-center gap-2 px-3 py-1 mr-2 rounded bg-studio-accent/20 border border-studio-accent/30 text-studio-accent hover:bg-studio-accent hover:text-white transition-all cursor-pointer">
            <Plus size={12} />
            <span className="text-[9px] font-bold uppercase">Add {activeTab}</span>
            <input type="file" multiple accept="audio/*" onChange={handleFileAdd} className="hidden" />
          </label>
        </div>
      </div>
      
      <div className="flex gap-2 p-2 overflow-x-auto studio-scroll no-scrollbar shrink-0">
        <div className="flex gap-2">
          {pads.map((pad, i) => (
            <SoundPadButton
              key={`${activeTab}-${pad.id}-${i}`}
              pad={pad}
              isActive={activePadIds.has(pad.id)}
              onUpdate={() => {}} // Controlled by DB now
              onFileSelect={saveFileToLibrary}
              onPlay={(p) => {
                if (!p.file) return;
                if (activeTab === 'musica') {
                  if (activePadIds.has(p.id)) {
                    onStopPad(p.id);
                  } else {
                    onPlayPad(p.id, p.file.url, true);
                  }
                } else {
                  onPlayPad(p.id, p.file.url, false);
                }
              }}
              onStop={(p) => onStopPad(p.id)}
              onRemove={handleRemovePad}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

