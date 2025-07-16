import fetch from 'node-fetch';

async function testAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/calculate-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: 'general',
        bedrooms: 1,
        bathrooms: 1,
        addons: [],
        customAddons: [{ name: 'Test', price: 20 }],
        hourlyRate: 60,
        cleanerRate: 35,
        customerPostcode: '2060',
        suburbMultiplier: 1.05
      })
    });

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI(); 