# Phase 2 test coverage

Each test targets one of the 10 confirmed Phase 1 bugs from `my-bug-report.md`.

| Bug | Test |
|---|---|
| wrong-dropdown-default-selection | `state dropdowns start with no selection` |
| wrong-format-display | `match percentage is displayed with a percent sign` |
| wrong-status-code | `valid POST returns 201 Created` |
| missing-enum-validation | `invalid state is rejected with 400...` |
| off-by-one-boundary | `7-digit pincode is rejected with 400` |
| wrong-persisted-default | `sameAsPermanent=true stores an exact copy...` |
| wrong-arithmetic | `matchPercent uses all four address fields` |
| missing-sanitization | `surrounding whitespace is trimmed...` |
| missing-required-field | `missing required current.city is rejected with 400` |
| missing-ui-feedback-guard | `invalid 5-digit pincode does not show a success message` |

The application source is intentionally left unchanged so the tests can fail against the buggy build.
