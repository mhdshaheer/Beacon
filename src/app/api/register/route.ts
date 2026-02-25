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

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    // 1. Handle User
    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = await User.create({
        name: data.fullName,
        email: data.email,
        role: 'user',
      });
    }

    // 2. Create Application
    const application = await Application.create({
      userId: user._id,
      personalInfo: {
        fullName: data.fullName,
        dob: new Date(data.dob),
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        address: data.address,
        parentName: data.parentName,
      },
      academicInfo: {
        schoolName: data.schoolName,
        grade: data.grade,
      },
      footballInfo: {
        position: data.position,
        clubName: data.clubName,
        level: data.level,
        experience: data.experience,
        achievements: data.achievements,
        honors: data.honors,
        futureGoals: data.futureGoals,
      },
      additionalInfo: {
        otherSports: data.otherSports,
        leadershipRole: data.leadershipRole,
        householdIncome: data.householdIncome,
      },
      paymentStatus: 'pending',
      approvalStatus: 'pending',
    });

    // 3. Create Razorpay Order
    const amount = 500 * 100; // Example fee: ₹500
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${application._id}`,
    };

    const order = await razorpay.orders.create(options);

    // 4. Update Application with Order ID
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
