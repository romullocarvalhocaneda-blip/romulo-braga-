import React, { useEffect, useState } from 'react';

export const VUMeter: React.FC<{ isPlaying: boolean; volume: number }> = ({ isPlaying, volume }) => {
  const [levels, setLevels] = useState([0, 0]);

  useEffect(() => {
    if (!isPlaying) {
      setLevels([0, 0]);
      return;
    }

    const interval = setInterval(() => {
      const l = Math.random() * 80 + 20;
      const r = Math.random() * 80 + 20;
      setLevels([l * volume, r * volume]);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, volume]);

  return (
    <div className="flex gap-1 h-32 px-4 py-2 bg-black/40 rounded border border-white/5">
      {[0, 1].map(i => (
        <div key={i} className="flex-1 flex flex-col-reverse bg-studio-panel/50 rounded-sm overflow-hidden w-4 relative">
          {/* Segments for visual style */}
          <div className="absolute inset-0 flex flex-col justify-between p-0.5 pointer-events-none opacity-20">
            {Array.from({length: 20}).map((_, j) => (
              <div key={j} className="h-[1px] bg-white w-full" />
            ))}
          </div>
          <div 
            className={`transition-all duration-100 w-full ${levels[i] > 85 ? 'bg-studio-error shadow-[0_0_10px_#f87171]' : levels[i] > 60 ? 'bg-yellow-400' : 'bg-studio-success'}`}
            style={{ height: `${levels[i]}%` }}
          />
        </div>
      ))}
      <div className="flex flex-col justify-between text-[8px] font-mono opacity-30 select-none pb-1">
        <span>0</span>
        <span>-6</span>
        <span>-12</span>
        <span>-24</span>
        <span>-48</span>
      </div>
    </div>
  );
};
