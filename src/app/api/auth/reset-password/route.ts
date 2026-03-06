import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const mongoose = await connectDB();
    const normalizedEmail = email.toLowerCase().trim();
    
    // DIRECT COLLECTION ACCESS
    if (!mongoose.connection.db) throw new Error('Database connection failed');
    const collection = mongoose.connection.db.collection('users');
    const user = await collection.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const receivedOtp = String(otp || '').trim();
    const storedOtp = String(user.resetOtp || '').trim();
    const isOtpValid = receivedOtp === storedOtp;
    const isOtpExpired = user.resetOtpExpires ? new Date() > new Date(user.resetOtpExpires) : true;

    if (!isOtpValid || isOtpExpired) {
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // DIRECT UPDATE
    await collection.updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword, updatedAt: new Date() },
        $unset: { resetOtp: "", resetOtpExpires: "" }
      }
    );

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
