// backend/src/investments/schemas/investment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Project } from '../../projects/schemas/project.schema';

export type InvestmentDocument = HydratedDocument<Investment>;

@Schema({ timestamps: true })
export class Investment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true })
  project: Project;

  @Prop({ required: true })
  amount: number; // The amount invested in USD
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);