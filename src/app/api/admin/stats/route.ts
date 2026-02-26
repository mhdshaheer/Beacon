import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Application from '@/models/Application';

export async function GET() {
  try {
    await connectDB();
    
    const userStats = {
      total: await User.countDocuments(),
      admins: await User.countDocuments({ role: 'admin' }),
      regularUsers: await User.countDocuments({ role: 'user' }),
    };

    const applicationStats = {
      total: await Application.countDocuments(),
      paid: await Application.countDocuments({ paymentStatus: 'completed' }),
      pending: await Application.countDocuments({ paymentStatus: 'pending' }),
      approved: await Application.countDocuments({ approvalStatus: 'approved' }),
    };

    // Monthly data (example last 6 months)
    // This could be real data based on createdAt
    const chartData = [
      { month: 'Sep', users: 12, applications: 8 },
      { month: 'Oct', users: 19, applications: 15 },
      { month: 'Nov', users: 25, applications: 22 },
      { month: 'Dec', users: 38, applications: 30 },
      { month: 'Jan', users: 45, applications: 42 },
      { month: 'Feb', users: 54, applications: 48 },
    ];

    return NextResponse.json({ 
      users: userStats, 
      applications: applicationStats,
      chartData 
    });

  } catch (error: any) {
    console.error('Admin Stats API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
