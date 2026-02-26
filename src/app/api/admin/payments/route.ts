import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all payments and populate user/application info
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('applicationId', 'personalInfo.fullName')
      .sort({ createdAt: -1 });

    const stats = {
      totalRevenue: payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount / 100), 0),
      count: payments.length,
      paidCount: payments.filter(p => p.status === 'paid').length,
      failedCount: payments.filter(p => p.status === 'failed').length,
    };

    return NextResponse.json({ payments, stats });

  } catch (error: any) {
    console.error('Admin Payments API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
