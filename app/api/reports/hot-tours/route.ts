import { openDb } from '@/lib/db';

export async function GET() {
  const db = await openDb();
  const result = await db.all(`
    SELECT * FROM tours
    WHERE DATE(start_date) <= DATE('now', '+5 day')
  `);
  return Response.json(result);
}
