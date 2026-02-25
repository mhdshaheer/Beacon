import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all applications and populate user info
    const applications = await Application.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const stats = {
      total: applications.length,
      paid: applications.filter(a => a.paymentStatus === 'completed').length,
      pendingPayments: applications.filter(a => a.paymentStatus === 'pending').length,
      approved: applications.filter(a => a.approvalStatus === 'approved').length,
    };

    return NextResponse.json({ applications, stats });

  } catch (error: any) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
