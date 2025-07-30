// In backend/src/projects/schemas/project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum ProjectStatus {
  SEEKING_FUNDING = 'SEEKING_FUNDING',
  FUNDED_ORDER_PLACED = 'FUNDED_ORDER_PLACED',
  FUNDED_MACHINE_SHIPPED = 'FUNDED_MACHINE_SHIPPED',
  FUNDED_INSTALLATION_PHASE = 'FUNDED_INSTALLATION_PHASE',
  OPERATIONAL = 'OPERATIONAL',
}

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop()
  projectName?: string; // For backward compatibility

  @Prop({ required: true })
  location: string;
  
  @Prop({ type: String, enum: ProjectStatus, default: ProjectStatus.SEEKING_FUNDING })
  status: ProjectStatus;

  @Prop({ default: 0 })
  avgHumidity: number;

  @Prop({ default: 0 })
  avgTemperature: number;

  @Prop({ required: true })
  goalAmount: number;

  @Prop()
  fundingGoal?: number; // For backward compatibility

  @Prop({ default: 0 })
  currentAmount: number;

  @Prop()
  currentFunding?: number; // For backward compatibility

  @Prop()
  mainImage: string;

  @Prop()
  imageUrl?: string; // For backward compatibility

  @Prop([String])
  images: string[];

  @Prop()
  imageUrls?: string[]; // For backward compatibility
  
  @Prop({ type: Types.ObjectId, ref: 'User' })
  operator: User;

  // Blockchain integration fields
  @Prop()
  blockchainProjectId?: number; // On-chain project ID for association

  @Prop()
  blockchainAddress?: string; // On-chain project contract address

  @Prop()
  deployedOnChain?: boolean; // Whether project is deployed on blockchain

  @Prop()
  machineModel?: string; // Machine model for blockchain deployment

  // Sync tracking fields
  @Prop()
  currentFundingETH?: number; // Current funding in ETH from blockchain

  @Prop()
  blockchainState?: number; // Current blockchain state (0-3)

  @Prop()
  fundingProgress?: number; // Funding progress percentage from blockchain

  @Prop({ default: Date.now })
  lastSyncAt?: Date; // Last time this project was synced with blockchain
}

export const ProjectSchema = SchemaFactory.createForClass(Project);