import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(), // once-daily, twice-daily, etc.
  times: json("times").$type<string[]>().notNull(), // array of time strings like ["08:00", "20:00"]
  prescribedBy: text("prescribed_by"),
  instructions: text("instructions"),
  isActive: boolean("is_active").notNull().default(true),
  enableSmartReminders: boolean("enable_smart_reminders").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  scheduledTime: text("scheduled_time").notNull(), // "08:00"
  takenAt: timestamp("taken_at"),
  status: text("status").notNull(), // "taken", "missed", "pending"
  date: text("date").notNull(), // "2024-06-29"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
}).extend({
  times: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)),
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;
