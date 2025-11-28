import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  linePosition: number;
  setLinePosition: (val: number) => void;
}

export const Visualizer: React.FC<VisualizerProps> = ({ linePosition, setLinePosition }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle drag to move line
  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1 || !containerRef.current) return;
    updatePosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    updatePosition(e.touches[0].clientX);
  };

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setLinePosition(percentage);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-slate-400 font-mono">
        <span>Sol Motor</span>
        <span>Analog Pin A0 - A7</span>
        <span>Sağ Motor</span>
      </div>

      {/* The Track Surface */}
      <div 
        ref={containerRef}
        className="relative h-40 bg-slate-200 rounded-lg overflow-hidden cursor-crosshair shadow-inner border-2 border-slate-600 group"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onClick={(e) => updatePosition(e.clientX)}
      >
        {/* Grid lines for reference */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* The Black Line */}
        <div 
          className="absolute top-0 bottom-0 bg-black shadow-lg transform -translate-x-1/2 transition-transform duration-75 ease-out"
          style={{ 
            left: `${linePosition}%`, 
            width: '40px' // Visual width of the tape
          }}
        >
          {/* Center marking of the line */}
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/20 -translate-x-1/2"></div>
        </div>

        {/* The Sensor Array (Fixed in center visually, line moves) */}
        {/* We actually render the sensor array fixed in the center of the viewport to simulate the robot's perspective */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-center items-center gap-2 pointer-events-none">
          <div className="bg-green-700 px-3 py-2 rounded-lg shadow-2xl border border-green-600 flex gap-2 relative z-10">
            {/* PCB Label */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-green-400 font-mono font-bold whitespace-nowrap">
              QTR-8A ARRAY
            </div>
            
            {/* 8 Sensors */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                 <div className="w-6 h-8 bg-slate-900 rounded-sm border border-slate-600 flex items-center justify-center relative overflow-hidden">
                   {/* IR LED Visual */}
                   <div className="w-2 h-2 rounded-full bg-blue-400/50 shadow-[0_0_5px_rgba(96,165,250,0.8)]"></div>
                   
                   {/* Reflection simulation overlay */}
                   {/* If line is under this sensor, it's dark (sensor absorbs). If white, it reflects. */}
                   {/* Since this is just a visualizer of the PCB, we don't change PCB color much, the bars show the data. */}
                 </div>
                 <span className="text-[9px] text-white font-mono">A{i}</span>
              </div>
            ))}
          </div>
          
          {/* Robot Chassis hint */}
          <div className="absolute inset-0 bg-transparent border-x-2 border-dashed border-slate-400/30 pointer-events-none" style={{ left: '10%', right: '10%'}}></div>
        </div>

        <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 font-mono bg-white/50 px-2 rounded">
          Siyah Çizgiyi Sürükle
        </div>
      </div>

      <div className="flex items-center gap-4">
         <input 
            type="range" 
            min="0" 
            max="100" 
            value={linePosition} 
            onChange={(e) => setLinePosition(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
         />
      </div>
    </div>
  );
};