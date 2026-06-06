import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import type { LetterFieldDef } from "../../types/letter";

// Master jenis surat (dikelola admin / kepala desa).
// Contoh: SKD = Surat Keterangan Domisili, SKU = Surat Keterangan Usaha.
export const letterTypes = mysqlTable("letter_types", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  // kode singkat unik, mis. "SKD", "SKTM"
  code: varchar({ length: 20 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 500 }),
  // isi badan surat dengan placeholder, mis. "{{name}} beralamat di {{address}}"
  template: text("template"),
  // definisi field tambahan yang harus diisi warga untuk surat ini
  requiredFields: json("required_fields").$type<LetterFieldDef[]>().default([]),
  active: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
