import { expect, test } from '@playwright/test'

test('the learning sequence survives reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /チャプター1：タスク追加へ進む/ }).click()
  await expect(page.getByRole('checkbox', { name: '実装した', exact: true })).toBeDisabled()
  for (const name of ['要件を読んだ', '実装した', 'UIで確認した', 'テストを追加・実行した']) await page.getByRole('checkbox', { name, exact: true }).check()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'テストを追加・実行した' })).toBeChecked()
  await page.getByRole('button', { name: /次の課題へ/ }).click()
  await expect(page.getByRole('heading', { name: '編集と削除を実装', exact: true })).toBeVisible()
})
test('mobile layout stays within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: /チャプター1：タスク追加へ進む/ }).click()
  await expect(page.getByRole('heading', { name: 'タスクを追加して一覧に表示', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('sidebar collapses and requirement results distinguish passed and todo', async ({ page }) => {
  await page.route('**/api/learning/test-results', route => route.fulfill({ json: { version: 1, catalog: { 'basic-01': [{ id: 'basic-01-01', title: '追加' }, { id: 'basic-01-02', title: '空入力' }] }, runs: { 'basic-01': { state: 'finished', startedAt: '', fingerprint: '', assertions: [
    { title: '[basic-01-01] 追加', fullName: '追加', state: 'passed', messages: [] },
    { title: '[basic-01-02] 空入力', fullName: '空入力', state: 'todo', messages: [] },
  ] } } } }))
  await page.goto('/')
  await page.getByRole('button', { name: /チャプター1：タスク追加へ進む/ }).click()
  await page.getByRole('button', { name: /メニューを閉じる/ }).click()
  await expect(page.locator('#curriculum-sidebar')).toBeHidden()
  const results = page.getByRole('article', { name: '要件ごとのテスト結果' })
  await expect(results.locator('li').filter({ hasText: 'basic-01-01' })).toContainText('✓ 成功')
  await expect(results.locator('li').filter({ hasText: 'basic-01-02' })).toContainText('未実装')
  await expect(results).toContainText('npm run test:learning -- basic-01')
  await page.reload()
  await expect(page.locator('#curriculum-sidebar')).toBeHidden()
  await page.getByRole('button', { name: /メニューを開く/ }).click()
  await expect(page.locator('#curriculum-sidebar')).toBeVisible()
})
