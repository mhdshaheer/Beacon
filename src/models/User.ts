import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  sport: string;
  password?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    sport: { type: String },
    password: { type: String, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
