import React from 'react';
import { Copy } from 'lucide-react';

export const ArduinoCode: React.FC = () => {
  const code = `
#include <QTRSensors.h>

QTRSensors qtr;
const uint8_t SensorCount = 8;
uint16_t sensorValues[SensorCount];

void setup() {
  // QTR-8A analog pinlerini tanımla
  qtr.setTypeAnalog();
  qtr.setSensorPins((const uint8_t[]){A0, A1, A2, A3, A4, A5, A6, A7}, SensorCount);

  Serial.begin(9600);
  
  // Kalibrasyon döngüsü (robotu sağa sola sallarız)
  for (uint16_t i = 0; i < 400; i++) {
    qtr.calibrate();
  }
}

void loop() {
  // Sensörleri oku ve pozisyonu hesapla (0-7000 arası)
  // 0: En sol, 3500: Merkez, 7000: En sağ
  uint16_t position = qtr.readLineBlack(sensorValues);

  // Değerleri Seri Port'a yazdır
  for (uint8_t i = 0; i < SensorCount; i++) {
    Serial.print(sensorValues[i]);
    Serial.print('\\t');
  }
  Serial.print("Poz: ");
  Serial.println(position);

  delay(50);
}
`;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-xl flex flex-col h-[400px]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800 rounded-t-xl">
        <span className="text-sm font-mono text-blue-300">main.ino</span>
        <button className="text-slate-400 hover:text-white transition-colors" title="Kodu Kopyala">
            <Copy className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <pre className="font-mono text-xs md:text-sm leading-relaxed text-slate-300">
            <code>
                {code.split('\n').map((line, i) => (
                    <div key={i} className="table-row">
                        <span className="table-cell text-slate-600 select-none text-right pr-4">{i + 1}</span>
                        <span className="table-cell whitespace-pre-wrap">
                            {line
                                .replace('#include', '🔹 #include')
                                .replace('void', '🟪 void')
                                .replace(/\/\/.*/g, (match) => `<span class="text-green-600 italic">${match}</span>`)
                                .replace('Serial', '<span class="text-orange-400">Serial</span>')
                                .split(/(<[^>]+>)/g).map((part, index) => {
                                    // Render HTML tags safely
                                    if(part.startsWith('<')) return <span key={index} dangerouslySetInnerHTML={{__html: part}} />;
                                    return part;
                                })
                            }
                        </span>
                    </div>
                ))}
            </code>
        </pre>
      </div>
    </div>
  );
};