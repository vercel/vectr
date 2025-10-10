import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const image = pgTable("image", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  downloadUrl: text("download_url").notNull(),
  url: text("url").notNull(),
  mediaType: text("media_type").notNull(),
  text: text("text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Image = typeof image.$inferSelect;
export type NewImage = typeof image.$inferInsert;
