import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Home as HomeIcon, Bed, PlusCircle, Calculator, FileText, Printer, TrendingUp, Phone, DollarSign, Settings } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type QuoteCalculation, type QuoteResult, ADD_ONS } from "@shared/schema";

// Add-on service display data
const ADDON_DISPLAY = {
  inside_oven_clean: { name: "Inside Oven Clean", price: 45 },
  inside_fridge_clean: { name: "Inside Fridge Clean", price: 45 },
  inside_freezer_clean: { name: "Inside Freezer Clean", price: 45 },
  inside_windows_and_tracks: { name: "Inside Windows & Tracks", price: 90 },
  blinds_up_to_5_sets: { name: "Blinds (up to 5 sets)", price: 45 },
  balcony_clean: { name: "Balcony Clean", price: 45 },
  garage_sweep_and_cobwebs: { name: "Garage Sweep & Cobwebs", price: 45 },
  carpet_steam_clean_1_room: { name: "Carpet Steam Clean (1 room)", price: 60 },
  wall_spot_cleaning: { name: "Wall Spot Cleaning", price: 60 },
  extra_bathroom: { name: "Extra Bathroom", price: 60 },
  extra_bedroom: { name: "Extra Bedroom", price: 60 }
};

export default function Home() {
  const [service, setService] = useState<'general' | 'deep' | 'move'>('general');
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [showAdminView, setShowAdminView] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(60);
  const [cleanerRate, setCleanerRate] = useState(35);
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  const calculateQuoteMutation = useMutation({
    mutationFn: async (data: QuoteCalculation) => {
      const response = await apiRequest("POST", "/api/calculate-quote", data);
      return response.json();
    },
    onSuccess: (data: QuoteResult) => {
      setQuote(data);
    }
  });

  // Calculate quote whenever inputs change
  useEffect(() => {
    const data: QuoteCalculation = {
      service,
      bedrooms,
      bathrooms,
      addons: selectedAddons,
      discountApplied,
      hourlyRate,
      cleanerRate
    };
    calculateQuoteMutation.mutate(data);
  }, [service, bedrooms, bathrooms, selectedAddons, discountApplied, hourlyRate, cleanerRate]);

  const handleAddonToggle = (addonName: string, checked: boolean) => {
    if (checked) {
      setSelectedAddons([...selectedAddons, addonName]);
    } else {
      setSelectedAddons(selectedAddons.filter(a => a !== addonName));
    }
  };

  const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;
  const formatAddonName = (name: string) => ADDON_DISPLAY[name as keyof typeof ADDON_DISPLAY]?.name || name;

  const serviceNames = { general: 'General', deep: 'Deep', move: 'Move In/Out' };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Sparkles className="text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sydney Premium Cleaning</h1>
                <p className="text-sm text-gray-600">Professional Quote Calculator</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Need help?</p>
                <p className="text-primary font-semibold">1300 CLEAN UP</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Selection Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Service Type Selection */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <HomeIcon className="inline mr-2 text-primary" />
                  Select Service Type
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['general', 'deep', 'move'] as const).map((serviceType) => (
                    <div key={serviceType} className="relative">
                      <input
                        type="radio"
                        id={serviceType}
                        name="service"
                        value={serviceType}
                        checked={service === serviceType}
                        onChange={(e) => setService(e.target.value as typeof service)}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={serviceType}
                        className="block p-4 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 peer-checked:border-primary peer-checked:bg-primary/5 transition-all"
                      >
                        <div className="text-center">
                          <div className="text-2xl text-gray-600 mb-2">
                            {serviceType === 'general' && '🧹'}
                            {serviceType === 'deep' && '🧼'}
                            {serviceType === 'move' && '🚚'}
                          </div>
                          <h3 className="font-semibold text-gray-900">{serviceNames[serviceType]} Clean</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {serviceType === 'general' && 'Regular maintenance cleaning'}
                            {serviceType === 'deep' && 'Spring cleaning service'}
                            {serviceType === 'move' && 'Moving cleaning service'}
                          </p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Configuration */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <Settings className="inline mr-2 text-primary" />
                  Pricing Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="inline w-4 h-4 mr-1" />
                      Hourly Rate (Client)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="pl-8"
                        min="1"
                        max="200"
                        step="1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Amount charged to client per hour</p>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="inline w-4 h-4 mr-1" />
                      Cleaner Rate (Cost)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={cleanerRate}
                        onChange={(e) => setCleanerRate(Number(e.target.value))}
                        className="pl-8"
                        min="1"
                        max="100"
                        step="1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Amount paid to cleaner per hour</p>
                  </div>
                </div>
                
                {/* Quick profit preview */}
                {quote && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Hours</p>
                        <p className="text-lg font-bold text-gray-900">{quote.totalHours}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Hourly Profit</p>
                        <p className="text-lg font-bold text-green-600">${(quote.profit / quote.totalHours).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Margin</p>
                        <p className="text-lg font-bold text-blue-600">{quote.margin.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <Bed className="inline mr-2 text-primary" />
                  Property Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</Label>
                    <Select value={bedrooms.toString()} onValueChange={(value) => setBedrooms(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Bedroom{num !== 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</Label>
                    <Select value={bathrooms.toString()} onValueChange={(value) => setBathrooms(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Bathroom{num !== 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add-on Services */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <PlusCircle className="inline mr-2 text-primary" />
                  Add-on Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {Object.entries(ADDON_DISPLAY).slice(0, 6).map(([key, addon]) => (
                      <label key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Checkbox
                          checked={selectedAddons.includes(key)}
                          onCheckedChange={(checked) => handleAddonToggle(key, checked as boolean)}
                        />
                        <span className="text-sm font-medium text-gray-700 flex-1">{addon.name}</span>
                        <span className="text-sm text-gray-500">+${addon.price}</span>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {Object.entries(ADDON_DISPLAY).slice(6).map(([key, addon]) => (
                      <label key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Checkbox
                          checked={selectedAddons.includes(key)}
                          onCheckedChange={(checked) => handleAddonToggle(key, checked as boolean)}
                        />
                        <span className="text-sm font-medium text-gray-700 flex-1">{addon.name}</span>
                        <span className="text-sm text-gray-500">+${addon.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discount Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-accent">%</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Promotional Discount</h3>
                      <p className="text-sm text-gray-600">Apply 20% discount for new customers</p>
                    </div>
                  </div>
                  <Switch
                    checked={discountApplied}
                    onCheckedChange={setDiscountApplied}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quote Summary Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <Calculator className="inline mr-2 text-primary" />
                  Quote Summary
                </h2>
                
                {quote && (
                  <div className="space-y-4">
                    {/* Main Service */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">
                        {serviceNames[service]} Clean – {bedrooms} Bed, {bathrooms} Bath
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatMoney(quote.mainServiceCost)}
                      </span>
                    </div>
                    
                    {/* Add-ons */}
                    {quote.addons.map((addon, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">
                          {formatAddonName(addon.name)}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatMoney(addon.cost)}
                        </span>
                      </div>
                    ))}
                    
                    {/* Subtotal */}
                    <div className="flex justify-between items-center py-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Subtotal</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatMoney(quote.subtotal)}
                      </span>
                    </div>
                    
                    {/* Discount */}
                    {quote.discountApplied && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-accent">Less 20% discount</span>
                        <span className="text-sm font-semibold text-accent">
                          -{formatMoney(quote.discountAmount)}
                        </span>
                      </div>
                    )}
                    
                    {/* GST */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-700">GST (10%)</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatMoney(quote.gst)}
                      </span>
                    </div>
                    
                    {/* Total */}
                    <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
                      <span className="text-lg font-semibold text-gray-900">Total (inc GST)</span>
                      <span className="text-lg font-bold text-primary">
                        {formatMoney(quote.total)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <Button className="w-full" disabled={calculateQuoteMutation.isPending}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Quote
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Quote
                  </Button>
                </div>
                
                {/* Admin View Toggle */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdminView(!showAdminView)}
                    className="text-sm text-gray-600 hover:text-primary"
                  >
                    <TrendingUp className="mr-1 h-4 w-4" />
                    {showAdminView ? 'Hide' : 'Show'} Profit Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Admin Profit Analysis Panel */}
            {showAdminView && quote && (
              <Card className="bg-gray-900 text-white mt-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    <TrendingUp className="inline mr-2 text-secondary" />
                    Detailed Profit Analysis
                  </h3>
                  
                  {/* Hourly Rates Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Hourly Rates</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400">Client Rate</p>
                        <p className="text-lg font-bold text-white">${quote.hourlyRate}/hr</p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400">Cleaner Rate</p>
                        <p className="text-lg font-bold text-white">${quote.cleanerRate}/hr</p>
                      </div>
                    </div>
                  </div>

                  {/* Hours & Labor Costs */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Labor Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Total Hours</span>
                        <span className="text-sm font-semibold text-white">{quote.totalHours}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Revenue ({quote.totalHours}h × ${quote.hourlyRate})</span>
                        <span className="text-sm font-semibold text-white">${(quote.totalHours * quote.hourlyRate).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Cleaner Pay ({quote.totalHours}h × ${quote.cleanerRate})</span>
                        <span className="text-sm font-semibold text-white">{formatMoney(quote.cleanerPay)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Final Profit */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Net Revenue (after discount)</span>
                      <span className="text-sm font-semibold text-white">
                        {formatMoney(quote.netRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                      <span className="text-sm font-medium text-gray-300">Total Profit</span>
                      <span className="text-sm font-bold text-secondary">
                        {formatMoney(quote.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Profit Margin</span>
                      <span className="text-sm font-semibold text-secondary">
                        {quote.margin.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Profit per Hour</span>
                      <span className="text-sm font-semibold text-secondary">
                        ${(quote.profit / quote.totalHours).toFixed(2)}/hr
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
