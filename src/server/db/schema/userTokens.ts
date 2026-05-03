import { createId } from "@paralleldrive/cuid2";
import {
  datetime,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

const tokenTypes = mysqlEnum(["OTP", "PasswordChange", "EmailChange"]);

export const userTokens = mysqlTable("user_tokens", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 128 })
    .references(() => users.id)
    .notNull(),
  token: varchar({ length: 255 }).notNull(),
  type: tokenTypes.notNull(),
  meta: json("meta"),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: datetime("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
