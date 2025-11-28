import React from 'react';
import { SensorState } from '../types';

interface SensorReadingsProps {
  sensors: SensorState[];
  weightedAverage: number;
}

export const SensorReadings: React.FC<SensorReadingsProps> = ({ sensors, weightedAverage }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-white">Sensör Verileri (ADC)</h2>
        <div className="text-xs font-mono text-slate-400">0 (Beyaz) - 1023 (Siyah)</div>
      </div>

      <div className="grid grid-cols-8 gap-2 md:gap-4 h-48 items-end pb-2 border-b border-slate-700">
        {sensors.map((sensor) => {
            // Color based on intensity
            const intensity = sensor.value / 1023;
            // Interpolate color from White (low) to Red (high)
            // But usually UI looks better with single color varying opacity or height
            const barColor = intensity > 0.5 ? 'bg-red-500' : 'bg-blue-500';
            
            return (
                <div key={sensor.id} className="flex flex-col items-center gap-2 h-full justify-end group">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-12 bg-black text-white text-[10px] px-2 py-1 rounded">
                        {sensor.voltage}V
                    </div>

                    <div className="text-xs font-mono text-slate-300 rotate-0 mb-1">{sensor.value}</div>
                    
                    <div className="w-full bg-slate-700 rounded-t-sm relative h-full w-4 md:w-8">
                        <div 
                            className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-100 ${barColor}`}
                            style={{ height: `${(sensor.value / 1023) * 100}%` }}
                        ></div>
                    </div>
                    
                    <div className="text-xs font-bold text-slate-500 mt-2">A{sensor.id}</div>
                </div>
            );
        })}
      </div>

      {/* PID / Weighted Average Visualization */}
      <div className="pt-2">
        <div className="flex justify-between items-end mb-2">
            <h3 className="text-sm font-semibold text-purple-400">Hesaplanan Konum (PID Girdisi)</h3>
            <span className="text-xl font-mono font-bold text-white">{weightedAverage}</span>
        </div>
        <div className="relative h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
             {/* Center marker */}
             <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500 z-10"></div>
             
             {/* Position Indicator */}
             <div 
                className="absolute top-1 bottom-1 w-4 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] transition-all duration-75 ease-out"
                style={{ left: `calc(${(weightedAverage / 7000) * 100}% - 8px)` }}
             ></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>0 (Sol)</span>
            <span>3500 (Merkez)</span>
            <span>7000 (Sağ)</span>
        </div>
      </div>
    </div>
  );
};