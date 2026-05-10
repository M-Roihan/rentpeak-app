import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ pesan: "Akun tidak ditemukan!" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ pesan: "Password salah!" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, peran: user.peran },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return NextResponse.json({ 
      pesan: "Login berhasil!", 
      token,
      user: { nama: user.nama, peran: user.peran } 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server", error }, { status: 500 });
  }
}