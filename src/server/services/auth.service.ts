// server/services/authService.ts
import {
  registerSchema,
  loginSchema,
  TRegisterInput,
  TLoginInput,
} from "../types/auth";
import { userRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import { generateOTP, getOTPExpiration } from "../utils/otp";
import { sendOTPEmail } from "./email.service";

export const authService = {
  async register(input: TRegisterInput) {
    const validatedData = registerSchema.parse(input);

    const existingUser = await userRepository.findByEmailOrNik(
      validatedData.email,
      validatedData.nik,
    );

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        throw new Error("Email sudah terdaftar");
      }
      if (existingUser.nik === validatedData.nik) {
        throw new Error("NIK sudah terdaftar");
      }
    }

    const passwordHash = await hashPassword(validatedData.password);

    const newUser = await userRepository.createUser({
      ...validatedData,
      passwordHash,
    });

    // Generate dan kirim OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    await userRepository.createOTPToken(newUser.id, otp, expiresAt);

    // Kirim email OTP
    let emailSent = false;
    let emailError: string | null = null;

    try {
      await sendOTPEmail(newUser.email, otp);
      emailSent = true;
      console.log(`✅ OTP email sent successfully to ${newUser.email}`);
    } catch (error: any) {
      emailError = error.message;
      console.error(
        `❌ Failed to send OTP email to ${newUser.email}:`,
        error.message,
      );
    }

    return {
      success: true,
      message: emailSent
        ? "Registrasi berhasil. Kode OTP telah dikirim ke email Anda."
        : "Registrasi berhasil, tapi email gagal terkirim. Gunakan 'Resend OTP' untuk coba ulang.",
      data: {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        emailSent,
        emailError:
          emailError && process.env.NODE_ENV === "development"
            ? emailError
            : undefined,
      },
    };
  },

  async verifyOTP(userId: string, otp: string) {
    const token = await userRepository.findValidOTPToken(userId, otp);

    if (!token) {
      throw new Error("Kode OTP tidak valid atau sudah expired");
    }

    // Mark token as used
    await userRepository.markTokenAsUsed(token.id);

    // Mark user as verified
    await userRepository.verifyUserEmail(userId);

    return {
      success: true,
      message: "Email berhasil diaktifkan",
    };
  },

  async login(input: TLoginInput) {
    const validatedData = loginSchema.parse(input);

    const user = await userRepository.findByEmail(validatedData.email);
    if (!user) {
      throw new Error("Email atau password salah");
    }

    // Check if email is verified
    if (!user.emailVerifiedAt) {
      throw new Error("Email belum diaktifkan. Silakan verifikasi email Anda.");
    }

    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error("Email atau password salah");
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      nik: user.nik,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nik: user.nik,
      },
      token,
    };
  },
};
