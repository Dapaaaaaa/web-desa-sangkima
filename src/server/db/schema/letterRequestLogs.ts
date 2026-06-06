import {
  bigint,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { LETTER_STATUSES } from "../../types/letter";
import { letterRequests } from "./letterRequests";
import { users } from "./users";

// Riwayat perubahan status tiap pengajuan (untuk transparansi & audit).
export const letterRequestLogs = mysqlTable("letter_request_logs", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  requestId: varchar("request_id", { length: 128 })
    .references(() => letterRequests.id)
    .notNull(),
  // status setelah perubahan ini
  status: mysqlEnum(LETTER_STATUSES).notNull(),
  // catatan opsional (mis. alasan tolak, catatan operator)
  note: varchar({ length: 500 }),
  // siapa yang mengubah (warga saat mengajukan, atau petugas)
  changedBy: varchar("changed_by", { length: 128 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});
