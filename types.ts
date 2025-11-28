export interface SensorState {
  id: number;
  value: number; // 0-1023
  voltage: number; // 0-5V
}

export interface SimulationState {
  linePosition: number; // 0-100 (percentage across width)
  sensors: SensorState[];
  weightedAverage: number; // Calculated position 0-7000
}