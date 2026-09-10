import { test, expect } from '@playwright/test'

for (const width of [1280, 390]) {
  test(`スクロール位置に合わせてメニューと背景の上端が追従する（${width}px）`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.addInitScript(() => localStorage.setItem('hook-lab-sidebar-collapsed', 'true'))
    await page.goto('/')
    const headerHeight = width === 390 ? 64 : 76
    for (const scroll of [0, 32, 200, 0]) {
      await page.evaluate(y => window.scrollTo(0, y), scroll)
      await page.getByRole('button', { name: 'メニューを開く', exact: true }).click()
      for (const selector of ['.sidebar-clip', '.sidebar-backdrop']) {
        await expect.poll(() => page.locator(selector).evaluate(element => Math.round(element.getBoundingClientRect().top)))
          .toBe(Math.max(0, headerHeight - scroll))
      }
      await page.getByRole('button', { name: 'メニューを閉じる', exact: true }).click()
    }
  })
}
