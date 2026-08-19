import https from 'https';

const BACKEND_URL = 'https://indochinese.onrender.com';
const FRONTEND_URL = 'https://indochinese-restaurant.onrender.com';

function httpRequest(url: string, options: any = {}, body: any = null): Promise<{ status: number; data: any; headers: any }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(JSON.stringify(body)) } : {}),
        ...(options.headers || {})
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch {
          // raw string
        }
        resolve({ status: res.statusCode || 0, data: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

interface TestResult {
  id: number;
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];
let testCounter = 1;

function record(category: string, name: string, passed: boolean, details: string) {
  results.push({ id: testCounter++, category, name, passed, details });
  const symbol = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${symbol} [#${String(testCounter - 1).padStart(3, '0')}] [${category}] ${name} -> ${details}`);
}

async function runAudit() {
  console.log('================================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE MULTI-SCENARIO SYSTEM AUDIT');
  console.log(`Backend:  ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log('================================================================================\n');

  // ==================== 1. SERVER HEALTH & SEO ====================
  try {
    const health = await httpRequest(`${BACKEND_URL}/api/health`);
    record('Health & SEO', 'Backend Health Check', health.status === 200 && health.data?.status === 'healthy', `Status: ${health.status}`);
  } catch (e: any) {
    record('Health & SEO', 'Backend Health Check', false, e.message);
  }

  try {
    const fe = await httpRequest(FRONTEND_URL);
    record('Health & SEO', 'Frontend Main Page Load', fe.status === 200, `Status: ${fe.status}`);
  } catch (e: any) {
    record('Health & SEO', 'Frontend Main Page Load', false, e.message);
  }

  // ==================== 2. DIGITAL MENU & SEARCH ENGINE ====================
  try {
    const menuRes = await httpRequest(`${BACKEND_URL}/api/menu`);
    const isArray = Array.isArray(menuRes.data);
    record('Menu Engine', 'Full Menu Catalog Retrieval', menuRes.status === 200 && isArray && menuRes.data.length > 0, `Items: ${isArray ? menuRes.data.length : 0}`);
    
    // Check specific official menu categories
    const soups = await httpRequest(`${BACKEND_URL}/api/menu?category=soups`);
    record('Menu Engine', 'Category: Soups', soups.status === 200 && Array.isArray(soups.data), `Matched: ${Array.isArray(soups.data) ? soups.data.length : 0}`);

    const vegStarters = await httpRequest(`${BACKEND_URL}/api/menu?category=veg_starters`);
    record('Menu Engine', 'Category: Veg Starters', vegStarters.status === 200 && Array.isArray(vegStarters.data), `Matched: ${Array.isArray(vegStarters.data) ? vegStarters.data.length : 0}`);

    const nonvegStarters = await httpRequest(`${BACKEND_URL}/api/menu?category=nonveg_starters`);
    record('Menu Engine', 'Category: Non-Veg Starters', nonvegStarters.status === 200 && Array.isArray(nonvegStarters.data), `Matched: ${Array.isArray(nonvegStarters.data) ? nonvegStarters.data.length : 0}`);

    const riceNoodles = await httpRequest(`${BACKEND_URL}/api/menu?category=rice_noodles`);
    record('Menu Engine', 'Category: Fried Rice & Noodles', riceNoodles.status === 200 && Array.isArray(riceNoodles.data), `Matched: ${Array.isArray(riceNoodles.data) ? riceNoodles.data.length : 0}`);

    const combos = await httpRequest(`${BACKEND_URL}/api/menu?category=combos`);
    record('Menu Engine', 'Category: Combo Special', combos.status === 200 && Array.isArray(combos.data), `Matched: ${Array.isArray(combos.data) ? combos.data.length : 0}`);

    const chips = await httpRequest(`${BACKEND_URL}/api/menu?category=chips`);
    record('Menu Engine', 'Category: Ours Special Chips', chips.status === 200 && Array.isArray(chips.data), `Matched: ${Array.isArray(chips.data) ? chips.data.length : 0}`);

    // Search keywords
    const searchManchow = await httpRequest(`${BACKEND_URL}/api/menu?search=manchow`);
    record('Menu Engine', 'Search: "manchow"', searchManchow.status === 200, `Matched: ${Array.isArray(searchManchow.data) ? searchManchow.data.length : 0}`);

    const searchLollipop = await httpRequest(`${BACKEND_URL}/api/menu?search=lollipop`);
    record('Menu Engine', 'Search: "lollipop"', searchLollipop.status === 200, `Matched: ${Array.isArray(searchLollipop.data) ? searchLollipop.data.length : 0}`);

    const searchHakka = await httpRequest(`${BACKEND_URL}/api/menu?search=hakka`);
    record('Menu Engine', 'Search: "hakka"', searchHakka.status === 200, `Matched: ${Array.isArray(searchHakka.data) ? searchHakka.data.length : 0}`);

    const searchPaneer = await httpRequest(`${BACKEND_URL}/api/menu?search=paneer`);
    record('Menu Engine', 'Search: "paneer"', searchPaneer.status === 200, `Matched: ${Array.isArray(searchPaneer.data) ? searchPaneer.data.length : 0}`);
  } catch (e: any) {
    record('Menu Engine', 'Menu Queries', false, e.message);
  }

  // ==================== 3. TABLE AVAILABILITY ====================
  try {
    const avail1 = await httpRequest(`${BACKEND_URL}/api/reservations/availability?date=2026-09-10&time=19:00&guests=2`);
    record('Table Availability', 'Party of 2 at 19:00', avail1.status === 200 && avail1.data.available === true, `Available: ${avail1.data?.available}`);

    const avail2 = await httpRequest(`${BACKEND_URL}/api/reservations/availability?date=2026-09-10&time=20:00&guests=6`);
    record('Table Availability', 'Party of 6 at 20:00', avail2.status === 200 && avail2.data.available === true, `Available: ${avail2.data?.available}`);

    const avail3 = await httpRequest(`${BACKEND_URL}/api/reservations/availability?date=2026-09-10&time=13:00&guests=10`);
    record('Table Availability', 'Party of 10 at 13:00 (Banquet)', avail3.status === 200 && avail3.data.available === true, `Available: ${avail3.data?.available}`);
  } catch (e: any) {
    record('Table Availability', 'Availability Queries', false, e.message);
  }

  // ==================== 4. CUSTOMER BOOKING & RESCHEDULING FLOW ====================
  let createdRef = '';
  let createdId = '';
  try {
    const bookRes = await httpRequest(`${BACKEND_URL}/api/reservations`, { method: 'POST' }, {
      name: 'Simulated Customer',
      email: 'customer.test@example.com',
      phone: '072777586916',
      guests: 4,
      date: '2026-10-05',
      time: '19:30',
      seatingArea: 'Main Dining Floor',
      occasion: 'Birthday Celebration',
      specialRequests: 'Window seat if available'
    });

    createdRef = bookRes.data?.reservationNumber || '';
    createdId = bookRes.data?.id || '';
    record('Booking Flow', 'Create New Table Reservation', bookRes.status === 201 || bookRes.status === 200, `Voucher: ${createdRef}, ID: ${createdId}`);

    // Self-Service Lookup by Voucher Reference
    if (createdRef) {
      const lookupRes = await httpRequest(`${BACKEND_URL}/api/reservations/lookup?ref=${createdRef}`);
      const found = Array.isArray(lookupRes.data) && lookupRes.data.some((r: any) => r.reservationNumber === createdRef);
      record('Booking Flow', 'Self-Service Lookup by Voucher Ref', lookupRes.status === 200 && found, `Found: ${found}`);
    }

    // Reschedule Booking
    if (createdRef) {
      const reschRes = await httpRequest(`${BACKEND_URL}/api/reservations/${createdRef}/reschedule`, { method: 'PATCH' }, {
        date: '2026-10-06',
        time: '20:00'
      });
      record('Booking Flow', 'Customer Reschedule Reservation', reschRes.status === 200 && reschRes.data?.date === '2026-10-06', `New Date: ${reschRes.data?.date}, Time: ${reschRes.data?.time}`);
    }

    // Cancel Booking
    if (createdRef) {
      const cancelRes = await httpRequest(`${BACKEND_URL}/api/reservations/${createdRef}/cancel`, { method: 'PATCH' });
      record('Booking Flow', 'Customer Cancel Reservation', cancelRes.status === 200 && cancelRes.data?.status === 'cancelled', `Status: ${cancelRes.data?.status}`);
    }
  } catch (e: any) {
    record('Booking Flow', 'End-to-End Booking Scenario', false, e.message);
  }

  // ==================== 5. CUSTOMER INQUIRIES & CONTACT ====================
  try {
    const contactRes = await httpRequest(`${BACKEND_URL}/api/contact`, { method: 'POST' }, {
      name: 'Event Organizer',
      email: 'events@corporate.co.uk',
      phone: '072777586916',
      subject: 'Corporate Annual Dinner Catering',
      message: 'Looking to book catering for 50 guests with live Hakka wok station.'
    });
    record('Contact & Inquiries', 'Submit Customer Contact Inquiry', contactRes.status === 200 || contactRes.status === 201, `Status: ${contactRes.status}`);
  } catch (e: any) {
    record('Contact & Inquiries', 'Submit Inquiry', false, e.message);
  }

  // ==================== 6. ADMIN SECURITY, AUTH & DASHBOARD ====================
  let adminToken = '';
  try {
    // Negative test: invalid login
    const badLogin = await httpRequest(`${BACKEND_URL}/api/auth/login`, { method: 'POST' }, {
      email: 'admin@restaurant.com',
      password: 'wrongpassword'
    });
    record('Admin Security', 'Block Invalid Password', badLogin.status === 401, `Status: ${badLogin.status}`);

    // Positive test: valid admin login
    const goodLogin = await httpRequest(`${BACKEND_URL}/api/auth/login`, { method: 'POST' }, {
      email: 'admin@restaurant.com',
      password: 'admin123'
    });
    adminToken = goodLogin.data?.token || '';
    record('Admin Security', 'Master Admin Authentication', goodLogin.status === 200 && Boolean(adminToken), `Token Issued: ${Boolean(adminToken)}`);

    if (adminToken) {
      const authHeaders = { 'Authorization': `Bearer ${adminToken}` };

      // Admin Dashboard Metrics
      const dash = await httpRequest(`${BACKEND_URL}/api/admin/dashboard`, { headers: authHeaders });
      record('Admin Portal', 'Fetch Dashboard Real-Time Metrics', dash.status === 200, `Occupancy Rate: ${dash.data?.summary?.occupancyRate}%`);

      // Admin Reservations List
      const adminResvs = await httpRequest(`${BACKEND_URL}/api/admin/reservations`, { headers: authHeaders });
      const count = Array.isArray(adminResvs.data) ? adminResvs.data.length : 0;
      record('Admin Portal', 'Fetch All Reservations List', adminResvs.status === 200 && count > 0, `Total Live Bookings: ${count}`);

      // Admin Floor Tables List
      const adminTables = await httpRequest(`${BACKEND_URL}/api/admin/tables`, { headers: authHeaders });
      const tableCount = Array.isArray(adminTables.data) ? adminTables.data.length : 0;
      record('Admin Portal', 'Fetch All Floor Tables List', adminTables.status === 200 && tableCount === 20, `Total Tables: ${tableCount}`);

      // Admin Contact Messages List
      const adminMessages = await httpRequest(`${BACKEND_URL}/api/admin/contact`, { headers: authHeaders });
      record('Admin Portal', 'Fetch Contact Inquiries List', adminMessages.status === 200 && Array.isArray(adminMessages.data), `Total Messages: ${Array.isArray(adminMessages.data) ? adminMessages.data.length : 0}`);

      // Admin Users List
      const adminUsers = await httpRequest(`${BACKEND_URL}/api/admin/users`, { headers: authHeaders });
      record('Admin Portal', 'Fetch Admin Staff Users List', adminUsers.status === 200 && Array.isArray(adminUsers.data), `Total Admin Users: ${Array.isArray(adminUsers.data) ? adminUsers.data.length : 0}`);

      // Admin Status Update on Reservation
      if (createdId) {
        const updateStatus = await httpRequest(`${BACKEND_URL}/api/admin/reservations/${createdId}/status`, { method: 'PATCH', headers: authHeaders }, {
          status: 'confirmed'
        });
        record('Admin Portal', 'Admin Update Reservation Status', updateStatus.status === 200, `Updated Status: ${updateStatus.data?.status}`);
      }

      // Admin Assign Table to Reservation
      if (createdId) {
        const assignTable = await httpRequest(`${BACKEND_URL}/api/admin/reservations/${createdId}/table`, { method: 'PATCH', headers: authHeaders }, {
          tableId: 'T-01'
        });
        record('Admin Portal', 'Admin Assign Table to Booking', assignTable.status === 200, `Assigned Table: ${assignTable.data?.assignedTableId}`);
      }
    }
  } catch (e: any) {
    record('Admin Security', 'Admin Workflows', false, e.message);
  }

  // ==================== SUMMARY REPORT ====================
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const passRate = Math.round((passed / total) * 100);

  console.log('\n================================================================================');
  console.log(`📊 AUDIT SUMMARY: ${passed}/${total} SCENARIOS PASSED (${passRate}%)`);
  console.log('================================================================================');

  if (passed === total) {
    console.log('🏆 100% PERFECT: ALL AUDIT SCENARIOS PASSED WITH ZERO ERRORS!');
  } else {
    console.log('⚠️ Some scenarios failed. Review details above.');
  }
}

runAudit();
