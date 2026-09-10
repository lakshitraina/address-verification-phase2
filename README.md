# Address Verification App — Phase 2

Automated regression tests and fixes for the Address Verification application developed as part of the Springworks bug-hunt challenge.

## Overview

Phase 1 involved testing the assigned Address Verification application and identifying defects against the provided specification.

10 bugs were successfully identified and reported during Phase 1.

Phase 2 required writing automated tests that reproduce those bugs against the original implementation. The bugs were then fixed in the application, and the same tests were run again to verify the fixes.

## Phase 2 Results

### Before Fixes

The regression suite was run against the original application:

- Tests: 11
- Passed: 0
- Failed: 11

The failures corresponded to the confirmed Phase 1 defects.

### After Fixes

After implementing the fixes:

- Tests: 11
- Passed: 11
- Failed: 0
- Skipped: 0

All existing regression tests pass successfully.

## Confirmed Bugs and Fixes

| # | Bug | Area | Status |
|---|---|---|---|
| 1 | Wrong dropdown default selection | UI | Fixed |
| 2 | Wrong Match % display format | UI | Fixed |
| 3 | Wrong POST status code | API | Fixed |
| 4 | Missing state enum validation | API | Fixed |
| 5 | Pincode boundary validation | API | Fixed |
| 6 | Incorrect `sameAsPermanent` behavior | API | Fixed |
| 7 | Incorrect match percentage arithmetic | API | Fixed |
| 8 | Missing address sanitization | API | Fixed |
| 9 | Missing required-field validation | API | Fixed |
| 10 | Incorrect UI success feedback | UI | Fixed |

## Test Coverage

### API Tests

The API regression tests verify:

- Successful POST returns HTTP 201
- Invalid states are rejected
- Invalid 7-digit pincodes are rejected
- `sameAsPermanent=true` copies the current address
- `sameAsPermanent` defaults to false
- Match percentage uses all four address fields
- Address whitespace is sanitized
- Required address fields are validated

### UI Tests

The UI regression tests verify:

- State dropdowns start without a preselected state
- Match percentage is displayed with `%`
- Invalid pincode submissions do not display a false success message

## Project Structure

```text
.
├── public/
│   ├── app.js
│   ├── index.html
│   ├── style.css
│   └── report-widget.js
│
├── test/
│   ├── api.test.js
│   └── ui.test.js
│
├── server.js
├── data.js
├── isolation.js
├── package.json
├── package-lock.json
├── PHASE2.md
├── TEST-COVERAGE.md
└── README.md
```

## Running the Tests

### Prerequisites

- Node.js
- npm

### Install dependencies

```bash
npm install
```

### Install Playwright Chromium

```bash
npx playwright install chromium
```

### Run the regression suite

```bash
npm test
```

Expected result after applying the fixes:

```text
11 tests
11 passed
0 failed
```

## Development Approach

The original application code was preserved while regression tests were created to reproduce the Phase 1 defects.

The fixes were then implemented in the application code without modifying, weakening, skipping, or deleting the regression tests.

This provides the following verification flow:

```text
Original Application
        ↓
Regression Tests
        ↓
11 Failures
        ↓
Application Fixes
        ↓
Same Regression Tests
        ↓
11 Passing
```

## Tools Used

- **Node.js `node:test`** — API automated testing
- **Node.js `node:assert/strict`** — test assertions
- **Playwright** — browser/UI automated testing
- **VS Code** — development and test review
- **Git / GitHub** — version control and submission

## Git History

The repository preserves the progression of the Phase 2 work:

```text
Fix Phase 1 bugs
Ignore node_modules
Add Phase 2 bug reproduction tests
```

The original regression-test commit is preserved so the repository history demonstrates that the tests were created against the buggy implementation before the application fixes were applied.
