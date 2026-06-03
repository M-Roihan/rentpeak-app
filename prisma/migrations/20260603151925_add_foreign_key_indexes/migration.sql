-- CreateIndex
CREATE INDEX "Booking_customer_id_idx" ON "Booking"("customer_id");

-- CreateIndex
CREATE INDEX "BookingDetail_booking_id_idx" ON "BookingDetail"("booking_id");

-- CreateIndex
CREATE INDEX "BookingDetail_barang_id_idx" ON "BookingDetail"("barang_id");

-- CreateIndex
CREATE INDEX "Jaminan_booking_id_idx" ON "Jaminan"("booking_id");

-- CreateIndex
CREATE INDEX "Jaminan_pegawai_id_idx" ON "Jaminan"("pegawai_id");

-- CreateIndex
CREATE INDEX "LaporanBarangRusak_barang_id_idx" ON "LaporanBarangRusak"("barang_id");

-- CreateIndex
CREATE INDEX "LaporanBarangRusak_pegawai_id_idx" ON "LaporanBarangRusak"("pegawai_id");

-- CreateIndex
CREATE INDEX "Notifikasi_user_id_idx" ON "Notifikasi"("user_id");

-- CreateIndex
CREATE INDEX "Pembayaran_booking_id_idx" ON "Pembayaran"("booking_id");
