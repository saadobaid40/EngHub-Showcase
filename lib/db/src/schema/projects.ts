import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  courseName: text("course_name"),
  teamMembers: text("team_members"),
  componentsTags: text("components_tags"),
  costLevel: text("cost_level"),
  difficultyLevel: text("difficulty_level"),
  inspiredByLink: text("inspired_by_link"),
  challengesText: text("challenges_text"),
  imageUrl: text("image_url"),
  reportLink: text("report_link"),
  videoLink: text("video_link"),
  upvotes: integer("upvotes").notNull().default(0),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true, upvotes: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
