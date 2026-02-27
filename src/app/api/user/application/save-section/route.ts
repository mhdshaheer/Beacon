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
    
    // Sanitize data: Remove fields that shouldn't be updated within a section
    const sanitizedData = { ...data };
    delete sanitizedData._id;
    delete sanitizedData.userId;
    delete sanitizedData.__v;
    delete sanitizedData.createdAt;
    delete sanitizedData.updatedAt;

    if (section === 'personalInfo' && sanitizedData.dob) {
        sanitizedData.dob = new Date(sanitizedData.dob);
    }
    
    update[section] = sanitizedData;

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
