import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { positions } from "../db/schema";
import type {
  TCreatePositionInput,
  TUpdatePositionInput,
} from "../types/position";

export const positionRepository = {
  async findAll() {
    return db.select().from(positions);
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(positions)
      .where(eq(positions.id, id))
      .limit(1);
    return result[0];
  },

  async findByName(name: string) {
    const result = await db
      .select()
      .from(positions)
      .where(eq(positions.name, name))
      .limit(1);
    return result[0];
  },

  async create(data: TCreatePositionInput) {
    const id = createId();
    await db.insert(positions).values({ id, ...data });
    return this.findById(id);
  },

  async update(id: string, data: TUpdatePositionInput) {
    await db.update(positions).set(data).where(eq(positions.id, id));
    return this.findById(id);
  },

  async delete(id: string) {
    const position = await this.findById(id);
    if (!position) throw new Error("Jabatan tidak ditemukan");
    await db.delete(positions).where(eq(positions.id, id));
    return true;
  },
};
