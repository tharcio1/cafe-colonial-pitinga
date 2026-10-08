import { chromium, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

// Only synthetic contacts are used. Any attempted external request is blocked.
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext()
const page = await context.newPage()
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173'
const runtimeErrors = []
page.on('pageerror', error => runtimeErrors.push(error.message))
await mkdir('artifacts', { recursive: true })
const submissions = []
await context.route('**/*', async route => {
  const request = route.request()
  if (new URL(request.url()).origin !== new URL(base).origin || !['GET', 'HEAD'].includes(request.method()) || ['fetch', 'xhr'].includes(request.resourceType())) {
    submissions.push({ url: request.url(), method: request.method() })
    return route.abort('blockedbyclient')
  }
  return route.continue()
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
  for (const scenario of ['empty', 'name-only', 'phone-only', 'spaces', 'mobile-empty', 'keyboard-empty']) {
    await page.goto(base)
    if (scenario === 'name-only') await page.locator('#name').fill('Contato de teste')
    if (scenario === 'spaces') await page.locator('#name').fill('   ')
    if (['phone-only', 'spaces'].includes(scenario)) await page.locator('#phone').fill('11987654321')
    if (scenario === 'mobile-empty') await page.locator('.mobile-cta button').click()
    else if (scenario === 'keyboard-empty') await page.locator('#name').press('Enter')
    else await page.locator('button[type="submit"]').click()
    const missingName = scenario !== 'name-only'
    const missingPhone = !['phone-only', 'spaces'].includes(scenario)
    await expect(page.locator('#name-error')).toHaveCount(missingName ? 1 : 0)
    await expect(page.locator('#phone-error')).toHaveCount(missingPhone ? 1 : 0)
    if (missingName) await expect(page.locator('#name-error')).toHaveText('Por favor, preencha seu nome.')
    if (missingPhone) await expect(page.locator('#phone-error')).toHaveText('Por favor, preencha seu telefone.')
    await expect(page.locator(missingName ? '#name' : '#phone')).toBeFocused()
    await expect(page.locator('.success-panel')).toHaveCount(0)
    expect(submissions).toHaveLength(0)
    await page.locator('#name').fill('Contato de teste')
    await page.locator('#phone').fill('11987654321')
    await expect(page.locator('.field-error')).toHaveCount(0)
    await page.locator('button[type="submit"]').click()
    await expect(page.getByRole('status')).toBeVisible()
    console.log(`Required fields and correction OK: ${scenario}`)
  }

  for (const scenario of ['filled', 'keyboard', 'offline', 'mobile-cta']) {
    await page.goto(base)
    await page.locator('#name').fill('Contato de teste')
    await page.locator('#phone').fill('11987654321')
    await expect(page.locator('#phone')).toHaveValue('(11) 98765-4321')
    if (scenario === 'mobile-cta') {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await expect(page.locator('.mobile-cta')).toBeVisible()
    }
    if (scenario === 'offline') await context.setOffline(true)
    if (scenario === 'mobile-cta') await page.locator('.mobile-cta button').click()
    else if (scenario === 'keyboard') await page.locator('#phone').press('Enter')
    else await page.locator('button[type="submit"]').click()
    await expect(page.getByRole('status')).toContainText('Solicitação realizada com sucesso!')
    await expect(page.getByRole('status')).toContainText('Um dos nossos colaboradores entrará em contato para fornecer todas as informações.')
    await expect(page.getByRole('status')).toBeInViewport()
    await expect(page.getByRole('status')).toBeFocused()
    await expect(page.locator('.mobile-cta')).toBeHidden()
    await expect(page.locator('.form-error, .field-error')).toHaveCount(0)
    expect(submissions).toHaveLength(0)
    await context.setOffline(false)
    console.log(`Simulated success without requests OK: ${scenario}`)
  }
  await page.screenshot({ path: 'artifacts/form-success.png', fullPage: true })

  await page.goto(base)
  await page.locator('summary').first().click()
  await expect(page.locator('.faq-list details').first()).toHaveAttribute('open', '')
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) throw new Error('Horizontal overflow at 200% font size')
  expect(runtimeErrors).toEqual([])
  console.log('Simulated success, phone mask, mobile CTA, offline mode, FAQ, 200% text, and JS runtime: OK. No submission requests or emails.')
} finally {
  await browser.close()
}
