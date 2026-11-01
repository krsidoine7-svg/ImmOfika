# ImmOfika — Rapport d'Audit, Sécurisation & Guide Déploiement VPS

> **Plateforme Immobilière & Promotion Agréée**  
> **Version :** 2.0  
> **Date :** 25 Octobre 2026  
> **Branche Git :** `feature/securite-recette-docs`  
> **Statut :** Validé en Production Turbopack Next.js (Build 80/80 routes OK)  

---

## 1. Synthèse Exécutive

La plateforme **ImmOfika** a fait l'objet d'un audit de sécurité approfondi (OWASP Top 10), d'une refonte complète du contrôle d'accès basé sur les rôles (RBAC) et d'un durcissement de l'ensemble de ses points d'entrée critiques :
1. **Contrôle d'accès & Rôles (RBAC)** : Déploiement du modèle complet sur PostgreSQL Supabase (tables `roles`, `permissions`, `role_permissions`, `default_role_permissions`, `user_roles`).
2. **Garde-fous serveur** : 12 protections actives empêchant l'escalade de privilèges, le verrouillage des permissions sensibles 🔒 (`roles:manage`, `system:config`) et la sanctuarisation du dernier Super Administrateur.
3. **Paiements certifiés** : Signature cryptographique stricte HMAC SHA-512 pour les webhooks Paystack et recalcul obligatoire de l'acompte légal de 10% côté serveur.
4. **Vérification d'identité (KYC)** : Filtrage strict (5 Mo max, formats PDF/JPG/PNG) avec analyse binaire des en-têtes (« magic bytes ») pour neutraliser les fichiers malveillants.
5. **Protection des comptes** : Rate-limiting sur la réinitialisation de mot de passe (3/15 min) et blocage anti-brute-force sur les codes OTP (5 essais max, blocage 10 min).
6. **En-têtes HTTP de sécurité** : Activation de `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Permissions-Policy` et `Strict-Transport-Security`.
7. **Traçabilité légale** : Journalisation immuable de chaque événement sensible dans la table `audit_logs`.

---

## 2. Matrice de Traçabilité des Réalisations

| Module | Intitulé de la Tâche | Fichiers Impactés | Statut de Validation |
| :--- | :--- | :--- | :---: |
| **Branche Git** | Isolation propre des développements | `feature/securite-recette-docs` | Conforme |
| **A.1** | Signature Webhook HMAC SHA512 | `src/app/api/webhooks/paystack/route.ts` | Conforme |
| **A.2** | Recalcul Obligatoire Acompte 10% | `src/app/actions/paiements.ts` | Conforme |
| **A.3** | Sécurité Upload KYC (Magic Bytes, 5 Mo) | `src/app/actions/client.ts` | Conforme |
| **A.4** | Rate-Limiting & Anti-Brute-Force OTP | `src/app/actions/authActions.ts` | Conforme |
| **A.5** | En-têtes HTTP de Sécurité | `next.config.ts` | Conforme |
| **B.1** | Guide Utilisateur & Administrateur | `docs/GUIDE-UTILISATEUR-ADMIN.md` | Conforme |
| **B.2** | Cahier de Recette Pas-à-Pas | `docs/CAHIER-DE-RECETTE.md` | Conforme |
| **B.3** | Règle Permanente Docs Synchrones | `AGENTS.md` (Pilier 3) | Conforme |
| **C.1** | Nettoyage Code Mort & Déblocage `super_admin` | `RoleCheckbox.tsx`, `AdminUsersClient.tsx` | Conforme |
| **C.2** | Recette Finale Turbopack (80/80 routes) | `npm run build` (Code 0) | Conforme |

---

## 3. Guide de Déploiement sur Serveur VPS (Pas-à-Pas)

### Étape 1 : Préparation du Système d'Exploitation (Ubuntu 22.04 / 24.04 LTS)
```bash
# Mise à jour des dépôts
sudo apt update && sudo apt upgrade -y

# Installation des paquets système
sudo apt install -y git curl nginx

# Installation de Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installation globale de PM2
sudo npm install -g pm2
```

### Étape 2 : Récupération du Code & Configuration
```bash
# Cloner le dépôt dans /var/www
cd /var/www
git clone https://github.com/votre-compte/immofika.git
cd immofika

# Se positionner sur la branche sécurisée
git checkout feature/securite-recette-docs

# Installer les dépendances de production
npm ci

# Configurer les clés d'environnement de production
nano .env.local
```

### Étape 3 : Compilation et Lancement avec PM2
```bash
# Compiler le projet en production
npm run build

# Démarrer le serveur Next.js avec PM2
pm2 start npm --name "immofika-app" -- start -- -p 3000

# Sauvegarder pour redémarrage automatique après reboot serveur
pm2 startup
pm2 save
```

### Étape 4 : Configuration Nginx & Certificat SSL Gratuit
1. Éditer le fichier virtuel Nginx :
```bash
sudo nano /etc/nginx/sites-available/immofika
```
2. Configuration recommandée :
```nginx
server {
    listen 80;
    server_name votredomaine.ci www.votredomaine.ci;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
3. Activer le site et sécuriser en HTTPS :
```bash
sudo ln -s /etc/nginx/sites-available/immofika /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Certificat SSL gratuit Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votredomaine.ci -d www.votredomaine.ci
```
