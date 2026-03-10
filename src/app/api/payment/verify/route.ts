import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Payment from '@/models/Payment';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, failed } = body;

    await connectDB();

    // Handle explicit failure recording from the frontend
    if (failed) {
      const application = await Application.findOne({ razorpayOrderId: razorpay_order_id });
      if (application) {
        await Payment.findOneAndUpdate(
          { razorpayOrderId: razorpay_order_id },
          {
            userId: application.userId,
            applicationId: application._id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id || null,
            amount: 229,
            status: 'failed',
          },
          { upsert: true, new: true }
        );
        console.log(`[VERIFY] Failed payment recorded for Order: ${razorpay_order_id}`);
      }
      return NextResponse.json({ success: false, recorded: true, message: 'Failure recorded' });
    }

    // Verify signature for successful payment
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update Application as paid
      const application = await Application.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { 
          paymentStatus: 'completed',
          razorpayPaymentId: razorpay_payment_id 
        },
        { new: true }
      );

      if (application) {
        // Upsert Payment record (handles duplicates safely)
        await Payment.findOneAndUpdate(
          { razorpayOrderId: razorpay_order_id },
          {
            userId: application.userId,
            applicationId: application._id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount: 229, // ₹229 (stored as rupees, not paise)
            status: 'paid',
          },
          { upsert: true, new: true }
        );
        console.log(`[VERIFY] Payment success recorded for Order: ${razorpay_order_id}`);
      }

      return NextResponse.json({ success: true, message: 'Payment verified successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
