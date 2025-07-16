import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Project } from '../../projects/schemas/project.schema';

export type OperatorRequestDocument = HydratedDocument<OperatorRequest>;

@Schema({ timestamps: true })
export class OperatorRequest {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  operator: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true })
  project: Project;

  @Prop({ enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  status: string;

  @Prop()
  adminFeedback?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reviewedBy?: User;

  @Prop({ type: Date })
  reviewedAt?: Date;
}

export const OperatorRequestSchema = SchemaFactory.createForClass(OperatorRequest);

// Add indexes for better query performance
OperatorRequestSchema.index({ operator: 1, project: 1 }, { unique: true });
OperatorRequestSchema.index({ status: 1 });
OperatorRequestSchema.index({ createdAt: -1 }); 