import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { approvalStatus } = await req.json();
    await connectDB();

    const application = await Application.findByIdAndUpdate(
      id,
      { approvalStatus },
      { new: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
