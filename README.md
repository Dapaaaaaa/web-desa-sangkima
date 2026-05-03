# Web Desa Sangkima API

Sistem API backend untuk Aplikasi Web Desa Sangkima dengan fitur autentikasi lengkap, manajemen email, dan dokumentasi API interaktif menggunakan Swagger.

## 📋 Daftar Isi

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Development Commands](#development-commands)

## 🛠 Tech Stack

- **Framework**: [Next.js 16.2](https://nextjs.org) dengan App Router
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Database**: MySQL dengan [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: JWT (Jose)
- **Password Hashing**: Bcrypt
- **Email Service**: Nodemailer
- **API Documentation**: Swagger/OpenAPI dengan swagger-jsdoc
- **Validation**: Zod
- **Styling**: Tailwind CSS v4
- **ID Generation**: CUID2



## 🚀 Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd web_desa_sangkima
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

Buat database baru di MySQL:

```sql
CREATE DATABASE desa_sangkima;
```

### 4. Konfigurasi Environment Variables

Copy `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Lihat [Environment Variables](#environment-variables) untuk detail.

### 5. Jalankan Migration

```bash
npm run db:migrate
```

atau dengan Drizzle Kit:

```bash
npx drizzle-kit migrate
```

### 6. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 🔧 Environment Variables

Buat file `.env.local` di root project dengan copy dari `.env.example`:

```bash
cp .env.example .env.local
```

### Database Configuration

```env
# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=db_websangkima
```

### Email Configuration

Project ini menggunakan **Nodemailer dengan 2 mode**:

#### Mode 1: Console Mode (Development/Testing) - DEFAULT ✅

Email **TIDAK** terkirim, hanya ditampilkan di console:

```env
# Email Mode
EMAIL_MODE=console

# SMTP credentials tidak perlu diisi
# Atau bisa dikosongkan jika ingin mode console
```

**Kelebihan**:

- Tidak butuh setup SMTP
- OTP terlihat langsung di console
- Cocok untuk development & testing

**Console output contoh:**

```
📧 OTP EMAIL (Console Mode - email TIDAK terkirim)
   To: user@example.com
   Code: 1234
   Valid for: 15 minutes
   💡 Set EMAIL_MODE=smtp di .env untuk kirim email sungguhan
```

#### Mode 2: SMTP Mode (Production) - Kirim Email Sungguhan

```env
# Email Mode
EMAIL_MODE=smtp

# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@desasangkima.com
```

### Gmail Setup (untuk SMTP mode)

1. Aktifkan **2-Step Verification** di Google Account
2. Buat **App Password** di [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Copy app password ke `SMTP_PASSWORD`
4. Set `EMAIL_MODE=smtp` di `.env.local`

### Other Configuration

```env
# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=1h

# App URL (untuk development & production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Example `.env.local`

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password123
DB_NAME=db_websangkima

# Application
NODE_ENV=development
JWT_SECRET=my_super_secret_jwt_key_min_32_chars_long
JWT_EXPIRES_IN=1h

# Email (Console Mode - Development)
EMAIL_MODE=console

# atau untuk SMTP Mode:
# EMAIL_MODE=smtp
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=yourname@gmail.com
# SMTP_PASSWORD=your_google_app_password
# SMTP_FROM_EMAIL=noreply@desasangkima.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 💾 Database Setup

### Schema yang dibuat:

**users** - Tabel user

- id, name, email, nik, password (hashed)
- emailVerifiedAt, createdAt, updatedAt
- Plus fields lainnya: positionId, address, birthday, dll

**user_tokens** - Token untuk OTP, password reset, email change

- id, userId, token, type (OTP, PasswordChange, EmailChange)
- meta (JSON untuk menyimpan data tambahan seperti newEmail)
- expiresAt, usedAt, createdAt

**positions** - Posisi/jabatan user (optional)

## � Email Mode - Console vs SMTP

Project ini menggunakan **Nodemailer dengan 2 mode fleksibel**:

### Bagaimana Cara Kerjanya?

```typescript
// Logic di email.service.ts
if (EMAIL_MODE === "console") {
  // Mode 1: Console only
  console.log(`📧 OTP EMAIL: ${otp}`); // Tampil di terminal

} else if (SMTP credentials lengkap) {
  // Mode 2: Kirim via SMTP
  await nodemailer.send(...); // Email terkirim ke inbox

} else {
  // Fallback: Console (jika SMTP credentials kurang)
  console.log(`📧 OTP EMAIL: ${otp}`);
}
```

### Mode 1: Console Mode (DEFAULT) ✅

**Setup**: Cukup set `EMAIL_MODE=console`

**Output di terminal**:

```
📧 OTP EMAIL (Console Mode - email TIDAK terkirim)
   To: user@example.com
   Code: 1234
   Valid for: 15 minutes
```

**Cocok untuk**: Development, testing, sandbox

**Keuntungan**:

- ✅ Tidak perlu setup SMTP
- ✅ OTP langsung terlihat di console
- ✅ Tidak kirim email ke email real
- ✅ Cepat untuk development

### Mode 2: SMTP Mode (Production) 📧

**Setup**: Konfigurasi SMTP + set `EMAIL_MODE=smtp`

**Email benar-benar terkirim** ke inbox penerima

**Cocok untuk**: Production, testing dengan email real

**Example dengan Gmail**:

```env
EMAIL_MODE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourname@gmail.com
SMTP_PASSWORD=your_google_app_password
SMTP_FROM_EMAIL=noreply@desasangkima.com
```

### Development Workflow Recommendation

```
1️⃣ Development Lokal
   EMAIL_MODE=console
   → OTP di console, cepat & simple

2️⃣ Testing Email Integration
   EMAIL_MODE=smtp (dengan Gmail)
   → Email benar terkirim, bisa test end-to-end

3️⃣ Production
   EMAIL_MODE=smtp (dengan mail server)
   → Email terkirim ke users real
```

## �📖 API Documentation

### Akses Swagger UI

Buka browser dan pergi ke:

```
http://localhost:3000/api-docs
```

Di sini Anda bisa:

- ✅ Lihat semua endpoints
- ✅ Test API langsung dari browser
- ✅ Lihat request/response examples
- ✅ Download OpenAPI spec


## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts
│   │       ├── register/route.ts
│   │       ├── verify-otp/route.ts
│   │       ├── resend-otp/route.ts
│   │       ├── forgot-password/route.ts
│   │       ├── reset-password/route.ts
│   │       ├── change-email/route.ts
│   │       ├── verify-email-change/route.ts
│   │       ├── me/route.ts
│   │       └── test-email/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── server/
│   ├── db/
│   │   ├── index.ts (Database connection)
│   │   └── schema/
│   │       ├── users.ts
│   │       ├── userTokens.ts
│   │       └── positions.ts
│   ├── services/
│   │   ├── auth.service.ts (Business logic)
│   │   └── email.service.ts
│   ├── repositories/
│   │   └── user.repository.ts (Data access)
│   ├── middlewares/
│   │   └── auth.middleware.ts (JWT verification)
│   ├── types/
│   │   └── auth.ts (Zod schemas & types)
│   ├── utils/
│   │   ├── hash.ts (Password hashing)
│   │   ├── jwt.ts (Token generation)
│   │   ├── otp.ts (OTP generation)
│   │   └── reset-token.ts (Reset token)
│   └── validations/
└── lib/
    └── swagger.ts (Swagger config)
```

### Layering Architecture

```
API Routes (route.ts)
    ↓
Middleware (auth.middleware.ts)
    ↓
Services (auth.service.ts) - Business logic
    ↓
Repositories (user.repository.ts) - Data access
    ↓
Database (Drizzle ORM)
```

Setiap layer terpisah untuk maintainability dan testability.

## 🔨 Development Commands

```bash
# Development server dengan hot reload
npm run dev

# Build untuk production
npm run build

# Start production server
npm start

# Linting
npm run lint

# Database migration
npm run db:migrate

# Database studio/viewer
npm run db:studio

# Generate types dari schema
npm run db:generate
```

## 🗄️ Database Commands

```bash
# Jalankan migrations
npx drizzle-kit migrate

# Open Drizzle Studio (GUI untuk database)
npx drizzle-kit studio

# Generate migrations dari schema changes
npx drizzle-kit generate
```

## 🐛 Troubleshooting

### Error: Database connection failed

- Pastikan MySQL berjalan
- Verifikasi `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` di `.env.local`
- Check MySQL username & password

### Error: OTP tidak terkirim / tidak muncul di console

**Console Mode** (EMAIL_MODE=console):

- Check terminal/console output, OTP harus muncul di sana
- Jangan lihat email inbox (mode console tidak kirim email sungguhan)
- Pastikan `EMAIL_MODE=console` sudah di `.env.local`

**SMTP Mode** (EMAIL_MODE=smtp):

- Verifikasi SMTP credentials di `.env.local` lengkap semua
- Jika pakai Gmail: Check App Password (bukan password biasa)
- Cek server logs untuk error messages
- Pastikan firewall tidak block SMTP port

### Error: "next dev warning tentang NODE_ENV"

⚠️ **NORMAL!** Next.js dev server memaksa `NODE_ENV=development`

Project ini **mengabaikan NODE_ENV**, gunakan `EMAIL_MODE` sebaliknya:

- Console mode: `EMAIL_MODE=console` → OTP di console
- SMTP mode: `EMAIL_MODE=smtp` → Email terkirim

### Error: JWT token invalid

- Pastikan `JWT_SECRET` cukup panjang (min 32 chars)
- Check `JWT_EXPIRES_IN` (default: 1h)
- Verify Authorization header format: `Bearer <token>`
- Token sudah expired? Login ulang untuk dapat token baru

### Error: Swagger docs not appearing

- Pastikan API routes punya JSDoc dengan `@swagger`
- Run dev server dan refresh di `/api-docs`
- Check browser console untuk errors
- Clear browser cache jika perlu

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Zod Validation](https://zod.dev)
- [Jose JWT](https://github.com/panva/jose)
- [Nodemailer Documentation](https://nodemailer.com)
- [Gmail App Password Setup](https://myaccount.google.com/apppasswords)
- [OpenAPI/Swagger](https://swagger.io)

## 📄 License

Private project untuk Desa Sangkima

## 👥 Support

Untuk pertanyaan atau issues, silakan hubungi tim development.
