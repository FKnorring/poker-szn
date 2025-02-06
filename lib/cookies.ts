import { cookies } from 'next/headers';

const ROOM_PASSWORD_PREFIX = 'room_pwd_';

export async function getRoomPasswordCookie(roomId: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(`${ROOM_PASSWORD_PREFIX}${roomId}`)?.value;
}

export async function setRoomPasswordCookie(roomId: string, password: string) {
  const cookieStore = await cookies();
  // Set cookie that expires in 30 days
  cookieStore.set(`${ROOM_PASSWORD_PREFIX}${roomId}`, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
}