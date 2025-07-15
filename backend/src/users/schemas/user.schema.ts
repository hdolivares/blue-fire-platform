import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true, unique: true })
  walletAddress: string;

  @Prop({ required: true, select: false }) // select: false hides it from default queries
  password!: string;

  @Prop({ type: [String], required: true })
  roles!: string[];

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add case-insensitive index for email
UserSchema.index({ email: 1 }, { 
  unique: true, 
  collation: { locale: 'en', strength: 2 } // Case-insensitive collation
});