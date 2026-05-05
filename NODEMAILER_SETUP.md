# Setup Nodemailer untuk Email OTP

## Status Saat Ini

✅ Nodemailer sudah di-install (`npm install nodemailer`)  
✅ Email service sudah dibuat (`src/server/services/email.service.ts`)  
⚠️ Environment variables belum configured

## Langkah Setup

### 1. Pilih SMTP Provider

#### Option A: Gmail (Recommended untuk testing)

**Kelebihan:** Gratis, mudah setup  
**Kekurangan:** Limited untuk production (low rate limit)

**Setup steps:**

1. Buka https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Buka https://myaccount.google.com/apppasswords
4. Pilih **Mail** dan **Windows Computer** (atau device lain)
5. Generate password baru
6. Copy app password yang digenerate

**`.env.local` configuration:**

```env
NODE_ENV=development

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App password yang digenerate
SMTP_FROM_EMAIL=noreply@desasangkima.com
```

---

#### Option B: SendGrid (Production-grade)

**Kelebihan:** Professional, reliable, scalable  
**Kekurangan:** Perlu signup, paid (tapi ada free tier)

**Setup steps:**

1. Daftar di https://sendgrid.com
2. Verify sender email
3. Create API key di Settings → API Keys
4. Copy API key

**`.env.local` configuration:**

```env
NODE_ENV=production

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx  # Paste API key
SMTP_FROM_EMAIL=noreply@desasangkima.com
```

---

#### Option C: Mailtrap (Development/Testing)

**Kelebihan:** Perfect untuk testing, free tier bagus  
**Kekurangan:** Tidak untuk production (fake SMTP)

**Setup steps:**

1. Daftar di https://mailtrap.io
2. Setup inbox
3. Copy SMTP credentials dari "Show Credentials"

**`.env.local` configuration:**

```env
NODE_ENV=development

SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username@mailtrap.io
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=noreply@desasangkima.com
```

---

### 2. Update `.env.local`

Pilih salah satu provider di atas dan update `.env.local` Anda:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_websangkima

# JWT
JWT_SECRET=your-secret-key

# Node Environment
NODE_ENV=development

# Email SMTP (Pilih salah satu provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@desasangkima.com
```

### 3. Test Email Configuration

Create test file:

```typescript
// test-email.ts
import { sendOTPEmail } from "./src/server/services/email.service";

async function test() {
  try {
    await sendOTPEmail("your-test-email@gmail.com", "1234");
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Email failed:", error);
  }
}

test();
```

Run:

```bash
npx tsx test-email.ts
```

---

## Development Mode vs Production Mode

### 🔧 Development (NODE_ENV=development)

```env
NODE_ENV=development
```

**Behavior:** OTP ditampilkan di **console**, tidak dikirim email
**Gunakan untuk:** Local testing, development environment

**Console output:**

```
📧 OTP Email to user@example.com:
   OTP Code: 1234
   Valid for 15 minutes
```

### 🚀 Production (NODE_ENV=production)

```env
NODE_ENV=production
SMTP_HOST=...
SMTP_USER=...
SMTP_PASSWORD=...
```

**Behavior:** Email benar-benar dikirim via SMTP  
**Gunakan untuk:** Staging, production environment

---

## How Email Service Works

**File:** `src/server/services/email.service.ts`

```typescript
// Development Mode
if (process.env.NODE_ENV !== "production") {
  console.log(`📧 OTP Email to ${to}:`);
  console.log(`   OTP Code: ${otp}`);
  return;
}

// Production Mode - Send via SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

await transporter.sendMail({...});
```

---

## Testing Email Flow

### Step 1: Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "nik": "1234567890123456",
    "password": "password123"
  }'
```

**Development Response (console log):**

```
📧 OTP Email to test@example.com:
   OTP Code: 1234
   Valid for 15 minutes
```

**Production Response (email sent):**

- Email terkirim ke inbox
- User bisa check email untuk OTP

### Step 2: Verify OTP

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_dari_register",
    "otp": "1234"
  }'
```

### Step 3: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## Troubleshooting

### ❌ Email tidak terkirim di production

**Solusi:**

1. Cek `.env` - SMTP_HOST, USER, PASSWORD benar?
2. Cek `NODE_ENV=production`
3. Check firewall - port 587 terbuka?
4. Try different SMTP provider
5. Check email provider logs (Gmail: myaccount.google.com/security-check)

### ❌ ECONNREFUSED pada console

**Penyebab:** Nodemailer mencoba connect SMTP tapi server down  
**Solusi:**

- Cek SMTP_HOST dan PORT benar
- Cek internet connection
- Try Mailtrap untuk testing

### ❌ Authentication failed

**Penyebab:** Username/password salah  
**Solusi:**

- Re-generate app password (untuk Gmail)
- Double-check credentials di provider
- Pastikan tidak ada extra spaces

### ℹ️ Development mode - hanya console log

**Expected behavior** - tidak ada bug  
Set `NODE_ENV=production` untuk real email

---

## Recommended Setup

### Untuk Development

```env
NODE_ENV=development
```

✅ Tidak perlu SMTP credentials  
✅ Lihat OTP langsung di console  
✅ Perfect untuk local testing

### Untuk Production

```env
NODE_ENV=production
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx
SMTP_FROM_EMAIL=noreply@desasangkima.com
```

✅ Real email service  
✅ Professional, scalable  
✅ Good reliability

---

## Apa Pilihan Anda?

1. **Gmail** - Simple, free, bagus untuk dev
2. **SendGrid** - Professional, production-ready
3. **Mailtrap** - Testing only, fake SMTP

Rekomendasikan mana yang mau digunakan?
