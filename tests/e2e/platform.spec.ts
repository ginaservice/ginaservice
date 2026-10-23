/**
 * GinaService E2E Platform Verification Suite
 */
import { test, expect } from '@playwright/test'

test.describe('GinaService Platform E2E', () => {
  test('renders Arabic RTL landing page and GinaPay branding', async ({ page }) => {
    await page.goto(process.env.E2E_BASE_URL || 'http://localhost:3100')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('body')).toContainText('جينا')
  })
})
