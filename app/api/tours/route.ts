import { openDb } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET() {
  const db = await openDb();
  const tours = await db.all('SELECT * FROM tours ORDER BY created_at DESC');
  return Response.json(tours);
}

export async function POST(req: NextRequest) {
  try {
    const db = await openDb();
    const data = await req.json();

    const result = await db.run(
      `INSERT INTO tours (
        name,
        description,
        price,
        duration,
        max_clients,
        start_date,
        end_date,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.description,
        data.price,
        data.duration,
        data.max_clients,
        data.start_date,
        data.end_date,
        data.status
      ]
    );

    if (result.changes === 0) {
      return new Response('Failed to create tour', { status: 500 });
    }

    return new Response('Tour created successfully', { status: 201 });
  } catch (error) {
    console.error('Error creating tour:', error);
    return new Response('Error creating tour', { status: 500 });
  }
}
