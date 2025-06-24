# Minecraft Addon Merger

**Minecraft Addon Merger** adalah aplikasi web yang memungkinkan Anda menggabungkan beberapa addon Minecraft Bedrock Edition (`.mcpack`, `.mcaddon`, atau `.zip`) menjadi satu paket terintegrasi, langsung dari browser Anda. Semua proses berjalan secara lokal tanpa mengunggah data ke server.

---

## Fitur

- **Unggah Banyak Addon:** Seret & jatuhkan atau pilih beberapa file addon sekaligus.
- **Pratinjau File:** Lihat isi file JSON, gambar, dan skrip sebelum digabungkan.
- **Edit Metadata:** Atur nama, deskripsi, versi, dan minimal engine version hasil gabungan.
- **Penggabungan Otomatis:** Semua file dan folder dari addon yang diunggah digabungkan ke dalam satu paket.
- **Unduh Hasil:** Hasil penggabungan dapat diunduh sebagai `.mcpack` atau `.mcaddon`.
- **100% Offline:** Tidak ada data yang dikirim ke server, privasi Anda terjaga.

---

## Instalasi & Menjalankan

### 1. Download atau Clone Repository

```sh
git clone https://github.com/username/MergerAddon.git
cd MergerAddon
```

### 2. Jalankan Secara Lokal

Cukup buka file `index.html` di browser modern (Chrome, Edge, Firefox, dsb):

- **Windows:**  
  Klik dua kali `index.html`  
  _atau_  
  Klik kanan → Open with → Pilih browser

- **Alternatif (rekomendasi):**  
  Jalankan server lokal (misal dengan Python):

  ```sh
  # Python 3.x
  python -m http.server 8000
  # lalu buka http://localhost:8000 di browser
  ```

---

## Cara Menggunakan

1. **Unggah Addon:**  
   Klik tombol **Pilih File** atau seret file `.mcpack`, `.mcaddon`, atau `.zip` ke area unggah.

2. **Pratinjau & Edit:**  
   - Lihat struktur file dan pratinjau isi file (JSON, gambar, JS).
   - Edit metadata hasil gabungan sesuai keinginan.

3. **Gabungkan:**  
   Klik **Mulai Penggabungan**. Proses akan berjalan dan file hasil dapat diunduh otomatis.

4. **Reset:**  
   Gunakan tombol **Reset Semua** untuk memulai ulang proses.

---

## Konfigurasi

Tidak ada konfigurasi khusus yang diperlukan. Semua pengaturan dilakukan melalui antarmuka web.

**Metadata Addon:**
- **Nama Addon:** Nama paket hasil gabungan.
- **Deskripsi:** Deskripsi singkat addon.
- **Versi:** Versi addon (misal: `1.0.0`).
- **Min. Engine Version:** Versi minimal Minecraft Bedrock yang didukung (misal: `1.21.90`).

---

## Struktur Proyek

```
MergerAddon/
├── index.html      # Halaman utama aplikasi
├── script.js       # Logika utama aplikasi (frontend)
├── styles.css      # Gaya tampilan aplikasi
└── README.md       # Dokumentasi (file ini)
```

---

## Kontribusi

Kontribusi sangat terbuka! Silakan lakukan _fork_ dan _pull request_ untuk:

- Menambah fitur baru
- Memperbaiki bug
- Meningkatkan UI/UX
- Menambah dokumentasi

**Langkah Kontribusi:**

1. Fork repository ini
2. Buat branch baru untuk perubahan Anda
3. Commit perubahan dan push ke branch Anda
4. Ajukan Pull Request ke repository utama

---

## Lisensi

Proyek ini dilisensikan di bawah **MIT License**.

---

## Catatan

- **Addon yang diunggah tidak dikirim ke server mana pun.** Semua proses berjalan di browser Anda.
- **Format yang didukung:** `.mcpack`, `.mcaddon`, `.zip` (struktur addon Minecraft Bedrock).
- **Batasan:** Konflik file dengan nama/path sama akan ditimpa oleh file terakhir yang diunggah.

---

## Kontak & Dukungan

Untuk pertanyaan, saran, atau pelaporan bug, silakan buka [Issue](https://github.com/ZeonPlay/MergerAddon/issues) di GitHub.

---

© 2025 Minecraft Addon Merger