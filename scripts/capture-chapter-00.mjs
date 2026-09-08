import { chromium } from 'playwright';
import { access, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('http://127.0.0.1:5173');
  const counter = page.getByRole('region', { name: 'チャプター0のカウンター' });
  const value = counter.getByRole('status', { name: 'カウント' });
  const values = [await value.innerText()];
  await counter.getByRole('button', { name: '＋1', exact: true }).click();
  values.push(await value.innerText());
  await counter.getByRole('button', { name: '＋1', exact: true }).click();
  values.push(await value.innerText());
  await counter.screenshot({ path: 'docs/walkthrough/chapter-00/counter-two.png' });
  await counter.getByRole('button', { name: 'リセット' }).click();
  values.push(await value.innerText());
  await page.screenshot({ path: 'docs/walkthrough/chapter-00/desktop.png', fullPage: true });
  const originalExists = await access('docs/walkthrough/chapter-00/ui-observations.json').then(() => true, () => false);
  await writeFile(`docs/walkthrough/chapter-00/${originalExists ? 'latest-observations' : 'ui-observations'}.json`, JSON.stringify({ capturedAt: new Date().toISOString(), actions: ['初期', '＋1', '＋1', 'リセット'], values }, null, 2));
  console.log(values);
} finally { await browser.close(); }
