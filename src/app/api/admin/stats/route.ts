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

    // Generate last 6 months list
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth()
      });
    }

    // Real aggregation for chart data
    const chartData = await Promise.all(months.map(async (m) => {
      const startDate = new Date(m.year, m.monthNum, 1);
      const endDate = new Date(m.year, m.monthNum + 1, 0, 23, 59, 59);

      const [userCount, appCount] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        Application.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } })
      ]);

      return {
        month: m.name,
        users: userCount,
        applications: appCount
      };
    }));

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
