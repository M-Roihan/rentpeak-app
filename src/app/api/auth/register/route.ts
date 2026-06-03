import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, email, password } = body;

    if (!nama || !email || !password) {
      return NextResponse.json({ pesan: "Nama, email, dan password wajib diisi!" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ pesan: "Password minimal 8 karakter!" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ pesan: "Email sudah terdaftar!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
  
    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ 
      pesan: "Berhasil daftar!", 
      user: {
        id: newUser.id,
        nama: newUser.nama,
        email: newUser.email,
        peran: newUser.peran
      }
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}