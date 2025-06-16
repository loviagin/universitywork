'use client';

import { useState, useEffect } from 'react';
import styles from './sales.module.css';

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
  client_name: string;
  client_phone: string;
  tour_name: string;
  tour_start_date: string;
  tour_end_date: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Sale>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Array<{ id: number; name: string }>>([]);
  const [tours, setTours] = useState<Array<{ id: number; name: string; price: number }>>([]);

  useEffect(() => {
    fetchSales();
    fetchClients();
    fetchTours();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.map((client: any) => ({
          id: client.id,
          name: client.name
        })));
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours');
      if (response.ok) {
        const data = await response.json();
        setTours(data.map((tour: any) => ({
          id: tour.id,
          name: tour.name,
          price: tour.price
        })));
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  const handleSort = (field: keyof Sale) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleDelete = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSale) return;
    setError(null);

    try {
      const response = await fetch(`/api/sales/${selectedSale.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setSales(sales.filter(s => s.id !== selectedSale.id));
        setIsDeleteModalOpen(false);
        setSelectedSale(null);
      } else {
        setError(data.error || 'Произошла ошибка при удалении продажи');
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      setError('Произошла ошибка при удалении продажи');
    }
  };

  const handleSubmit = async (formData: Partial<Sale>) => {
    try {
      const url = selectedSale 
        ? `/api/sales/${selectedSale.id}`
        : '/api/sales';
      
      const response = await fetch(url, {
        method: selectedSale ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchSales();
        setIsModalOpen(false);
        setSelectedSale(null);
      } else {
        const errorData = await response.json();
        console.error('Error saving sale:', errorData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('ru-RU');
  };

  const filteredSales = sales
    .filter(sale => {
      const searchLower = searchQuery.toLowerCase();
      const clientName = (sale.client_name || '').toLowerCase();
      const tourName = (sale.tour_name || '').toLowerCase();
      const paymentMethod = (sale.payment_method || '').toLowerCase();

      return clientName.includes(searchLower) ||
             tourName.includes(searchLower) ||
             paymentMethod.includes(searchLower);
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Продажи</h1>
        <button 
          className={styles.addButton}
          onClick={() => {
            setSelectedSale(null);
            setIsModalOpen(true);
          }}
        >
          Добавить продажу
        </button>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Поиск по клиенту, туру или способу оплаты..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('client_name')}>Клиент</th>
              <th onClick={() => handleSort('tour_name')}>Тур</th>
              <th onClick={() => handleSort('price')}>Цена</th>
              <th onClick={() => handleSort('status')}>Статус</th>
              <th onClick={() => handleSort('payment_method')}>Способ оплаты</th>
              <th onClick={() => handleSort('created_at')}>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(sale => (
              <tr key={sale.id}>
                <td>
                  <div>{sale.client_name || '-'}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{sale.client_phone || '-'}</div>
                </td>
                <td>
                  <div>{sale.tour_name || '-'}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {formatDate(sale.tour_start_date)} - {formatDate(sale.tour_end_date)}
                  </div>
                </td>
                <td>{sale.price.toLocaleString('ru-RU')} ₽</td>
                <td>
                  <span className={`${styles.status} ${styles[sale.status]}`}>
                    {sale.status === 'pending' && 'Ожидает оплаты'}
                    {sale.status === 'completed' && 'Оплачено'}
                    {sale.status === 'cancelled' && 'Отменено'}
                  </span>
                </td>
                <td>
                  <span className={styles.paymentMethod}>
                    {sale.payment_method === 'cash' && 'Наличные'}
                    {sale.payment_method === 'card' && 'Карта'}
                    {sale.payment_method === 'transfer' && 'Перевод'}
                  </span>
                </td>
                <td>{formatDate(sale.created_at)}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleEdit(sale)}
                      className={styles.editButton}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(sale)}
                      className={styles.deleteButton}
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{selectedSale ? 'Редактировать продажу' : 'Добавить продажу'}</h2>
            <SaleForm
              sale={selectedSale}
              clients={clients}
              tours={tours}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedSale(null);
              }}
            />
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedSale && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Подтверждение удаления</h2>
            <p>Вы уверены, что хотите удалить продажу для клиента {selectedSale.client_name}?</p>
            {error && (
              <p className={styles.error}>{error}</p>
            )}
            <div className={styles.modalActions}>
              <button
                onClick={handleDeleteConfirm}
                className={styles.deleteConfirmButton}
              >
                Удалить
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedSale(null);
                  setError(null);
                }}
                className={styles.cancelButton}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaleForm({ 
  sale, 
  clients, 
  tours, 
  onSubmit, 
  onCancel 
}: { 
  sale: Sale | null;
  clients: Array<{ id: number; name: string }>;
  tours: Array<{ id: number; name: string; price: number }>;
  onSubmit: (data: Partial<Sale>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Sale>>({
    client_id: sale?.client_id || undefined,
    tour_id: sale?.tour_id || undefined,
    price: sale?.price || 0,
    status: sale?.status || 'pending',
    payment_method: sale?.payment_method || 'cash',
    notes: sale?.notes || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));

    // Если изменился тур, обновляем цену
    if (name === 'tour_id') {
      const selectedTour = tours.find(t => t.id === Number(value));
      if (selectedTour) {
        setFormData(prev => ({
          ...prev,
          price: selectedTour.price
        }));
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="client_id">Клиент</label>
        <select
          id="client_id"
          name="client_id"
          value={formData.client_id}
          onChange={handleChange}
          required
        >
          <option value="">Выберите клиента</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="tour_id">Тур</label>
        <select
          id="tour_id"
          name="tour_id"
          value={formData.tour_id}
          onChange={handleChange}
          required
        >
          <option value="">Выберите тур</option>
          {tours.map(tour => (
            <option key={tour.id} value={tour.id}>
              {tour.name} - {tour.price} ₽
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="price">Цена (₽)</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="status">Статус</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="pending">Ожидает оплаты</option>
          <option value="completed">Оплачено</option>
          <option value="cancelled">Отменено</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="payment_method">Способ оплаты</label>
        <select
          id="payment_method"
          name="payment_method"
          value={formData.payment_method}
          onChange={handleChange}
          required
        >
          <option value="cash">Наличные</option>
          <option value="card">Карта</option>
          <option value="transfer">Перевод</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="notes">Примечания</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          {sale ? 'Сохранить' : 'Добавить'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Отмена
        </button>
      </div>
    </form>
  );
}
