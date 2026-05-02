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

    return newUser;
  },

  async login(input: TLoginInput) {
    const validatedData = loginSchema.parse(input);

    const user = await userRepository.findByEmail(validatedData.email);
    if (!user) {
      throw new Error("Email atau password salah");
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
