import { openDb } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET() {
  const db = await openDb();
  const employees = await db.all('SELECT * FROM employees');
  return Response.json(employees);
}

export async function POST(req: NextRequest) {
  const db = await openDb();
  const data = await req.json();
  await db.run(
    'INSERT INTO employees (name, position) VALUES (?, ?)',
    data.name, data.position
  );
  return new Response('OK', { status: 201 });
}
