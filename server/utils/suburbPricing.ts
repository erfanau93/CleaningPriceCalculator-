import fs from 'fs';
import path from 'path';

interface SuburbData {
  ssc_code: number;
  suburb: string;
  postcode: number;
  median_income: number;
  state: string;
  [key: string]: any;
}

let suburbDataCache: SuburbData[] = [];

function loadSuburbData(): SuburbData[] {
  if (suburbDataCache.length > 0) {
    return suburbDataCache;
  }

  try {
    // Use process.cwd() to resolve the path from the project root
    const dataPath = path.join(process.cwd(), 'server', 'data', 'suburb_income.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const parsedData = JSON.parse(rawData);
    // The JSON has a 'data' property containing the array of suburbs
    suburbDataCache = parsedData.data || [];
    console.log(`Loaded ${suburbDataCache.length} suburbs from data file`);
    return suburbDataCache;
  } catch (error) {
    console.error('Error loading suburb income data:', error);
    return [];
  }
}

export function getMultiplierForPostcode(postcode: string): { multiplier: number; found: boolean; message?: string } {
  const suburbs = loadSuburbData();
  const postcodeNum = parseInt(postcode);
  
  console.log(`Searching for postcode: ${postcode} (parsed as: ${postcodeNum})`);
  console.log(`Total suburbs loaded: ${suburbs.length}`);
  
  if (isNaN(postcodeNum)) {
    return { multiplier: 1.0, found: false, message: "Invalid postcode format" };
  }
  
  // Search for postcode (exact match)
  const suburb = suburbs.find(s => s.postcode === postcodeNum);

  console.log(`Found suburb:`, suburb ? suburb.suburb : 'Not found');

  if (!suburb) {
    return { multiplier: 1.0, found: false, message: "Postcode not found" };
  }

  const income = suburb.median_income;

  // Apply multiplier based on income brackets
  if (income > 80000) return { multiplier: 1.25, found: true };
  if (income > 60000) return { multiplier: 1.15, found: true };
  if (income > 40000) return { multiplier: 1.05, found: true };
  return { multiplier: 1.0, found: true };
}

export function getPostcodeInfo(postcode: string): { 
  found: boolean; 
  income?: number; 
  multiplier: number; 
  suburb?: string;
  state?: string;
  message?: string;
} {
  const suburbs = loadSuburbData();
  const postcodeNum = parseInt(postcode);
  
  if (isNaN(postcodeNum)) {
    return {
      found: false,
      multiplier: 1.0,
      message: "Invalid postcode format"
    };
  }
  
  const suburb = suburbs.find(s => s.postcode === postcodeNum);

  if (!suburb) {
    return {
      found: false,
      multiplier: 1.0,
      message: "Postcode not found"
    };
  }

  const income = suburb.median_income;
  let multiplier = 1.0;
  
  if (income > 80000) multiplier = 1.25;
  else if (income > 60000) multiplier = 1.15;
  else if (income > 40000) multiplier = 1.05;

  return {
    found: true,
    income: suburb.median_income,
    multiplier,
    suburb: suburb.suburb,
    state: suburb.state
  };
}

// Keep the old functions for backward compatibility
export function getMultiplierForSuburb(suburbName: string): number {
  const suburbs = loadSuburbData();
  
  // Search for suburb (case-insensitive)
  const suburb = suburbs.find(s => 
    s.suburb.toLowerCase() === suburbName.toLowerCase()
  );

  if (!suburb) {
    return 1.0; // Default multiplier if suburb not found
  }

  const income = suburb.median_income;

  // Apply multiplier based on income brackets
  if (income > 80000) return 1.25;
  if (income > 60000) return 1.15;
  if (income > 40000) return 1.05;
  return 1.0;
}

export function getSuburbInfo(suburbName: string): { 
  found: boolean; 
  income?: number; 
  multiplier: number; 
  postcode?: number;
  state?: string;
} {
  const suburbs = loadSuburbData();
  
  const suburb = suburbs.find(s => 
    s.suburb.toLowerCase() === suburbName.toLowerCase()
  );

  if (!suburb) {
    return {
      found: false,
      multiplier: 1.0
    };
  }

  const income = suburb.median_income;
  let multiplier = 1.0;
  
  if (income > 80000) multiplier = 1.25;
  else if (income > 60000) multiplier = 1.15;
  else if (income > 40000) multiplier = 1.05;

  return {
    found: true,
    income: suburb.median_income,
    multiplier,
    postcode: suburb.postcode,
    state: suburb.state
  };
}

export function searchSuburbs(query: string): SuburbData[] {
  const suburbs = loadSuburbData();
  const lowerQuery = query.toLowerCase();
  
  return suburbs
    .filter(s => s.suburb.toLowerCase().includes(lowerQuery))
    .slice(0, 10); // Limit to 10 results
} 