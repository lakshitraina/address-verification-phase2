const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');

let server;
let browser;
const baseUrl = 'http://127.0.0.1:3002';

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

async function freshPage() {
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  return page;
}

test.before(async () => {
  server = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await waitForServer(`${baseUrl}/api/address`);
  browser = await chromium.launch({ headless: true });
});

test.after(async () => {
  if (browser) await browser.close();
  if (server) server.kill();
});

test('state dropdowns start with no selection', async () => {
  const page = await freshPage();
  assert.equal(await page.locator('#current-state').inputValue(), '');
  assert.equal(await page.locator('#permanent-state').inputValue(), '');
  await page.close();
});

test('match percentage is displayed with a percent sign', async () => {
  const page = await freshPage();
  const cell = page.locator('#submissions-tbody tr').first().locator('td').nth(4);
  assert.match(await cell.textContent(), /%$/);
  await page.close();
});

test('invalid 5-digit pincode does not show a success message', async () => {
  const page = await freshPage();
  await page.fill('#candidateId', '21008');
  await page.fill('#current-line1', 'Valid Road');
  await page.fill('#current-city', 'Mumbai');
  await page.selectOption('#current-state', 'Maharashtra');
  await page.fill('#current-pincode', '40000');
  await page.check('#same-as-permanent');

  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);

  const toast = page.locator('#toast');
  assert.doesNotMatch(await toast.textContent(), /Address submitted successfully/i);
  await page.close();
});
