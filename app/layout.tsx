'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import styles from '@/styles/Layout.module.css';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

const navItems = [
  { href: '/', icon: '🏠', label: 'Главная' },
  { href: '/clients', icon: '👥', label: 'Клиенты' },
  { href: '/tours', icon: '✈️', label: 'Туры' },
  { href: '/sales', icon: '💰', label: 'Продажи' },
  { href: '/reports', icon: '📊', label: 'Отчеты' },
  { href: '/account', icon: '👤', label: 'Аккаунт' }
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (!response.ok && pathname !== '/login') {
          router.push('/login');
        }
      } catch (error) {
        if (pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <html lang="ru" className={inter.className}>
        <body>
          <div className={styles.loading}>Загрузка...</div>
        </body>
      </html>
    );
  }

  if (pathname === '/login') {
    return (
      <html lang="ru" className={inter.className}>
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="ru" className={inter.className}>
      <body>
        <nav className={styles.nav}>
          <div className={styles.navContent}>
            <a href="/" className={styles.logo}>
              <span className={styles.logoIcon}>🏢</span>
              <span className={styles.logoText}>Tours</span>
            </a>

            <button
              className={`${styles.menuButton} ${isMenuOpen ? styles.menuOpen : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Меню"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <ul className={`${styles.navLinks} ${isMenuOpen ? styles.menuOpen : ''}`}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={pathname === item.href ? styles.active : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(item.href);
                      setIsMenuOpen(false);
                    }}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <main className={styles.main}>{children}</main>
      </body>
    </html>
  );
}
