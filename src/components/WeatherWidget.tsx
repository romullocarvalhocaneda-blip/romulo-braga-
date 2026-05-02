import React, { useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Thermometer, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: string;
}

const CITIES = [
  { name: "TOKYO", temp: 18, condition: "Sunny", humidity: 45, wind: "12km/h" },
  { name: "NAGOYA", temp: 21, condition: "Cloudy", humidity: 55, wind: "8km/h" },
  { name: "HAMAMATSU", temp: 19, condition: "Rain", humidity: 70, wind: "15km/h" },
  { name: "GUNMA", temp: 16, condition: "Windy", humidity: 40, wind: "22km/h" }
];

export const WeatherWidget: React.FC = () => {
  const [cityIndex, setCityIndex] = useState(0);
  const data = CITIES[cityIndex];

  const nextCity = () => setCityIndex((prev) => (prev + 1) % CITIES.length);
  const prevCity = () => setCityIndex((prev) => (prev - 1 + CITIES.length) % CITIES.length);

  const getIcon = (cond: string) => {
    switch (cond) {
      case "Sunny": return <Sun className="text-yellow-400" size={16} />;
      case "Rain": return <CloudRain className="text-blue-400" size={16} />;
      case "Windy": return <Wind className="text-studio-accent" size={16} />;
      default: return <Cloud className="text-studio-text-dim" size={16} />;
    }
  };

  return (
    <div className="studio-card p-3 bg-studio-panel/10 flex flex-col gap-2 border border-white/5">
      <div className="flex justify-between items-start mb-1">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold text-studio-accent uppercase tracking-widest leading-none">Previsão do Tempo</span>
          <span className="text-[8px] opacity-30 font-mono uppercase">Controle Manual • Satélite</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={prevCity} 
            className="p-1 hover:bg-white/5 rounded transition-colors text-studio-text-dim hover:text-studio-accent"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextCity} 
            className="p-1 hover:bg-white/5 rounded transition-colors text-studio-text-dim hover:text-studio-accent"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/40 rounded-lg border border-studio-border">
            {getIcon(data.condition)}
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-white tracking-widest">{data.name}</h4>
            <span className="text-[9px] font-mono text-studio-text-dim uppercase">{data.condition}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-studio-accent tabular-nums leading-none">
            {data.temp}°
          </div>
          <div className="text-[8px] font-mono opacity-40 uppercase">
            Hum: {data.humidity}% • {data.wind}
          </div>
        </div>
      </div>

      <div className="flex gap-1 mt-1 justify-center">
        {CITIES.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-0.5 w-4 rounded-full transition-all duration-300 ${idx === cityIndex ? 'bg-studio-accent' : 'bg-studio-border opacity-20'}`}
          />
        ))}
      </div>
    </div>
  );
};
