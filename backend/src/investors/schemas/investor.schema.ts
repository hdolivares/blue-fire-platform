// In backend/src/investors/schemas/investor.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InvestorDocument = HydratedDocument<Investor>;

@Schema()
export class Investor {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true, unique: true })
  walletAddress: string;
}

export const InvestorSchema = SchemaFactory.createForClass(Investor);