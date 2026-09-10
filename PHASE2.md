# Phase 2 — Automated regression tests

These tests are designed to fail against the original Phase 1 build because of the 10 confirmed bugs in the supplied bug report.

## Run

```bash
npm install
npx playwright install chromium
npm test
```

The tests intentionally assert the **specification-correct behavior**, so the unmodified Phase 1 application should produce failures. Do not modify the application before capturing the failing test run.

## Coverage

- `test/api.test.js`: API bugs
- `test/ui.test.js`: UI bugs

## Tools used

- Node.js built-in `node:test` and `node:assert/strict` — API regression tests.
- Playwright — browser/UI automation for the state dropdown, Match % display, and invalid-pincode feedback.
- VS Code (or another code editor) — writing and reviewing the tests.
