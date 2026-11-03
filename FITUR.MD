buatkan saya backend untuk dapat di integrasikan ke mobile.
untuk keamanan tolong gunakan api_app dari tabel :
model Setting {
  id              Int      @id @default(autoincrement())
  site_name       String
  favicon         String?
  logo            String?
  api_app         String?
  email           String?
  whatsapp        String?
  instagram       String?
  facebook        String?
  tiktok          String?
  telegram        String?
  url_image_kit   String?
  imagekit_api    String?
  imagekit_secret String?
  create_at       DateTime @default(now())
  update_at       DateTime @updatedAt

  @@map("setting")
}

sebagai api_key ke aplikasi mobile saya.
url routenya /api/mobile/v1

## auth
1.buatkan login, register, lupa password. pastikan register memuat pilihan area server

## dashboard
1.menampilkan data:
-balance
-platform
-history order dan deposit
-account

## history
1.order
-menampilkan detail transaksi meliputi target, qty/jumlah order, remain dan start, status order, price sale,invoice
2.deposit
-menampilkan detail transaksi meliput status,jumlah, waktu, invoice, detail

## akun
-update akun password, nama
-delete akun
-logout
-session

## order
-order by platform
-menghitung transaksi
-mengurangi saldo user
-menampilkan detail service
-menyimpan otomatis ke server mongodb sesuai server yang dipilih oleh user
-