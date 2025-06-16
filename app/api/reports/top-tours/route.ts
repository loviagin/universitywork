import { openDb } from '@/lib/db';

export async function GET() {
  const db = await openDb();
  const result = await db.all(`
    SELECT t.title, SUM(s.quantity) AS total_sold
    FROM sales s
    JOIN tours t ON s.tour_id = t.id
    GROUP BY s.tour_id
    ORDER BY total_sold DESC
    LIMIT 5
  `);
  return Response.json(result);
}
