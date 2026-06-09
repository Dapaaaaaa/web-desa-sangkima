# Dokumentasi Backend — Web E-Surat Desa Sangkima

Backend untuk sistem **E-Surat** (surat-menyurat digital) Desa Sangkima: warga
mengajukan surat secara online, petugas & kepala desa memprosesnya, lalu surat
terbit sebagai PDF resmi dengan QR code untuk verifikasi keaslian.

---

## 1. Teknologi

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, Route Handlers) |
| Bahasa | TypeScript |
| Database | MySQL |
| ORM | Drizzle ORM + drizzle-kit |
| Autentikasi | JWT (jose) + bcrypt |
| Validasi | Zod |
| PDF & QR | pdf-lib + qrcode |
| Email (OTP) | Nodemailer |
| Dokumentasi API | Swagger (swagger-jsdoc + swagger-ui) di `/api-docs` |

---

## 2. Cara Menjalankan

```bash
# 1. Install dependency
npm install

# 2. Siapkan environment
#    Salin .env.example menjadi .env lalu isi kredensial MySQL & JWT
cp .env.example .env

# 3. Buat database di MySQL
#    CREATE DATABASE db_websangkima;

# 4. Buat semua tabel dari schema
npx drizzle-kit push

# 5. Isi data awal jenis surat (6 jenis)
npx tsx src/server/db/seed.ts

# 6. Jalankan server
npm run dev
```

Buka **http://localhost:3000/api-docs** untuk dokumentasi API interaktif (Swagger).

### Variabel `.env` penting
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_websangkima
JWT_SECRET=...        # rahasia bebas
JWT_EXPIRES_IN=1h
```

---

## 3. Arsitektur Berlapis

Setiap fitur mengikuti alur lapisan yang sama agar mudah dirawat:

```
Request  →  Route Handler  →  Service       →  Repository   →  Database
            (HTTP, auth)      (logika &         (query DB,
                              validasi)          Drizzle)
```

| Folder | Tanggung jawab |
|---|---|
| `src/app/api/**/route.ts` | Endpoint HTTP: cek auth/role, panggil service, balas JSON |
| `src/server/services/` | Logika bisnis, validasi Zod, aturan status & role |
| `src/server/repositories/` | Akses database (Drizzle) |
| `src/server/db/schema/` | Definisi tabel |
| `src/server/middlewares/` | `acl.middleware` (requireRole), `auth/role.middleware` (JWT) |
| `src/server/types/` | Skema Zod & tipe (kontrak data) |
| `src/server/utils/` | Helper (hash, jwt, otp, nomor surat) |

**Format respons** seragam:
```json
{ "success": true, "message": "...", "data": { } }
```

---

## 4. Role & Hak Akses

| Role (DB) | Peran | Wewenang utama |
|---|---|---|
| `user` | **Warga** | Ajukan surat, lihat riwayat & status miliknya, unduh surat |
| `staff` | **Operator Desa** | Verifikasi & proses pengajuan, tolak |
| `admin` | **Kepala Desa** | Menyetujui surat (final), kelola jenis surat, kelola user |

Pembatasan akses memakai middleware bersama `requireRole(req, [roles])` di level
route, dan aturan lebih rinci (mis. *approve* hanya `admin`) ditegakkan di service.

---

## 5. Modul E-Surat

### 5.1 Jenis Surat (6 jenis MVP)

| Kode | Nama | Field tambahan |
|---|---|---|
| SKD | Surat Keterangan Domisili | — |
| SKTM | Surat Keterangan Tidak Mampu | — |
| SKU | Surat Keterangan Usaha | nama usaha, jenis usaha, alamat usaha |
| SKBM | Surat Keterangan Belum Menikah | — |
| SP | Surat Pengantar | tujuan instansi (opsional) |
| SKP | Surat Keterangan Penghasilan | penghasilan/bulan |

Field tambahan tiap jenis disimpan fleksibel sebagai JSON (`requiredFields` pada
jenis surat, jawaban pada `data` pengajuan) — tanpa tabel terpisah per jenis.

### 5.2 Alur & Status (approval 2 tingkat)

```
Warga ajukan                Operator (staff)         Kepala Desa (admin)
     │                            │                        │
     ▼                            ▼                        ▼
 DIAJUKAN  ──proses──►  DIPROSES  ──setujui──►  DISETUJUI ──►  SELESAI
     │                       │                  (+ nomor surat
     └────── tolak ──────────┴──► DITOLAK         + kode verifikasi
              (+ alasan)                          + PDF siap)
