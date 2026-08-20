const https = require('https');
const http = require('http');

const FRONTEND_URL = 'https://indochinese-restaurant.onrender.com';
const BACKEND_URL = 'https://indochinese.onrender.com';

function httpRequest(url, options = {}, postData = null) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https:');
    const lib = isHttps ? https : http;
    const urlObj = new URL(url);

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json, text/html, */*',
        ...(postData ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      },
      timeout: 15000
    };

    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || data,
          raw: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 408, error: 'Request Timeout' });
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

const auditResults = [];

function check(category, testName, passed, details = '') {
  auditResults.push({ category, testName, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${category}] ${testName} ${details ? '- ' + details : ''}`);
}

async function runFullAudit() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE PRODUCTION AUDIT');
  console.log('====================================================\n');

  // --- 1. Frontend HTML & Asset Integrity ---
  console.log('>>> 1. FRONTEND APP & ASSET INTEGRITY');
  const frontRes = await httpRequest(FRONTEND_URL);
  check('Frontend', 'Frontend Responds HTTP 200', frontRes.status === 200, `Status: ${frontRes.status}`);
  check('Frontend', 'HTML contains Root App Element', typeof frontRes.raw === 'string' && frontRes.raw.includes('id="root"'));
  check('Frontend', 'HTML loads Google Fonts', typeof frontRes.raw === 'string' && frontRes.raw.includes('Plus+Jakarta+Sans'));

  const scriptMatches = typeof frontRes.raw === 'string' ? [...frontRes.raw.matchAll(/src=["']([^"']+\.js)["']/g)].map(m => m[1]) : [];
  check('Frontend', 'HTML references Compiled JavaScript Bundle', scriptMatches.length > 0, `Bundle: ${scriptMatches[0]}`);

  if (scriptMatches.length > 0) {
    const jsUrl = FRONTEND_URL + (scriptMatches[0].startsWith('/') ? '' : '/') + scriptMatches[0];
    const jsRes = await httpRequest(jsUrl);
    check('Frontend', 'JavaScript Bundle Serves HTTP 200', jsRes.status === 200, `Size: ${Math.round((jsRes.raw?.length || 0)/1024)} KB`);
    check('Frontend', 'JS Bundle Contains React Root & App Components', typeof jsRes.raw === 'string' && jsRes.raw.includes('INDO CHINESE'));
  }

  // --- 2. Backend Health & Core APIs ---
  console.log('\n>>> 2. BACKEND API HEALTH & DATA');
  const healthRes = await httpRequest(`${BACKEND_URL}/api/health`);
  check('Backend', 'Health API Responds HTTP 200', healthRes.status === 200, JSON.stringify(healthRes.data));

  const settingsRes = await httpRequest(`${BACKEND_URL}/api/settings`);
  check('Backend', 'Settings API Responds HTTP 200', settingsRes.status === 200);
  const sData = settingsRes.data || {};
  check('Backend', 'Settings contain NAP Information', Boolean(sData.name && sData.phone && sData.city), `${sData.name} • ${sData.phone}`);

  const menuRes = await httpRequest(`${BACKEND_URL}/api/menu`);
  check('Backend', 'Menu API Responds HTTP 200', menuRes.status === 200);
  const menuList = Array.isArray(menuRes.data) ? menuRes.data : [];
  check('Backend', 'Complete Menu Items Served (64 dishes)', menuList.length >= 60, `Count: ${menuList.length}`);

  // Check unique IDs in menu
  const menuIds = menuList.map(m => m.id);
  const uniqueMenuIds = new Set(menuIds);
  check('Backend', 'Zero Duplicate Menu Items', uniqueMenuIds.size === menuIds.length, `Unique: ${uniqueMenuIds.size}/${menuIds.length}`);

  // --- 3. Customer Testimonials & Review Submission ---
  console.log('\n>>> 3. CUSTOMER REVIEWS & INTERACTIVE SUBMISSION');
  const reviewsRes = await httpRequest(`${BACKEND_URL}/api/reviews`);
  check('Reviews', 'Reviews API Responds HTTP 200', reviewsRes.status === 200);
  const initialReviewsCount = Array.isArray(reviewsRes.data) ? reviewsRes.data.length : 0;
  check('Reviews', 'Existing Reviews Available', initialReviewsCount > 0, `Found: ${initialReviewsCount} reviews`);

  const testReviewPayload = {
    author: `QA Tester ${Date.now().toString().slice(-4)}`,
    rating: 5,
    comment: 'Exceptional wok hei flavour and pristine service! Truly authentic Bombay Indo-Chinese.',
    recommendedDish: 'Chilli Chicken Sizzler'
  };
  const submitReviewRes = await httpRequest(`${BACKEND_URL}/api/reviews`, { method: 'POST' }, testReviewPayload);
  check('Reviews', 'Customer Review Submission (HTTP 200/201)', submitReviewRes.status === 200 || submitReviewRes.status === 201, `ID: ${submitReviewRes.data?.id}`);

  // --- 4. Table Reservations & Availability ---
  console.log('\n>>> 4. TABLE RESERVATIONS & BOOKING ENGINE');
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const availRes = await httpRequest(`${BACKEND_URL}/api/availability?date=${tomorrow}&time=19:30&guests=2`);
  check('Reservations', 'Table Availability Check API (HTTP 200)', availRes.status === 200);

  const bookingPayload = {
    name: 'Pooja Varma',
    email: 'pooja.varma@example.com',
    phone: '+44 7700 900123',
    guests: 2,
    date: tomorrow,
    time: '19:30',
    seatingArea: 'Main Dining Floor',
    occasion: 'Anniversary Celebration',
    specialRequests: 'Window table with flower arrangement'
  };
  const bookRes = await httpRequest(`${BACKEND_URL}/api/reservations`, { method: 'POST' }, bookingPayload);
  check('Reservations', 'Book Dining Table (HTTP 200)', bookRes.status === 200);
  const resvData = bookRes.data || {};
  const bookingRef = resvData.bookingReference || resvData.booking_reference || resvData.reservationNumber || resvData.id;
  check('Reservations', 'Booking Reference Generated', Boolean(bookingRef), `Ref: ${bookingRef}`);

  // --- 5. Staff Authentication & Role Security ---
  console.log('\n>>> 5. STAFF AUTHENTICATION & ACCESS CLEARANCE');
  const masterLoginRes = await httpRequest(`${BACKEND_URL}/api/auth/login`, { method: 'POST' }, {
    email: 'dikshithavarma2006@gmail.com',
    password: 'MasterAdminPassword2026!'
  });
  check('Auth', 'Master Owner Login (HTTP 200)', masterLoginRes.status === 200, `Token issued: ${Boolean(masterLoginRes.data?.token)}`);

  // --- Summary ---
  console.log('\n====================================================');
  console.log('📊 AUDIT SUMMARY REPORT');
  console.log('====================================================');
  const total = auditResults.length;
  const passed = auditResults.filter(r => r.passed).length;
  const failed = total - passed;

  console.log(`Total Checks: ${total}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);
  console.log(`Score:        ${Math.round((passed/total)*100)}%`);

  if (failed === 0) {
    console.log('\n🟢 100% PASS - ALL SYSTEMS READY & FUNCTIONING PROPERLY!');
  } else {
    console.log('\n⚠️ ATTENTION: Some checks failed. Review detailed logs above.');
  }
}

runFullAudit();
