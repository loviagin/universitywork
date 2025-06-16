'use client';

import { useState, useEffect } from 'react';
import styles from './reports.module.css';

interface Report {
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  salesByStatus: {
    completed: number;
    pending: number;
    cancelled: number;
  };
  salesByPaymentMethod: {
    cash: number;
    card: number;
    transfer: number;
  };
  topTours: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  topClients: Array<{
    id: number;
    name: string;
    purchases: number;
    totalSpent: number;
  }>;
  salesByMonth: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
}

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports?start=${dateRange.start}&end=${dateRange.end}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (!report) {
    return <div className={styles.error}>Ошибка загрузки отчета</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Отчеты</h1>
        <div className={styles.dateRange}>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className={styles.dateInput}
          />
          <span>—</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className={styles.dateInput}
          />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Общая статистика</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Всего продаж</div>
              <div className={styles.statValue}>{report.totalSales}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Общая выручка</div>
              <div className={styles.statValue}>{report.totalRevenue.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Средний чек</div>
              <div className={styles.statValue}>{report.averagePrice.toLocaleString('ru-RU')} ₽</div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Статусы продаж</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Оплачено</div>
              <div className={`${styles.statValue} ${styles.completed}`}>
                {report.salesByStatus.completed}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>В ожидании</div>
              <div className={`${styles.statValue} ${styles.pending}`}>
                {report.salesByStatus.pending}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Отменено</div>
              <div className={`${styles.statValue} ${styles.cancelled}`}>
                {report.salesByStatus.cancelled}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Способы оплаты</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Наличные</div>
              <div className={styles.statValue}>{report.salesByPaymentMethod.cash}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Карта</div>
              <div className={styles.statValue}>{report.salesByPaymentMethod.card}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Перевод</div>
              <div className={styles.statValue}>{report.salesByPaymentMethod.transfer}</div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Топ туров</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Тур</th>
                  <th>Продажи</th>
                  <th>Выручка</th>
                </tr>
              </thead>
              <tbody>
                {report.topTours.map(tour => (
                  <tr key={tour.id}>
                    <td>{tour.name}</td>
                    <td>{tour.sales}</td>
                    <td>{tour.revenue.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Топ клиентов</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Покупки</th>
                  <th>Потрачено</th>
                </tr>
              </thead>
              <tbody>
                {report.topClients.map(client => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.purchases}</td>
                    <td>{client.totalSpent.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Продажи по месяцам</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Месяц</th>
                  <th>Продажи</th>
                  <th>Выручка</th>
                </tr>
              </thead>
              <tbody>
                {report.salesByMonth.map(month => (
                  <tr key={month.month}>
                    <td>{month.month}</td>
                    <td>{month.sales}</td>
                    <td>{month.revenue.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
