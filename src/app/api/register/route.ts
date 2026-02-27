import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';
import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID) {
  console.error('RAZORPAY_KEY_ID is missing from environment variables');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const formData = await req.json();
    const userId = (session.user as any).id;

    // 1. Sanitize the data chunks to avoid _id conflicts in subdocuments
    const sanitize = (obj: any) => {
      if (!obj) return {};
      const newObj = { ...obj };
      delete newObj._id;
      delete newObj.userId;
      delete newObj.__v;
      delete newObj.createdAt;
      delete newObj.updatedAt;
      return newObj;
    };

    const personalInfo = sanitize(formData.personalInfo);
    if (personalInfo.dob) personalInfo.dob = new Date(personalInfo.dob);

    const academicInfo = sanitize(formData.academicInfo);
    const sportsInfo = sanitize(formData.sportsInfo);
    const additionalInfo = sanitize(formData.additionalInfo);

    // 2. Find or Update Application
    let application = await Application.findOneAndUpdate(
      { userId },
      { 
        $set: {
          personalInfo,
          academicInfo,
          sportsInfo,
          additionalInfo,
          paymentStatus: 'pending'
        }
      },
      { upsert: true, new: true, runValidators: false }
    );

    // 2. Create Razorpay Order
    const amount = 500 * 100; // Registration fee: ₹500
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${application._id}`,
    };

    const order = await razorpay.orders.create(options);

    // 3. Update Application with Order ID
    application.razorpayOrderId = order.id;
    await application.save();

    return NextResponse.json({
      orderId: order.id,
      applicationId: application._id,
      amount: amount,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
