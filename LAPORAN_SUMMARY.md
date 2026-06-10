# Laporan Proyek — PERT Network Diagram

---

## 1. Deskripsi Studi Kasus

Sebuah perusahaan retail ingin meluncurkan produk baru ke pasar, namun proses peluncuran melibatkan banyak aktivitas yang saling bergantung — mulai dari finalisasi kemasan, produksi massal, pembuatan iklan, distribusi, hingga pelatihan staf. Tanpa perencanaan waktu yang sistematis, sulit untuk menentukan kapan proyek selesai dan aktivitas mana yang paling kritis. Proyek ini bertujuan mengotomatisasi kalkulasi PERT agar manajer proyek dapat menentukan jalur kritis dan estimasi durasi total secara akurat. Dengan mengetahui jalur kritis, tim dapat memprioritaskan sumber daya pada aktivitas yang berpotensi memperlambat seluruh proyek.

---

## 2. Metode yang Digunakan

**PERT (Program Evaluation and Review Technique)** adalah teknik manajemen proyek yang dikembangkan oleh U.S. Navy pada 1950-an untuk mengelola proyek dengan ketidakpastian durasi tinggi. PERT memodelkan proyek sebagai jaringan aktivitas (DAG) dan menghitung estimasi waktu berdasarkan tiga skenario: optimis, paling mungkin, dan pesimis.

Formula utama PERT:

```
TE  = (O + 4M + P) / 6        — Expected Time (rata-rata tertimbang)
σ²  = ((P - O) / 6)²          — Variance (ukuran ketidakpastian)
```

PERT dipilih karena aktivitas dalam peluncuran produk retail memiliki ketidakpastian waktu yang signifikan — misalnya, durasi produksi massal sangat bergantung pada kapasitas vendor. Dengan mempertimbangkan tiga skenario (O, M, P), estimasi menjadi lebih realistis dibanding hanya menggunakan satu angka durasi. Selain itu, analisis jalur kritis (CPM) yang terintegrasi dalam PERT memungkinkan identifikasi aktivitas mana yang harus selesai tepat waktu agar proyek tidak terlambat.

---

## 3. Proses dan Hasil Penyelesaian

### Langkah-Langkah

1. **Input Aktivitas** — Pengguna mengisi nama aktivitas, daftar pendahulu, serta nilai O/M/P (hari) atau durasi per minggu (dikonversi otomatis ke O/M/P).
2. **Kalkulasi TE dan σ²** — Setiap aktivitas dihitung Expected Time dan Variance-nya menggunakan formula PERT.
3. **Forward Pass** — ES (Early Start) dan EF (Early Finish) dihitung dari kiri ke kanan; ES suatu node adalah EF maksimum dari semua pendahulunya.
4. **Backward Pass** — LF (Late Finish) dan LS (Late Start) dihitung dari kanan ke kiri; LF suatu node adalah LS minimum dari semua penerusnya.
5. **Slack** — `Slack = LS − ES`; aktivitas dengan Slack = 0 masuk jalur kritis dan tidak boleh terlambat.
6. **Output** — Network diagram interaktif ditampilkan beserta tabel hasil lengkap dan summary card yang merangkum durasi proyek dan jalur kritis.

### Contoh Hasil

Studi kasus: **Alur Peluncuran Produk Baru di Toko Retail**
Durasi proyek total: **21.17 hari** | Jalur kritis: **A → B → D → F**

| ID | Nama Aktivitas                     | O  | M  | P  | TE    | σ²   | ES    | EF    | LS    | LF    | Slack | Status    |
|----|------------------------------------|----|----|----|-------|------|-------|-------|-------|-------|-------|-----------|
| A  | Finalisasi desain kemasan produk   | 2  | 4  | 8  | 4.33  | 1.00 | 0.00  | 4.33  | 0.00  | 4.33  | 0.00  | **Kritis**|
| B  | Produksi massal tahap pertama      | 5  | 8  | 14 | 8.50  | 2.25 | 4.33  | 12.83 | 4.33  | 12.83 | 0.00  | **Kritis**|
| C  | Pembuatan konten iklan dan promosi | 3  | 5  | 9  | 5.33  | 1.00 | 4.33  | 9.67  | 13.83 | 19.17 | 9.50  | Normal    |
| D  | Distribusi ke gudang cabang        | 4  | 6  | 10 | 6.33  | 1.00 | 12.83 | 19.17 | 12.83 | 19.17 | 0.00  | **Kritis**|
| E  | Pelatihan staf toko                | 2  | 3  | 5  | 3.17  | 0.25 | 12.83 | 16.00 | 16.00 | 19.17 | 3.17  | Normal    |
| F  | Peluncuran produk di toko          | 1  | 2  | 3  | 2.00  | 0.11 | 19.17 | 21.17 | 19.17 | 21.17 | 0.00  | **Kritis**|

> Aktivitas C dan E memiliki slack sehingga dapat terlambat tanpa mengganggu jadwal proyek secara keseluruhan.

---

## 4. Alur Sistem dan Deskripsi Program

**Fitur utama:**

- **Mode Input Ganda** — Toggle antara mode O/M/P (hari) dan Per Minggu; mode Per Minggu otomatis mengkonversi ke O=80%, M=100%, P=130% dari durasi hari.
- **Validasi Real-time** — Deteksi input tidak valid (O > M > P, nilai kosong) sebelum kalkulasi dikirim ke API.
- **Network Diagram Interaktif** — Visualisasi DAG menggunakan React Flow; node kritis berwarna oranye, edge kritis beranimasi; mendukung zoom, pan, dan minimap.
- **Node Detail Panel** — Klik node menampilkan panel detail dengan rumus ES/EF/LS/LF step-by-step.
- **Tabel Hasil Lengkap** — Menampilkan semua nilai PERT per aktivitas; kolom O/M/P otomatis tersembunyi di mode Per Minggu.
- **Summary Card** — Rangkuman durasi proyek, jumlah aktivitas kritis, dan visualisasi jalur kritis dengan badge bernomor.

### Flowchart Sistem

<img width="636" height="1374" alt="image" src="https://github.com/user-attachments/assets/94b7bef0-56d0-477e-8972-a32d6303fff3" />
