'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './clients.module.css';

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

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Client>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    console.log('Fetching clients...');
    try {
      console.log('Making request to /api/clients...');
      const response = await fetch('/api/clients');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received clients data:', data);
        setClients(data);
      } else {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof Client) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient) return;

    try {
      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setClients(clients.filter(c => c.id !== selectedClient.id));
        setIsDeleteModalOpen(false);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleSave = async (clientData: Partial<Client>) => {
    try {
      const url = selectedClient 
        ? `/api/clients/${selectedClient.id}`
        : '/api/clients';
      
      const response = await fetch(url, {
        method: selectedClient ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        await fetchClients();
        setIsModalOpen(false);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const filteredClients = clients
    .filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1>Клиенты</h1>
        <button 
          className={styles.addButton}
          onClick={() => {
            setSelectedClient(null);
            setIsModalOpen(true);
          }}
        >
          Добавить клиента
        </button>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Поиск по имени, телефону или email..."
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
                Имя {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('phone')}>
                Телефон {sortField === 'phone' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('email')}>
                Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('passport')}>
                Паспорт {sortField === 'passport' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('createdAt')}>
                Дата добавления {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.phone}</td>
                <td>{client.email}</td>
                <td>{client.passport}</td>
                <td>{new Date(client.createdAt).toLocaleDateString('ru-RU')}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleEdit(client)}
                      className={styles.editButton}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
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
            <h2>{selectedClient ? 'Редактировать клиента' : 'Новый клиент'}</h2>
            <ClientForm
              client={selectedClient}
              onSave={handleSave}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedClient(null);
              }}
            />
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedClient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Подтверждение удаления</h2>
            <p>Вы уверены, что хотите удалить клиента {selectedClient.name}?</p>
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
                  setSelectedClient(null);
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

function ClientForm({ 
  client, 
  onSave, 
  onCancel 
}: { 
  client: Client | null;
  onSave: (data: Partial<Client>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    passport: client?.passport || '',
    notes: client?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Имя *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone">Телефон *</label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="passport">Паспорт *</label>
        <input
          id="passport"
          type="text"
          value={formData.passport}
          onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="notes">Заметки</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.saveButton}>
          {client ? 'Сохранить' : 'Добавить'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Отмена
        </button>
      </div>
    </form>
  );
}
