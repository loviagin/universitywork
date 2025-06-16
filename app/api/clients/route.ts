import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET() {
  console.log('GET /api/clients - Starting request');
  try {
    console.log('Opening database connection...');
    const db = await openDb();
    
    console.log('Executing query to fetch clients...');
    const clients = await db.all(`
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
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${clients.length} clients`);
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Database Error in GET /api/clients:', error);
    return NextResponse.json(
      { error: 'Database Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      INSERT INTO clients (name, phone, email, passport, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [name, phone, email, passport, notes]);

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
    `, [result.lastID]);

    return NextResponse.json(client);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Database Error' },
      { status: 500 }
    );
  }
}
