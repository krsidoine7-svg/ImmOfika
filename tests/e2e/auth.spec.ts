import { test, expect } from '@playwright/test'

test.describe('Authentification et Connexion', () => {
  test('devrait afficher la page de connexion et rejeter des identifiants invalides', async ({ page }) => {
    await page.goto('/auth/login')

    // Vérifier la présence du titre de connexion
    const heading = page.locator('h1, h2, .card-title, [class*="title"], [data-slot="card-title"]')
    await expect(heading.locator('text=Connexion').first()).toBeVisible()

    // Remplir avec des données erronées
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="téléphone"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    await emailInput.fill('baduser@example.com')
    await passwordInput.fill('badpassword')

    // Clic sur le bouton de connexion
    const submitBtn = page.locator('button[type="submit"], button:has-text("Se connecter")').first()
    await submitBtn.click()

    // On s'attend à ce qu'une erreur ou un message de validation soit visible ou qu'on reste sur la page
    await expect(page).toHaveURL(/.*\/auth\/login.*/)
  })
})
