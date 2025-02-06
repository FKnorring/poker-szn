import { NextRequest, NextResponse } from 'next/server';
import { checkRoomPassword } from '@/app/pokerroom/[room]/actions';
import { setRoomPasswordCookie } from '@/lib/cookies';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { password } = await request.json();
    const { roomId } = await params;

    const isValid = await checkRoomPassword(roomId, password);

    if (!isValid) {
      return new NextResponse('Invalid password', { status: 401 });
    }

    // Set the password cookie
    setRoomPasswordCookie(roomId, password);

    return new NextResponse('Password accepted', { status: 200 });
  } catch (error) {
    console.error('Error checking room password:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 