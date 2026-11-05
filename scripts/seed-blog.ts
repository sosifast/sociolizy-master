import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding blog categories and articles...");

  // 1. Create or ensure categories
  const catReseller = await prisma.blogCategory.upsert({
    where: { slug: "tips-reseller" },
    update: {},
    create: {
      name: "Tips Reseller",
      slug: "tips-reseller",
      description: "Panduan dan strategi bisnis untuk reseller SMM panel pemula hingga mahir.",
      color: "emerald",
    },
  });

  const catInstagram = await prisma.blogCategory.upsert({
    where: { slug: "instagram-growth" },
    update: {},
    create: {
      name: "Instagram Growth",
      slug: "instagram-growth",
      description: "Strategi meningkatkan followers, likes, engagement rate, dan optimasi Reels Instagram.",
      color: "rose",
    },
  });

  const catTiktok = await prisma.blogCategory.upsert({
    where: { slug: "tiktok-marketing" },
    update: {},
    create: {
      name: "TikTok Marketing",
      slug: "tiktok-marketing",
      description: "Trik viral FYP, penggunaan sound trending, dan peningkatan views akun TikTok.",
      color: "cyan",
    },
  });

  // 2. Create sample articles
  await prisma.blogArticle.upsert({
    where: { slug: "panduan-lengkap-memulai-bisnis-reseller-smm-panel-2026" },
    update: {},
    create: {
      title: "Panduan Lengkap Memulai Bisnis Reseller SMM Panel di Tahun 2026",
      slug: "panduan-lengkap-memulai-bisnis-reseller-smm-panel-2026",
      category_id: catReseller.id,
      excerpt:
        "Ingin punya bisnis digital dengan modal terjangkau namun potensi profit jutaan per hari? Simak panduan langkah demi langkah menjadi reseller SMM panel sukses.",
      content: `## Mengapa Bisnis Reseller SMM Menjadi Peluang Emas di 2026?

Di era digital saat ini, kebutuhan akan eksistensi media sosial bukan lagi sekadar hobi, melainkan instrumen utama dalam pemasaran bisnis, personal branding, hingga kampanye influencer.

Setiap hari ada ribuan UMKM, kreator konten, dan agensi periklanan baru yang membutuhkan layanan pendorong visibilitas seperti followers, likes, views, dan retensi interaksi.

> [!TIP]
> Reseller SMM Panel adalah model bisnis di mana Anda membeli layanan grosir dengan harga terendah dari penyedia (seperti Sociolizy) dan menjualnya kembali ke konsumen retail dengan margin keuntungan 100% hingga 300%.

---

## 4 Langkah Sukses Memulai Reseller SMM

### 1. Temukan Niche Pasar yang Spesifik
Daripada menjual ke semua orang, fokuslah pada ceruk pasar tertentu terlebih dahulu:
- **Kreator Konten Pemula**: Membutuhkan paket boost tayangan Reels dan TikTok FYP.
- **Toko Online / UMKM**: Memerlukan kredibilitas awal akun toko dengan followers aktif dan review positif.
- **Musisi & Podcaster**: Mencari layanan Spotify Streams dan YouTube Watchtime.

### 2. Manfaatkan Provider Grosir Terbaik
Kualitas penyedia menentukan reputasi bisnis Anda. Pastikan memilih provider dengan:
- **Server Cepat & Otomatis**: Pesanan diproses detik itu juga via REST API.
- **Tingkat Drop Rendah & Garansi Refill**: Menjaga kepuasan klien jangka panjang.
- **Harga Grosir Murah**: Memberikan fleksibilitas dalam menentukan harga jual.

\`\`\`json
{
  "service": "Instagram Followers Real High Quality",
  "wholesale_rate_per_k": 12500,
  "resale_price_per_k": 35000,
  "net_profit_per_order": 22500
}
\`\`\`

### 3. Bangun Saluran Promosi Efektif
Gunakan media seperti grup Telegram, WhatsApp bisnis, marketplace digital, atau buat website mini dengan sistem pembayaran otomatis seperti QRIS.

### 4. Pelayanan Pelanggan yang Responsif
Layanan after-sales yang ramah dan cepat tanggap akan membuat pelanggan melakukan pemesanan berulang (*repeat order*) setiap minggunya.

---

## Kesimpulan

Memulai bisnis reseller SMM panel sangat terjangkau dan scalable. Dengan platform terpercaya seperti **Sociolizy**, Anda mendapatkan akses langsung ke ribuan layanan instan berkualitas tinggi dengan harga termurah di pasaran. Daftarkan akun Anda sekarang dan raih profit digital pertamamu!`,
      cover_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      reading_time: 4,
      is_featured: true,
      tags: "reseller, smm panel, bisnis online, sociolizy",
      meta_title: "Panduan Lengkap Memulai Bisnis Reseller SMM Panel di Tahun 2026 | Sociolizy",
      meta_description:
        "Panduan langkah demi langkah memulai bisnis reseller SMM panel sukses dengan modal terjangkau dan potensi profit tinggi di tahun 2026.",
      author_name: "Sociolizy Editorial Team",
    },
  });

  await prisma.blogArticle.upsert({
    where: { slug: "7-rahasia-algoritma-instagram-terbaru-melejitkan-engagement" },
    update: {},
    create: {
      title: "7 Rahasia Algoritma Instagram Terbaru untuk Melejitkan Engagement",
      slug: "7-rahasia-algoritma-instagram-terbaru-melejitkan-engagement",
      category_id: catInstagram.id,
      excerpt:
        "Algoritma Instagram terus bertransformasi. Ketahui metrik apa saja yang sekarang paling disukai Instagram agar konten Reels dan feed Anda menjangkau jutaan audiens.",
      content: `## Memahami Perubahan Algoritma Instagram Terbaru

Instagram tidak lagi memprioritaskan jumlah followers semata. Kini, algoritma memberi bobot tertinggi pada **sinyal interaksi berkualitas** (*meaningful engagement*).

Mari kita bahas faktor kunci penentu jangkauan postingan Anda!

---

### 1. Metrik Share (DMs) Menjadi Raja
Sinyal terkuat untuk algoritma saat ini adalah berapa kali konten Anda dibagikan ke Direct Message (DM) teman. Konten yang memicu orang mengirimkannya ke kerabat dianggap sangat bernilai tinggi.

### 2. Save Rate (Simpan Konten)
Konten bernilai edukasi, tips ringkas, atau panduan visual sering kali disimpan pengguna untuk dibaca kembali di masa mendatang.

> [!NOTE]
> Postingan carousel dengan 5-7 slide memiliki rasio simpan (*save rate*) 3.2x lebih tinggi dibandingkan postingan satu foto.

### 3. Hook 3 Detik Pertama pada Reels
Jangan gunakan intro bertele-tele. Tampilkan visual menarik atau pertanyaan provokatif pada 3 detik pertama agar pengguna tidak langsung men-scroll lewat.

### 4. Menggunakan Audio yang Sedang Trending
Cari audio dengan ikon panah ke atas di pojok Reels. Menggunakan audio yang sedang naik daun membantu Instagram merekomendasikan video Anda ke penonton dengan minat serupa.

### 5. Konsistensi Waktu Upload
Upload pada jam aktif followers Anda (biasanya pukul 11:30 - 13:00 atau 18:30 - 21:00 waktu setempat).

---

## Ringkasan Prioritas Metrik Algoritma

| Metrik | Bobot Sinyal | Tujuan Utama |
| :--- | :--- | :--- |
| **Share (DMs)** | Paling Tinggi | Jangkauan Viral Eksternal |
| **Saves** | Tinggi | Retensi Nilai Konten |
| **Watch Time / Loop** | Tinggi | Konten Menghibur & Tidak Diskip |
| **Comments** | Sedang | Interaksi Komunitas |
| **Likes** | Dasar | Validasi Visual Cepat |

Optimalkan akun Instagram Anda sekarang dan jangan ragu mempercepat traksi awal dengan layanan pendorong engagement terpercaya di Sociolizy!`,
      cover_image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      reading_time: 3,
      is_featured: false,
      tags: "instagram, algoritma instagram, reels viral, social media marketing",
      meta_title: "7 Rahasia Algoritma Instagram Terbaru untuk Melejitkan Engagement | Sociolizy",
      meta_description:
        "Pelajari 7 rahasia algoritma Instagram terbaru untuk menaikkan engagement rate, views Reels, dan jangkauan konten Anda.",
      author_name: "Sociolizy Editorial Team",
    },
  });

  await prisma.blogArticle.upsert({
    where: { slug: "trik-masuk-fyp-tiktok-2026-strategi-jam-tayang-dan-sound" },
    update: {},
    create: {
      title: "Trik Masuk FYP TikTok 2026: Strategi Jam Tayang dan Optimasi SEO",
      slug: "trik-masuk-fyp-tiktok-2026-strategi-jam-tayang-dan-sound",
      category_id: catTiktok.id,
      excerpt:
        "Mau video TikTok kamu tembus jutaan views dan nongkrong di FYP? Terapkan strategi optimasi TikTok SEO dan teknik retensi video berikut ini.",
      content: `## Mengapa Video TikTok Anda Susah FYP?

TikTok kini telah bertransformasi menjadi salah satu mesin pencari (*search engine*) terbesar bagi generasi Z dan milenial. Algoritmanya tidak hanya melihat sound viral, tetapi juga **TikTok SEO** dan **Completion Rate**.

---

### Kunci Utama Menembus FYP

1. **Retensi & Completion Rate**: Video yang ditonton hingga selesai (100%) dan ditonton berulang kali (*loop*) akan secara otomatis dipromosikan ke gelombang audiens yang lebih besar.
2. **TikTok SEO Pada Caption**: Tulis kata kunci pencarian utama di kalimat pertama caption dan gunakan 3-5 hashtag relevan.
3. **Teks Overlay di Video**: Algoritma TikTok membaca teks yang ada di dalam video untuk memahami topik konten Anda.

> [!TIP]
> Buat video berdurasi ringkas (15 - 30 detik) yang padat informasi untuk memaksimalkan rasio tonton selesai di atas 70%.

---

## Tingkatkan Kredibilitas Akun TikTok Anda

Akun dengan bukti sosial (*social proof*) awal yang kuat cenderung lebih dipercaya oleh penonton baru. Mulai percepat pertumbuhan akun TikTok Anda dengan layanan views dan followers instan dari Sociolizy!`,
      cover_image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      reading_time: 3,
      is_featured: false,
      tags: "tiktok, fyp tiktok, tiktok seo, viral marketing",
      meta_title: "Trik Masuk FYP TikTok 2026: Strategi Jam Tayang dan Optimasi SEO | Sociolizy",
      meta_description:
        "Panduan trik masuk FYP TikTok 2026 dengan strategi TikTok SEO, retensi penonton, dan sound trending.",
      author_name: "Sociolizy Editorial Team",
    },
  });

  console.log("Seeding blog finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

