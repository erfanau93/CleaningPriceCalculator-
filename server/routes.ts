import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  quoteCalculationSchema, 
  PRICING_CONFIG, 
  SERVICES, 
  ADD_ONS,
  type QuoteCalculation,
  type QuoteResult
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Quote calculation endpoint
  app.post("/api/calculate-quote", async (req, res) => {
    try {
      const data = quoteCalculationSchema.parse(req.body);
      const result = calculateQuote(data);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        error: "Invalid request data", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateQuote(data: QuoteCalculation): QuoteResult {
  const { service, bedrooms, bathrooms, addons, discountApplied, hourlyRate, cleanerRate } = data;
  
  // Get main service hours
  const serviceKey = `${bedrooms},${bathrooms}` as keyof typeof SERVICES[typeof service];
  const mainServiceHours = SERVICES[service][serviceKey];
  
  if (!mainServiceHours) {
    throw new Error(`Invalid bed/bath combination: ${bedrooms} bed, ${bathrooms} bath`);
  }
  
  // Calculate main service cost using custom hourly rate
  const mainServiceCost = mainServiceHours * hourlyRate;
  
  // Calculate add-on costs using custom hourly rate
  const addonItems = addons.map(addonName => {
    const hours = ADD_ONS[addonName as keyof typeof ADD_ONS];
    if (!hours) {
      throw new Error(`Invalid add-on service: ${addonName}`);
    }
    return {
      name: addonName,
      hours,
      cost: hours * hourlyRate
    };
  });
  
  const addonCost = addonItems.reduce((sum, addon) => sum + addon.cost, 0);
  const subtotal = mainServiceCost + addonCost;
  
  // Apply discount
  const discountAmount = discountApplied ? subtotal * (PRICING_CONFIG.DEFAULT_DISCOUNT_PCT / 100) : 0;
  const netRevenue = subtotal - discountAmount;
  
  // Calculate GST and total
  const gst = netRevenue * PRICING_CONFIG.GST_RATE;
  const total = netRevenue + gst;
  
  // Calculate cleaner pay and profit using custom cleaner rate
  const totalHours = mainServiceHours + addonItems.reduce((sum, addon) => sum + addon.hours, 0);
  const cleanerPay = totalHours * cleanerRate;
  const profit = netRevenue - cleanerPay;
  const margin = netRevenue > 0 ? (profit / netRevenue) * 100 : 0;
  
  return {
    service,
    bedrooms,
    bathrooms,
    addons: addonItems,
    mainServiceHours,
    mainServiceCost,
    subtotal,
    discountApplied,
    discountAmount,
    netRevenue,
    gst,
    total,
    cleanerPay,
    profit,
    margin,
    hourlyRate,
    cleanerRate,
    totalHours
  };
}

function formatAddonName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
