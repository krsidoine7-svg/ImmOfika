# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentification et Connexion >> devrait afficher la page de connexion et rejeter des identifiants invalides
- Location: tests\e2e\auth.spec.ts:4:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/auth\/login.*/
Received string:  "chrome-error://chromewebdata/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "chrome-error://chromewebdata/"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Authentification et Connexion', () => {
  4  |   test('devrait afficher la page de connexion et rejeter des identifiants invalides', async ({ page }) => {
  5  |     await page.goto('/auth/login')
  6  | 
  7  |     // Vérifier la présence du titre de connexion
  8  |     const heading = page.locator('h1, h2, .card-title, [class*="title"], [data-slot="card-title"]')
  9  |     await expect(heading.locator('text=Connexion').first()).toBeVisible()
  10 | 
  11 |     // Remplir avec des données erronées
  12 |     const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="téléphone"]').first()
  13 |     const passwordInput = page.locator('input[type="password"]').first()
  14 | 
  15 |     await emailInput.fill('baduser@example.com')
  16 |     await passwordInput.fill('badpassword')
  17 | 
  18 |     // Clic sur le bouton de connexion
  19 |     const submitBtn = page.locator('button[type="submit"], button:has-text("Se connecter")').first()
  20 |     await submitBtn.click()
  21 | 
  22 |     // On s'attend à ce qu'une erreur ou un message de validation soit visible ou qu'on reste sur la page
> 23 |     await expect(page).toHaveURL(/.*\/auth\/login.*/)
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  24 |   })
  25 | })
  26 | 
```