import { chromium, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

// Only synthetic contacts are used. Every email request is intercepted locally.
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext()
const page = await context.newPage()
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173'
const runtimeErrors = []
page.on('pageerror', error => runtimeErrors.push(error.message))
await mkdir('artifacts', { recursive: true })
let submissions = []
let behavior = 'success'
await context.route('https://formsubmit.co/**', async route => {
  submissions.push(route.request().postDataJSON())
  if (behavior === 'network') return route.abort('failed')
  if (behavior === 'rejected') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: 'false' }) })
  await new Promise(resolve => setTimeout(resolve, 250))
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: 'true' }) })
})

try {
  for (const width of [320, 375, 390, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base)
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('h1')).toContainText('Que seja aqui.')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    if (overflow) throw new Error(`Horizontal overflow at ${width}px`)
    for (const img of await page.locator('img').all()) {
      await img.scrollIntoViewIfNeeded()
      await expect(img).toHaveJSProperty('complete', true)
      if (!(await img.evaluate(element => element.naturalWidth > 0))) throw new Error('Broken image')
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    if ([390, 1440].includes(width)) await page.screenshot({ path: `artifacts/${width === 390 ? 'mobile' : 'desktop'}.png`, fullPage: true })
    console.log(`Layout and images OK: ${width}px`)
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(base)
  await page.locator('.mobile-cta a').click()
  await expect(page.locator('.mobile-cta')).toBeHidden()
  await page.locator('button[type="submit"]').click()
  await expect(page.locator('#name-error')).toBeVisible()
  await expect(page.locator('#phone-error')).toBeVisible()
  expect(submissions).toHaveLength(0)
  await page.locator('#name').fill('Contato de teste')
  await page.locator('#phone').fill('123')
  await page.locator('button[type="submit"]').click()
  expect(submissions).toHaveLength(0)
  await page.locator('#phone').fill('11987654321')
  await expect(page.locator('#phone')).toHaveValue('(11) 98765-4321')
  behavior = 'network'
  await page.locator('button[type="submit"]').click()
  await expect(page.locator('[role="alert"]')).toBeVisible()
  await expect(page.locator('#name')).toHaveValue('Contato de teste')
  behavior = 'rejected'
  await page.locator('button[type="submit"]').click()
  await expect(page.locator('button[type="submit"]')).toBeEnabled()
  await expect(page.locator('[role="alert"]')).toBeVisible()
  behavior = 'success'
  await page.locator('button[type="submit"]').click()
  await expect(page.locator('button[type="submit"]')).toBeDisabled()
  await expect(page.locator('.success-panel')).toBeVisible()
  expect(submissions).toHaveLength(3)
  expect(submissions[2].Nome).toBe('Contato de teste')
  expect(submissions[2].Telefone).toBe('+55 11987654321')
  await page.screenshot({ path: 'artifacts/form-success.png', fullPage: true })

  await page.goto(base)
  await page.locator('summary').first().click()
  await expect(page.locator('.faq-list details').first()).toHaveAttribute('open', '')
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) throw new Error('Horizontal overflow at 200% font size')
  expect(runtimeErrors).toEqual([])
  console.log('Validation, phone mask, mobile CTA, failed/rejected/successful submissions, FAQ, 200% text, and JS runtime: OK. No email was sent.')
} finally {
  await browser.close()
}
