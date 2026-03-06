import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Payment from '@/models/Payment';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    await connectDB();

    if (event.event === 'payment.failed') {
      const payload = event.payload.payment.entity;
      const orderId = payload.order_id;
      const paymentId = payload.id;

      // Mark the application payment as pending (not completed)
      const application = await Application.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { paymentStatus: 'pending' },
        { new: true }
      );

      if (application) {
        // Create or update payment record as failed
        await Payment.findOneAndUpdate(
          { razorpayOrderId: orderId },
          {
            userId: application.userId,
            applicationId: application._id,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            amount: Math.round(payload.amount / 100), // Convert paise to rupees
            status: 'failed',
          },
          { upsert: true, new: true }
        );

        console.log(`[WEBHOOK] Payment failed recorded for Order: ${orderId}`);
      }
    }

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload?.payment?.entity;
      if (!payment) return NextResponse.json({ received: true });

      const orderId = payment.order_id;
      const paymentId = payment.id;

      const application = await Application.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { paymentStatus: 'completed', razorpayPaymentId: paymentId },
        { new: true }
      );

      if (application) {
        await Payment.findOneAndUpdate(
          { razorpayOrderId: orderId },
          {
            userId: application.userId,
            applicationId: application._id,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            amount: Math.round(payment.amount / 100),
            status: 'paid',
          },
          { upsert: true, new: true }
        );

        console.log(`[WEBHOOK] Payment captured for Order: ${orderId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[WEBHOOK] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
