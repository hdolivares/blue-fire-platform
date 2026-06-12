// In backend/src/performance/schemas/performance-data.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Project } from '../../projects/schemas/project.schema';
import { MachineStatus } from './machine-status.enum';

export type PerformanceDataDocument = PerformanceData & Document;

@Schema({ timestamps: true })
export class PerformanceData {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true })
  project: Project;

  @Prop()
  timestamp: Date; // Renaming 'date' to 'timestamp' for consistency

  @Prop()
  litersProduced: number;

  @Prop()
  kwhPerLiter: number;

  @Prop()
  humidity: number; // Renaming 'avgHumidity' to 'humidity'

  @Prop()
  temperature: number; // Renaming 'avgTemperature' to 'temperature'

  @Prop({ type: String, enum: MachineStatus })
  machineStatus: MachineStatus;
}

export const PerformanceDataSchema = SchemaFactory.createForClass(PerformanceData);