import { eq, or } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
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
};
