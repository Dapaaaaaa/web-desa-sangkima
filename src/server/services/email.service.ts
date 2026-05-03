/**
 * Email Service - Send OTP via email
 * Menggunakan Nodemailer dengan SMTP
 *
 * CATATAN: Jangan gunakan NODE_ENV untuk menentukan mode email,
 * karena Next.js memaksa NODE_ENV=development saat `next dev`.
 * Gunakan EMAIL_MODE=console di .env jika ingin mode console saja.
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Cek apakah harus menggunakan mode console (tidak kirim email sungguhan)
 * - Jika EMAIL_MODE=console → mode console
 * - Jika SMTP credentials tidak lengkap → mode console (fallback)
 * - Selain itu → kirim email sungguhan via SMTP
 */
function shouldUseConsoleMode(): boolean {
  if (process.env.EMAIL_MODE === "console") {
    return true;
  }

  // Jika tidak ada SMTP credentials, fallback ke console
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return true;
  }

  return false;
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  // Console mode - hanya tampilkan di console, tidak kirim email
  if (shouldUseConsoleMode()) {
    console.log(`\n📧 OTP EMAIL (Console Mode - email TIDAK terkirim)`);
    console.log(`   To: ${to}`);
    console.log(`   Code: ${otp}`);
    console.log(`   Valid for: 15 minutes`);
    console.log(`   💡 Set EMAIL_MODE=smtp di .env untuk kirim email sungguhan\n`);
    return;
  }

  // SMTP mode - kirim email sungguhan via Nodemailer
  console.log(`\n🔄 Sending OTP email to ${to}...`);

  try {
    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Test connection
    console.log(
      `   Connecting to ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`,
    );
    await transporter.verify();
    console.log(`   ✅ SMTP connection verified`);

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to,
      subject: "Kode Aktivasi Akun - Desa Sangkima",
      html: getOTPEmailTemplate(otp),
    });

    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`   Message ID: ${info.messageId}\n`);
  } catch (error: any) {
    console.error(`❌ Failed to send OTP email to ${to}`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}\n`);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/**
 * HTML template untuk OTP email
 */
function getOTPEmailTemplate(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: white; padding: 20px; }
          .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #4CAF50; 
            text-align: center; 
            padding: 20px;
            letter-spacing: 5px;
            background-color: #f0f0f0;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Aktivasi Akun Anda</h1>
          </div>
          <div class="content">
            <p>Halo,</p>
            <p>Terima kasih telah mendaftar di Desa Sangkima. Masukkan kode di bawah ini untuk mengaktifkan akun Anda:</p>
            <div class="otp-code">${otp}</div>
            <p>Kode ini berlaku selama <strong>15 menit</strong>.</p>
            <p style="color: #666; font-size: 12px;">Jika Anda tidak melakukan pendaftaran, abaikan email ini.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Desa Sangkima. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
