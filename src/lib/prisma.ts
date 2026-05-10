import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Ambil URL dari .env
const connectionString = process.env.DATABASE_URL as string;

// Bikin konektor (Adapter)
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Sambungkan ke Prisma versi Next.js
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;