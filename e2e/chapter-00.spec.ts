import { expect, test } from '@playwright/test';

test('chapter zero introduces the counter, explains tests, and leads to task learning', async ({ page }) => {
  await page.goto('/');
  const counter = page.getByRole('region', { name: 'チャプター0のカウンター' });
  const count = counter.getByRole('status', { name: 'カウント' });
  await expect(count).toHaveText('0');
  await counter.getByRole('button', { name: '＋1', exact: true }).click();
  await counter.getByRole('button', { name: '＋1', exact: true }).click();
  await expect(count).toHaveText('2');
  await counter.getByRole('button', { name: 'リセット' }).click();
  await expect(count).toHaveText('0');
  const toggle = page.getByText('Vitestのコードと、一つずつの解説を開く', { exact: true });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'まずは3つに分けて読む' })).toBeVisible();
  await page.getByRole('button', { name: /チャプター1：タスク追加へ進む/ }).click();
  await expect(page.getByRole('heading', { name: 'タスクを追加して一覧に表示', exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: '要件を読んだ' })).not.toBeChecked();
});

test('chapter zero explanations fit a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByText('Vitestのコードと、一つずつの解説を開く', { exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'docs/walkthrough/chapter-00/mobile.png', fullPage: true });
});
