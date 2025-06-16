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
      UPDATE tours 
      SET 
        name = ?,
        description = ?,
        price = ?,
        duration = ?,
        max_clients = ?,
        start_date = ?,
        end_date = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      data.name,
      data.description,
      data.price,
      data.duration,
      data.max_clients,
      data.start_date,
      data.end_date,
      data.status,
      params.id
    ]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Тур не найден' },
        { status: 404 }
      );
    }

    const updatedTour = await db.get('SELECT * FROM tours WHERE id = ?', [params.id]);
    return NextResponse.json(updatedTour);
  } catch (error) {
    console.error('Ошибка при обновлении тура:', error);
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
    
    // Проверяем, есть ли связанные продажи
    const sales = await db.get(
      'SELECT COUNT(*) as count FROM sales WHERE tour_id = ?',
      [params.id]
    );

    if (sales.count > 0) {
      return NextResponse.json(
        { error: 'Невозможно удалить тур, так как есть связанные продажи' },
        { status: 400 }
      );
    }

    // Удаляем тур
    const result = await db.run(
      'DELETE FROM tours WHERE id = ?',
      [params.id]
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Тур не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении тура:', error);
    return NextResponse.json(
      { error: 'Ошибка базы данных' },
      { status: 500 }
    );
  }
} 