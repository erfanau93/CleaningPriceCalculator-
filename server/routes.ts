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
      console.log('Received request body:', JSON.stringify(req.body, null, 2));
      const data = quoteCalculationSchema.parse(req.body);
      console.log('Parsed data successfully:', JSON.stringify(data, null, 2));
      const result = calculateQuote(data);
      res.json(result);
    } catch (error) {
      console.error('Validation error:', error);
      res.status(400).json({ 
        error: "Invalid request data", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Save quote endpoint
  app.post("/api/quotes", async (req, res) => {
    try {
      const data = quoteCalculationSchema.parse(req.body);
      const quoteResult = calculateQuote(data);
      
      // Save to database
      const savedQuote = await storage.saveQuote({
        service: quoteResult.service,
        bedrooms: quoteResult.bedrooms,
        bathrooms: quoteResult.bathrooms,
        addons: data.addons,
        customAddons: data.customAddons,
        discountApplied: quoteResult.discountApplied,
        discountPercentage: quoteResult.discountPercentage.toString(),
        hourlyRate: quoteResult.hourlyRate.toString(),
        cleanerRate: quoteResult.cleanerRate.toString(),
        totalHours: quoteResult.totalHours.toString(),
        subtotal: quoteResult.subtotal.toString(),
        discountAmount: quoteResult.discountAmount.toString(),
        netRevenue: quoteResult.netRevenue.toString(),
        gst: quoteResult.gst.toString(),
        total: quoteResult.total.toString(),
        cleanerPay: quoteResult.cleanerPay.toString(),
        profit: quoteResult.profit.toString(),
        margin: quoteResult.margin.toString(),
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        depositPercentage: quoteResult.depositPercentage.toString(),
        depositAmount: quoteResult.depositAmount.toString(),
      });
      
      res.json(savedQuote);
    } catch (error) {
      res.status(400).json({ 
        error: "Failed to save quote", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get all quotes endpoint
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to retrieve quotes", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get specific quote endpoint
  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuote(id);
      
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to retrieve quote", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateQuote(data: QuoteCalculation): QuoteResult {
  const { service, bedrooms, bathrooms, addons, customAddons, discountApplied, discountPercentage, discountAmount, hourlyRate, cleanerRate, customerName, customerPhone, customerEmail, depositPercentage } = data;
  
  // Calculate total rooms
  const totalRooms = bedrooms + bathrooms;
  
  // Time estimate per room (hours) - different for each service type
  const timePerRoom = {
    general: 0.8, // 48 minutes per room
    deep: 1.2,    // 72 minutes per room  
    move: 1.5     // 90 minutes per room
  }[service];
  
  // Minimum time per job
  const minTime = {
    general: 1.5,
    deep: 2.0,
    move: 2.5
  }[service];
  
  // Calculate total time estimate
  const timeEstimateHours = Math.max(totalRooms * timePerRoom, minTime);
  
  // Calculate main service cost using custom hourly rate
  const mainServiceCost = timeEstimateHours * hourlyRate;
  
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
  const customAddonCost = customAddons.reduce((sum, addon) => sum + addon.price, 0);
  const subtotal = mainServiceCost + addonCost + customAddonCost;
  
  // Apply discount - either percentage or fixed amount
  let finalDiscountAmount = 0;
  if (discountApplied) {
    if (discountAmount > 0) {
      // Fixed amount discount
      finalDiscountAmount = Math.min(discountAmount, subtotal);
    } else {
      // Percentage discount
      finalDiscountAmount = subtotal * (discountPercentage / 100);
    }
  }
  
  const netRevenue = subtotal - finalDiscountAmount;
  
  // Calculate GST and total
  const gst = netRevenue * PRICING_CONFIG.GST_RATE;
  const total = netRevenue + gst;
  
  // Calculate cleaner pay and profit using custom cleaner rate
  const totalHours = timeEstimateHours + addonItems.reduce((sum, addon) => sum + addon.hours, 0);
  const cleanerPay = totalHours * cleanerRate;
  const profit = netRevenue - cleanerPay;
  const margin = netRevenue > 0 ? (profit / netRevenue) * 100 : 0;
  
  // Calculate deposit amount
  const depositAmount = total * (depositPercentage / 100);
  
  return {
    service,
    bedrooms,
    bathrooms,
    addons: addonItems,
    customAddons,
    mainServiceHours: timeEstimateHours,
    mainServiceCost,
    subtotal,
    discountApplied,
    discountPercentage,
    discountAmount: finalDiscountAmount,
    netRevenue,
    gst,
    total,
    cleanerPay,
    profit,
    margin,
    hourlyRate,
    cleanerRate,
    totalHours,
    customerName,
    customerPhone,
    customerEmail,
    depositPercentage,
    depositAmount
  };
}

function formatAddonName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
