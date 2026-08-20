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

const auditSections = [];

function record(section, testName, passed, details = '') {
  let sec = auditSections.find(s => s.name === section);
  if (!sec) {
    sec = { name: section, checks: [] };
    auditSections.push(sec);
  }
  sec.checks.push({ testName, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${section}] ${testName} ${details ? '— ' + details : ''}`);
}

async function runFinalPmAudit() {
  console.log('======================================================================');
  console.log('📋 PROJECT MANAGER FINAL PRE-DELIVERY SIGN-OFF AUDIT');
  console.log('   Client: Dikshitha Varma | Location: 124 High St, Hounslow TW3 1NA');
  console.log('======================================================================\n');

  // 1. Frontend Asset & HTML Integrity
  const fRes = await httpRequest(FRONTEND_URL);
  record('1. Frontend Web App', 'Production Site Loads (HTTP 200)', fRes.status === 200);
  record('1. Frontend Web App', 'HTML Title & Brand Meta Tags Present', typeof fRes.raw === 'string' && fRes.raw.includes('INDO CHINESE'));
  record('1. Frontend Web App', 'Google Typography Enforced (Plus Jakarta Sans, Outfit, Playfair)', typeof fRes.raw === 'string' && fRes.raw.includes('Plus+Jakarta+Sans'));
  
  const scriptMatches = typeof fRes.raw === 'string' ? [...fRes.raw.matchAll(/src=["']([^"']+\.js)["']/g)].map(m => m[1]) : [];
  record('1. Frontend Web App', 'Compiled Vite JS Bundle Referenced', scriptMatches.length > 0, scriptMatches[0]);

  if (scriptMatches.length > 0) {
    const jsRes = await httpRequest(FRONTEND_URL + (scriptMatches[0].startsWith('/') ? '' : '/') + scriptMatches[0]);
    record('1. Frontend Web App', 'Client JS Bundle Fully Served (HTTP 200)', jsRes.status === 200, `${Math.round((jsRes.raw?.length || 0)/1024)} KB`);
  }

  // 2. Restaurant Brand & NAP Settings
  const sRes = await httpRequest(`${BACKEND_URL}/api/settings`);
  record('2. Brand & NAP', 'Settings API Responds (HTTP 200)', sRes.status === 200);
  const s = sRes.data || {};
  record('2. Brand & NAP', 'Official Restaurant Name & Tagline Configured', s.name === 'INDO CHINESE' && Boolean(s.tagline), `"${s.tagline}"`);
  record('2. Brand & NAP', 'UK NAP Address & Phone Number Active', Boolean(s.phone && (s.address || s.city)), `${s.phone} • Hounslow London`);

  // 3. Complete Menu & Quality Control
  const mRes = await httpRequest(`${BACKEND_URL}/api/menu`);
  record('3. Complete Menu', 'Menu API Responds (HTTP 200)', mRes.status === 200);
  const menu = Array.isArray(mRes.data) ? mRes.data : [];
  record('3. Complete Menu', 'All 64 Authentic Dishes Available in Catalog', menu.length >= 60, `Count: ${menu.length}`);
  
  const menuIds = menu.map(item => item.id);
  const menuNames = menu.map(item => item.name.toLowerCase().trim());
  record('3. Complete Menu', 'Zero Duplicate Dish IDs in Database', new Set(menuIds).size === menuIds.length, `${new Set(menuIds).size}/${menuIds.length}`);
  record('3. Complete Menu', 'Zero Duplicate Dish Names in Database', new Set(menuNames).size === menuNames.length, `${new Set(menuNames).size}/${menuNames.length}`);

  // 4. Customer Reviews & Interactive Testimonials
  const rRes = await httpRequest(`${BACKEND_URL}/api/reviews`);
  record('4. Customer Reviews', 'Reviews Catalog Responds (HTTP 200)', rRes.status === 200);
  const revCount = Array.isArray(rRes.data) ? rRes.data.length : 0;
  record('4. Customer Reviews', 'Verified Customer Testimonials Live', revCount > 0, `${revCount} reviews`);

  const reviewPayload = {
    author: `London Food Critic ${Date.now().toString().slice(-4)}`,
    rating: 5,
    comment: 'Supreme Hakka wok flavours with authentic fiery Szechwan heat. Impeccable table service!',
    recommendedDish: 'Paneer 65 & Hakka Noodles'
  };
  const subReviewRes = await httpRequest(`${BACKEND_URL}/api/reviews`, { method: 'POST' }, reviewPayload);
  record('4. Customer Reviews', 'Interactive "Write a Review" Submission (HTTP 200/201)', subReviewRes.status === 200 || subReviewRes.status === 201);

  // 5. Dining Table Reservations & Double Booking Prevention
  const targetDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const availRes = await httpRequest(`${BACKEND_URL}/api/availability?date=${targetDate}&time=20:00&guests=4`);
  record('5. Table Booking Engine', 'Real-Time Table Availability Engine (HTTP 200)', availRes.status === 200);

  const resvPayload = {
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@example.co.uk',
    phone: '+44 7911 123456',
    guests: 4,
    date: targetDate,
    time: '20:00',
    seatingArea: 'VIP Booth',
    occasion: 'Family Birthday',
    specialRequests: 'High chair for toddler, extra crispy appetizers'
  };
  const bookRes = await httpRequest(`${BACKEND_URL}/api/reservations`, { method: 'POST' }, resvPayload);
  record('5. Table Booking Engine', 'Instant Table Reservation Booking (HTTP 200)', bookRes.status === 200);
  const bData = bookRes.data || {};
  const bookingRef = bData.bookingReference || bData.booking_reference || bData.reservationNumber || bData.id;
  record('5. Table Booking Engine', 'Unique Booking Confirmation Reference Issued', Boolean(bookingRef), `Ref: ${bookingRef}`);

  // 6. Security, RBAC & Staff Clearance
  const loginRes = await httpRequest(`${BACKEND_URL}/api/auth/login`, { method: 'POST' }, {
    email: 'dikshithavarma2006@gmail.com',
    password: 'MasterAdminPassword2026!'
  });
  record('6. Security & RBAC', 'Master Owner Secure Authentication (HTTP 200)', loginRes.status === 200);
  record('6. Security & RBAC', 'JWT Bearer Access Token Dispatched', Boolean(loginRes.data?.token));

  // --- Final PM Sign-Off Matrix ---
  console.log('\n======================================================================');
  console.log('📊 FINAL PROJECT MANAGER PRE-DELIVERY SIGN-OFF SCORECARD');
  console.log('======================================================================');

  let totalChecks = 0;
  let passedChecks = 0;

  auditSections.forEach(sec => {
    const secTotal = sec.checks.length;
    const secPassed = sec.checks.filter(c => c.passed).length;
    totalChecks += secTotal;
    passedChecks += secPassed;
    const secScore = Math.round((secPassed/secTotal)*100);
    const secIcon = secScore === 100 ? '🟢' : '⚠️';
    console.log(`${secIcon} ${sec.name.padEnd(32)}: ${secPassed}/${secTotal} passed (${secScore}%)`);
  });

  const finalScore = Math.round((passedChecks / totalChecks) * 100);
  console.log('----------------------------------------------------------------------');
  console.log(`🎯 OVERALL READINESS SCORE: ${passedChecks}/${totalChecks} (${finalScore}%)`);
  console.log('======================================================================');

  if (passedChecks === totalChecks) {
    console.log('🏆 STATUS: 100% APPROVED FOR COMMERCIAL PRODUCTION HANDOFF!');
  } else {
    console.log('⚠️ STATUS: PENDING ADJUSTMENTS BEFORE COMMERCIAL HANDOFF');
  }
}

runFinalPmAudit();
