import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  personalInfo: {
    fullName: string;
    dob: Date;
    gender: 'male' | 'female' | 'other';
    phone: string;
    email: string;
    address: string;
    parentName: string;
  };
  academicInfo: {
    isStudying: boolean;
    schoolName: string;
    grade: string;
  };
  footballInfo: {
    position: string;
    clubName: string;
    level: 'School' | 'District' | 'State' | 'National';
    experience: number;
    achievements: string;
    honors: string;
    futureGoals: string;
  };
  additionalInfo: {
    otherSports: string;
    leadershipRole: string;
    householdIncome: number;
  };
  documents: {
    certificates: string[];
    awards: string[];
    trophies: string[];
  };
  paymentStatus: 'pending' | 'completed' | 'failed';
  approvalStatus: 'pending' | 'viewed' | 'approved' | 'rejected';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    personalInfo: {
      fullName: { type: String },
      dob: { type: Date },
      gender: { type: String, enum: ['male', 'female', 'other'] },
      phone: { type: String },
      email: { type: String },
      address: { type: String },
      parentName: { type: String },
    },
    academicInfo: {
      isStudying: { type: Boolean, default: true },
      schoolName: { type: String },
      grade: { type: String },
    },
    footballInfo: {
      position: { type: String },
      clubName: { type: String },
      level: { type: String, enum: ['School', 'District', 'State', 'National'] },
      experience: { type: Number },
      achievements: { type: String },
      honors: { type: String },
      futureGoals: { type: String },
    },
    additionalInfo: {
      otherSports: { type: String },
      leadershipRole: { type: String },
      householdIncome: { type: Number },
    },
    documents: {
      certificates: [{ type: String }],
      awards: [{ type: String }],
      trophies: [{ type: String }],
    },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    approvalStatus: { type: String, enum: ['pending', 'viewed', 'approved', 'rejected'], default: 'pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
