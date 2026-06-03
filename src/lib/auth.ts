import jwt from 'jsonwebtoken';

// 3. Tipe TypeScript JWTPayload untuk decoded token
export interface JWTPayload {
  id: string;
  peran: 'CUSTOMER' | 'PEGAWAI' | 'ADMIN';
}

// Custom Error agar bisa menangkap status code HTTP spesifik
export class AuthError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'AuthError';
  }
}

/**
 * 1. Fungsi verifyToken
 * Mengambil, memvalidasi, dan melakukan decode JWT dari header Authorization.
 * @param req Objek Request dari Next.js App Router
 * @returns Object { id, peran }
 */
export function verifyToken(req: Request): JWTPayload {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    throw new AuthError('Token tidak ditemukan di header (Unauthorized)', 401);
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthError('Format token salah. Harus menggunakan: Bearer <token>', 401);
  }

  const token = authHeader.split(' ')[1];
  
  if (!process.env.JWT_SECRET) {
    throw new Error('Internal Server Error: JWT_SECRET belum di-setup di .env');
  }

  try {
    // Verify token dengan process.env.JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    // Return object { id, peran } jika valid
    return {
      id: decoded.id,
      peran: decoded.peran,
    };
  } catch (error) {
    // Throw error dengan pesan spesifik
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Sesi telah habis (Token Expired). Silakan login ulang.', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Token JWT tidak valid.', 401);
    }
    throw new AuthError('Terjadi kesalahan saat memverifikasi token.', 401);
  }
}

/**
 * 2. Fungsi requireRole
 * Memeriksa apakah pengguna memiliki hak akses (role) yang dibutuhkan.
 * @param decoded Payload JWT hasil dari verifyToken
 * @param roles Array berisi role yang diizinkan (contoh: ['ADMIN', 'PEGAWAI'])
 */
export function requireRole(decoded: JWTPayload, roles: string[]): void {
  if (!roles.includes(decoded.peran)) {
    throw new AuthError('Akses ditolak: Peran Anda tidak memiliki izin untuk aksi ini', 403);
  }
}