```

Setiap perubahan status dicatat di tabel `letter_request_logs` (riwayat/audit).

### 5.3 Nomor Surat (otomatis saat disetujui)

Format: `470/{nomor urut}/DS-SKM/{bulan romawi}/{tahun}`
Contoh: `470/001/DS-SKM/VI/2026`
Nomor urut dihitung dari jumlah surat yang disetujui pada tahun berjalan + 1.

### 5.4 Tanda Tangan & QR Verifikasi

- Saat disetujui, sistem membuat **nomor surat** + **kode verifikasi** acak, dan
  surat dapat diunduh sebagai **PDF** (kop desa, isi dari template, area TTD).
- **TTD kepala desa**: jika file `public/ttd-kepala-desa.png` tersedia, otomatis
  ditempel ke PDF.
- **QR code** pada PDF mengarah ke `/{host}/verifikasi/{kode}` — halaman publik
  yang menampilkan keaslian surat (nomor, jenis, nama, tanggal terbit).

---

## 6. Daftar Endpoint

> Semua endpoint (kecuali yang ditandai *publik*) memerlukan header
> `Authorization: Bearer <token>`.

### 6.1 E-Surat — Jenis Surat
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/letter-types` | semua login | Daftar jenis surat (`?active=true`) |
| POST | `/api/letter-types` | admin | Buat jenis surat |
| GET | `/api/letter-types/{id}` | semua login | Detail jenis surat |
| PUT | `/api/letter-types/{id}` | admin | Ubah jenis surat |
| DELETE | `/api/letter-types/{id}` | admin | Nonaktifkan (soft, `active=false`) |

### 6.2 E-Surat — Pengajuan
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/letter-requests` | semua login | Warga: miliknya; petugas: semua (`?status=`) |
| POST | `/api/letter-requests` | warga | Ajukan surat |
| GET | `/api/letter-requests/{id}` | pemilik / petugas | Detail pengajuan |
| PATCH | `/api/letter-requests/{id}` | staff/admin | Aksi: `process` / `approve` (admin) / `reject` / `complete` |
| GET | `/api/letter-requests/{id}/pdf` | pemilik / petugas | Unduh PDF (status DISETUJUI/SELESAI) |
| GET | `/api/letter-requests/verify/{code}` | **publik** | Verifikasi keaslian via QR |

**Body PATCH (aksi petugas):**
```json
{ "action": "process" }                 // DIAJUKAN → DIPROSES
{ "action": "approve" }                 // DIPROSES → DISETUJUI (admin)
{ "action": "reject", "reason": "..." } // → DITOLAK (wajib alasan)
{ "action": "complete" }                // DISETUJUI → SELESAI
```

### 6.3 Autentikasi
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/register` | Daftar (kirim OTP ke email) |
| POST | `/api/auth/verify-otp` | Verifikasi email via OTP |
| POST | `/api/auth/resend-otp` | Kirim ulang OTP |
| POST | `/api/auth/login` | Login (dapat JWT) |
| GET | `/api/auth/me` | Profil user saat ini |
| POST | `/api/auth/forgot-password` | Minta token reset sandi |
| POST | `/api/auth/reset-password` | Reset sandi |
| POST | `/api/auth/change-email` | Ubah email (OTP) |
| POST | `/api/auth/verify-email-change` | Verifikasi email baru |

### 6.4 Manajemen (admin)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET / POST | `/api/users` | Daftar / tambah user |
| GET / PUT / DELETE | `/api/users/{id}` | Detail / ubah / hapus user |
| GET / POST | `/api/position` | Daftar / tambah jabatan |
| GET / PUT / DELETE | `/api/position/{id}` | Detail / ubah / hapus jabatan |

---

## 7. Skema Database (ringkas)

| Tabel | Isi |
|---|---|
| `users` | Data warga & petugas (termasuk `role`, profil kependudukan) |
| `user_tokens` | Token OTP / reset sandi / ganti email |
| `positions` | Jabatan perangkat desa |
| `letter_types` | Master jenis surat (kode, nama, template, field tambahan) |
| `letter_requests` | Pengajuan surat (status, nomor surat, kode verifikasi, dll) |
| `letter_request_logs` | Riwayat perubahan status tiap pengajuan |

---

## 8. Pengujian Cepat (Swagger)

1. Buka `http://localhost:3000/api-docs`.
2. `POST /api/auth/login` → salin `token` dari respons.
3. Klik **Authorize**, tempel `Bearer <token>`.
4. Coba endpoint E-Surat sesuai role.

**Akun tes** (jika sudah di-seed manual; sandi semua `password123`):

| Email | Role |
|---|---|
| `warga@test.com` | user (warga) |
| `staff@test.com` | staff (operator) |
| `admin@test.com` | admin (kepala desa) |

> Catatan: registrasi biasa menghasilkan role `user`. Untuk menguji peran
> staff/admin, ubah kolom `role` user di database, atau buat lewat `POST /api/users`
> (oleh admin).

---

## 9. Status

Modul backend **E-Surat sudah lengkap**: schema → jenis surat → pengajuan →
approval 2 tingkat → PDF + QR + verifikasi publik. Bagian Frontend (halaman warga
& dashboard petugas) dikembangkan terpisah dan mengonsumsi endpoint di atas.
