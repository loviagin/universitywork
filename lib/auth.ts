// Client-side auth utilities
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = '1234';

export function login(username: string, password: string): boolean {
  return username === VALID_USERNAME && password === VALID_PASSWORD;
}

export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith('session='));
}

export function setSession() {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days
  document.cookie = `session=true; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

export function clearSession() {
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict';
}
