import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const db = await openDb();

    const result = await db.run(`
      UPDATE sales 
      SET 
        client_id = ?,
        tour_id = ?,
        price = ?,
        status = ?,
        payment_method = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      data.client_id,
      data.tour_id,
      data.price,
      data.status,
      data.payment_method,
      data.notes,
      params.id
    ]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Продажа не найдена' },
        { status: 404 }
      );
    }

    // Получаем обновленную продажу со всеми связанными данными
    const updatedSale = await db.get(`
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
      WHERE s.id = ?
    `, [params.id]);

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error('Ошибка при обновлении продажи:', error);
    return NextResponse.json(
      { error: 'Ошибка базы данных' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await openDb();
    
    // Удаляем продажу
    const result = await db.run(
      'DELETE FROM sales WHERE id = ?',
      [params.id]
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Продажа не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении продажи:', error);
    return NextResponse.json(
      { error: 'Ошибка базы данных' },
      { status: 500 }
    );
  }
} 