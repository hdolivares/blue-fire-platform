import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// Credential material must never leave the API regardless of how a user document
// reaches a response: `select: false` does not cover freshly save()d documents
// (register) or full-document populate()s, so strip on every serialization path.
const stripCredentials = (_doc: unknown, ret: Record<string, any>) => {
  delete ret.password;
  delete ret.passwordResetToken;
  delete ret.passwordResetExpires;
  return ret;
};

@Schema({
  timestamps: true,
  toJSON: { transform: stripCredentials },
  toObject: { transform: stripCredentials },
})
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true }) // 'unique' constraint moved to schema.index()
  email: string;

  @Prop({ required: true })
  country: string;

  @Prop({ unique: true, sparse: true }) // Made optional, sparse index allows multiple null values
  walletAddress?: string;

  @Prop({ required: true, select: false }) // select: false hides it from default queries
  password!: string;

  @Prop({ type: [String], required: true })
  roles!: string[];

  @Prop({ select: false })
  passwordResetToken?: string;

  @Prop({ select: false })
  passwordResetExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add case-insensitive index for email
UserSchema.index({ email: 1 }, { 
  unique: true, 
  collation: { locale: 'en', strength: 2 } // Case-insensitive collation
});