import { createId } from "@paralleldrive/cuid2";
import {
  datetime,
  json,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

export const userTokens = mysqlTable("user_tokens", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 128 })
    .references(() => users.id)
    .notNull(),
  token: varchar({ length: 255 }).notNull(),
  meta: json("meta").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: datetime("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
