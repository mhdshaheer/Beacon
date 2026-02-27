import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPendingUser extends Document {
  name: string;
  email: string;
  sport: string;
  passwordHashed: string;
  otpCode: string;
  otpExpires: Date;
  createdAt: Date;
}

const PendingUserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    sport: { type: String },
    passwordHashed: { type: String, required: true },
    otpCode: { type: String, required: true },
    otpExpires: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 minutes (600 seconds)
  }
);

const PendingUser: Model<IPendingUser> = mongoose.models.PendingUser || mongoose.model<IPendingUser>('PendingUser', PendingUserSchema);

export default PendingUser;
