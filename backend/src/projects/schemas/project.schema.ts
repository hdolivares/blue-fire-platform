// In backend/src/projects/schemas/project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose'; // Import mongoose
import { User } from '../../users/schemas/user.schema'; // Import the User schema

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  projectName: string;

  @Prop({ required: true })
  fundingGoal: number;

  @Prop({ default: 0 })
  currentFunding: number;

  @Prop()
  location: string;

  @Prop() 
  avgHumidity: number;

  @Prop() 
  avgTemperature: number;

  @Prop({ default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070' })
  imageUrl: string; // <-- adding a static image for now

  @Prop({ type: [String], default: [] }) // <-- Adding array for image carousel
  imageUrls: string[];

  @Prop({ enum: ['SEEKING_FUNDING', 'OPERATIONAL', 'COMPLETED'], default: 'SEEKING_FUNDING' })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  operator?: User;

  @Prop()
  unitControllerAddress?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);