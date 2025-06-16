'use client';

import { useRouter } from 'next/navigation';
import styles from './account.module.css';

export default function AccountPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Аккаунт</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Выйти
        </button>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Информация о пользователе</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Имя пользователя</label>
              <div>admin</div>
            </div>
            <div className={styles.infoItem}>
              <label>Роль</label>
              <div>Администратор</div>
            </div>
            <div className={styles.infoItem}>
              <label>Последний вход</label>
              <div>{new Date().toLocaleString('ru-RU')}</div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Настройки</h2>
          <div className={styles.settings}>
            <div className={styles.settingItem}>
              <label className={styles.switch}>
                <input type="checkbox" />
                <span className={styles.slider}></span>
              </label>
              <div className={styles.settingInfo}>
                <h3>Уведомления</h3>
                <p>Получать уведомления о новых заказах</p>
              </div>
            </div>

            <div className={styles.settingItem}>
              <label className={styles.switch}>
                <input type="checkbox" defaultChecked />
                <span className={styles.slider}></span>
              </label>
              <div className={styles.settingInfo}>
                <h3>Темная тема</h3>
                <p>Использовать темную тему интерфейса</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 