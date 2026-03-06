import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const mongoose = await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    // USE DIRECT COLLECTION ACCESS for the pending session
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection failed');
    const pendingCollection = db.collection('pendingusers'); // Collection name from Mongoose model (lowercase + s)
    const pendingUser = await pendingCollection.findOne({ email: normalizedEmail });
    
    if (!pendingUser) {
      return NextResponse.json({ 
        error: 'No pending registration found or code expired. Please sign up again.' 
      }, { status: 404 });
    }

    // 2. Validate OTP and expiration
    const receivedOtp = String(otp || '').trim();
    const storedOtp = String(pendingUser.otpCode || '').trim();
    const isOtpValid = receivedOtp === storedOtp;
    const isOtpExpired = pendingUser.otpExpires ? new Date() > new Date(pendingUser.otpExpires) : true;

    if (process.env.NODE_ENV === 'development') {
      console.log(`\n--- [SIGNUP] OTP VERIFICATION DEBUG ---`);
      console.log(`Email: [${normalizedEmail}]`);
      console.log(`Received: [${receivedOtp}]`);
      console.log(`Stored:   [${storedOtp}]`);
      console.log(`Is Match?     ${isOtpValid}`);
      console.log(`Is Expired?   ${isOtpExpired}\n`);
    }

    if (!isOtpValid) {
      return NextResponse.json({ error: 'The verification code you entered is incorrect. Please check your email and try again.' }, { status: 400 });
    }

    if (isOtpExpired) {
      return NextResponse.json({ error: 'This verification code has expired. Please sign up again to get a new code.' }, { status: 400 });
    }

    // 3. ATOMIC PROMOTION: Move to main User collection
    try {
      await User.create({
        name: pendingUser.name,
        email: pendingUser.email,
        sport: pendingUser.sport,
        password: pendingUser.passwordHashed,
        role: 'user',
        isVerified: true,
      });

      // 4. Clean up Pending collection
      await pendingCollection.deleteOne({ _id: pendingUser._id });

    } catch (dbError: unknown) {
      console.error('Database Promotion Error:', dbError);
      if ((dbError as any).code === 11000) { // eslint-disable-line @typescript-eslint/no-explicit-any
        return NextResponse.json({ error: 'This user already exists in our system.' }, { status: 400 });
      }
      throw dbError;
    }

    return NextResponse.json({ 
      message: 'Email verified and account created successfully! You can now login.' 
    }, { status: 200 });

  } catch (error) {
    console.error('General Verification Error:', error);
    return NextResponse.json({ error: 'Verification failed. Please try again later.' }, { status: 500 });
  }
}
