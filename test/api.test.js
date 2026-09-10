const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

let server;
let baseUrl;

function waitForServer(url, timeoutMs = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      fetch(url).then(() => resolve()).catch(() => {
        if (Date.now() - start > timeoutMs) reject(new Error('Server did not start in time'));
        else setTimeout(attempt, 100);
      });
    };
    attempt();
  });
}

async function post(body) {
  return fetch(`${baseUrl}/api/address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validAddress(overrides = {}) {
  return {
    line1: '12 MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    ...overrides,
  };
}

function validSubmission(overrides = {}) {
  return {
    candidateId: 90000 + Math.floor(Math.random() * 9999),
    current: validAddress(),
    permanent: validAddress({ line1: '45 Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016' }),
    sameAsPermanent: false,
    ...overrides,
  };
}

test.before(async () => {
  server = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await waitForServer('http://127.0.0.1:3002/api/address');
  baseUrl = 'http://127.0.0.1:3002';
});

test.after(() => {
  if (server) server.kill();
});

test('valid POST returns 201 Created', async () => {
  const res = await post(validSubmission());
  assert.equal(res.status, 201);
});

test('invalid state is rejected with 400 and is not accepted as a submission', async () => {
  const candidateId = 21001;
  const res = await post(validSubmission({
    candidateId,
    current: validAddress({ state: 'INVALID_STATE' }),
  }));
  assert.equal(res.status, 400);

});

test('7-digit pincode is rejected with 400', async () => {
  const res = await post(validSubmission({
    candidateId: 21002,
    current: validAddress({ pincode: '5600011' }),
  }));
  assert.equal(res.status, 400);
});

test('sameAsPermanent=true stores an exact copy of current address', async () => {
  const current = validAddress({ line1: '111 Valid Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' });
  const submittedPermanent = validAddress({ line1: 'TOTALLY DIFFERENT', city: 'Kolkata', state: 'West Bengal', pincode: '700016' });
  const res = await post(validSubmission({ candidateId: 21003, current, permanent: submittedPermanent, sameAsPermanent: true }));
  const body = await res.json();
  assert.deepEqual(body.permanent, current);
});

test('matchPercent uses all four address fields', async () => {
  const current = validAddress({ line1: 'Alpha Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' });
  const permanent = validAddress({ line1: 'Beta Road', city: 'Pune', state: 'Delhi', pincode: '400001' });
  const res = await post(validSubmission({ candidateId: 21004, current, permanent, sameAsPermanent: false }));
  const body = await res.json();
  assert.equal(body.matchPercent, 25);
});

test('surrounding whitespace is trimmed before comparison', async () => {
  const current = { line1: ' 12 MG Road ', city: ' Bengaluru ', state: ' Karnataka ', pincode: '560001' };
  const permanent = { line1: '12 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' };
  const res = await post(validSubmission({ candidateId: 21005, current, permanent, sameAsPermanent: false }));
  const body = await res.json();
  assert.equal(body.matchPercent, 100);
  assert.equal(body.current.line1, '12 MG Road');
  assert.equal(body.current.city, 'Bengaluru');
  assert.equal(body.current.state, 'Karnataka');
});

test('missing required current.city is rejected with 400', async () => {
  const res = await post(validSubmission({
    candidateId: 21006,
    current: validAddress({ city: '' }),
  }));
  assert.equal(res.status, 400);
});

test('sameAsPermanent defaults to false when omitted', async () => {
  const current = validAddress({ line1: 'Alpha Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' });
  const permanent = validAddress({ line1: 'Beta Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' });
  const { sameAsPermanent, ...withoutFlag } = validSubmission({ candidateId: 21007, current, permanent });
  const res = await post(withoutFlag);
  const body = await res.json();
  assert.equal(body.sameAsPermanent, false);
  assert.deepEqual(body.permanent, permanent);
});
