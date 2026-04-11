import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET the current user's avatar
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { image: true }
    });

    return NextResponse.json({ image: user?.image || null });
  } catch (error) {
    console.error('Avatar GET Error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST to update the avatar
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { image } = await req.json();

    // Limit base64 length to prevent DB abuse (e.g., 2MB map out to ~2.7MB string)
    if (image?.length > 3000000) {
       return NextResponse.json({ error: 'Imagen muy grande (Máx 2MB aprox)' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: image }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Avatar POST Error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
