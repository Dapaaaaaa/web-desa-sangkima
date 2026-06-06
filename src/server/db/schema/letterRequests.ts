import { createId } from "@paralleldrive/cuid2";
import {
  datetime,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { LETTER_STATUSES, type LetterRequestData } from "../../types/letter";
import { letterTypes } from "./letterTypes";
import { users } from "./users";

// Pengajuan surat oleh warga + alur approval 2 tingkat (operator -> kepala desa).
export const letterRequests = mysqlTable("letter_requests", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  // pemohon (warga)
  userId: varchar("user_id", { length: 128 })
    .references(() => users.id)
    .notNull(),
  letterTypeId: varchar("letter_type_id", { length: 128 })
    .references(() => letterTypes.id)
    .notNull(),
  // keperluan / tujuan surat
  purpose: varchar({ length: 500 }).notNull(),
  // jawaban field tambahan sesuai letter_types.required_fields
  data: json("data").$type<LetterRequestData>(),
  status: mysqlEnum(LETTER_STATUSES).notNull().default("DIAJUKAN"),

  // diisi saat DISETUJUI
  letterNumber: varchar("letter_number", { length: 100 }),
  // kode acak untuk verifikasi publik via QR (URL /verifikasi/{code})
  verificationCode: varchar("verification_code", { length: 64 }).unique(),
  pdfPath: varchar("pdf_path", { length: 255 }),

  // diisi saat DITOLAK
  rejectionReason: text("rejection_reason"),

  // jejak petugas
  verifiedBy: varchar("verified_by", { length: 128 }).references(
    () => users.id,
  ), // operator (staff)
  approvedBy: varchar("approved_by", { length: 128 }).references(
    () => users.id,
  ), // kepala desa (admin)

  // stempel waktu tiap tahap
  verifiedAt: datetime("verified_at"),
  approvedAt: datetime("approved_at"),
  completedAt: datetime("completed_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  deletedAt: datetime("deleted_at"),
});
