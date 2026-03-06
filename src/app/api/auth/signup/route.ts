import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, sport, resendOnly } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const mongoose = await connectDB();
    const normalizedEmail = email.toLowerCase().trim();
    const db = mongoose.connection.db;
    const pendingCollection = db.collection('pendingusers');
    
    // 1. Check if user already exists in main collection
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'This email is already verified and registered.' }, { status: 400 });
    }

    // 2. Handle Resend Case
    if (resendOnly) {
      const pending = await pendingCollection.findOne({ email: normalizedEmail });
      if (!pending) {
        return NextResponse.json({ error: 'No registration session found. Please fill the form again.' }, { status: 404 });
      }

      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await pendingCollection.updateOne(
        { _id: pending._id },
        { 
          $set: { 
            otpCode: newOtp, 
            otpExpires: newExpiry 
          } 
        }
      );

      await sendOTPEmail(normalizedEmail, newOtp);
      return NextResponse.json({ message: 'New verification code sent!' }, { status: 200 });
    }

    // 3. Regular Signup Logic
    if (!name || !password || !sport) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // DIRECT UPSERT
    await pendingCollection.updateOne(
      { email: normalizedEmail },
      { 
        $set: { 
          name, 
          email: normalizedEmail,
          sport,
          passwordHashed: hashedPassword, 
          otpCode, 
          otpExpires,
          createdAt: new Date() 
        } 
      },
      { upsert: true }
    );

    if (process.env.NODE_ENV === 'development') {
      console.log(`\n--- [SIGNUP] OTP GENERATED ---`);
      console.log(`Email: [${normalizedEmail}]`);
      console.log(`Code:  [${otpCode}]\n`);
    }

    await sendOTPEmail(normalizedEmail, otpCode);

    return NextResponse.json({ 
      message: 'Verification code sent. Please check your email.',
      email: normalizedEmail 
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Something went wrong during signup' }, { status: 500 });
  }
}
