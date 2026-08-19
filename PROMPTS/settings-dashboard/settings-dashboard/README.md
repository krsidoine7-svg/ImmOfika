# Settings — Atelier

Page de paramètres modulaire construite en React 19 + Next.js 15 (App Router).

## Démarrer

```bash
npm install
npm run dev
```

Puis ouvrez http://localhost:3000/settings

## Système de design

- **Palette** — encre `#14161b`, papier `#f5f4f1`, émeraude `#1b6f58` (accent), laiton `#a3771f` (badge Pro), terracotta rouille `#b3432b` (danger). Tout est défini en variables CSS dans `src/app/globals.css`, donc un seul fichier à modifier pour changer le thème.
- **Typographie** — Fraunces (serif, titres de section), Inter (corps de texte), IBM Plex Mono (étiquettes "namespace" façon fichier de config, ex. `account.profile`). Chargées via `next/font/google` dans `layout.tsx`, zéro requête réseau supplémentaire côté client.
- **Signature visuelle** — chaque carte affiche son "chemin de configuration" en mono au-dessus du titre, et la navigation utilise un rail vertical avec un point qui s'allume sur la section active. L'idée : une page de paramètres, c'est un fichier de config qu'on édite — le design l'assume au lieu de le cacher derrière une esthétique dashboard générique.

## Structure

```
src/
  app/
    layout.tsx            polices + styles globaux
    globals.css            tokens de design (couleurs, radius, fonts)
    settings/page.tsx      point d'entrée de la page
  components/settings/
    SettingsShell.tsx       assemble nav + sections + barre de sauvegarde
    SettingsNav.tsx          navigation latérale (rail + groupes)
    SettingsSection.tsx      carte réutilisable (namespace + titre + description)
    SettingsRow.tsx          ligne label / description / contrôle
    SaveBar.tsx              barre flottante "modifications non enregistrées"
    ui/
      Toggle.tsx             interrupteur accessible (role="switch")
      TextField.tsx          input, textarea, select réutilisables
      Badge.tsx               étiquette (accent, pro, danger, neutre)
      AvatarUpload.tsx        bloc photo de profil
      Icon.tsx                jeu d'icônes SVG maison (aucune dépendance)
    sections/
      ProfileSection.tsx
      SecuritySection.tsx
      WorkspaceSection.tsx
      MembersSection.tsx
      NotificationsSection.tsx
      AppearanceSection.tsx
      BillingSection.tsx
      IntegrationsSection.tsx
      DangerSection.tsx
  lib/settings-nav.ts        source unique de vérité pour la navigation
```

## Comment réutiliser

Chaque section suit le même contrat : elle reçoit un callback `onDirty()` qu'elle
appelle à chaque modification, et le `SettingsShell` fait remonter cet état
vers la `SaveBar`. Pour ajouter une nouvelle section :

1. Ajoutez l'entrée dans `src/lib/settings-nav.ts`.
2. Créez `sections/MaSection.tsx` en composant avec `SettingsSection` + `SettingsRow`.
3. Ajoutez-la dans `SettingsShell.tsx`.

Les primitives (`Toggle`, `TextField`, `SelectField`, `Badge`, `AvatarUpload`)
sont indépendantes du contexte "paramètres" et réutilisables ailleurs dans le
produit.

## Accessibilité

- Contrastes AA sur toutes les combinaisons texte/fond.
- `Toggle` expose `role="switch"` + `aria-checked`.
- Focus visible sur tous les éléments interactifs (`:focus-visible` global).
- `prefers-reduced-motion` respecté.
- Layout responsive : la navigation passe au-dessus du contenu sous 860px.
