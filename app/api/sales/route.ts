import { openDb } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET() {
  const db = await openDb();
  const sales = await db.all(`
    SELECT 
      s.*,
      c.name as client_name,
      c.phone as client_phone,
      t.name as tour_name,
      t.start_date as tour_start_date,
      t.end_date as tour_end_date
    FROM sales s
    LEFT JOIN clients c ON s.client_id = c.id
    LEFT JOIN tours t ON s.tour_id = t.id
    ORDER BY s.created_at DESC
  `);
  return Response.json(sales);
}

export async function POST(req: NextRequest) {
  try {
    const db = await openDb();
    const data = await req.json();

    const result = await db.run(
      `INSERT INTO sales (
        client_id,
        tour_id,
        price,
        status,
        payment_method,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.client_id,
        data.tour_id,
        data.price,
        data.status,
        data.payment_method,
        data.notes
      ]
    );

    if (result.changes === 0) {
      return new Response('Failed to create sale', { status: 500 });
    }

    return new Response('Sale created successfully', { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return new Response('Error creating sale', { status: 500 });
  }
}
