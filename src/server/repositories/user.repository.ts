import { eq, or, and, gt, isNull } from "drizzle-orm";
import { db } from "../db";
import { users, userTokens } from "../db/schema";
import { TRegisterInput } from "../types/auth";
import { createId } from "@paralleldrive/cuid2";

export const userRepository = {
  async findByEmailOrNik(email: string, nik: string) {
    const result = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.nik, nik)))
      .limit(1);
    return result[0];
  },

  async findByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  },

  async createUser(data: TRegisterInput & { passwordHash: string }) {
    const newId = createId();

    await db.insert(users).values({
      id: newId,
      name: data.name,
      email: data.email,
      nik: data.nik,
      password: data.passwordHash,
    });

    return {
      id: newId,
      name: data.name,
      email: data.email,
      nik: data.nik,
      role: "user",
    };
  },

  /**
   * Create OTP token untuk user
   */
  async createOTPToken(
    userId: string,
    otp: string,
    expiresAt: Date,
  ): Promise<void> {
    await db.insert(userTokens).values({
      id: createId(),
      userId,
      token: otp,
      type: "OTP",
      meta: null,
      expiresAt,
      usedAt: null,
    });
  },

  /**
   * Find valid OTP token (belum expired dan belum dipakai)
   */
  async findValidOTPToken(userId: string, otp: string) {
    const now = new Date();
    const result = await db
      .select()
      .from(userTokens)
      .where(
        and(
          eq(userTokens.userId, userId),
          eq(userTokens.token, otp),
          eq(userTokens.type, "OTP"),
          isNull(userTokens.usedAt),
          gt(userTokens.expiresAt, now),
        ),
      )
      .limit(1);

    return result[0];
  },

  /**
   * Mark token as used
   */
  async markTokenAsUsed(tokenId: string): Promise<void> {
    await db
      .update(userTokens)
      .set({ usedAt: new Date() })
      .where(eq(userTokens.id, tokenId));
  },

  /**
   * Mark user email as verified
   */
  async verifyUserEmail(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(users.id, userId));
  },
};
