import { createId } from "@paralleldrive/cuid2";
import {
    mysqlTable,
    timestamp,
    varchar,
} from "drizzle-orm/mysql-core";

export const positions = mysqlTable("positions", {
    id: varchar({ length: 128 })
        .primaryKey()
        .$defaultFn(() => createId()),
    category: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
