'use client';

import { useState, useEffect } from 'react';
import styles from './tours.module.css';

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

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Tour>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours');
      if (response.ok) {
        const data = await response.json();
        setTours(data);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof Tour) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour);
    setIsModalOpen(true);
  };

  const handleDelete = (tour: Tour) => {
    setSelectedTour(tour);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTour) return;
    setError(null);

    try {
      const response = await fetch(`/api/tours/${selectedTour.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setTours(tours.filter(t => t.id !== selectedTour.id));
        setIsDeleteModalOpen(false);
        setSelectedTour(null);
      } else {
        setError(data.error || 'Произошла ошибка при удалении тура');
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      setError('Произошла ошибка при удалении тура');
    }
  };

  const handleSubmit = async (formData: Partial<Tour>) => {
    try {
      const url = selectedTour 
        ? `/api/tours/${selectedTour.id}`
        : '/api/tours';
      
      const response = await fetch(url, {
        method: selectedTour ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTours();
        setIsModalOpen(false);
        setSelectedTour(null);
      } else {
        const errorData = await response.json();
        console.error('Error saving tour:', errorData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error saving tour:', error);
    }
  };

  const filteredTours = tours
    .filter(tour => 
      tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
        <h1>Туры</h1>
        <button 
          className={styles.addButton}
          onClick={() => {
            setSelectedTour(null);
            setIsModalOpen(true);
          }}
        >
          Добавить тур
        </button>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Поиск по названию или описанию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Название {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('price')}>
                Цена {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('duration')}>
                Длительность {sortField === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('max_clients')}>
                Макс. клиентов {sortField === 'max_clients' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('start_date')}>
                Дата начала {sortField === 'start_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')}>
                Статус {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredTours.map(tour => (
              <tr key={tour.id}>
                <td>{tour.name}</td>
                <td>{tour.price.toLocaleString('ru-RU')} ₽</td>
                <td>{tour.duration} дней</td>
                <td>{tour.max_clients}</td>
                <td>{new Date(tour.start_date).toLocaleDateString('ru-RU')}</td>
                <td>
                  <span className={`${styles.status} ${styles[tour.status]}`}>
                    {tour.status === 'active' ? 'Активен' : 
                     tour.status === 'completed' ? 'Завершен' : 
                     tour.status === 'cancelled' ? 'Отменен' : tour.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleEdit(tour)}
                      className={styles.editButton}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(tour)}
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
            <h2>{selectedTour ? 'Редактировать тур' : 'Добавить тур'}</h2>
            <TourForm
              tour={selectedTour}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedTour(null);
              }}
            />
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedTour && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Подтверждение удаления</h2>
            <p>Вы уверены, что хотите удалить тур {selectedTour.name}?</p>
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
                  setSelectedTour(null);
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

function TourForm({ tour, onSubmit, onCancel }: { tour: Tour | null, onSubmit: (data: Partial<Tour>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<Tour>>({
    name: tour?.name || '',
    description: tour?.description || '',
    price: tour?.price || 0,
    duration: tour?.duration || 1,
    max_clients: tour?.max_clients || 1,
    start_date: tour?.start_date || new Date().toISOString().split('T')[0],
    end_date: tour?.end_date || new Date().toISOString().split('T')[0],
    status: tour?.status || 'active'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' || name === 'max_clients' ? Number(value) : value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Название тура</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Описание</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
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
        <label htmlFor="duration">Длительность (дней)</label>
        <input
          type="number"
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          min="1"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="max_clients">Максимум клиентов</label>
        <input
          type="number"
          id="max_clients"
          name="max_clients"
          value={formData.max_clients}
          onChange={handleChange}
          min="1"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="start_date">Дата начала</label>
        <input
          type="date"
          id="start_date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="end_date">Дата окончания</label>
        <input
          type="date"
          id="end_date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
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
          <option value="active">Активный</option>
          <option value="completed">Завершен</option>
          <option value="cancelled">Отменен</option>
        </select>
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          {tour ? 'Сохранить' : 'Добавить'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Отмена
        </button>
      </div>
    </form>
  );
}
