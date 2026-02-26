import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all users
    const users = await User.find().sort({ createdAt: -1 });

    const stats = {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      regularUsers: users.filter(u => u.role === 'user').length,
      recentUsers: users.filter(u => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return u.createdAt > oneWeekAgo;
      }).length,
    };

    return NextResponse.json({ users, stats });

  } catch (error: any) {
    console.error('Admin Users API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
