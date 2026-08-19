import { test, expect } from '@playwright/test'

test.describe('Catalogue de Biens', () => {
  test('devrait charger la page catalogue et effectuer des filtres de recherche', async ({ page }) => {
    await page.goto('/biens')

    // Vérifier la présence du titre
    const heading = page.locator('h1')
    await expect(heading).toContainText("Catalogue des Biens")

    // Vérifier la présence de la barre de recherche
    const searchBar = page.locator('input[placeholder*="rechercher"], input[placeholder*="Rechercher"]')
    if (await searchBar.count() > 0) {
      await expect(searchBar.first()).toBeVisible()
      await searchBar.first().fill('Villa')
      await searchBar.first().press('Enter')
      await expect(page).toHaveURL(/.*search=Villa.*/)
    }
  })

  test('devrait naviguer vers la fiche de détail d\'un bien', async ({ page }) => {
    await page.goto('/biens')

    const propertyLink = page.locator('a[href^="/biens/"]').first()
    
    if (await propertyLink.count() > 0) {
      const href = await propertyLink.getAttribute('href')
      await propertyLink.click()
      await expect(page).toHaveURL(new RegExp(href || ''))
    }
  })
})
