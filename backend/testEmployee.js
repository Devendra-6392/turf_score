// Using global fetch (Node >=18)
(async () => {
  try {
    // Get list of turfs
    const turfsRes = await fetch('http://localhost:5000/api/turfs');
    const turfs = await turfsRes.json();
    if (!turfs.length) {
      console.log('No turfs found.');
      return;
    }
    const turfId = turfs[0].id;
    console.log('Using turfId:', turfId);
    // Create employee
    const empRes = await fetch('http://localhost:5000/api/admin/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John Doe', email: 'john@example.com', turfId })
    });
    // Fetch all employees for this turf
    const getRes = await fetch('http://localhost:5000/api/admin/employees');
    const getData = await getRes.json();
    console.log('GET employees status:', getRes.status);
    console.log('Employees list:', getData);

    console.log('Employee create status:', empRes.status);
    console.log('Response:', empData);
  } catch (e) {
    console.error('Error:', e);
  }
})();
