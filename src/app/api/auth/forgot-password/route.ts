import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const mongoose = await connectDB();
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. USE DIRECT COLLECTION ACCESS (Bypasses Mongoose Schema Cache)
    const collection = mongoose.connection.db.collection('users');
    const user = await collection.findOne({ email: normalizedEmail });

    if (process.env.NODE_ENV === 'development') {
        console.log(`\n--- [FORGOT] DIRECT DB CHECK ---`);
        console.log(`Email: [${normalizedEmail}]`);
        console.log(`User Found? ${!!user}`);
    }

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      // 2. DIRECT UPDATE (Solves Mongoose stripping "unknown" fields)
      const updateResult = await collection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            resetOtp: otp, 
            resetOtpExpires: otpExpires,
            updatedAt: new Date() 
          } 
        }
      );

      if (process.env.NODE_ENV === 'development') {
        console.log(`OTP Generated: [${otp}]`);
        console.log(`Update Result:`, updateResult);
        console.log(`--- [FORGOT] END ---\n`);
      }

      await sendPasswordResetEmail(normalizedEmail, otp);
    }

    return NextResponse.json({ message: 'If an account exists, a reset code has been sent.' });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
