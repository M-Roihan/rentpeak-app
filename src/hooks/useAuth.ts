import { useState, useEffect } from 'react';

export interface UserPayload {
  id: string;
  peran: string;
  exp: number; // Expiration time dari JWT
  iat?: number;
}

export function useAuth() {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Hanya berjalan di client (browser)
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // Decode payload dari JWT (bagian tengah token yang dipisah oleh titik)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decoded = JSON.parse(jsonPayload) as UserPayload;

      // Cek apakah token expired (exp dalam satuan detik)
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (decoded.exp && decoded.exp < currentTime) {
        // Token kedaluwarsa
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // Token valid (secara waktu)
        setIsAuthenticated(true);
        setUser(decoded);
      }
    } catch (error) {
      // Token cacat/invalid format
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { user, isLoading, isAuthenticated };
}
