import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Payment from '@/models/Payment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;

    const [application, payments] = await Promise.all([
      Application.findOne({ userId }).sort({ createdAt: -1 }),
      Payment.find({ userId }).sort({ createdAt: -1 })
    ]);

    return NextResponse.json({
      application,
      payments,
      user: session.user
    });

  } catch (error) {
    console.error('Dashboard Data Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
