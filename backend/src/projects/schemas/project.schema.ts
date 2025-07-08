// In backend/src/projects/schemas/project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  projectName: string;

  @Prop({ required: true })
  fundingGoal: number;

  @Prop({ default: 0 })
  currentFunding: number;

  @Prop({ default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070' })
  imageUrl: string; // <-- adding a static image for now

  @Prop({ enum: ['SEEKING_FUNDING', 'OPERATIONAL', 'COMPLETED'], default: 'SEEKING_FUNDING' })
  status: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);