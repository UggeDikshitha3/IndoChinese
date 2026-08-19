import http from 'http';

function makeRequest(options: http.RequestOptions, postData?: string): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string; json?: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          // not json
        }
        resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: data, json });
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

interface TestResult {
  category: string;
  testName: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function recordTest(category: string, testName: string, passed: boolean, details: string) {
  results.push({ category, testName, passed, details });
  const statusIcon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${statusIcon} [${category}] ${testName}: ${details}`);
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 RUNNING A-Z PRE-DEPLOYMENT COMPREHENSIVE AUDIT');
  console.log('====================================================\n');

  const BASE_HOST = 'localhost';
  const BASE_PORT = 3000;

  // ----------------------------------------------------
  // TEST SUITE A: Core Server & Health Endpoints
  // ----------------------------------------------------
  try {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/api/health',
      method: 'GET'
    });
    recordTest('A. Server Health', 'GET /api/health', res.statusCode === 200 && res.json?.status === 'ok', `Status: ${res.statusCode}, Body: ${JSON.stringify(res.json)}`);
  } catch (err: any) {
    recordTest('A. Server Health', 'GET /api/health', false, `Error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST SUITE B: Restaurant Settings & NAP Identity
  // ----------------------------------------------------
  try {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/api/settings',
      method: 'GET'
    });
    const s = res.json;
    const isIndoChinese = s?.name === 'INDO CHINESE';
    const hasAddress = s?.address?.includes('124 High Street') || s?.address?.includes('Hounslow');
    const hasPhone = Boolean(s?.phone);
    recordTest('B. Restaurant Identity', 'GET /api/settings (NAP Validation)', isIndoChinese && hasAddress && hasPhone, `Name: ${s?.name}, Address: ${s?.address}, Phone: ${s?.phone}`);
  } catch (err: any) {
    recordTest('B. Restaurant Identity', 'GET /api/settings', false, `Error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST SUITE C: Menu & Categories API
  // ----------------------------------------------------
  try {
    const resCats = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/api/menu/categories',
      method: 'GET'
    });
    recordTest('C. Menu Engine', 'GET /api/menu/categories', resCats.statusCode === 200 && Array.isArray(resCats.json) && resCats.json.length > 0, `Found ${resCats.json?.length} categories`);

    const resMenu = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/api/menu',
      method: 'GET'
    });
    const items = resMenu.json;
    const hasDishes = Array.isArray(items) && items.length >= 10;
    const hasDietaryFlags = items.every((i: any) => typeof i.isVeg === 'boolean' && typeof i.isSpicy === 'boolean');
    recordTest('C. Menu Engine', 'GET /api/menu (Items & Dietary Tags)', hasDishes && hasDietaryFlags, `Found ${items?.length} items with complete nutrition & spice indicators`);
  } catch (err: any) {
    recordTest('C. Menu Engine', 'GET /api/menu', false, `Error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST SUITE D: Real-Time Table Availability & Occupancy
  // ----------------------------------------------------
  try {
    const resStatus = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/api/tables/status',
      method: 'GET'
    });
    recordTest('D. Tables & Floor Plan', 'GET /api/tables/status (Live Occupancy)', resStatus.statusCode === 200 && typeof resStatus.json?.occupancyPercentage === 'number', `Total tables: ${resStatus.json?.totalTables}, Available: ${resStatus.json?.availableTables}, Occupancy: ${resStatus.json?.occupancyPercentage}%`);

    const resAvail = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: `/api/availability?date=2026-08-20&time=19:00&guests=4`,
      method: 'GET'
    });
    recordTest('D. Tables & Floor Plan', 'GET /api/availability (Slot Query)', resAvail.statusCode === 200 && typeof resAvail.json?.available === 'boolean', `Available: ${resAvail.json?.available}, Assigned: ${resAvail.json?.assignedTable || 'Dynamic'}`);
  } catch (err: any) {
    recordTest('D. Tables & Floor Plan', 'GET /api/tables', false, `Error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST SUITE E: End-to-End Table Booking & Validation
  // ----------------------------------------------------
  let createdRef = '';
  try {
    const bookingPayload = JSON.stringify({
      name: 'Deployment Test Guest',
      email: 'testguest@example.com',
      phone: '+447999888777',
      guests: 2,
      date: '2026-08-25',
      time: '19:30',
      seatingArea: 'Main Dining Floor',
      occasion: 'Anniversary',
      specialRequests: 'Window table requested for QA validation'
    });

    const resBooking = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/api/reservations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bookingPayload)
      }
    }, bookingPayload);

    createdRef = resBooking.json?.reservationNumber;
    const isBooked = resBooking.statusCode === 201 && Boolean(createdRef);
    recordTest('E. Table Reservation Flow', 'POST /api/reservations (Create Booking)', isBooked, `Status: ${resBooking.statusCode}, Reference: ${createdRef}`);

    // Lookup
    if (createdRef) {
      const resLookup = await makeRequest({
        hostname: BASE_HOST,
        port: BASE_PORT,
        path: `/api/reservations/lookup?ref=${encodeURIComponent(createdRef)}`,
        method: 'GET'
      });
      const match = Array.isArray(resLookup.json) ? resLookup.json[0] : resLookup.json;
      const isFound = resLookup.statusCode === 200 && match?.reservationNumber === createdRef;
      recordTest('E. Table Reservation Flow', 'GET /api/reservations/lookup (Manage My Booking)', isFound, `Found booking under ref ${createdRef}, Name: ${match?.name}`);
    }
  } catch (err: any) {
    recordTest('E. Table Reservation Flow', 'POST /api/reservations', false, `Error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST SUITE F: Admin Authentication & Protected Routes
  // ----------------------------------------------------
  let adminToken = '';
  try {
    // Negative test: unauthenticated access to admin endpoints
    const resUnauth = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/api/admin/reservations',
      method: 'GET'
    });
    recordTest('F. Security & RBAC', 'GET /api/admin/reservations (Unauthorized 401/403 Check)', resUnauth.statusCode === 401 || resUnauth.statusCode === 403, `Correctly blocked with status: ${resUnauth.statusCode}`);

    // Positive test: valid admin login
    const loginPayload = JSON.stringify({
      email: 'admin@restaurant.com',
      password: 'admin123'
    });
    const resLogin = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginPayload)
      }
    }, loginPayload);

    adminToken = resLogin.json?.token;
    const isLoginOk = resLogin.statusCode === 200 && Boolean(adminToken);
    recordTest('F. Security & RBAC', 'POST /api/auth/login (JWT Token Issuance)', isLoginOk, `Status: ${resLogin.statusCode}, User Role: ${resLogin.json?.user?.role}`);

    if (adminToken) {
      const resAdminResvs = await makeRequest({
        hostname: BASE_HOST,
        port: BASE_PORT,
        path: '/api/admin/reservations',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      recordTest('F. Security & RBAC', 'GET /api/admin/reservations (Authorized Access)', resAdminResvs.statusCode === 200 && Array.isArray(resAdminResvs.json), `Retrieved ${resAdminResvs.json?.length} reservations securely`);

      const resDashboard = await makeRequest({
        hostname: BASE_HOST,
        port: BASE_PORT,
        path: '/api/admin/dashboard',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      recordTest('F. Security & RBAC', 'GET /api/admin/dashboard (Admin Analytics)', resDashboard.statusCode === 200 && Boolean(resDashboard.json?.summary), `Occupancy rate: ${resDashboard.json?.summary?.occupancyRate}%, Today Bookings: ${resDashboard.json?.summary?.todayBookingsCount}`);
    }
  } catch (err: any) {
    recordTest('F. Security & RBAC', 'Admin Authentication Suite', false, `Error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST SUITE G: Contact, Reviews & Event Inquiries
  // ----------------------------------------------------
  try {
    const contactPayload = JSON.stringify({
      name: 'QA Test Runner',
      email: 'qa@indochinese.com',
      phone: '+442085709888',
      subject: 'Pre-deployment Verification',
      message: 'Automated contact delivery test'
    });
    const resContact = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/api/contact',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(contactPayload)
      }
    }, contactPayload);
    recordTest('G. Customer Inquiries', 'POST /api/contact', resContact.statusCode === 200 || resContact.statusCode === 201, `Status: ${resContact.statusCode}, Message: ${resContact.json?.message}`);

    const resReviews = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/api/reviews',
      method: 'GET'
    });
    recordTest('G. Customer Inquiries', 'GET /api/reviews', resReviews.statusCode === 200 && Array.isArray(resReviews.json), `Found ${resReviews.json?.length} verified customer reviews`);
  } catch (err: any) {
    recordTest('G. Customer Inquiries', 'Contact & Reviews', false, `Error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST SUITE H: SEO, Metadata, Sitemap & Robots.txt
  // ----------------------------------------------------
  try {
    const resRobots = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/robots.txt',
      method: 'GET'
    });
    const isRobotsValid = resRobots.statusCode === 200 && resRobots.body.includes('User-agent: *') && resRobots.body.includes('Sitemap:');
    recordTest('H. SEO & Crawlers', 'GET /robots.txt', isRobotsValid, `Status: ${resRobots.statusCode}, Content-Length: ${resRobots.body.length}`);

    const resSitemap = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/sitemap.xml',
      method: 'GET'
    });
    const isSitemapValid = resSitemap.statusCode === 200 && resSitemap.body.includes('<urlset') && resSitemap.body.includes('<url>');
    recordTest('H. SEO & Crawlers', 'GET /sitemap.xml', isSitemapValid, `Status: ${resSitemap.statusCode}, Valid XML urlset detected`);
  } catch (err: any) {
    recordTest('H. SEO & Crawlers', 'SEO Routes', false, `Error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST SUITE I: Frontend Static HTML & Bundle Serving
  // ----------------------------------------------------
  try {
    const resHtml = await makeRequest({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/',
      method: 'GET'
    });
    const hasHtmlDoctype = resHtml.body.includes('<!DOCTYPE html') || resHtml.body.includes('<html');
    const hasMetaTitle = resHtml.body.includes('INDO CHINESE');
    recordTest('I. Client HTML & Assets', 'GET / (Index HTML & Shell)', resHtml.statusCode === 200 && hasHtmlDoctype && hasMetaTitle, `Status: ${resHtml.statusCode}, Contains Title: ${hasMetaTitle}`);
  } catch (err: any) {
    recordTest('I. Client HTML & Assets', 'GET /', false, `Error: ${err.message}`);
  }

  // ----------------------------------------------------
  // SUMMARY REPORT
  // ----------------------------------------------------
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;

  console.log('\n====================================================');
  console.log(`📊 PRE-DEPLOYMENT TEST AUDIT REPORT: ${passedCount}/${total} PASSED`);
  console.log('====================================================\n');

  if (failedCount === 0) {
    console.log('🎉 ALL A-Z PRODUCTION READINESS TESTS PASSED (100% GREEN)! Ready for deployment.');
  } else {
    console.error(`⚠️ ${failedCount} tests failed. Immediate attention required.`);
  }
}

runTestSuite().catch(console.error);
