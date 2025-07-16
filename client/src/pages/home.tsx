import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Home as HomeIcon, Bed, PlusCircle, Calculator, FileText, Printer, TrendingUp, Phone, DollarSign, Settings } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type QuoteCalculation, type QuoteResult, type Quote, ADD_ONS } from "@shared/schema";

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
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [showAdminView, setShowAdminView] = useState(true);
  const [hourlyRate, setHourlyRate] = useState(60);
  const [cleanerRate, setCleanerRate] = useState(35);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [showQuoteHistory, setShowQuoteHistory] = useState(false);
  const [customAddons, setCustomAddons] = useState<{name: string, price: number}[]>([]);
  const [newCustomAddon, setNewCustomAddon] = useState({name: "", price: 0});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customerSuburb, setCustomerSuburb] = useState("");
  const [customerPostcode, setCustomerPostcode] = useState("");
  const [suburbMultiplier, setSuburbMultiplier] = useState(1.0);
  const [suggestedMultiplier, setSuggestedMultiplier] = useState(1.0);
  const [suburbInfo, setSuburbInfo] = useState<any>(null);

  // Suggest multiplier when postcode changes
  useEffect(() => {
    if (!customerPostcode) {
      setSuggestedMultiplier(1.0);
      setSuburbMultiplier(1.0);
      setSuburbInfo(null);
      return;
    }
    // Fetch suggestion from backend
    fetch(`/api/suggest-multiplier?postcode=${encodeURIComponent(customerPostcode)}`)
      .then(res => res.json())
      .then(data => {
        setSuggestedMultiplier(data.multiplier);
        setSuburbMultiplier(data.multiplier);
        setSuburbInfo(data.postcodeInfo);
        if (!data.found) {
          setErrorMessage(data.message || "Postcode not found");
        } else {
          setErrorMessage(null);
        }
      })
      .catch(() => {
        setSuggestedMultiplier(1.0);
        setSuburbMultiplier(1.0);
        setSuburbInfo(null);
        setErrorMessage("Error fetching postcode data");
      });
  }, [customerPostcode]);

  const calculateQuoteMutation = useMutation({
    mutationFn: async (data: QuoteCalculation) => {
      console.log('Calculating quote with data:', data);
      const response = await apiRequest("POST", "/api/calculate-quote", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to calculate quote');
      }
      return response.json();
    },
    onSuccess: (data: QuoteResult) => {
      console.log('Quote calculated successfully:', data);
      setQuote(data);
      setShowSuccessMessage(true);
      setErrorMessage(null);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    },
    onError: (error) => {
      console.error('Error calculating quote:', error);
      setErrorMessage(error.message);
    }
  });

  const saveQuoteMutation = useMutation({
    mutationFn: async (data: QuoteCalculation) => {
      const response = await apiRequest("POST", "/api/quotes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    }
  });

  const quotesQuery = useQuery({
    queryKey: ['/api/quotes'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/quotes");
      return response.json();
    },
    enabled: showQuoteHistory
  });

  // Manual calculation function
  const handleCalculateQuote = () => {
    console.log('Manual calculate button clicked');
    
    const data: QuoteCalculation = {
      service,
      bedrooms,
      bathrooms,
      addons: selectedAddons,
      discountApplied,
      discountPercentage: discountType === 'percentage' ? discountPercentage : 0,
      discountAmount: discountType === 'amount' ? discountAmount : 0,
      hourlyRate,
      cleanerRate,
      customAddons: customAddons || [],
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      customerSuburb: customerSuburb || undefined,
      customerPostcode: customerPostcode || undefined,
      suburbMultiplier,
      depositPercentage
    };
    console.log('Sending data to calculate:', data);
    calculateQuoteMutation.mutate(data);
  };

  // Calculate quote whenever inputs change
  useEffect(() => {
    // Clear any previous error messages
    setErrorMessage(null);
    
    const data: QuoteCalculation = {
      service,
      bedrooms,
      bathrooms,
      addons: selectedAddons,
      discountApplied,
      discountPercentage: discountType === 'percentage' ? discountPercentage : 0,
      discountAmount: discountType === 'amount' ? discountAmount : 0,
      hourlyRate,
      cleanerRate,
      customAddons: customAddons || [],
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      customerSuburb: customerSuburb || undefined,
      customerPostcode: customerPostcode || undefined,
      suburbMultiplier,
      depositPercentage
    };
    console.log('Calculating quote with data:', data);
    calculateQuoteMutation.mutate(data);
  }, [service, bedrooms, bathrooms, selectedAddons, discountApplied, discountPercentage, discountAmount, discountType, hourlyRate, cleanerRate, customAddons, customerName, customerPhone, customerEmail, depositPercentage, customerSuburb, customerPostcode, suburbMultiplier]);

  const handleAddonToggle = (addonName: string, checked: boolean) => {
    if (checked) {
      setSelectedAddons([...selectedAddons, addonName]);
    } else {
      setSelectedAddons(selectedAddons.filter(a => a !== addonName));
    }
  };

  const handleSaveQuote = () => {
    const data: QuoteCalculation = {
      service,
      bedrooms,
      bathrooms,
      addons: selectedAddons,
      discountApplied,
      discountPercentage: discountType === 'percentage' ? discountPercentage : 0,
      discountAmount: discountType === 'amount' ? discountAmount : 0,
      hourlyRate,
      cleanerRate,
      customAddons: customAddons || [],
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      customerSuburb: customerSuburb || undefined,
      customerPostcode: customerPostcode || undefined,
      suburbMultiplier,
      depositPercentage
    };
    saveQuoteMutation.mutate(data);
  };

  const handleResetForm = () => {
    setService('general');
    setBedrooms(1);
    setBathrooms(1);
    setSelectedAddons([]);
    setDiscountApplied(false);
    setDiscountPercentage(10);
    setDiscountAmount(0);
    setDiscountType('percentage');
    setHourlyRate(60);
    setCleanerRate(35);
    setCustomAddons([]);
    setNewCustomAddon({name: "", price: 0});
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setDepositPercentage(50);
    setQuote(null);
  };

  const handleAddCustomAddon = () => {
    if (newCustomAddon.name && newCustomAddon.price > 0) {
      setCustomAddons([...customAddons, newCustomAddon]);
      setNewCustomAddon({name: "", price: 0});
    }
  };

  const handleRemoveCustomAddon = (index: number) => {
    setCustomAddons(customAddons.filter((_, i) => i !== index));
  };

  const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;
  const formatAddonName = (name: string) => ADDON_DISPLAY[name as keyof typeof ADDON_DISPLAY]?.name || name;

  const serviceNames = { general: 'General', deep: 'Deep', move: 'Move In/Out' };

  // Calculate total rooms for display
  const totalRooms = bedrooms + bathrooms;

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
                <p className="text-sm text-gray-600">Professional cleaning services</p>
                <p className="text-primary font-semibold">Get your quote today!</p>
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
                    <Input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      min="1"
                      max="20"
                      step="1"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter number of bedrooms (1-20)</p>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</Label>
                    <Input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      min="1"
                      max="10"
                      step="1"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter number of bathrooms (1-10)</p>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  📊 Total Rooms: {bedrooms + bathrooms} (Bedrooms: {bedrooms} + Bathrooms: {bathrooms})
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <Phone className="inline mr-2 text-primary" />
                  Customer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</Label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Email Address</Label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Suburb</Label>
                    <Input
                      value={customerSuburb}
                      onChange={(e) => setCustomerSuburb(e.target.value)}
                      placeholder="Enter suburb"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Postcode</Label>
                    <Input
                      value={customerPostcode}
                      onChange={(e) => setCustomerPostcode(e.target.value)}
                      placeholder="Enter postcode"
                    />
                    {suburbInfo && !suburbInfo.found && (
                      <p className="text-xs text-red-600 mt-1">{suburbInfo.message || "Postcode not found"}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Suburb Multiplier</Label>
                    <Input
                      type="number"
                      value={suburbMultiplier}
                      min={0.5}
                      max={2.0}
                      step={0.01}
                      onChange={e => setSuburbMultiplier(Number(e.target.value))}
                    />
                    {suggestedMultiplier !== 1.0 && suburbInfo && suburbInfo.found && (
                      <p className="text-xs text-blue-600 mt-1">
                        Suggested: x{suggestedMultiplier} 
                        {suburbInfo.income ? ` (${suburbInfo.suburb}, $${suburbInfo.income.toLocaleString()})` : ''}
                      </p>
                    )}
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
                
                {/* Custom Add-ons Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Add-ons</h3>
                  
                  {/* Add Custom Addon Form */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Service Name</Label>
                        <Input
                          value={newCustomAddon.name}
                          onChange={(e) => setNewCustomAddon(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter service name"
                        />
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Price</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            value={newCustomAddon.price}
                            onChange={(e) => setNewCustomAddon(prev => ({ ...prev, price: Number(e.target.value) }))}
                            className="pl-8"
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={handleAddCustomAddon}
                          disabled={!newCustomAddon.name || newCustomAddon.price <= 0}
                          className="w-full"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Service
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Custom Addons List */}
                  {customAddons.length > 0 && (
                    <div className="space-y-2">
                      {customAddons.map((addon, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">{addon.name}</span>
                            <span className="text-sm text-gray-500">${addon.price.toFixed(2)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCustomAddon(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Discount Section */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-accent">%</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Promotional Discount</h3>
                        <p className="text-sm text-gray-600">Apply discount for customers</p>
                      </div>
                    </div>
                    <Switch
                      checked={discountApplied}
                      onCheckedChange={setDiscountApplied}
                    />
                  </div>
                  
                  {discountApplied && (
                    <div className="space-y-4">
                      {/* Discount Type Toggle */}
                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium text-gray-700">Discount Type:</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="percentage"
                            name="discountType"
                            value="percentage"
                            checked={discountType === 'percentage'}
                            onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'amount')}
                            className="mr-1"
                          />
                          <Label htmlFor="percentage" className="text-sm">Percentage (%)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="amount"
                            name="discountType"
                            value="amount"
                            checked={discountType === 'amount'}
                            onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'amount')}
                            className="mr-1"
                          />
                          <Label htmlFor="amount" className="text-sm">Fixed Amount ($)</Label>
                        </div>
                      </div>
                      
                      {/* Discount Input */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={discountType === 'percentage' ? discountPercentage : discountAmount}
                            onChange={(e) => {
                              if (discountType === 'percentage') {
                                setDiscountPercentage(Number(e.target.value));
                              } else {
                                setDiscountAmount(Number(e.target.value));
                              }
                            }}
                            className="pr-8"
                            min="0"
                            max={discountType === 'percentage' ? 100 : undefined}
                            step={discountType === 'percentage' ? 1 : 0.01}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {discountType === 'percentage' ? '%' : '$'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {discountType === 'percentage' 
                            ? 'Enter discount percentage (0-100)' 
                            : 'Enter fixed discount amount'
                          }
                        </p>
                      </div>
                    </div>
                  )}
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
                
                {/* Calculator Button */}
                <div className="mb-4">
                  <Button 
                    className="w-full" 
                    onClick={handleCalculateQuote}
                    disabled={calculateQuoteMutation.isPending}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    {calculateQuoteMutation.isPending ? 'Calculating...' : 'Calculate Quote'}
                  </Button>
                  {calculateQuoteMutation.isError && (
                    <p className="text-red-500 text-sm mt-2">Error calculating quote. Check console for details.</p>
                  )}
                  {errorMessage && (
                    <p className="text-red-500 text-sm mt-2">Error: {errorMessage}</p>
                  )}
                  {showSuccessMessage && (
                    <p className="text-green-500 text-sm mt-2">Quote calculated successfully!</p>
                  )}
                </div>
                
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
                    
                    {/* Custom Add-ons */}
                    {quote.customAddons.map((addon, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">
                          {addon.name} (Custom)
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatMoney(addon.price)}
                        </span>
                      </div>
                    ))}
                    
                    {/* Postcode Adjustment */}
                    {quote && quote.suburbMultiplier && quote.suburbMultiplier !== 1.0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-blue-700">
                          Postcode adjustment (×{quote.suburbMultiplier})
                          {quote.suburbInfo && quote.suburbInfo.found && quote.suburbInfo.income ? 
                            ` (${quote.suburbInfo.suburb}, $${quote.suburbInfo.income.toLocaleString()})` : ''}
                        </span>
                        <span className="text-sm font-semibold text-blue-700">
                          +{formatMoney((quote.suburbMultiplier - 1) * (quote.preMultiplierSubtotal || 0))}
                        </span>
                        {/* Debug info */}
                        <div className="text-xs text-gray-500">
                          Debug: preMultiplierSubtotal={quote.preMultiplierSubtotal}, 
                          multiplier={quote.suburbMultiplier}, 
                          adjustment={((quote.suburbMultiplier - 1) * (quote.preMultiplierSubtotal || 0)).toFixed(2)}
                        </div>
                      </div>
                    )}
                    
                    {/* Discount */}
                    {quote.discountApplied && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-accent">
                          Less {discountType === 'percentage' ? `${quote.discountPercentage}%` : `$${quote.discountAmount}`} discount
                        </span>
                        <span className="text-sm font-semibold text-accent">
                          -{formatMoney(quote.discountAmount)}
                        </span>
                      </div>
                    )}
                    
                    {/* Subtotal */}
                    <div className="flex justify-between items-center py-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Subtotal</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatMoney(quote.netRevenue)}
                      </span>
                    </div>
                    
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
                    
                    {/* Deposit Information */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Deposit Required</span>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={depositPercentage}
                            onChange={(e) => setDepositPercentage(Number(e.target.value))}
                            className="w-16 h-8 text-sm"
                            min="0"
                            max="100"
                            step="5"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">Deposit Amount</span>
                        <span className="text-sm font-bold text-blue-700">
                          {formatMoney(quote.depositAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Remaining Balance</span>
                        <span className="text-sm text-gray-600">
                          {formatMoney(quote.total - quote.depositAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleSaveQuote}
                    disabled={saveQuoteMutation.isPending || !quote}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {saveQuoteMutation.isPending ? 'Saving...' : 'Save Quote'}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Email Quote
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleResetForm}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Reset Form
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowQuoteHistory(!showQuoteHistory)}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    {showQuoteHistory ? 'Hide' : 'View'} Quote History
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
                        <span className="text-sm text-gray-300">Base Revenue ({quote.totalHours}h × ${quote.hourlyRate})</span>
                        <span className="text-sm font-semibold text-white">${(quote.totalHours * quote.hourlyRate).toFixed(2)}</span>
                      </div>
                      {quote.suburbMultiplier && quote.suburbMultiplier !== 1 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Postcode Adjustment (×{quote.suburbMultiplier})</span>
                          <span className="text-sm font-semibold text-white">+${((quote.suburbMultiplier - 1) * (quote.preMultiplierSubtotal || 0)).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                        <span className="text-sm text-gray-300">Adjusted Revenue</span>
                        <span className="text-sm font-semibold text-white">${quote.subtotal.toFixed(2)}</span>
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
        
        {/* Quote History Section */}
        {showQuoteHistory && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <Calculator className="inline mr-2 text-primary" />
                  Quote History
                </h2>
                
                {quotesQuery.isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading quotes...</p>
                  </div>
                ) : quotesQuery.data?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No saved quotes yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotesQuery.data?.map((savedQuote: Quote, index: number) => (
                      <div key={savedQuote.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {savedQuote.service.charAt(0).toUpperCase() + savedQuote.service.slice(1)} Clean
                            </h3>
                            <p className="text-sm text-gray-600">
                              {savedQuote.bedrooms} bed, {savedQuote.bathrooms} bath
                              {savedQuote.addons && savedQuote.addons.length > 0 && 
                                ` • ${savedQuote.addons.length} add-on${savedQuote.addons.length > 1 ? 's' : ''}`
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              ${parseFloat(savedQuote.total).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(savedQuote.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-gray-600">Hours</p>
                            <p className="font-medium">{parseFloat(savedQuote.totalHours).toFixed(1)}h</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Rate</p>
                            <p className="font-medium">${parseFloat(savedQuote.hourlyRate).toFixed(0)}/hr</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Profit</p>
                            <p className="font-medium text-green-600">${parseFloat(savedQuote.profit).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Margin</p>
                            <p className="font-medium">{parseFloat(savedQuote.margin).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
