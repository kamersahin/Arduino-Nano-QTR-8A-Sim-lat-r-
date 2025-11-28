import React, { useEffect, useRef, useState } from 'react';
import { SensorState } from '../types';

interface SerialMonitorProps {
  sensors: SensorState[];
  weightedAverage: number;
}

export const SerialMonitor: React.FC<SerialMonitorProps> = ({ sensors, weightedAverage }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Throttled update to avoid React rendering too fast for visual comfort
    const timer = setInterval(() => {
        if (sensors.length === 0) return;

        const valuesString = sensors.map(s => String(s.value).padStart(4, ' ')).join('\t');
        const logLine = `${valuesString}\t| Poz: ${weightedAverage}`;
        
        setLogs(prev => {
            const newLogs = [...prev, logLine];
            if (newLogs.length > 50) return newLogs.slice(newLogs.length - 50);
            return newLogs;
        });
    }, 200); // 5Hz update rate for serial monitor UI

    return () => clearInterval(timer);
  }, [sensors, weightedAverage]);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  return (
    <div className="bg-black rounded-xl border border-slate-700 shadow-xl flex flex-col font-mono text-xs md:text-sm h-64">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700 rounded-t-xl">
        <span className="text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Seri Port Ekranı (COM3)
        </span>
        <div className="flex gap-2 text-[10px]">
            <span className="text-slate-500">9600 baud</span>
            <label className="flex items-center gap-1 text-slate-400 cursor-pointer">
                <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
                Otomatik Kaydır
            </label>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1 text-green-400">
        <div className="text-slate-500 border-b border-slate-800 pb-2 mb-2">
            A0   A1   A2   A3   A4   A5   A6   A7   | Konum
        </div>
        {logs.map((log, i) => (
            <div key={i} className="whitespace-pre hover:bg-slate-900">{log}</div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};