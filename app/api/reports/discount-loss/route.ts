import { openDb } from '@/lib/db';

interface DiscountLossRecord {
  sale_id: number;
  client_name: string;
  discount: number;
  price: number;
  quantity: number;
  discount_loss: number;
}

export async function GET() {
  const db = await openDb();
  const result = (await db.all(`
    SELECT s.id AS sale_id, c.name AS client_name, c.discount, t.price, s.quantity,
           (t.price * s.quantity * c.discount / 100.0) AS discount_loss
    FROM sales s
    JOIN clients c ON s.client_id = c.id
    JOIN tours t ON s.tour_id = t.id
    WHERE c.discount > 0
  `)) as DiscountLossRecord[];

  const totalLoss = result.reduce((sum: number, r: DiscountLossRecord) => sum + (r.discount_loss || 0), 0);
  return Response.json({ totalLoss, details: result });
}
