import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await openDb();
    const client = await db.get(`
      SELECT 
        id,
        name,
        phone,
        email,
        passport,
        notes,
        created_at as createdAt,
        updated_at as updatedAt
      FROM clients 
      WHERE id = ?
    `, [params.id]);

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Database Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, phone, email, passport, notes } = await request.json();

    if (!name || !phone || !passport) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await openDb();
    const result = await db.run(`
      UPDATE clients 
      SET 
        name = ?,
        phone = ?,
        email = ?,
        passport = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, phone, email, passport, notes, params.id]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const updatedClient = await db.get(`
      SELECT 
        id,
        name,
        phone,
        email,
        passport,
        notes,
        created_at as createdAt,
        updated_at as updatedAt
      FROM clients 
      WHERE id = ?
    `, [params.id]);

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Database Error' },
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
    const result = await db.run(`
      DELETE FROM clients 
      WHERE id = ?
    `, [params.id]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Database Error' },
      { status: 500 }
    );
  }
} 