import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, email, NIK, password, no_telp, peran } = body;

    // 1. Cek email & NIK (biar nggak ada yang dobel)
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { NIK }] }
    });
    
    if (existingUser) {
      return NextResponse.json({ pesan: "Email atau NIK sudah terdaftar!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
  
    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        NIK,
        no_telp, 
        password: hashedPassword,
        peran: peran || 'CUSTOMER', // CUSTOMER, PEGAWAI, atau ADMIN
      },
    });

    return NextResponse.json({ pesan: "Berhasil daftar!", user: newUser }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server", error }, { status: 500 });
  }
}