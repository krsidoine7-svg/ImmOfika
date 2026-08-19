---
name: securite-favor
description: "Gestion des audits de sécurité, analyse de menaces (XSS, Prototype Pollution, RBAC, Redirections d'aiguillage), et exécution de Proof-of-Concept (PoC) sécuritaires conformes aux standards OWASP."
---

# 🛡️ Fiche de Compétence : Audit de Sécurité & Validation PoC (securite-favor)

Ce skill recense les bonnes pratiques de codage sécurisé, les techniques de modélisation de menaces et les procédures de validation (Proof of Concept - PoC) adaptées aux applications Next.js et à la stack de **Favor Company International**.

---

## 🔍 1. Directives de Codage Sécurisé (Anti-Vecteurs)

### A. Neutralisation du Cross-Site Scripting (XSS - CWE-79)
Le rendu de chaînes de caractères dynamiques sous forme de HTML brut (ex: méthodes de cartes Leaflet `bindPopup`, injection DOM via `dangerouslySetInnerHTML`) constitue un vecteur critique d'exécution de script.

> [!IMPORTANT]
> **Règle absolue** : Ne jamais interpoler de données brutes issues de la base de données ou saisies par l'utilisateur directement dans du code rendu en HTML. Appliquer systématiquement le filtre d'assainissement suivant :

```typescript
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

*   **HTML Attributes** : Échapper impérativement les attributs (ex: `src="${escapeHtml(imageUrl)}"` ou `alt="${escapeHtml(title)}"`) pour empêcher l'attaquant de s'échapper des guillemets d'attributs.

### B. Isolation Stricte des Privilèges (RBAC - CWE-285)
Les droits d'accès administratifs critiques ne doivent jamais être groupés sous des permissions généralistes (ex: `manage:users`), car cela permettrait à un utilisateur de s'octroyer lui-même des privilèges.

*   **Segmentation** : Isoler chaque action à haut risque sous une permission granulaire dédiée.
    *   Exemple : Protéger la page `/admin/roles` uniquement sous la permission `'manage:roles'`.
*   **Contrôle Serveur Double Barrière** : 
    1.  *Côté Client* : Utiliser `<PermissionGate permission="manage:roles">` pour masquer les boutons et menus de la sidebar (AppSidebar).
    2.  *Côté Serveur* : Verrouiller la page via `await requirePermission('manage:roles')` au sommet du Server Component pour interdire tout forçage d'URL.

### C. Gestion des Redirections de Rôles Administratifs
Tous les rôles ayant accès à l'espace administration (comme `admin`, `super_admin`, et `agent`) doivent être redirigés de façon centralisée vers `/admin` dès le succès de la connexion (`login`, `verify-otp`, `callback`), empêchant ainsi les fuites vers les dashboards clients grand public.

### D. Protection de la Vie Privée & Privacy by Design (RGPD / CEDEAO / ARTCI Côte d'Ivoire)
Pour tout traitement de leads et de données sensibles capturées en Côte d'Ivoire et à l'international, les agents et modules automatisés doivent strictement respecter les règles de confidentialité des données personnelles (Loi n° 2013-450 ivoirienne et RGPD européen) :
*   **Soft Delete Strict (Droit à l'oubli)** : Lorsqu'un lead demande sa suppression ou qu'il est supprimé de l'interface, appliquer une suppression logique (`deleted_at = now()`) immédiate pour masquer les données de l'interface utilisateur. Mettre en place un processus de purge ou d'anonymisation automatique après la durée légale de conservation (ex: 3 ans maximum).
*   **Data Masking de Sécurité OBLIGATOIRE (`{{...}}`)** : Avant d'écrire ou de compiler le moindre rapport, diagnostic technique, journal brut de session, ou fichier dans un espace de stockage persistant (comme les répertoires `memoire-favor/fourtour/`), vous **devez impérativement masquer automatiquement** toutes les données d'identification personnelles (noms, emails, numéros de téléphone, tokens, mots de passe) avec des placeholders anonymisés du type `{{...}}`.

---

## 🧪 2. Protocoles de Tests & Scénarios de Validation (PoC)

Pour chaque correctif de sécurité appliqué, le Tech Lead doit formaliser une procédure de validation Proof of Concept (PoC) démontrant la non-exploitabilité de la faille :

### Protocole de Test 1 : Validation de l'isolation RBAC
1.  Créer ou modifier un profil de test avec un rôle restreint (ex: `agent`).
2.  Tenter d'accéder directement via la barre d'adresse à la route `/admin/roles`.
3.  *Résultat attendu* : Le serveur intercepte la requête, valide l'absence de la permission `manage:roles` et redirige instantanément l'utilisateur vers `/admin`.

### Protocole de Test 2 : Validation de l'immunité XSS
1.  Insérer temporairement un titre malveillant dans la table `biens` en base de données : `<script>alert('XSS')</script>`.
2.  Accéder à la carte interactive des biens (/biens).
3.  Cliquer sur le marqueur correspondant au bien testé pour ouvrir le popup Leaflet.
4.  *Résultat attendu* : Le code JavaScript s'affiche comme simple chaîne de caractères inoffensive. Aucun script ne s'exécute, l'alerte n'apparaît pas.

---

## 🌐 3. Organismes Internationaux de Référence & Normes de Sécurité (Index Exhaustif)

Pour assurer la conformité de la plateforme **Favor Company International** face aux normes globales, ce skill répertorie les instances de standardisation et de régulation clés ainsi que leurs **liens officiels et points d'accès (APIs)** :

### A. Autorités d'Attribution & Registres CVE (Common Vulnerabilities and Exposures)
*   **MITRE Corporation** : Organisme à but non lucratif américain qui gère et attribue de façon centralisée les identifiants uniques de vulnérabilités (**CVE**).
    *   🔗 **Site Officiel** : [https://www.mitre.org/](https://www.mitre.org/)
    *   🔗 **Registre Officiel CVE** : [https://cve.mitre.org/](https://cve.mitre.org/)
    *   🔗 **Moteur de Recherche CVE** : [https://cve.mitre.org/cve/search_cve_list.html](https://cve.mitre.org/cve/search_cve_list.html)
*   **NVD (National Vulnerability Database - NIST)** : Le référentiel du gouvernement américain qui enrichit chaque CVE avec des scores de gravité **CVSS** (Common Vulnerability Scoring System, de 0 à 10) et des configurations affectées (**CPE**).
    *   🔗 **Site Officiel & Recherche** : [https://nvd.nist.gov/](https://nvd.nist.gov/)
    *   🔗 **Moteur de Recherche de Filles** : [https://nvd.nist.gov/vuln/search](https://nvd.nist.gov/vuln/search)
    *   🔗 **Endpoint API NVD 2.0** : `https://services.nvd.nist.gov/rest/json/cves/2.0` (utilisé pour les requêtes automatiques par date ou mot-clé).
