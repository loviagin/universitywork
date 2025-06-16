import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (login(username, password)) {
      const response = NextResponse.json({ success: true });
      
      // Устанавливаем простую куки
      response.cookies.set('session', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 дней
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Неверный логин или пароль' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
