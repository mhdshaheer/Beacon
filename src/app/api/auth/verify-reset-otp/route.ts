import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const mongoose = await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    // USE DIRECT COLLECTION ACCESS (Bypasses Mongoose cached schemas and filters)
    const collection = mongoose.connection.db.collection('users');
    const user = await collection.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const receivedOtp = String(otp || '').trim();
    const storedOtp = String(user.resetOtp || '').trim();
    
    const isOtpValid = receivedOtp === storedOtp;
    const isOtpExpired = user.resetOtpExpires ? new Date() > new Date(user.resetOtpExpires) : true;

    if (process.env.NODE_ENV === 'development') {
      console.log(`\n--- [RESET-VERIFY] DIRECT DB DEBUG ---`);
      console.log(`Email: [${normalizedEmail}]`);
      console.log(`Received: [${receivedOtp}]`);
      console.log(`Stored In DB: [${storedOtp}]`);
      console.log(`Field exists in DB? ${'resetOtp' in user}`);
      console.log(`Is Match? ${isOtpValid}`);
      console.log(`Is Expired? ${isOtpExpired}\n`);
    }

    if (!isOtpValid) {
      return NextResponse.json({ error: 'The verification code you entered is incorrect.' }, { status: 400 });
    }

    if (isOtpExpired) {
      return NextResponse.json({ error: 'This code has expired. Please request a new one.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'OTP verified successfully' }, { status: 200 });

  } catch (error) {
    console.error('Verify reset OTP error:', error);
    return NextResponse.json({ error: 'Internal server error during verification' }, { status: 500 });
  }
}
