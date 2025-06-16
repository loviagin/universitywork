'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const form = new FormData(e.target as HTMLFormElement);
      const username = form.get('username');
      const password = form.get('password');

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Просто перезагружаем страницу после успешного входа
        window.location.href = '/';
      } else {
        const data = await res.json();
        setError(data.message || 'Неверный логин или пароль');
      }
    } catch (err) {
      setError('Ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.heading}>Вход в систему</h1>
          <div className={styles.inputGroup}>
            <input 
              name="username" 
              placeholder="Логин" 
              className={styles.input}
              autoComplete="username"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input 
              name="password" 
              type="password" 
              placeholder="Пароль" 
              className={styles.input}
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
