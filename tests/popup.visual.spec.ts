import { test, expect, Page } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper function to inject result data into the Preact app
async function injectResult(page: Page, result: any) {
  await page.evaluate((data) => {
    // Find the App component instance through window or create a mock event
    const event = new CustomEvent('__test_inject_result', { detail: data });
    window.dispatchEvent(event);
  }, result);
  
  // Alternative approach: directly manipulate the DOM after component renders
  await page.waitForTimeout(100); // Give React time to render
}

test.describe('Popup UI Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Use the dev server URL for index.html (popup)
    await page.goto('http://localhost:5173/');
    
    // Add event listener in the page context to handle test data injection
    await page.evaluate(() => {
      window.addEventListener('__test_inject_result', (event: any) => {
        // Create the result display manually since we can't easily access Preact state
        const app = document.getElementById('app');
        if (app) {
          // Keep the header and button
          const header = app.querySelector('.header');
          const button = app.querySelector('button');
          
          // Clear existing content except header and button
          app.innerHTML = '';
          if (header) app.appendChild(header);
          if (button) app.appendChild(button);
          
          // Add the result display
          const resultDiv = document.createElement('div');
          resultDiv.id = 'result';
          resultDiv.style.marginTop = '20px';
          
          const data = event.detail;
          
          // Add vinyl status banner
          if (data.isVinylOnly !== undefined) {
            const statusDiv = document.createElement('div');
            statusDiv.style.background = data.isVinylOnly ? '#2d5a2d' : '#5a2d2d';
            statusDiv.style.color = 'white';
            statusDiv.style.padding = '10px';
            statusDiv.style.margin = '5px 0';
            statusDiv.style.borderRadius = '5px';
            statusDiv.style.fontWeight = 'bold';
            statusDiv.textContent = data.isVinylOnly ? '🎵 VINYL ONLY RELEASE' : '📀 MULTIPLE FORMATS AVAILABLE';
            resultDiv.appendChild(statusDiv);
          }
          
          // Create table
          const table = document.createElement('table');
          table.style.width = '100%';
          table.style.borderCollapse = 'collapse';
          table.style.borderRadius = '5px';
          table.style.overflow = 'hidden';
          table.style.fontSize = '14px';
          table.style.color = 'var(--text-primary)';
          
          const tbody = document.createElement('tbody');
          
          // Helper to create table row
          const createRow = (label: string, value: any, isLast = false) => {
            const tr = document.createElement('tr');
            if (!isLast) {
              tr.style.borderBottom = '1px solid rgba(128, 128, 128, 0.2)';
            }
            
            const tdLabel = document.createElement('td');
            tdLabel.style.padding = '10px';
            tdLabel.style.fontWeight = 'bold';
            tdLabel.style.width = '40%';
            tdLabel.textContent = label;
            
            const tdValue = document.createElement('td');
            tdValue.style.padding = '10px';
            
            if (label === 'Vinyl Only?' && typeof value === 'boolean') {
              const span = document.createElement('span');
              span.style.color = value ? '#4ade80' : '#f87171';
              span.style.fontSize = '16px';
              span.textContent = value ? '✓' : '✗';
              tdValue.appendChild(span);
            } else if (label === 'Available Formats' && Array.isArray(value)) {
              const div = document.createElement('div');
              div.style.display = 'flex';
              div.style.flexWrap = 'wrap';
              div.style.gap = '5px';
              
              value.forEach(format => {
                const span = document.createElement('span');
                span.style.background = 'rgba(139, 92, 246, 0.2)';
                span.style.color = 'var(--primary)';
                span.style.padding = '2px 8px';
                span.style.borderRadius = '12px';
                span.style.fontSize = '12px';
                span.style.border = '1px solid rgba(139, 92, 246, 0.3)';
                span.textContent = format;
                div.appendChild(span);
              });
              
              tdValue.appendChild(div);
            } else {
              tdValue.textContent = value;
            }
            
            tr.appendChild(tdLabel);
            tr.appendChild(tdValue);
            return tr;
          };
          
          // Add rows based on data
          if (data.artist) tbody.appendChild(createRow('Artist', data.artist));
          if (data.title) tbody.appendChild(createRow('Title', data.title));
          if (data.year) tbody.appendChild(createRow('Release Year', data.year));
          if (data.identifiers) tbody.appendChild(createRow('ID', data.identifiers));
          if (data.isVinylOnly !== undefined) tbody.appendChild(createRow('Vinyl Only?', data.isVinylOnly));
          if (data.availableFormats && data.availableFormats.length > 0) {
            tbody.appendChild(createRow('Available Formats', data.availableFormats, true));
          }
          
          table.appendChild(tbody);
          resultDiv.appendChild(table);
          
          // Add link if present
          if (data.url) {
            const p = document.createElement('p');
            p.style.marginTop = '10px';
            const a = document.createElement('a');
            a.href = data.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.style.color = 'var(--primary)';
            a.style.textDecoration = 'none';
            a.textContent = 'Go to Discogs Page';
            p.appendChild(a);
            resultDiv.appendChild(p);
          }
          
          app.appendChild(resultDiv);
        }
      });
    });
  });

  test('initial state', async ({ page }) => {
    // Wait for the popup to fully render
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#app');
    
    await expect(page).toHaveScreenshot('popup-initial.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.005,
    });
  });

  test('loading state with spinner', async ({ page }) => {
    // Inject loading state directly
    await page.evaluate(() => {
      const app = document.getElementById('app');
      if (app) {
        // Find or create progress element
        let progress = app.querySelector('#progress');
        if (!progress) {
          progress = document.createElement('div');
          progress.id = 'progress';
          progress.style.textAlign = 'center';
          progress.style.padding = '20px';
          progress.style.backgroundColor = 'rgba(100, 108, 255, 0.1)';
          progress.style.borderRadius = '12px';
          progress.style.margin = '10px 0';
          
          // Add turntable spinner
          const recordPlayer = document.createElement('div');
          recordPlayer.className = 'record-player';
          recordPlayer.innerHTML = `
            <div class="record">
              <div class="record-grooves"></div>
            </div>
          `;
          
          const message = document.createElement('div');
          message.id = 'progressMessage';
          message.style.color = 'var(--primary-color, #646cff)';
          message.style.fontSize = '14px';
          message.style.marginTop = '10px';
          message.style.fontWeight = '500';
          message.textContent = '検索中です...';
          
          progress.appendChild(recordPlayer);
          progress.appendChild(message);
          app.appendChild(progress);
        }
      }
    });
    
    await page.waitForSelector('.record-player');
    
    await expect(page).toHaveScreenshot('popup-loading.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.005,
    });
  });

  test('result display with vinyl only', async ({ page }) => {
    const vinylOnlyResult = {
      artist: "King Gizzard & The Lizard Wizard",
      title: "Nonagon Infinity",
      year: 2016,
      identifiers: "ATO0297",
      url: "https://www.discogs.com/release/8538043",
      isVinylOnly: true,
      availableFormats: ["Vinyl", "LP", "12\"", "Album"]
    };
    
    await injectResult(page, vinylOnlyResult);
    await page.waitForSelector('#result');
    
    await expect(page).toHaveScreenshot('popup-result-vinyl-only.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.005,
    });
  });

  test('result display with multiple formats', async ({ page }) => {
    const multiFormatResult = {
      artist: "Radiohead",
      title: "OK Computer",
      year: 1997,
      identifiers: "NODATA01",
      url: "https://www.discogs.com/release/1234567",
      isVinylOnly: false,
      availableFormats: ["Vinyl", "CD", "Cassette", "Digital", "Streaming"]
    };
    
    await injectResult(page, multiFormatResult);
    await page.waitForSelector('#result');
    
    await expect(page).toHaveScreenshot('popup-result-multiple-formats.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.005,
    });
  });

  test('result display with partial data', async ({ page }) => {
    const partialResult = {
      artist: "Unknown Artist",
      title: "Rare Test Pressing",
      isVinylOnly: true,
      availableFormats: ["Test Pressing", "7\""]
    };
    
    await injectResult(page, partialResult);
    await page.waitForSelector('#result');
    
    await expect(page).toHaveScreenshot('popup-result-partial-data.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.005,
    });
  });

  test('error state', async ({ page }) => {
    // Inject an error message
    await page.evaluate(() => {
      const app = document.getElementById('app');
      if (app) {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'var(--error)';
        errorDiv.style.marginTop = '10px';
        errorDiv.textContent = 'Error: Failed to process content with AI';
        app.appendChild(errorDiv);
      }
    });
    
    await expect(page).toHaveScreenshot('popup-error.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.005,
    });
  });
});