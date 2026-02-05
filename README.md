# DITAP Curriculum Update – Project Website

Single-page static website for the DITAP Curriculum Update initiative.

## Purpose

This website communicates the need for updated federal acquisition training in response to recent Federal Acquisition Regulation (FAR) changes that emphasize outcomes-based and performance-based procurement for digital services.

Target audience: Federal, state, and local procurement officers, contracting officers, and acquisition professionals.

## Project Repository

Full curriculum materials and updates:  
**https://github.com/usds/ditap-curriculum-update**

## Viewing the Website

Open `index.html` in a modern web browser.

No build step is required.

### Locally

```bash
open index.html
```

Or use a simple HTTP server:

```bash
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

## Running Accessibility Tests

Automated accessibility tests use Playwright with axe-core.

### Prerequisites

Node.js 18 or later.

### Install Dependencies

```bash
npm install
```

This installs Playwright and the axe-core integration.

### Install Browsers

```bash
npx playwright install
```

### Run Tests

```bash
npm test
```
This runs all accessibility tests in Chromium using Playwright.

To run tests in additional browsers such as Firefox or WebKit, update `playwright.config.js` to enable those projects and run:

```bash
npx playwright install
```

### Run Tests in Headed Mode

To see the browser while tests execute:

```bash
npm run test:headed
```

### Run Tests in UI Mode

For interactive debugging:

```bash
npm run test:ui
```

## What the Tests Cover

The test suite includes:

1. **Smoke test**: Page loads, semantic landmarks present, single H1 exists
2. **Keyboard navigation**: Skip link functions, all interactive elements keyboard-accessible
3. **Automated accessibility scan**: Checks for WCAG 2.2 AA violations using axe-core
4. **Color contrast**: Verifies sufficient contrast on key elements
5. **Heading structure**: Confirms logical heading hierarchy with no skipped levels
6. **Form labels**: Ensures all form controls have programmatic labels (if forms exist)
7. **Link text**: Verifies all links have accessible names and avoids generic text
8. **Focus visibility**: Confirms visible focus indicators on interactive elements
9. **Language attribute**: Checks `lang` attribute is set on `<html>`
10. **Responsive viewport**: Verifies viewport meta tag

## What Automated Testing Does Not Guarantee

Automated accessibility testing detects many common issues but cannot replace manual review.

Automated tests **cannot** verify:
- Logical reading order
- Meaningful alt text (only presence, not quality)
- Keyboard trap scenarios in complex interactions
- Cognitive load or plain language effectiveness
- Real assistive technology compatibility

**Manual testing with assistive technologies remains necessary for comprehensive accessibility validation.**

## Accessibility Compliance

This website aims to meet WCAG 2.2 Level AA and is backed by automated accessibility tests.

Automated tests are configured to fail when axe-core reports detectable WCAG issues, but they do not provide certification or guaranteed compliance.

Specific accessibility features:
- Semantic HTML5 landmarks (`<header>`, `<main>`, `<footer>`)
- Single H1 with logical heading hierarchy
- Visible skip link for keyboard navigation
- Keyboard operability for all interactive elements
- Sufficient color contrast (tested)
- Visible focus states
- Valid `lang` attribute
- Responsive viewport configuration

**No accessibility overlays or third-party "fixer" widgets are used.**

## Design System

This site uses the **U.S. Web Design System (USWDS)** version 3.7.1.

USWDS is loaded via CDN for simplicity. For production use, consider hosting USWDS assets directly.

Custom CSS (`styles.css`) provides minimal layout and visual distinction without altering USWDS core components or reducing accessibility.

## Content Policy

Content is written in plain language for procurement professionals familiar with the Federal Acquisition Regulation.

The messaging is direct and policy-aware. Marketing language is avoided.

## Attribution

This project is developed and maintained by **CivicActions** in support of DITAP and the U.S. Digital Service.

CivicActions serves as a delivery partner and steward for this work.

## License

Content: [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)  
Code: [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)

## Questions or Contributions

Visit the main repository:  
**https://github.com/usds/ditap-curriculum-update**

Federal employees and contractors with relevant expertise may submit issues or contribute via pull request.
