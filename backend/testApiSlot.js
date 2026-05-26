const prisma = require('./src/config/db');

async function testApi() {
  try {
    const turf = await prisma.turf.findFirst();
    if (!turf) {
      console.log('No turfs found in database.');
      return;
    }
    const turfId = turf.id;
    console.log(`Testing API on Turf: ${turf.name} (ID: ${turfId})`);

    const dateStr = '2026-05-28';
    const startTime = '08:00 AM';
    const endTime = '09:00 AM';
    const price = 1200;

    const payload = {
      date: dateStr,
      startTime,
      endTime,
      price
    };

    console.log('\n--- 1. Testing Valid Slot Creation ---');
    let response = await fetch(`http://localhost:5000/api/turfs/${turfId}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', data);

    console.log('\n--- 2. Testing Duplicate Slot Creation (Uniqueness validation) ---');
    response = await fetch(`http://localhost:5000/api/turfs/${turfId}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`Status: ${response.status}`);
    const duplicateData = await response.json();
    console.log('Response:', duplicateData);

    console.log('\n--- 3. Testing Missing Inputs Validation ---');
    response = await fetch(`http://localhost:5000/api/turfs/${turfId}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr }) // missing other fields
    });
    console.log(`Status: ${response.status}`);
    const missingData = await response.json();
    console.log('Response:', missingData);

  } catch (error) {
    console.error('API call failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApi();
