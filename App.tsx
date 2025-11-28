import React, { useState, useEffect, useCallback } from 'react';
import { Visualizer } from './components/Visualizer';
import { SensorReadings } from './components/SensorReadings';
import { SerialMonitor } from './components/SerialMonitor';
import { ArduinoCode } from './components/ArduinoCode';
import { SensorState } from './types';
import { Cpu, Activity, Info } from 'lucide-react';

const SENSOR_COUNT = 8;

// Physics constants
const SENSOR_SPREAD = 80; // Total width covered by sensors in abstract units
const LINE_WIDTH = 15; // Width of the black line
const NOISE_LEVEL = 5; // Analog noise simulation

export default function App() {
  const [linePosition, setLinePosition] = useState<number>(50); // 0 to 100
  const [sensorValues, setSensorValues] = useState<SensorState[]>([]);
  const [weightedAverage, setWeightedAverage] = useState<number>(0);
  const [isAutoMoving, setIsAutoMoving] = useState<boolean>(false);

  // Calculate sensor physics
  const calculatePhysics = useCallback(() => {
    const newSensors: SensorState[] = [];
    let sumValue = 0;
    let sumWeighted = 0;

    // Convert slider position (0-100) to simulation coordinates (-40 to 40)
    const lineX = (linePosition - 50) * (SENSOR_SPREAD / 50);

    for (let i = 0; i < SENSOR_COUNT; i++) {
      // Sensor positions spread from left to right centered at 0
      // i=0 is left-most, i=7 is right-most
      const sensorX = (i - (SENSOR_COUNT - 1) / 2) * (SENSOR_SPREAD / (SENSOR_COUNT - 1));
      
      // Calculate distance between this sensor and the line center
      const distance = Math.abs(sensorX - lineX);
      
      // Reflectance calculation (Gaussian-ish falloff)
      // If distance < LINE_WIDTH/2, it's fully black (High Value ~1000)
      // As distance increases, value drops to White (Low Value ~50)
      
      let rawValue = 0;
      
      if (distance < LINE_WIDTH / 1.5) {
        rawValue = 950 + Math.random() * 50; // Max reading on black
      } else if (distance < LINE_WIDTH * 1.5) {
        // Edge of line
        const factor = 1 - ((distance - LINE_WIDTH/1.5) / LINE_WIDTH);
        rawValue = 50 + (900 * factor);
      } else {
        rawValue = 30 + Math.random() * NOISE_LEVEL; // Background white noise
      }

      // Clamp
      rawValue = Math.max(0, Math.min(1023, Math.floor(rawValue)));
      const voltage = Number((rawValue * (5.0 / 1023.0)).toFixed(2));

      newSensors.push({
        id: i,
        value: rawValue,
        voltage: voltage
      });

      // QTR Library "readLine" logic
      // Only consider significant readings to avoid noise dividing by zero
      if (rawValue > 50) {
        sumValue += rawValue;
        sumWeighted += rawValue * (i * 1000);
      }
    }

    // Standard QTR library logic for position (0 to 7000)
    // If lost line, keep last known position (simplified here to just 3500 center if lost)
    let position = 3500;
    if (sumValue > 0) {
      position = sumWeighted / sumValue;
    }
    
    setSensorValues(newSensors);
    setWeightedAverage(Math.floor(position));
  }, [linePosition]);

  // Loop for physics calculation
  useEffect(() => {
    calculatePhysics();
  }, [calculatePhysics]);

  // Auto-move effect
  useEffect(() => {
    let interval: number;
    if (isAutoMoving) {
      let direction = 1;
      interval = window.setInterval(() => {
        setLinePosition(prev => {
          if (prev >= 95) direction = -1;
          if (prev <= 5) direction = 1;
          // Simple sine wave movement for smoother look
          const time = Date.now() / 500;
          return 50 + Math.sin(time) * 40; 
        });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isAutoMoving]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
              <Cpu className="w-8 h-8" />
              Arduino Nano & QTR-8A Simülatörü
            </h1>
            <p className="text-slate-400 mt-2">
              Çizgi izleyen robot sensör mantığı ve analog veri analizi.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
             <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
               <Activity className="w-4 h-4 text-green-400" />
               <span className="text-sm font-mono text-green-400">Sensör Aktif</span>
             </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Visualizer & Readings */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Visualizer Card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-semibold text-white">Fiziksel Simülasyon</h2>
                 <button 
                  onClick={() => setIsAutoMoving(!isAutoMoving)}
                  className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition-colors ${isAutoMoving ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}
                 >
                   {isAutoMoving ? 'Otomatik Hareketi Durdur' : 'Otomatik Hareket Başlat'}
                 </button>
               </div>
               
               <Visualizer linePosition={linePosition} setLinePosition={setLinePosition} />
               
               <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-slate-300">Nasıl Çalışır?</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    QTR-8A sensörü kızılötesi (IR) ışık yayar ve yansımayı ölçer. 
                    <strong className="text-white"> Siyah çizgi</strong> ışığı emer (Düşük Yansıma = Yüksek Voltaj/Değer).
                    <strong className="text-white"> Beyaz zemin</strong> ışığı yansıtır (Yüksek Yansıma = Düşük Voltaj/Değer).
                  </p>
               </div>
            </div>

            {/* Sensor Readings Card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
               <SensorReadings sensors={sensorValues} weightedAverage={weightedAverage} />
            </div>

          </div>

          {/* Right Column: Code & Serial */}
          <div className="lg:col-span-5 space-y-6">
            <ArduinoCode />
            <SerialMonitor sensors={sensorValues} weightedAverage={weightedAverage} />
          </div>

        </div>
      </div>
    </div>
  );
}