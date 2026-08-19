import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Audit d\'Accessibilité (a11y)', () => {
  test('la page d\'accueil ne devrait pas avoir de violations critiques d\'accessibilité', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze()

    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(criticalViolations).toEqual([])
  })

  test('la page catalogue ne devrait pas avoir de violations d\'accessibilité', async ({ page }) => {
    await page.goto('/biens')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze()

    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(criticalViolations).toEqual([])
  })
})

