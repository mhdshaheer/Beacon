import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user in PENDING collection
    const pendingUser = await PendingUser.findOne({ email: normalizedEmail });
    
    if (!pendingUser) {
      return NextResponse.json({ 
        error: 'No pending registration found or code expired. Please sign up again.' 
      }, { status: 404 });
    }

    // 2. Validate OTP and expiration
    const isOtpValid = pendingUser.otpCode === otp;
    const isOtpExpired = new Date() > pendingUser.otpExpires;

    if (process.env.NODE_ENV === 'development') {
      console.log(`\n--- OTP VERIFY DEBUG for ${normalizedEmail} ---`);
      console.log(`Provided OTP: "${otp}"`);
      console.log(`Stored OTP:   "${pendingUser.otpCode}"`);
      console.log(`Is Match?     ${isOtpValid}`);
      console.log(`Is Expired?   ${isOtpExpired}\n`);
    }

    if (!isOtpValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (isOtpExpired) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
    }

    // 3. ATOMIC PROMOTION: Move to main User collection
    await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      sport: pendingUser.sport,
      password: pendingUser.passwordHashed,
      role: 'user',
      isVerified: true,
    });

    // 4. Clean up Pending collection
    await PendingUser.deleteOne({ _id: pendingUser._id });

    return NextResponse.json({ 
      message: 'Email verified and account created successfully! You can now login.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
