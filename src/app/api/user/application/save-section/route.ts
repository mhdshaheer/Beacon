import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
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
    const application = await Application.findOne({ userId });

    return NextResponse.json(application || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    const { section, data } = await req.json();

    if (!section || !data) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Prepare update object
    const update: any = {};
    if (section === 'personalInfo') {
        // Ensure DOB is a date object
        if (data.dob) data.dob = new Date(data.dob);
    }
    update[section] = data;

    const application = await Application.findOneAndUpdate(
      { userId },
      { $set: update },
      { upsert: true, new: true, runValidators: false } // runValidators: false allows partial saving
    );

    return NextResponse.json({ message: 'Section saved successfully', application });
  } catch (error: any) {
    console.error('Save Section Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
