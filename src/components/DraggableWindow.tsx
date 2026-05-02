import React, { useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Maximize2, Minimize2, Move } from 'lucide-react';

interface DraggableWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  isVisible: boolean;
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({
  title,
  children,
  x,
  y,
  width,
  height,
  isVisible,
  zIndex,
  onClose,
  onFocus,
  onMove,
  onResize
}) => {
  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  if (!isVisible) return null;

  return (
    <motion.div
      ref={windowRef}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        onMove(x + info.offset.x, y + info.offset.y);
      }}
      onPointerDown={(e) => {
        onFocus();
        // Allow dragging from anywhere if Ctrl is pressed OR if not clicking an interactive element
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button, input, select, textarea, .studio-scroll, [role="button"]');
        
        if (e.ctrlKey || !isInteractive || target.closest('.group\\/header')) {
          dragControls.start(e);
        }
      }}
      initial={false}
      animate={{ x, y, width, height, zIndex }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
      className="fixed bg-studio-card border border-studio-border rounded-lg shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
      style={{ minWidth: 200, minHeight: 150 }}
    >
      {/* Title Bar */}
      <div 
        className="h-9 bg-studio-panel/80 border-b border-studio-border flex items-center justify-between px-3 cursor-move select-none shrink-0 group/header"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 bg-studio-accent/20 rounded group-hover/header:bg-studio-accent/40 transition-colors">
            <Move size={10} className="text-studio-accent" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/80 group-hover/header:text-white transition-colors">{title}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-white/5 rounded transition-colors text-white/40">
            <Minimize2 size={12} />
          </button>
          <button className="p-1 hover:bg-white/5 rounded transition-colors text-white/40">
            <Maximize2 size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1 hover:bg-studio-error/20 hover:text-studio-error rounded transition-colors text-white/40"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group"
        onPointerDown={(e) => {
          e.stopPropagation();
          const startX = e.clientX;
          const startY = e.clientY;
          const startW = width;
          const startH = height;

          const onPointerMove = (moveEvent: PointerEvent) => {
            const newW = Math.max(200, startW + (moveEvent.clientX - startX));
            const newH = Math.max(150, startH + (moveEvent.clientY - startY));
            onResize(newW, newH);
          };

          const onPointerUp = () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
          };

          document.addEventListener('pointermove', onPointerMove);
          document.addEventListener('pointerup', onPointerUp);
        }}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-white/20 group-hover:border-studio-accent rounded-br-sm transition-colors" />
      </div>
    </motion.div>
  );
};
