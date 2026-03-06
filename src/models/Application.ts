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
    lastQualification: string;
  };
  sportsInfo: Array<{
    sport: string;
    position: string;
    clubName: string;
    level: 'School' | 'District' | 'State' | 'National' | 'Other';
    levelOther?: string;
    experience: number;
    achievements: string;
    certificates: Array<{ url: string; public_id: string }>; // objects per sport
  }>;
  additionalInfo: {
    leadershipRole: string;
    fatherOccupation: string;
    fatherIncome: number;
    motherOccupation: string;
    motherIncome: number;
    isWorking: boolean;
    userOccupation: string;
    userIncome: number;
    householdIncome: number; // This will store Total Monthly HH Income
  };
  documents: {
    certificates: Array<{ url: string; public_id: string }>;
    awards: Array<{ url: string; public_id: string }>;
    trophies: Array<{ url: string; public_id: string }>;
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
      lastQualification: { type: String },
    },
    sportsInfo: [{
      sport: { type: String },
      position: { type: String },
      clubName: { type: String },
      level: { type: String, enum: ['School', 'District', 'State', 'National', 'Other'] },
      levelOther: { type: String },
      experience: { type: Number },
      achievements: { type: String },
      certificates: [{
        url: { type: String },
        public_id: { type: String }
      }],
    }],
    additionalInfo: {
      leadershipRole: { type: String },
      fatherOccupation: { type: String },
      fatherIncome: { type: Number },
      motherOccupation: { type: String },
      motherIncome: { type: Number },
      isWorking: { type: Boolean, default: false },
      userOccupation: { type: String },
      userIncome: { type: Number },
      householdIncome: { type: Number },
    },
    documents: {
      certificates: [{ url: { type: String }, public_id: { type: String } }],
      awards: [{ url: { type: String }, public_id: { type: String } }],
      trophies: [{ url: { type: String }, public_id: { type: String } }],
    },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    approvalStatus: { type: String, enum: ['pending', 'viewed', 'approved', 'rejected'], default: 'pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

// Delete cached model to ensure schema changes (e.g. footballInfo -> sportsInfo) are picked up
if (mongoose.models.Application) {
  delete mongoose.models.Application;
}
const Application: Model<IApplication> = mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
