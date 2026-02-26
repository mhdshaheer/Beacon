import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Check if user already exists in main collection
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists and is verified' }, { status: 400 });
    }

    // 2. Hash password and generate OTP
    const hashedPassword = await bcrypt.hash(password, 12);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Store in PENDING collection (Upsert if already pending)
    await PendingUser.findOneAndUpdate(
      { email: normalizedEmail },
      { 
        name, 
        passwordHashed: hashedPassword, 
        otpCode, 
        otpExpires,
        createdAt: new Date() 
      },
      { upsert: true, new: true }
    );

    // For Development: Log OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n--- PENDING OTP for ${normalizedEmail}: ${otpCode} ---\n`);
    }

    // 4. Send Email via Resend
    const { success, error } = await sendOTPEmail(normalizedEmail, otpCode);
    
    if (!success) {
      console.error('Email sending failed during signup:', error);
    }

    return NextResponse.json({ 
      message: 'Verification code sent. Please check your email.',
      email: normalizedEmail 
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
