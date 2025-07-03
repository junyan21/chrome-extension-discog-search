import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Options Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Use the dev server URL instead of file protocol
    await page.goto('http://localhost:5173/options.html');
  });

  test('initial state', async ({ page }) => {
    await expect(page).toHaveScreenshot('options-initial.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.005, // Allow up to 0.5% pixel difference
    });
  });

  test('with API key entered', async ({ page }) => {
    // Wait for the form elements to be rendered
    await page.waitForSelector('#apiKey', { state: 'visible' });
    await page.waitForSelector('#modelInput', { state: 'visible' });
    
    await page.fill('#apiKey', 'test-api-key-1234567890');
    await page.fill('#modelInput', 'gemini-1.5-flash');
    
    await expect(page).toHaveScreenshot('options-with-api-key.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.005, // Allow up to 0.5% pixel difference
    });
  });

  test('saved state', async ({ page }) => {
    // Wait for the form elements to be rendered
    await page.waitForSelector('#apiKey', { state: 'visible' });
    await page.waitForSelector('#modelInput', { state: 'visible' });
    
    await page.fill('#apiKey', 'test-api-key-1234567890');
    await page.fill('#modelInput', 'gemini-1.5-flash');
    
    // Click the save button (first button in the button group)
    await page.click('button:has-text("設定を保存")');
    
    // Wait for status message to appear
    await page.waitForSelector('div[style*="background"]', { state: 'visible' });
    
    await expect(page).toHaveScreenshot('options-saved.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.005, // Allow up to 0.5% pixel difference
    });
  });

  test('hover states', async ({ page }) => {
    // Wait for buttons to be rendered
    await page.waitForSelector('button:has-text("設定を保存")', { state: 'visible' });
    
    await page.hover('button:has-text("設定を保存")');
    
    await expect(page).toHaveScreenshot('options-button-hover.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.005, // Allow up to 0.5% pixel difference
    });
  });

  test('focus states', async ({ page }) => {
    // Wait for the input to be rendered
    await page.waitForSelector('#apiKey', { state: 'visible' });
    
    await page.focus('#apiKey');
    
    await expect(page).toHaveScreenshot('options-input-focus.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.005, // Allow up to 0.5% pixel difference
    });
  });
});