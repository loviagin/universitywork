import { openDb } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const db = await openDb();
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('start') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDate = searchParams.get('end') || new Date().toISOString().split('T')[0];

    // Общая статистика
    const totalStats = await db.get(`
      SELECT 
        COUNT(*) as totalSales,
        SUM(price) as totalRevenue,
        AVG(price) as averagePrice
      FROM sales
      WHERE DATE(created_at) BETWEEN ? AND ?
    `, [startDate, endDate]);

    // Статистика по статусам
    const salesByStatus = await db.get(`
      SELECT 
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM sales
      WHERE DATE(created_at) BETWEEN ? AND ?
    `, [startDate, endDate]);

    // Статистика по способам оплаты
    const salesByPaymentMethod = await db.all(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(price) as total
      FROM sales
      WHERE DATE(created_at) BETWEEN ? AND ?
        AND payment_method IS NOT NULL
      GROUP BY payment_method
      ORDER BY count DESC
    `, [startDate, endDate]);

    // Топ туров
    const topTours = await db.all(`
      SELECT 
        t.id,
        t.name,
        COUNT(s.id) as sales,
        SUM(s.price) as revenue
      FROM tours t
      LEFT JOIN sales s ON t.id = s.tour_id
      WHERE DATE(s.created_at) BETWEEN ? AND ?
      GROUP BY t.id
      ORDER BY sales DESC
      LIMIT 5
    `, [startDate, endDate]);

    // Топ клиентов
    const topClients = await db.all(`
      SELECT 
        c.id,
        c.name,
        COUNT(s.id) as purchases,
        SUM(s.price) as totalSpent
      FROM clients c
      LEFT JOIN sales s ON c.id = s.client_id
      WHERE DATE(s.created_at) BETWEEN ? AND ?
      GROUP BY c.id
      ORDER BY totalSpent DESC
      LIMIT 5
    `, [startDate, endDate]);

    // Продажи по месяцам
    const salesByMonth = await db.all(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as sales,
        SUM(price) as revenue
      FROM sales
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `, [startDate, endDate]);

    // Преобразуем методы оплаты в более читаемый формат
    const formattedPaymentMethods = salesByPaymentMethod.map((method: any) => ({
      method: method.payment_method === 'cash' ? 'Наличные' :
              method.payment_method === 'card' ? 'Карта' :
              method.payment_method === 'transfer' ? 'Перевод' : method.payment_method,
      count: method.count || 0,
      total: method.total || 0
    }));

    return Response.json({
      totalSales: totalStats.totalSales || 0,
      totalRevenue: totalStats.totalRevenue || 0,
      averagePrice: totalStats.averagePrice || 0,
      salesByStatus: {
        completed: salesByStatus.completed || 0,
        pending: salesByStatus.pending || 0,
        cancelled: salesByStatus.cancelled || 0
      },
      salesByPaymentMethod: formattedPaymentMethods,
      topTours: topTours.map((tour: any) => ({
        id: tour.id,
        name: tour.name,
        sales: tour.sales || 0,
        revenue: tour.revenue || 0
      })),
      topClients: topClients.map((client: any) => ({
        id: client.id,
        name: client.name,
        purchases: client.purchases || 0,
        totalSpent: client.totalSpent || 0
      })),
      salesByMonth: salesByMonth.map((month: any) => ({
        month: month.month,
        sales: month.sales || 0,
        revenue: month.revenue || 0
      }))
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return new Response('Error generating report', { status: 500 });
  }
} 