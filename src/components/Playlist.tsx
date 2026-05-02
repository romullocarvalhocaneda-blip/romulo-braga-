import React, { useRef, useEffect } from 'react';
import { Reorder } from 'motion/react';
import { Plus, Play, Trash2, Music, Clock, Save, FileUp, Database } from 'lucide-react';
import { AudioFile, PlaylistEntry } from '../types';
import { db } from '../services/db';

interface Props {
  queue: PlaylistEntry[];
  history: PlaylistEntry[];
  currentTrack: AudioFile | null;
  onSetQueue: (list: PlaylistEntry[]) => void;
  onSetHistory: (list: PlaylistEntry[]) => void;
  onPlayTrack: (track: AudioFile) => void;
  onOpenBuilder: () => void;
}

interface TrackItemProps {
  item: PlaylistEntry;
  from: 'queue' | 'history';
  currentTrack: AudioFile | null;
  onPlayTrack: (track: AudioFile) => void;
  onRemove: (id: string, from: 'queue' | 'history') => void;
  onLinkFile: (id: string, file: File) => void;
}

const TrackItem: React.FC<TrackItemProps> = ({ 
  item, 
  from, 
  currentTrack, 
  onPlayTrack, 
  onRemove,
  onLinkFile
}) => {
  const hasUrl = !!item.url;
  
  return (
    <div
      className={`flex items-center gap-2 p-2 px-3 rounded group transition-colors border ${
        currentTrack?.id === item.id 
          ? 'bg-studio-accent/20 border-studio-accent/30' 
          : hasUrl ? 'bg-studio-panel/30 border-studio-border/50 hover:bg-studio-panel/50'
          : 'bg-studio-error/5 border-studio-error/20 hover:bg-studio-error/10 border-dashed'
      }`}
    >
      <div className="flex-1 min-w-0" onClick={() => hasUrl ? onPlayTrack(item) : undefined}>
        <div className="flex items-center gap-2">
          <p className={`text-xs font-bold truncate ${currentTrack?.id === item.id ? 'text-studio-accent' : !hasUrl ? 'text-studio-error/60' : 'text-studio-text'}`}>
            {item.name}
          </p>
          {!hasUrl && (
            <span className="text-[7px] font-bold bg-studio-error text-white px-1 rounded animate-pulse">OFFLINE</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {!hasUrl ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'audio/*';
              input.onchange = (ev: any) => {
                const file = ev.target.files[0];
                if (file) onLinkFile(item.id, file);
              };
              input.click();
            }}
            className="p-1 text-studio-success hover:scale-125 transition-transform"
            title="Vincular Arquivo"
          >
            <Plus size={14} />
          </button>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onPlayTrack(item); }}
            className="p-1 hover:text-studio-accent"
          >
            <Play size={12} />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(item.id, from); }}
          className="p-1 hover:text-studio-error"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export const Playlist: React.FC<Props> = ({ queue, history, currentTrack, onSetQueue, onSetHistory, onPlayTrack, onOpenBuilder }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkLinkRef = useRef<HTMLInputElement>(null);

  // Auto-sync with local DB Library
  useEffect(() => {
    let active = true;
    const syncWithLibrary = async () => {
      const itemsToSync = queue.filter(item => !item.url);
      if (itemsToSync.length === 0) return;

      const library = await db.library.toArray();
      let changed = false;
      const updatedQueue = queue.map(item => {
        if (item.url) return item;
        const match = library.find(l => l.name.toLowerCase() === item.name.toLowerCase());
        if (match) {
          changed = true;
          return { ...item, url: URL.createObjectURL(match.blob) };
        }
        return item;
      });

      if (active && changed) {
        onSetQueue(updatedQueue);
      }
    };
    
    syncWithLibrary();
    const interval = setInterval(syncWithLibrary, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [queue, onSetQueue]); 

  const handleFileAdd = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: File[] = [];
    if ('files' in e.target && (e.target as HTMLInputElement).files) {
      files = Array.from((e.target as HTMLInputElement).files || []);
    } else if ('dataTransfer' in e && (e as React.DragEvent).dataTransfer?.files) {
      files = Array.from((e as React.DragEvent).dataTransfer.files);
    }

    if (files.length === 0) return;

    const audioFiles = files.filter(f => f.type.startsWith('audio/'));
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    let newQueueItems: PlaylistEntry[] = [];

    // 1. Save all added audio to the permanent Library DB
    for (const file of audioFiles) {
      const nameNoExt = file.name.split('.')[0];
      const exists = await db.library.where('name').equalsIgnoreCase(nameNoExt).first();
      if (!exists) {
        await db.library.add({
          name: nameNoExt,
          category: 'musica',
          blob: file,
          type: file.type,
          createdAt: Date.now()
        });
      }
    }

    // 2. Process JSON Playlists
    if (jsonFiles.length > 0) {
      for (const file of jsonFiles) {
        try {
          const text = await file.text();
          const loaded = JSON.parse(text) as PlaylistEntry[];
          const freshItems = loaded.map(item => ({
            ...item,
            id: 'loaded-' + Math.random().toString(36).substr(2, 9),
            url: '' 
          }));
          newQueueItems = [...newQueueItems, ...freshItems];
        } catch (err) {
          console.error("Erro ao ler playlist JSON:", err);
        }
      }
    }

    // 3. Re-scan library for URLs
    const library = await db.library.toArray();
    const linkMap = new Map<string, string>();
    library.forEach(l => {
      linkMap.set(l.name.toLowerCase(), URL.createObjectURL(l.blob));
    });

    // Match newly loaded items
    newQueueItems = newQueueItems.map(item => {
      const url = linkMap.get(item.name.toLowerCase());
      return url ? { ...item, url } : item;
    });

    // Update existing queue
    const updatedExistingQueue = queue.map(item => {
      if (!item.url) {
        const url = linkMap.get(item.name.toLowerCase());
        return url ? { ...item, url } : item;
      }
      return item;
    });

    // Add audio files that weren't in the JSON
    const unmatchedAudios = audioFiles.filter(file => {
      const name = file.name.split('.')[0].toLowerCase();
      const inNewJson = newQueueItems.some(item => item.name.toLowerCase() === name);
      const inExisting = updatedExistingQueue.some(item => item.name.toLowerCase() === name && item.url);
      return !inNewJson && !inExisting;
    }).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name.split('.')[0],
      url: URL.createObjectURL(file), // Direct URL for immediate feedback
      type: 'music' as const,
      order: 0
    }));

    onSetQueue([...updatedExistingQueue, ...newQueueItems, ...unmatchedAudios]);

    if ('value' in e.target) {
      (e.target as any).value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileAdd(e);
  };

  const handleLinkFile = async (id: string, file: File) => {
    const nameNoExt = file.name.split('.')[0];
    await db.library.put({
      name: nameNoExt,
      category: 'musica',
      blob: file,
      type: file.type,
      createdAt: Date.now()
    });
    
    const url = URL.createObjectURL(file);
    onSetQueue(queue.map(item => item.id === id ? { ...item, url, name: nameNoExt } : item));
  };

  const handleBulkLink = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    for (const file of files) {
      const nameNoExt = file.name.split('.')[0];
      await db.library.put({
        name: nameNoExt,
        category: 'musica',
        blob: file,
        type: file.type,
        createdAt: Date.now()
      });
    }
  };

  const savePlaylist = () => {
    const data = JSON.stringify(queue.map(t => ({ ...t, url: '' })));
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playlist_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const removeTrack = (id: string, from: 'queue' | 'history') => {
    if (from === 'queue') onSetQueue(queue.filter(t => t.id !== id));
    else onSetHistory(history.filter(t => t.id !== id));
  };

  return (
    <div 
      className="flex flex-col h-full gap-4 overflow-hidden text-studio-text"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-2">
          <Database className="w-3 h-3 text-studio-accent" />
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Automação de Playlist</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onOpenBuilder}
            title="Confeccionar Sequência"
            className="p-1 px-3 rounded bg-studio-panel border border-studio-border text-studio-text hover:text-white transition-all flex items-center gap-2 text-[9px] uppercase font-bold"
          >
            <Plus size={12} /> Confeccionar
          </button>
          <button 
            onClick={savePlaylist}
            title="Salvar Playlist"
            className="p-1 px-3 rounded bg-studio-panel border border-studio-border text-studio-text hover:text-white transition-all flex items-center gap-2 text-[9px] uppercase font-bold"
          >
            <Save size={12} /> Salvar Arquivo
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-1.5 rounded bg-studio-accent text-white text-[10px] font-bold uppercase transition-all shadow-lg hover:brightness-110 active:scale-95"
          >
            <FileUp size={14} /> Abrir Playlist / Mídias
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col bg-studio-card/80 studio-card border-studio-accent/20 border-2 overflow-hidden shadow-2xl">
          <div className="p-3 px-4 border-b border-studio-border bg-studio-panel/60 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest italic flex items-center gap-2 text-studio-accent">
              <Plus size={12} className="text-studio-success" />
              Lista de Execução (Fila)
            </span>
            <span className="text-[10px] font-mono opacity-60 font-bold">{queue.length} ITENS</span>
          </div>
          <div className="flex-1 overflow-y-auto studio-scroll p-2 bg-black/20">
             <Reorder.Group axis="y" values={queue} onReorder={onSetQueue} className="space-y-1.5">
              {queue.map(item => (
                <Reorder.Item key={item.id} value={item}>
                  <TrackItem 
                    item={item} 
                    from="queue" 
                    currentTrack={currentTrack} 
                    onPlayTrack={onPlayTrack} 
                    onRemove={removeTrack} 
                    onLinkFile={handleLinkFile}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
            {queue.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8 text-[10px] uppercase font-mono opacity-20 italic border-2 border-dashed border-white/5 rounded-lg">
                  Arraste playlists ou áudios aqui para iniciar a automação
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col bg-studio-card/80 studio-card border-white/10 border overflow-hidden shadow-xl">
          <div className="p-3 px-4 border-b border-studio-border bg-black/40 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest italic flex items-center gap-2">
              <Clock size={12} className="text-studio-text-dim" />
              Recentemente Tocadas (Histórico)
            </span>
            <span className="text-[10px] font-mono opacity-40 font-bold">{history.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto studio-scroll p-2 bg-black/10">
            <div className="space-y-1.5">
              {history.map(item => (
                <TrackItem 
                  key={item.id} 
                  item={item} 
                  from="history" 
                  currentTrack={currentTrack} 
                  onPlayTrack={onPlayTrack} 
                  onRemove={removeTrack} 
                  onLinkFile={handleLinkFile}
                />
              ))}
              {history.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center py-8 text-[10px] uppercase font-mono opacity-10 italic">Nenhuma faixa tocada recentemente</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" multiple accept="audio/*,.json" onChange={handleFileAdd} className="hidden" />
      <input ref={bulkLinkRef} type="file" multiple accept="audio/*" onChange={handleBulkLink} className="hidden" />
    </div>
  );
};
