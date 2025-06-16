'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  passport: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Tour {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  max_clients: number;
  start_date: string;
  end_date: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Sale {
  id: number;
  client_id: number;
  tour_id: number;
  price: number;
  status: string;
  payment_method: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cRes, tRes, sRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/tours'),
          fetch('/api/sales'),
        ]);

        if (!cRes.ok) throw new Error('Failed to fetch clients');
        if (!tRes.ok) throw new Error('Failed to fetch tours');
        if (!sRes.ok) throw new Error('Failed to fetch sales');

        const [clientsData, toursData, salesData] = await Promise.all([
          cRes.json(),
          tRes.json(),
          sRes.json(),
        ]);

        setClients(clientsData);
        setTours(toursData);
        setSales(salesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Система Турфирмы</h1>

      <div className={styles.grid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.subheading}>Клиенты</h2>
            <span className={styles.count}>{clients.length}</span>
          </div>
          <div className={styles.card}>
            {clients.length === 0 ? (
              <p className={styles.emptyState}>Нет клиентов</p>
            ) : (
              <ul className={styles.list}>
                {clients.map(client => (
                  <li className={styles.listItem} key={client.id}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>{client.name}</span>
                      <span className={styles.itemDate}>
                        {new Date(client.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemPhone}>{client.phone}</span>
                      {client.email && (
                        <span className={styles.itemEmail}>{client.email}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.subheading}>Туры</h2>
            <span className={styles.count}>{tours.length}</span>
          </div>
          <div className={styles.card}>
            {tours.length === 0 ? (
              <p className={styles.emptyState}>Нет туров</p>
            ) : (
              <ul className={styles.list}>
                {tours.map(tour => (
                  <li className={styles.listItem} key={tour.id}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>{tour.name}</span>
                      <span className={styles.itemPrice}>{tour.price} ₽</span>
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemDate}>
                        {new Date(tour.start_date).toLocaleDateString('ru-RU')} - {new Date(tour.end_date).toLocaleDateString('ru-RU')}
                      </span>
                      <span className={styles.itemStatus}>{tour.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.subheading}>Продажи</h2>
            <span className={styles.count}>{sales.length}</span>
          </div>
          <div className={styles.card}>
            {sales.length === 0 ? (
              <p className={styles.emptyState}>Нет продаж</p>
            ) : (
              <ul className={styles.list}>
                {sales.map(sale => (
                  <li className={styles.listItem} key={sale.id}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>
                        Продажа #{sale.id}
                      </span>
                      <span className={styles.itemPrice}>{sale.price} ₽</span>
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemDate}>
                        {new Date(sale.created_at).toLocaleDateString('ru-RU')}
                      </span>
                      <span className={styles.itemStatus}>{sale.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
