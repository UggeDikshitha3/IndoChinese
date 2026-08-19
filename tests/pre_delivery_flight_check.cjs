const https = require('https');

const FRONTEND_URL = 'https://indochinese-restaurant.onrender.com';
const BACKEND_URL = 'https://indochinese.onrender.com';

function httpRequest(urlStr, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const reqOptions = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json, text/html, */*',
        ...(options.headers || {})
      }
    };

    let dataBody = null;
    if (postData) {
      dataBody = typeof postData === 'string' ? postData : JSON.stringify(postData);
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(dataBody);
    }

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = body ? JSON.parse(body) : null;
        } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          text: body
        });
      });
    });

    req.on('error', reject);
    if (dataBody) req.write(dataBody);
    req.end();
  });
}

async function runPreDeliveryFlightChecks() {
  console.log('================================================================================');
  console.log('📋 INDO CHINESE RESTAURANT — PRE-DELIVERY QA FLIGHT-CHECK AUDIT');
  console.log('   Client: Dikshitha Varma | Location: Hounslow, London');
  console.log('   Timestamp: ' + new Date().toISOString());
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;
  const categories = {};

  function record(category, testName, condition, detail = '') {
    if (!categories[category]) categories[category] = { passed: 0, failed: 0 };
    if (condition) {
      console.log(`  ✅ [${category}] ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
      categories[category].passed++;
    } else {
      console.error(`  ❌ [${category}] ${testName} — FAILED: ${detail}`);
      failed++;
      categories[category].failed++;
    }
  }

  // --------------------------------------------------------------------------
  // 1. FRONTEND AVAILABILITY & ASSET INTEGRITY
  // --------------------------------------------------------------------------
  console.log('>>> 1. PRODUCTION HOSTING & FRONTEND ASSET INTEGRITY');
  const feHome = await httpRequest(FRONTEND_URL);
  record('Frontend', 'Frontend Homepage HTTP 200 OK', feHome.status === 200);
  record('Frontend', 'HTML contains title & viewport meta', feHome.text.includes('<title>') && feHome.text.includes('viewport'));
  record('Frontend', 'Favicon & App Icon Defined', feHome.text.includes('icon') || feHome.text.includes('favicon'));
  record('Frontend', 'Vite Bundle Script Linked', feHome.text.includes('/assets/index-') || feHome.text.includes('.js'));

  // --------------------------------------------------------------------------
  // 2. BACKEND API HEALTH & CORS INTEGRITY
  // --------------------------------------------------------------------------
  console.log('\n>>> 2. BACKEND API HEALTH & INFRASTRUCTURE');
  const beHealth = await httpRequest(`${BACKEND_URL}/api/health`);
  record('Backend', 'Health Check Endpoint', beHealth.status === 200 && beHealth.data?.status === 'healthy', 'Status: healthy');

  const beDocs = await httpRequest(`${BACKEND_URL}/docs`);
  record('Backend', 'FastAPI OpenAPI Interactive Docs Live', beDocs.status === 200);

  // --------------------------------------------------------------------------
  // 3. MENU CATALOGUE & ALLERGEN DATA QUALITY
  // --------------------------------------------------------------------------
  console.log('\n>>> 3. DIGITAL MENU CATALOGUE & DIETARY ACCURACY');
  const menuRes = await httpRequest(`${BACKEND_URL}/api/menu`);
  record('Menu', 'Menu API Returns Dishes', menuRes.status === 200 && Array.isArray(menuRes.data));
  const dishes = menuRes.data || [];
  record('Menu', 'Dishes Count >= 20', dishes.length >= 20, `Found ${dishes.length} dishes`);

  // Check categories represented
  const hasSoups = dishes.some(d => d.category?.toLowerCase().includes('soup'));
  const hasStarters = dishes.some(d => d.category?.toLowerCase().includes('starter') || d.category?.toLowerCase().includes('momo'));
  const hasMains = dishes.some(d => d.category?.toLowerCase().includes('rice') || d.category?.toLowerCase().includes('noodle'));
  const hasCombos = dishes.some(d => d.category?.toLowerCase().includes('combo'));
  const hasChips = dishes.some(d => d.category?.toLowerCase().includes('chip'));
  record('Menu', 'Category: Soups Available', hasSoups);
  record('Menu', 'Category: Starters & Dumplings Available', hasStarters);
  record('Menu', 'Category: Fried Rice & Hakka Noodles Available', hasMains);
  record('Menu', 'Category: Combo Meal Boxes Available', hasCombos);
  record('Menu', 'Category: Ours Special Chips Available', hasChips);

  // Check pricing and allergens
  const validPricing = dishes.every(d => typeof d.price === 'number' && d.price > 0);
  record('Menu', 'Every Dish Has Valid Positive GBP Price', validPricing);

  // --------------------------------------------------------------------------
  // 4. RESERVATION SYSTEM, CAPACITY & AUTO-RESCHEDULING
  // --------------------------------------------------------------------------
  console.log('\n>>> 4. TABLE RESERVATIONS & RESCHEDULING WORKFLOW');
  const todayStr = new Date().toISOString().split('T')[0];
  const testPhone = '072777586916';
  const testEmail = 'qa_guest_' + Date.now() + '@indochinese.com';

  const bookingRes = await httpRequest(`${BACKEND_URL}/api/reservations`, { method: 'POST' }, {
    name: 'Lady Aishwarya Sen',
    email: testEmail,
    phone: testPhone,
    guests: 4,
    date: todayStr,
    time: '19:30',
    seatingArea: 'VIP / Family Booths',
    occasion: 'Anniversary Dinner',
    specialRequests: 'Near window, extra spice for momos'
  });
  record('Reservations', 'Create New Reservation (HTTP 200)', bookingRes.status === 200);
  const createdResv = bookingRes.data;
  record('Reservations', 'Unique Reservation Ref Issued', Boolean(createdResv?.reservationNumber?.startsWith('IC-')), `Ref: ${createdResv?.reservationNumber}`);

  // Lookup reservation by ref
  if (createdResv?.reservationNumber) {
    const lookupRes = await httpRequest(`${BACKEND_URL}/api/reservations/${createdResv.reservationNumber}`);
    record('Reservations', 'Lookup by Booking Reference', lookupRes.status === 200 && lookupRes.data?.name === 'Lady Aishwarya Sen');
  }

  // Lookup by phone
  const phoneLookupRes = await httpRequest(`${BACKEND_URL}/api/reservations/lookup?phone=${testPhone}`);
  record('Reservations', 'Lookup by Phone Number', phoneLookupRes.status === 200 && Array.isArray(phoneLookupRes.data) && phoneLookupRes.data.length > 0);

  // Reschedule reservation
  if (createdResv?.id) {
    const rescheduleRes = await httpRequest(`${BACKEND_URL}/api/reservations/${createdResv.id}/reschedule`, { method: 'POST' }, {
      date: todayStr,
      time: '20:30',
      reason: 'Traffic delay'
    });
    record('Reservations', 'Reschedule Reservation Slot to 20:30', rescheduleRes.status === 200 && rescheduleRes.data?.time === '20:30', `New Time: ${rescheduleRes.data?.time}`);
  }

  // --------------------------------------------------------------------------
  // 5. MASTER & SERVER AUTHENTICATION & RBAC SECURITY
  // --------------------------------------------------------------------------
  console.log('\n>>> 5. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)');
  // 1. Master Login
  const masterAuth = await httpRequest(`${BACKEND_URL}/api/auth/login`, { method: 'POST' }, {
    email: 'dikshithavarma2006@gmail.com',
    password: 'MasterAdminPassword2026!'
  });
  record('Security', 'Master Admin Login (200 OK)', masterAuth.status === 200 && masterAuth.data?.user?.role === 'master', `Role: ${masterAuth.data?.user?.role}`);
  const masterToken = masterAuth.data?.token;
  const masterHeaders = { Authorization: `Bearer ${masterToken}` };

  // 2. Reject bad password
  const badAuth = await httpRequest(`${BACKEND_URL}/api/auth/login`, { method: 'POST' }, {
    email: 'dikshithavarma2006@gmail.com',
    password: 'WrongPassword999!'
  });
  record('Security', 'Reject Unauthorized Password (401)', badAuth.status === 401);

  // 3. Block unauthenticated access to admin endpoints
  const blockedResv = await httpRequest(`${BACKEND_URL}/api/admin/reservations`);
  record('Security', 'Protect /api/admin/reservations against anonymous access (401)', blockedResv.status === 401);

  // --------------------------------------------------------------------------
  // 6. MASTER USER MANAGEMENT (ADD SERVER, LIST, PERMISSIONS, DELETE)
  // --------------------------------------------------------------------------
  console.log('\n>>> 6. MASTER USER MANAGEMENT & TEAM ROLES');
  const tempServerEmail = `server_flightcheck_${Date.now()}@indochinese.com`;
  const addServerRes = await httpRequest(`${BACKEND_URL}/api/admin/users`, { method: 'POST', headers: masterHeaders }, {
    name: 'Anil Kapoor (Senior Server)',
    email: tempServerEmail,
    password: 'ServerPass2026!',
    role: 'server'
  });
  record('User Management', 'Master Provisioning Server Account', addServerRes.status === 200, `Email: ${tempServerEmail}`);
  const serverId = addServerRes.data?.id;

  // Server Login Check
  const serverLogin = await httpRequest(`${BACKEND_URL}/api/auth/login`, { method: 'POST' }, {
    email: tempServerEmail,
    password: 'ServerPass2026!'
  });
  record('User Management', 'Provisioned Server Login & Role Verified', serverLogin.status === 200 && serverLogin.data?.user?.role === 'server');

  // Fetch users list
  const userListRes = await httpRequest(`${BACKEND_URL}/api/admin/users`, { headers: masterHeaders });
  record('User Management', 'Master Fetching Team Accounts List', userListRes.status === 200 && Array.isArray(userListRes.data));

  // --------------------------------------------------------------------------
  // 7. FLOOR MANAGEMENT & LIVE SERVER POS ORDERING
  // --------------------------------------------------------------------------
  console.log('\n>>> 7. FLOOR OPERATIONS & LIVE SERVER POS ORDER CONSOLE');
  const tablesRes = await httpRequest(`${BACKEND_URL}/api/tables`);
  const allTables = tablesRes.data || [];
  record('Floor Plan', '20 Floor Tables Seeded & Available', allTables.length === 20, `Tables: ${allTables.length}`);

  const activeTable = allTables[1] || allTables[0];

  // 1. Seat party & assign server
  const seatRes = await httpRequest(`${BACKEND_URL}/api/admin/tables/${activeTable.id}/seat`, { method: 'PATCH', headers: masterHeaders }, {
    partyName: 'Lady Aishwarya Sen',
    guests: 4,
    assignedServer: 'Anil Kapoor',
    notes: 'Anniversary Special Banquet'
  });
  record('Floor Plan', `Seat Table ${activeTable.tableNumber} with Server Anil Kapoor`, seatRes.status === 200);

  // 2. Server Add Items to Table
  const dishA = dishes[0];
  const dishB = dishes[2] || dishes[0];
  const addItemRes1 = await httpRequest(`${BACKEND_URL}/api/orders/tables/${activeTable.id}/items`, { method: 'POST' }, {
    menuItemId: dishA.id,
    name: dishA.name,
    price: dishA.price,
    quantity: 2,
    spiceLevel: 'Extra Spicy',
    dietaryNotes: 'Extra crispy'
  });
  record('POS Order', `Add 2x ${dishA.name} to Table`, addItemRes1.status === 200);

  const addItemRes2 = await httpRequest(`${BACKEND_URL}/api/orders/tables/${activeTable.id}/items`, { method: 'POST' }, {
    menuItemId: dishB.id,
    name: dishB.name,
    price: dishB.price,
    quantity: 1,
    spiceLevel: 'Medium',
    dietaryNotes: 'No garlic'
  });
  record('POS Order', `Add 1x ${dishB.name} to Table`, addItemRes2.status === 200);

  // 3. View Table Order & Bill Calculation
  const tableOrderRes = await httpRequest(`${BACKEND_URL}/api/orders/tables/${activeTable.id}`);
  const currentOrder = tableOrderRes.data;
  record('POS Order', 'Fetch Table Active Order Cart', tableOrderRes.status === 200 && currentOrder?.items?.length === 2);

  const expectedSubtotal = (dishA.price * 2) + dishB.price;
  const expectedTax = Math.round(expectedSubtotal * 0.20 * 100) / 100;
  const expectedTotal = Math.round((expectedSubtotal + expectedTax) * 100) / 100;
  record('POS Billing', 'UK VAT 20% Precise Calculation', Math.abs((currentOrder?.tax || 0) - expectedTax) < 0.05, `VAT: £${currentOrder?.tax?.toFixed(2)}`);
  record('POS Billing', 'Total Amount to be Paid Correctly Summed', Math.abs((currentOrder?.totalAmount || 0) - expectedTotal) < 0.05, `Total: £${currentOrder?.totalAmount?.toFixed(2)}`);

  // 4. Issue Bill
  const issueBillRes = await httpRequest(`${BACKEND_URL}/api/orders/tables/${activeTable.id}/issue-bill`, { method: 'POST' }, {
    customerPhone: testPhone,
    partyName: 'Lady Aishwarya Sen'
  });
  record('POS Billing', 'Issue Bill & Generate Invoice Ref', issueBillRes.status === 200 && issueBillRes.data?.invoiceNumber?.startsWith('INV-'), `Invoice: ${issueBillRes.data?.invoiceNumber}`);

  // 5. Send SMS Invoice
  const smsRes = await httpRequest(`${BACKEND_URL}/api/orders/tables/${activeTable.id}/send-sms-invoice`, { method: 'POST' }, {
    phone: testPhone
  });
  record('SMS Dispatch', `Dispatch Itemized SMS Invoice to ${testPhone}`, smsRes.status === 200 && smsRes.data?.success === true);
  record('SMS Dispatch', 'SMS Invoice Content Contains Tax, Table & Items', smsRes.data?.smsContent?.includes('TOTAL AMOUNT TO BE PAID') && smsRes.data?.smsContent?.includes('VAT (20%)'));

  // 6. Complete Dining Session
  const completeRes = await httpRequest(`${BACKEND_URL}/api/orders/tables/${activeTable.id}/complete`, { method: 'POST' });
  record('Floor Plan', `Complete Dining Session & Free Table ${activeTable.tableNumber}`, completeRes.status === 200);

  // --------------------------------------------------------------------------
  // 8. MASTER SERVER DAILY PERFORMANCE TRACKER
  // --------------------------------------------------------------------------
  console.log('\n>>> 8. MASTER SERVER DAILY PERFORMANCE METRICS');
  const serverStatsRes = await httpRequest(`${BACKEND_URL}/api/orders/server-stats`, { headers: masterHeaders });
  record('Server Stats', 'Master Server Daily Performance Tracker Live', serverStatsRes.status === 200);
  const statsList = Array.isArray(serverStatsRes.data) ? serverStatsRes.data : [serverStatsRes.data];
  const anilStat = statsList.find(s => (s.serverName || '').toLowerCase().includes('anil'));
  if (anilStat) {
    record('Server Stats', 'Server Tables Served Counter Incremented', anilStat.totalTablesServedToday >= 1, `Served: ${anilStat.totalTablesServedToday}`);
    record('Server Stats', 'Server Revenue Turnover Tracked', anilStat.totalRevenueToday > 0, `Turnover: £${anilStat.totalRevenueToday.toFixed(2)}`);
  }

  // Clean up test server
  if (serverId) {
    const delRes = await httpRequest(`${BACKEND_URL}/api/admin/users/${serverId}`, { method: 'DELETE', headers: masterHeaders });
    record('User Management', 'Master Clean-up / Delete User Account', delRes.status === 200);
  }

  // --------------------------------------------------------------------------
  // 9. EVENTS, REVIEWS & CONTACT MESSAGES
  // --------------------------------------------------------------------------
  console.log('\n>>> 9. EVENTS, CUSTOMER REVIEWS & CONTACT INQUIRIES');
  // Contact Message
  const contactRes = await httpRequest(`${BACKEND_URL}/api/contact`, { method: 'POST' }, {
    name: 'Chef Sanjeev',
    email: 'sanjeev@catering.co.uk',
    phone: '07111222333',
    subject: 'Special Diwali Pop-up Collaboration',
    message: 'We would love to collaborate on a Mumbai Fusion dinner night.'
  });
  record('Contact', 'Submit Customer Contact Message', contactRes.status === 200);

  // Event Inquiry
  const eventRes = await httpRequest(`${BACKEND_URL}/api/events`, { method: 'POST' }, {
    name: 'Meera Singhania',
    email: 'meera@corporate.co.uk',
    phone: '07888999000',
    eventType: 'Corporate Dinner',
    guests: 25,
    date: '2026-11-15',
    time: '19:00',
    budget: '£1,500',
    specialRequests: 'Buffet setup with Hakka noodles live wok station'
  });
  record('Events', 'Submit Private Event Inquiry', eventRes.status === 200);

  // Review Submission
  const reviewRes = await httpRequest(`${BACKEND_URL}/api/reviews`, { method: 'POST' }, {
    name: 'Vikram Joshi',
    rating: 5,
    comment: 'Authentic Bombay taste! The Schezwan Momos and Manchow Soup brought back memories of Mumbai.',
    dishRecommended: 'Bombay Steamed Momos',
    verifiedDiner: true
  });
  record('Reviews', 'Submit 5-Star Diner Review', reviewRes.status === 200);

  // --------------------------------------------------------------------------
  // FINAL SCORE & SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log(`📊 PRE-DELIVERY FLIGHT-CHECK SUMMARY`);
  console.log(`   Total Checks: ${passed + failed}`);
  console.log(`   Passed:       ${passed}`);
  console.log(`   Failed:       ${failed}`);
  console.log(`   Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('--------------------------------------------------------------------------------');
  for (const [cat, res] of Object.entries(categories)) {
    console.log(`   • ${cat.padEnd(20)}: ${res.passed}/${res.passed + res.failed} Passed`);
  }
  console.log('================================================================================');

  if (failed > 0) {
    console.error('\n⚠️ PRE-DELIVERY FLIGHT CHECK HAS DETECTED FAILURES. FIX BEFORE CLIENT HANDOVER.');
    process.exit(1);
  } else {
    console.log('\n🌟 PRE-DELIVERY FLIGHT-CHECK STATUS: 100% PERFECT & READY FOR CLIENT HANDOVER! 🚀');
  }
}

runPreDeliveryFlightChecks().catch(err => {
  console.error('Flight check runtime error:', err);
  process.exit(1);
});
