import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Razorpay from 'razorpay';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;

    // Find the user's application
    const application = await Application.findOne({ userId });
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.paymentStatus === 'completed') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    // Create a new Razorpay order
    const amount = 500 * 100; // ₹500 in paise
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `retry_${application._id}_${Date.now()}`,
    });

    // Update application with the new order ID
    application.razorpayOrderId = order.id;
    application.paymentStatus = 'pending';
    await application.save();

    return NextResponse.json({
      orderId: order.id,
      applicationId: application._id,
      amount,
      key: process.env.RAZORPAY_KEY_ID,
      prefill: {
        name: application.personalInfo?.fullName || '',
        email: application.personalInfo?.email || '',
        contact: application.personalInfo?.phone || '',
      },
    });
  } catch (error: any) {
    console.error('Retry Payment Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
