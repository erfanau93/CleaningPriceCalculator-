import { pgTable, text, serial, integer, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Quote calculation request schema
export const quoteCalculationSchema = z.object({
  service: z.enum(['general', 'deep', 'move']),
  bedrooms: z.number().min(1).max(6),
  bathrooms: z.number().min(1).max(3),
  addons: z.array(z.string()).default([]),
  discountApplied: z.boolean().default(false),
  hourlyRate: z.number().min(1).max(200).default(60),
  cleanerRate: z.number().min(1).max(100).default(35)
});

// Quote result schema
export const quoteResultSchema = z.object({
  service: z.string(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  addons: z.array(z.object({
    name: z.string(),
    hours: z.number(),
    cost: z.number()
  })),
  mainServiceHours: z.number(),
  mainServiceCost: z.number(),
  subtotal: z.number(),
  discountApplied: z.boolean(),
  discountAmount: z.number(),
  netRevenue: z.number(),
  gst: z.number(),
  total: z.number(),
  cleanerPay: z.number(),
  profit: z.number(),
  margin: z.number(),
  hourlyRate: z.number(),
  cleanerRate: z.number(),
  totalHours: z.number()
});

export type QuoteCalculation = z.infer<typeof quoteCalculationSchema>;
export type QuoteResult = z.infer<typeof quoteResultSchema>;

// Configuration constants
export const PRICING_CONFIG = {
  HOURLY_RATE: 60.0,
  CLEANER_RATE: 35.0,
  GST_RATE: 0.10,
  DEFAULT_DISCOUNT_PCT: 20
};

// Service pricing data
export const SERVICES = {
  general: {
    "1,1": 2,
    "2,1": 2.5,
    "2,2": 3.5,
    "3,2": 4,
    "4,2": 4.75,
    "4,3": 5.75,
    "5,3": 6.5,
    "6,3": 7
  },
  deep: {
    "1,1": 3.5,
    "2,1": 4,
    "2,2": 5,
    "3,2": 6,
    "4,2": 7.25,
    "4,3": 8.5,
    "5,3": 9.75,
    "6,3": 11
  },
  move: {
    "1,1": 5,
    "2,1": 6,
    "2,2": 7,
    "3,2": 8,
    "4,2": 9.5,
    "4,3": 10.5,
    "5,3": 11,
    "6,3": 12.5
  }
} as const;

// Add-on services data
export const ADD_ONS = {
  inside_oven_clean: 0.75,
  inside_fridge_clean: 0.75,
  inside_freezer_clean: 0.75,
  inside_windows_and_tracks: 1.5,
  blinds_up_to_5_sets: 0.75,
  balcony_clean: 0.75,
  garage_sweep_and_cobwebs: 0.75,
  carpet_steam_clean_1_room: 1.0,
  wall_spot_cleaning: 1.0,
  extra_bathroom: 1.0,
  extra_bedroom: 1.0
} as const;

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Quotes table for storing customer quotes
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  addons: text("addons").array().notNull().default([]),
  discountApplied: boolean("discount_applied").notNull().default(false),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  cleanerRate: decimal("cleaner_rate", { precision: 10, scale: 2 }).notNull(),
  totalHours: decimal("total_hours", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull().default('0'),
  netRevenue: decimal("net_revenue", { precision: 10, scale: 2 }).notNull(),
  gst: decimal("gst", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  cleanerPay: decimal("cleaner_pay", { precision: 10, scale: 2 }).notNull(),
  profit: decimal("profit", { precision: 10, scale: 2 }).notNull(),
  margin: decimal("margin", { precision: 10, scale: 2 }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
