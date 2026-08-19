import { test, expect } from '@playwright/test'

test.describe('CRM - Kanban Transition Gating', () => {
  // Configurer la connexion avant de lancer les tests
  test.beforeEach(async ({ page }) => {
    // Connexion en tant qu'admin
    await page.goto('/auth/login')

    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="téléphone"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitBtn = page.locator('button[type="submit"], button:has-text("Se connecter")').first()

    // Remplir les identifiants de test administrateur
    // Note : Modifier avec les informations réelles ou configurer l'environnement de test
    await emailInput.fill('admin@favorcompany.ci')
    await passwordInput.fill('Password123!') 
    await submitBtn.click()

    // Attendre la redirection vers le dashboard ou l'espace d'accueil
    await page.waitForURL(/.*\/admin.*/)
  })

  test('devrait bloquer la transition vers Lead Qualifié si les critères ne sont pas remplis', async ({ page }) => {
    // Aller sur la page de gestion des leads
    await page.goto('/admin/leads')

    // S'assurer que le tableau Kanban est visible
    const kanbanTab = page.locator('button:has-text("Kanban"), button[value="kanban"]')
    if (await kanbanTab.count() > 0) {
      await kanbanTab.click()
    }

    // Repérer la première carte de lead dans la colonne "Prospect"
    const prospectColumn = page.locator('div:has-text("Prospect")').first()
    const leadCard = prospectColumn.locator('div[draggable="true"]').first()
    
    await expect(leadCard).toBeVisible()

    // Survoler la carte pour faire apparaître le bouton de déplacement rapide
    await leadCard.hover()

    // Cliquer sur le bouton de déplacement rapide à droite (ChevronRight)
    const moveRightBtn = leadCard.locator('button:has-text("ChevronRight"), button:has(.lucide-chevron-right), button:has-text("right")').first()
    
    // Si le bouton existe, cliquer pour tenter la transition
    if (await moveRightBtn.count() > 0) {
      await moveRightBtn.click()

      // Attendre l'ouverture du modal de gating
      const dialogTitle = page.locator('h2:has-text("Validation de transition"), [role="dialog"] h2')
      await expect(dialogTitle.first()).toBeVisible()

      // Vérifier que le message d'erreur indiquant que les conditions ne sont pas satisfaites est affiché
      const errorMsg = page.locator('text=Le déplacement est bloqué car certaines conditions obligatoires ne sont pas satisfaites')
      await expect(errorMsg).toBeVisible()

      // S'assurer que le bouton de confirmation est désactivé (disabled)
      const confirmBtn = page.locator('button:has-text("Confirmer"), button:has-text("Forcer le transfert")').first()
      await expect(confirmBtn).toBeDisabled()

      // Cliquer sur "Annuler" pour fermer la modal
      const cancelBtn = page.locator('button:has-text("Annuler")').first()
      await cancelBtn.click()

      // S'assurer que la modal est fermée
      await expect(dialogTitle.first()).not.toBeVisible()
    }
  })
})
