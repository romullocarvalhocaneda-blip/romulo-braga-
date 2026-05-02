import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Save, Trash2, GripVertical, ListMusic, Database, Search, Music } from 'lucide-react';
import { Reorder } from 'motion/react';
import { PlaylistEntry } from '../types';
import { db, LibraryFile } from '../services/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface Props {
  onClose: () => void;
  onSendToPlayer: (items: PlaylistEntry[]) => void;
}

export const PlaylistBuilder: React.FC<Props> = ({ onClose, onSendToPlayer }) => {
  const [items, setItems] = useState<PlaylistEntry[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const library = useLiveQuery(() => db.library.toArray()) || [];
  const filteredLibrary = library.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const newItems: PlaylistEntry[] = [];

    for (const file of files) {
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

      newItems.push({
        id: Math.random().toString(36).substr(2, 9) + Date.now(),
        name: nameNoExt,
        url: URL.createObjectURL(file),
        type: 'music',
        order: items.length + newItems.length
      });
    }

    setItems([...items, ...newItems]);
  };

  const addFromLibrary = (file: LibraryFile) => {
    const newItem: PlaylistEntry = {
      id: Math.random().toString(36).substr(2, 9) + Date.now(),
      name: file.name,
      url: URL.createObjectURL(file.blob),
      type: 'music',
      order: items.length
    };
    setItems([...items, newItem]);
  };

  const removeTrack = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const savePlaylist = () => {
    if (items.length === 0) return;
    const data = JSON.stringify(items.map(i => ({ ...i, url: '' })));
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlistName || 'sequencia'}.json`;
    a.click();
    onClose();
  };

  const sendToPlayer = () => {
    onSendToPlayer(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
      <div className="w-full max-w-5xl bg-studio-card border border-studio-accent/30 rounded-2xl overflow-hidden flex flex-col h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="p-4 px-6 bg-studio-panel border-b border-studio-border flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-studio-accent/20 rounded-xl">
              <Database className="text-studio-accent" size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold uppercase tracking-[0.2em] text-white">Confeccionador de Programação</h2>
              <p className="text-[10px] text-studio-text-dim font-mono tracking-wider">Monte sua grade horária • Banco de Mídias Local</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} className="text-studio-text-dim hover:text-white" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Library Section */}
          <div className="w-80 border-r border-studio-border flex flex-col bg-black/40 shrink-0">
            <div className="p-4 border-b border-studio-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-studio-accent uppercase tracking-widest">Banco Local</span>
                <span className="text-[9px] font-mono text-studio-text-dim">{library.length} ARQUIVOS</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-text-dim" size={14} />
                <input 
                  type="text"
                  placeholder="Pesquisar no banco..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-studio-panel border border-studio-border rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-studio-accent"
                />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-studio-panel border border-studio-border text-studio-text rounded text-[10px] font-bold uppercase hover:bg-studio-border transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Importar Novos
              </button>
            </div>
            <div className="flex-1 overflow-y-auto studio-scroll p-2 space-y-1">
              {filteredLibrary.map(file => (
                <button 
                  key={file.id}
                  onClick={() => addFromLibrary(file)}
                  className="w-full text-left p-2 rounded hover:bg-studio-accent/10 border border-transparent hover:border-studio-accent/20 transition-all group flex items-center gap-3"
                >
                  <Music size={12} className="text-studio-text-dim group-hover:text-studio-accent" />
                  <span className="text-[10px] font-bold uppercase truncate flex-1">{file.name}</span>
                </button>
              ))}
              {library.length === 0 && (
                <div className="p-8 text-center opacity-20 text-[9px] uppercase font-mono italic">Banco Vazio</div>
              )}
            </div>
          </div>

          {/* Builder Section */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Name Input */}
            <div className="p-4 px-6 bg-black/20 border-b border-studio-border flex gap-4">
              <div className="flex-1">
                <label className="text-[9px] font-mono text-studio-accent uppercase font-bold mb-1 block">Nome da Sequência / Playlist</label>
                <input 
                  type="text"
                  placeholder="EX: PROGRAMA_MANHA_SEGUNDA..."
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="w-full bg-studio-bg border border-studio-border rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-widest focus:border-studio-accent outline-none shadow-inner"
                />
              </div>
            </div>

            {/* List Editor */}
            <div className="flex-1 overflow-y-auto p-6 studio-scroll bg-black/20">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6">
                  <ListMusic size={80} strokeWidth={0.5} />
                  <p className="text-xs font-mono uppercase tracking-[0.4em] text-center max-w-[400px]">Sequência Vazia. Use o Banco ao lado para montar sua grade.</p>
                </div>
              ) : (
                <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
                  {items.map((item) => (
                    <Reorder.Item 
                      key={item.id} 
                      value={item}
                      className="bg-studio-panel border border-studio-border rounded-xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing group hover:border-studio-accent/30 transition-all shadow-lg hover:shadow-studio-accent/5"
                    >
                      <GripVertical className="text-studio-text-dim" size={18} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white uppercase tracking-wider truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[8px] px-1.5 py-0.5 rounded bg-studio-accent/20 text-studio-accent font-mono uppercase">Mídia</span>
                           <span className="text-[8px] font-mono text-studio-text-dim uppercase">Pos: {items.indexOf(item) + 1}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeTrack(item.id)}
                        className="p-2 text-studio-error/30 hover:text-studio-error hover:bg-studio-error/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 px-6 bg-studio-panel border-t border-studio-border flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-studio-text-dim uppercase tracking-widest">{items.length} ITENS NA SEQUÊNCIA</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg text-xs font-bold uppercase text-studio-text-dim hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={savePlaylist}
                  disabled={items.length === 0}
                  className="px-6 py-2 bg-studio-panel border border-studio-border text-studio-text hover:text-white rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2"
                >
                  <Save size={16} /> Salvar Arquivo
                </button>
                <button 
                  onClick={sendToPlayer}
                  disabled={items.length === 0}
                  className="px-8 py-2 bg-studio-success text-white rounded-lg text-xs font-bold uppercase shadow-xl shadow-studio-success/20 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                >
                  <ListMusic size={18} /> Carregar no Player
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <input ref={fileInputRef} type="file" multiple accept="audio/*" className="hidden" onChange={handleAddFiles} />
    </div>
  );
};
