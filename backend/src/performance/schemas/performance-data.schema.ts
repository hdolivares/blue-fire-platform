// In backend/src/performance/schemas/performance-data.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Project } from '../../projects/schemas/project.schema';

export type PerformanceDataDocument = HydratedDocument<PerformanceData>;

@Schema({ timestamps: true })
export class PerformanceData {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project' })
  project: Project;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  waterProduction: number; // In Liters

  @Prop({ required: true })
  energyConsumption: number; // In kWh
}

export const PerformanceDataSchema = SchemaFactory.createForClass(PerformanceData);