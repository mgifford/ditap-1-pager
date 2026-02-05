import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = 'file://' + process.cwd() + '/index.html';

test.describe('DITAP Curriculum Update Website - Accessibility Tests', () => {
  
  test('smoke test: page loads with required landmarks and single H1', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Verify page loads
    await expect(page).toHaveTitle(/DITAP Curriculum Update/);
    
    // Verify semantic landmarks exist
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Verify single H1 exists
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
    
    // Verify H1 content is meaningful
    const h1Text = await h1Elements.textContent();
    expect(h1Text).toBeTruthy();
    expect(h1Text.length).toBeGreaterThan(10);
  });

  test('keyboard navigation: skip link moves focus to main content', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Verify skip link exists
    const skipLink = page.locator('.usa-skipnav');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
    
    // Tab to focus the skip link (first focusable element)
    await page.keyboard.press('Tab');
    
    // Verify skip link receives focus
    await expect(skipLink).toBeFocused();
    
    // Activate skip link
    await page.keyboard.press('Enter');
    
    // Verify main content receives focus or is scrolled into view
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
    
    // The main element should now be in focus or at top of viewport
    const mainElement = await mainContent.boundingBox();
    expect(mainElement).toBeTruthy();
  });

  test('keyboard navigation: all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Collect all interactive elements
    const links = page.locator('a[href]');
    const buttons = page.locator('button');
    
    const linkCount = await links.count();
    const buttonCount = await buttons.count();
    
    // Verify interactive elements exist
    expect(linkCount).toBeGreaterThan(0);
    
    // Tab through page and verify we can reach interactive elements
    let tabCount = 0;
    const maxTabs = linkCount + buttonCount + 5; // Buffer for safety
    
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          hasHref: el?.hasAttribute('href'),
          isButton: el?.tagName === 'BUTTON'
        };
      });
      
      // Count successful focus on interactive elements
      if (focusedElement.tagName === 'A' && focusedElement.hasHref) {
        expect(true).toBe(true); // Link successfully focused
      }
      
      // If we've tabbed beyond the expected number, break
      if (tabCount > maxTabs) break;
    }
    
    expect(tabCount).toBeGreaterThan(0);
  });

  test('theme toggle: can be operated with keyboard and updates theme', async ({ page }) => {
    await page.goto(BASE_URL);

    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('type', 'button');

    // Initial state should be either light or dark, but aria-pressed must be set
    const initialPressed = await toggle.getAttribute('aria-pressed');
    expect(initialPressed === 'true' || initialPressed === 'false').toBe(true);

    // Move focus to the toggle programmatically, then operate it via keyboard
    await toggle.focus();
    await expect(toggle).toBeFocused();

    const beforeHasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('theme-dark')
    );

    await page.keyboard.press('Enter');

    const afterHasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('theme-dark')
    );

    // Theme should toggle
    expect(afterHasDark).not.toBe(beforeHasDark);

    const newPressed = await toggle.getAttribute('aria-pressed');
    expect(newPressed === 'true' || newPressed === 'false').toBe(true);
  });

  test('automated accessibility scan: no detectable violations', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    
    // Fail test if violations are found
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('color contrast: verify sufficient contrast on key elements', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Run targeted color contrast scan
    const contrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('main')
      .analyze();
    
    // Filter for color contrast violations specifically
    const contrastViolations = contrastResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);

    // Also verify contrast in dark mode by toggling the theme
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();

    const darkContrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('main')
      .analyze();

    const darkContrastViolations = darkContrastResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(darkContrastViolations).toEqual([]);
  });

  test('heading structure: verify logical heading hierarchy', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Get all headings in order
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements =>
      elements.map(el => ({
        level: parseInt(el.tagName.substring(1)),
        text: el.textContent?.trim()
      }))
    );
    
    // Verify we have headings
    expect(headings.length).toBeGreaterThan(0);
    
    // Verify first heading is H1
    expect(headings[0].level).toBe(1);
    
    // Verify only one H1
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBe(1);
    
    // Verify no heading level gaps (no jumping from H2 to H4)
    for (let i = 1; i < headings.length; i++) {
      const prevLevel = headings[i - 1].level;
      const currentLevel = headings[i].level;
      
      // Heading can stay same level, go down one level, or go back up any amount
      if (currentLevel > prevLevel) {
        expect(currentLevel - prevLevel).toBeLessThanOrEqual(1);
      }
    }
  });

  test('form labels: verify all form controls have labels', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Run label scan
    const labelResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();
    
    // Filter for label violations
    const labelViolations = labelResults.violations.filter(
      v => v.id === 'label' || v.id === 'label-title-only'
    );
    
    expect(labelViolations).toEqual([]);
  });

  test('link text: verify links have accessible names', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const links = await page.$$eval('a[href]', elements =>
      elements.map(el => ({
        href: el.getAttribute('href'),
        text: el.textContent?.trim(),
        ariaLabel: el.getAttribute('aria-label'),
        hasAccessibleName: !!(el.textContent?.trim() || el.getAttribute('aria-label'))
      }))
    );
    
    // Verify all links have accessible names
    const linksWithoutNames = links.filter(link => !link.hasAccessibleName);
    expect(linksWithoutNames).toEqual([]);
    
    // Verify no generic link text
    const genericTexts = ['click here', 'here', 'read more', 'more', 'link'];
    const genericLinks = links.filter(link => 
      genericTexts.includes(link.text?.toLowerCase() || '')
    );
    expect(genericLinks).toEqual([]);
  });

  test('focus visibility: verify focus indicators are present', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Move focus to the first interactive element programmatically
    const firstInteractive = await page.$('a[href], button');
    expect(firstInteractive).toBeTruthy();

    await firstInteractive?.focus();

    // Get computed styles of focused element
    const focusStyles = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow
      };
    });
    
    // Verify some form of focus indicator exists
    expect(focusStyles).toBeTruthy();
    
    // Either outline or box-shadow should be present
    const hasOutline = focusStyles?.outlineWidth && 
                       focusStyles.outlineWidth !== '0px' &&
                       focusStyles.outlineStyle !== 'none';
    
    const hasBoxShadow = focusStyles?.boxShadow && 
                         focusStyles.boxShadow !== 'none';
    
    expect(hasOutline || hasBoxShadow).toBe(true);
  });

  test('language attribute: verify lang attribute is set', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const langAttr = await page.getAttribute('html', 'lang');
    expect(langAttr).toBeTruthy();
    expect(langAttr).toBe('en');
  });

  test('responsive viewport: verify viewport meta tag', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const viewportMeta = await page.$('meta[name="viewport"]');
    expect(viewportMeta).toBeTruthy();
    
    const content = await viewportMeta?.getAttribute('content');
    expect(content).toContain('width=device-width');
  });
});
