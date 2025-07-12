// In frontend/src/types/project.d.ts

export interface AssignedProject {
  _id: string;
  projectName: string;
  location: string;
  status: string;
  unitControllerAddress: string;
  imageUrl: string;
  avgHumidity: number;
  avgTemperature: number;
  avgDailyWaterProduction: number;
  waterSoldUntil?: string;
}