*   **CISA (Cybersecurity and Infrastructure Security Agency)** : Agence fédérale américaine publiant le catalogue **KEV** (Known Exploited Vulnerabilities), répertoriant les failles activement exploitées en conditions réelles.
    *   🔗 **Site Officiel** : [https://www.cisa.gov/](https://www.cisa.gov/)
    *   🔗 **Catalogue KEV (Exploits Actifs)** : [https://www.cisa.gov/known-exploited-vulnerabilities-catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
*   **ENISA (European Union Agency for Cybersecurity)** : Agence européenne responsable de la cybersécurité dans l'UE, coordonnant la directive NIS 2 et publiant les rapports de menaces émergentes.
    *   🔗 **Site Officiel** : [https://www.enisa.europa.eu/](https://www.enisa.europa.eu/)

### B. Standardisation & Normes de Gouvernance
*   **ISO (Organisation Internationale de Normalisation) / IEC** :
    *   🔗 **Site Officiel** : [https://www.iso.org/](https://www.iso.org/)
    *   **ISO/IEC 27001 (SMSI)** : [https://www.iso.org/standard/73906.html](https://www.iso.org/standard/73906.html) (Standard mondial pour la gouvernance de sécurité).
    *   **ISO/IEC 27002 (Pratiques)** : [https://www.iso.org/standard/75652.html](https://www.iso.org/standard/75652.html) (Contrôles physiques, logiques et organisationnels).
    *   **ISO/IEC 29147 (Vuln Disclosure)** : [https://www.iso.org/standard/72894.html](https://www.iso.org/standard/72894.html) (Lignes de divulgation).
*   **NIST (National Institute of Standards and Technology)** :
    *   🔗 **Site Officiel** : [https://www.nist.gov/](https://www.nist.gov/)
    *   🔗 **NIST Cybersecurity Framework (CSF)** : [https://www.nist.gov/cyberframework](https://www.nist.gov/cyberframework) (Cadre mondial CSF 2.0).
    *   🔗 **NIST SP 800-53 (Contrôles)** : [https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final) (Standards fédéraux).
*   **CIS (Center for Internet Security)** :
    *   🔗 **Site Officiel** : [https://www.cisecurity.org/](https://www.cisecurity.org/)
    *   🔗 **Les 18 CIS Controls** : [https://www.cisecurity.org/controls/](https://www.cisecurity.org/controls/) (Actions de défense fondamentales).
    *   🔗 **CIS Benchmarks** : [https://www.cisecurity.org/benchmark/](https://www.cisecurity.org/benchmark/) (Durcissement OS et Bases de données).
*   **ITU-T (Union Internationale des Télécommunications)** : Organisme de l'ONU publiant les normes de télécommunication mondiales.
    *   🔗 **Site Officiel** : [https://www.itu.int/](https://www.itu.int/)
    *   🔗 **Série X (Sécurité des réseaux/PKI)** : [https://www.itu.int/rec/T-REC-X/fr](https://www.itu.int/rec/T-REC-X/fr) (Normes de cryptographie X.509).

### C. Sécurité Applicative & Veille Communautaire
*   **OWASP (Open Web Application Security Project)** : Fondation internationale publiant les normes de sécurité des applications web.
    *   🔗 **Site Officiel** : [https://owasp.org/](https://owasp.org/)
    *   🔗 **OWASP Top 10** : [https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/) (Les 10 failles web les plus critiques).
    *   🔗 **OWASP ASVS (Standard de Vérification)** : [https://owasp.org/www-project-application-security-verification-standard/](https://owasp.org/www-project-application-security-verification-standard/) (Critères de test rigoureux).
*   **GitHub Advisory Database** : Registre d'alertes open-source géré par GitHub, hautement réactif pour l'écosystème JS/TS.
    *   🔗 **Site de Recherche & Consultation** : [https://github.com/advisories](https://github.com/advisories)
*   **Snyk Vulnerability Database** : Index de failles enrichi proposant des patchs et analyses détaillées.
    *   🔗 **Moteur de Recherche Snyk** : [https://snyk.io/vuln/](https://snyk.io/vuln/)
*   **Socket.dev** : Analyseur de supply-chain npm pour prévenir les comportements malveillants masqués dans les paquets tiers.
    *   🔗 **Recherche de Packages** : [https://socket.dev/](https://socket.dev/)

### D. Régulations & Protection des Données Personnelles (RGPD & Droits Nationaux / ARTCI)
*   **GDPR (RGPD - Règlement Général sur la Protection des Données - Union Européenne)** :
    *   **Description** : Réglementation de référence mondiale imposant le consentement explicite (Opt-in), le droit d'accès, la portabilité, le droit à l'effacement (droit à l'oubli) et la protection dès la conception (Privacy by Design).
    *   🔗 **Site officiel de la Régulation (GDPR Info)** : [https://gdpr-info.eu/](https://gdpr-info.eu/)
    *   🔗 **Portail de la CNIL (Commission Nationale de l'Informatique et des Libertés - France)** : [https://www.cnil.fr/](https://www.cnil.fr/) (Guides de sécurité, fiches pratiques pour le chiffrement et registres de traitement).
*   **ARTCI (Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire - Régulation Nationale)** :
    *   **Description** : Autorité ivoirienne chargée de veiller au respect de la **Loi n° 2013-450 du 19 juin 2013** relative à la protection des données à caractère personnel. Toute capture de leads (CRM, formulaires immobiliers) opérée en Côte d'Ivoire ou ciblant des résidents ivoiriens est légalement soumise à cette réglementation et doit être déclarée à l'ARTCI.
    *   🔗 **Site officiel de l'ARTCI** : [https://www.artci.ci/](https://www.artci.ci/)
    *   🔗 **Portail Protection des Données ARTCI** : [https://www.artci.ci/index.php/protection-des-donnees-personnelles.html](https://www.artci.ci/index.php/protection-des-donnees-personnelles.html)
*   **Acte Additionnel CEDEAO (A/SA.1/01/10) - Protection des Données en Afrique de l'Ouest** :
    *   **Description** : Directive internationale unifiant la législation de protection des données personnelles pour l'ensemble des 15 États membres de la CEDEAO (dont la Côte d'Ivoire fait partie), garantissant un niveau de protection homogène dans toute la sous-région ouest-africaine.
    *   🔗 **Portail officiel de la CEDEAO** : [https://ecowas.int/](https://ecowas.int/)

---

## 🔍 4. Protocole de Revue des Failles CVE Récentes (Filtre sur les 2 dernières semaines)

Ce protocole décrit la démarche systématique pour identifier et corriger les vulnérabilités de moins de 14 jours affectant le projet.

### A. Méthodologie d'Audit Flash
Pour les dépendances du projet, exécutez de façon hebdomadaire l'audit de sécurité ciblé :
```bash
# 1. Audit rapide avec remontée des CVE
npm audit

# 2. Identifier où se situe un package vulnérable dans l'arborescence
npm list <nom-du-package-vulnérable>
```

Pour le code applicatif, lancez l'analyseur statique sur vos fichiers récemment modifiés :
```bash
# Lancement de Semgrep ou Wiz sur le projet
npx semgrep --config auto
```

### B. Outil Script d'Interrogation Automatique des CVE Récentes
Voici un script de veille automatique en TypeScript/JavaScript (`scripts/check_recent_cves.ts`) conçu pour interroger la base de données des vulnérabilités pour les alertes ciblant notre stack (Next.js, Drizzle, PostgreSQL, Node) publiées au cours des **14 derniers jours** :

```typescript
// scripts/check_recent_cves.ts
import { exec } from "child_process"

// Calcul de la date d'il y a 2 semaines au format ISO
const dateTwoWeeksAgo = new Date()
dateTwoWeeksAgo.setDate(dateTwoWeeksAgo.getDate() - 14)
const isoDate = dateTwoWeeksAgo.toISOString().split('T')[0] // AAAA-MM-JJ

console.log(`🔍 Lancement de la revue des CVE publiées depuis le : ${isoDate}...\n`)

// Commande npm audit pour sortir un format JSON et filtrer programmatiquement
exec("npm audit --json", (error, stdout, stderr) => {
  if (!stdout) {
    console.log("❌ Aucun retour de npm audit.")
    return
  }
  
  try {
    const report = JSON.parse(stdout)
    const vulnerabilities = report.vulnerabilities || {}
    let foundRecent = 0

    console.log("🛡️ ANALYSE DES VULNÉRABILITÉS DE MOINS DE 2 SEMAINES :")
    
    for (const [name, data] of Object.entries(vulnerabilities) as any) {
      const advisories = data.via || []
      const isRecent = advisories.some((adv: any) => {
        if (typeof adv === 'object' && adv.updated) {
          const updateDate = new Date(adv.updated)
          return updateDate >= dateTwoWeeksAgo
        }
        return false
      })

      if (isRecent) {
        foundRecent++
        console.log(`\n🚨 [ALERTE CVE RÉCENTE] Package: ${name}`)
        console.log(`   - Gravité : ${data.severity?.toUpperCase()}`)
        console.log(`   - Version installée : ${data.range}`)
        console.log(`   - Détails : ${advisories.map((a: any) => a.title || a.source).join(", ")}`)
        console.log(`   - Lien : ${advisories.map((a: any) => a.url).filter(Boolean).join("\n            ")}`)
      }
    }

    if (foundRecent === 0) {
      console.log("\n✅ Félicitations : Aucune faille de moins de 2 semaines détectée dans vos dépendances.")
    } else {
      console.log(`\n⚠️ Total : ${foundRecent} alerte(s) de moins de 2 semaines à corriger d'urgence !`)
    }
  } catch (err) {
    console.error("❌ Erreur d'analyse du JSON de npm audit :", err)
  }
})
```

### C. Procédure de Correction & Résolution d'Overrides (Remédiation)
Lorsqu'une CVE de moins de 2 semaines affecte une sous-dépendance (une bibliothèque utilisée en interne par un module parent), une mise à jour simple de type `npm update` peut échouer à écraser la dépendance vulnérable.

> [!TIP]
> **Technique d'Override de Prestige (package.json)** :
> Si une faille est détectée dans un paquet imbriqué (ex: `postcss` sous `next`), vous devez forcer son écrasement de manière globale dans le fichier `package.json` en y injectant un champ `overrides` :
> 
> ```json
> {
>   "name": "favor-company",
>   "dependencies": {
>     "next": "16.2.6"
>   },
>   "overrides": {
>     "next": {
>       "postcss": "^8.5.14"
>     }
>   }
> }
> ```
> Après ajout de l'override, lancez `npm install` pour reconstruire l'arbre proprement et nettoyez le cache. Validez impérativement le non-brise de production avec :
> ```bash
> npx tsc --noEmit && npm run build
> ```
