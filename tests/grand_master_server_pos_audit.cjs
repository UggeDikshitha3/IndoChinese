const https = require('https');

const BACKEND_URL = 'https://indochinese.onrender.com';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    };

    let postData = null;
    if (body) {
      postData = typeof body === 'string' ? body : JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = responseBody ? JSON.parse(responseBody) : null;
          resolve({ status: res.statusCode, data: parsed, raw: responseBody });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody, error: e.message });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runComprehensiveAudit() {
  console.log('========================================================================');
  console.log('🚀 RUNNING GRAND MASTER RESTAURANT & SERVER POS AUDIT SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. MASTER LOGIN
  console.log('--- TEST 1: Master Admin Authentication ---');
  const masterLoginRes = await request('POST', '/api/auth/login', {
    email: 'dikshithavarma2006@gmail.com',
    password: 'MasterAdminPassword2026!'
  });
  assert(masterLoginRes.status === 200, `Master login HTTP 200 (Got ${masterLoginRes.status})`);
  assert(masterLoginRes.data?.user?.role === 'master', `Master user role confirmed: ${masterLoginRes.data?.user?.role}`);
  const masterToken = masterLoginRes.data?.token;

  const authHeaders = { Authorization: `Bearer ${masterToken}` };

  // 2. MASTER USER MANAGEMENT (Add Server, Manager, Admin & Delete)
  console.log('\n--- TEST 2: Master Adding Server & Manager Team Accounts ---');
  const testServerEmail = `server_raj_${Date.now()}@indochinese.com`;
  const addServerRes = await request('POST', '/api/admin/users', {
    name: 'Rajesh Kumar (Head Server)',
    email: testServerEmail,
    password: 'ServerPassword123!',
    role: 'server'
  }, authHeaders);
  assert(addServerRes.status === 200, `Add Server Account (HTTP ${addServerRes.status})`);
  const createdServer = addServerRes.data?.user;

  // Verify created server can login
  const serverLoginRes = await request('POST', '/api/auth/login', {
    email: testServerEmail,
    password: 'ServerPassword123!'
  });
  assert(serverLoginRes.status === 200, `Created Server Login (HTTP ${serverLoginRes.status})`);
  assert(serverLoginRes.data?.user?.role === 'server', `Logged in Server role = ${serverLoginRes.data?.user?.role}`);

  // Fetch admin user list
  const usersListRes = await request('GET', '/api/admin/users', null, authHeaders);
  assert(usersListRes.status === 200, `Fetch Users List (HTTP ${usersListRes.status})`);
  assert(Array.isArray(usersListRes.data) && usersListRes.data.some(u => u.email === testServerEmail), 'Server exists in team list');

  // 3. TABLE SELECTION & SERVER ASSIGNMENT
  console.log('\n--- TEST 3: Floor Tables & Server Assignment ---');
  const tablesRes = await request('GET', '/api/tables');
  assert(tablesRes.status === 200 && Array.isArray(tablesRes.data), `Fetch floor tables (Count: ${tablesRes.data?.length})`);
  const testTable = tablesRes.data[0];
  console.log(`  Selected Test Table: ${testTable.tableNumber} (ID: ${testTable.id})`);

  // Seat party & assign server
  const seatRes = await request('PATCH', `/api/tables/${testTable.id}/seat`, {
    partyName: 'Mr. Verma & Family',
    guests: 4,
    assignedServer: 'Rajesh Kumar',
    notes: 'Anniversary celebration party'
  }, authHeaders);
  assert(seatRes.status === 200, `Seat Table & Assign Server Rajesh (HTTP ${seatRes.status})`);

  // 4. SERVER TAKING ORDERS (Adding Items to Table)
  console.log('\n--- TEST 4: Server Taking Order & Adding Menu Items ---');
  const menuRes = await request('GET', '/api/menu');
  assert(menuRes.status === 200 && Array.isArray(menuRes.data), `Fetch menu (Dishes: ${menuRes.data?.length})`);
  const dish1 = menuRes.data[0];
  const dish2 = menuRes.data[1] || menuRes.data[0];

  // Add Item 1
  const addItem1Res = await request('POST', `/api/orders/tables/${testTable.id}/items`, {
    menuItemId: dish1.id,
    name: dish1.name,
    price: dish1.price,
    quantity: 2,
    spiceLevel: 'Extra Spicy',
    dietaryNotes: 'Extra crispy with green chillies'
  });
  assert(addItem1Res.status === 200, `Add Dish 1: 2x ${dish1.name} (HTTP ${addItem1Res.status})`);

  // Add Item 2
  const addItem2Res = await request('POST', `/api/orders/tables/${testTable.id}/items`, {
    menuItemId: dish2.id,
    name: dish2.name,
    price: dish2.price,
    quantity: 1,
    spiceLevel: 'Medium',
    dietaryNotes: 'No coriander'
  });
  assert(addItem2Res.status === 200, `Add Dish 2: 1x ${dish2.name} (HTTP ${addItem2Res.status})`);

  // 5. VIEW ACTIVE TABLE ORDER CART & RUNNING BILL
  console.log('\n--- TEST 5: Table Order Cart & Running Bill Calculation ---');
  const getOrderRes = await request('GET', `/api/orders/tables/${testTable.id}`);
  assert(getOrderRes.status === 200, `Fetch Active Table Order (HTTP ${getOrderRes.status})`);
  const activeOrder = getOrderRes.data;
  assert(activeOrder?.items?.length === 2, `Active order item count = ${activeOrder?.items?.length}`);
  console.log(`  Current Subtotal: £${activeOrder?.subtotal?.toFixed(2)} | UK VAT (20%): £${activeOrder?.tax?.toFixed(2)} | Total: £${activeOrder?.totalAmount?.toFixed(2)}`);

  // 6. ISSUE BILL TO TABLE
  console.log('\n--- TEST 6: Issuing Bill & Total Amount to be Paid ---');
  const issueBillRes = await request('POST', `/api/orders/tables/${testTable.id}/issue-bill`, {
    customerPhone: '072777586916',
    partyName: 'Mr. Verma & Family'
  });
  assert(issueBillRes.status === 200, `Issue Bill (HTTP ${issueBillRes.status})`);
  assert(issueBillRes.data?.invoiceNumber?.startsWith('INV-'), `Invoice generated: ${issueBillRes.data?.invoiceNumber}`);
  assert(issueBillRes.data?.totalAmount > 0, `Total Amount to be paid: £${issueBillRes.data?.totalAmount?.toFixed(2)}`);

  // 7. DISPATCH SMS INVOICE TO CUSTOMER PHONE
  console.log('\n--- TEST 7: Sending SMS Invoice to Customer Mobile ---');
  const smsRes = await request('POST', `/api/orders/tables/${testTable.id}/send-sms-invoice`, {
    phone: '072777586916'
  });
  assert(smsRes.status === 200, `Send SMS Invoice (HTTP ${smsRes.status})`);
  assert(smsRes.data?.success === true, `SMS dispatched successfully to ${smsRes.data?.recipientPhone}`);
  console.log(`  SMS Preview Content:\n    ${smsRes.data?.smsContent.replace(/\n/g, '\n    ')}`);

  // 8. COMPLETE TABLE DINING SESSION
  console.log('\n--- TEST 8: Complete Dining Session & Free Table ---');
  const completeRes = await request('POST', `/api/orders/tables/${testTable.id}/complete`);
  assert(completeRes.status === 200, `Complete Dining Session (HTTP ${completeRes.status})`);

  // Verify table is now available
  const tableCheckRes = await request('GET', `/api/tables/${testTable.id}`);
  assert(tableCheckRes.status === 200 && tableCheckRes.data?.status === 'available', `Table status reset to available`);

  // 9. DAILY SERVER PERFORMANCE TRACKER (MASTER MONITOR)
  console.log('\n--- TEST 9: Master Viewing Server Daily Performance Stats ---');
  const statsRes = await request('GET', '/api/orders/server-stats', null, authHeaders);
  assert(statsRes.status === 200, `Fetch Server Performance Stats (HTTP ${statsRes.status})`);
  const serverStatList = Array.isArray(statsRes.data) ? statsRes.data : [statsRes.data];
  const rajeshStat = serverStatList.find(s => s.serverName.toLowerCase().includes('rajesh'));
  if (rajeshStat) {
    console.log(`  Server: ${rajeshStat.serverName}`);
    console.log(`  • Tables Served Today: ${rajeshStat.totalTablesServedToday}`);
    console.log(`  • Total Dishes Ordered: ${rajeshStat.ordersTakenToday}`);
    console.log(`  • Today's Revenue Turnover: £${rajeshStat.totalRevenueToday.toFixed(2)}`);
    console.log(`  • Efficiency Score: ${rajeshStat.efficiencyScore}`);
    assert(rajeshStat.totalTablesServedToday >= 1, `Rajesh tables served count incremented to ${rajeshStat.totalTablesServedToday}`);
  }

  // 10. MASTER DELETING TEAM USER
  console.log('\n--- TEST 10: Master Deleting Team User ---');
  const deleteRes = await request('DELETE', `/api/admin/users/${createdServer.id}`, null, authHeaders);
  assert(deleteRes.status === 200, `Delete Server User (HTTP ${deleteRes.status})`);

  // Verify user is gone
  const verifyUsersRes = await request('GET', '/api/admin/users', null, authHeaders);
  const stillExists = verifyUsersRes.data?.some(u => u.id === createdServer.id);
  assert(!stillExists, 'Deleted user verified removed from database');

  console.log('\n========================================================================');
  console.log(`GRAND AUDIT COMPLETED: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================');
}

runComprehensiveAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
