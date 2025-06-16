import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Database initialization failed' },
      { status: 500 }
    );
  }
} 