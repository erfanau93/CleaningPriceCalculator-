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

let suburbDataCache: SuburbData[] | null = null;

function loadSuburbData(): SuburbData[] {
  if (suburbDataCache) {
    return suburbDataCache;
  }

  try {
    const dataPath = path.join(__dirname, '../data/suburb_income.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    suburbDataCache = JSON.parse(rawData);
    return suburbDataCache;
  } catch (error) {
    console.error('Error loading suburb income data:', error);
    return [];
  }
}

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