"use client";

import { useState } from "react";
import { SettingsSection } from "../SettingsSection";
import { SettingsRow } from "../SettingsRow";
import { Toggle } from "../ui/Toggle";
import styles from "./AppearanceSection.module.css";

const THEMES = [
  { id: "papier", label: "Papier", a: "#f5f4f1", b: "#ffffff" },
  { id: "encre", label: "Encre", a: "#14161b", b: "#2b2e35" },
  { id: "systeme", label: "Système", a: "#f5f4f1", b: "#14161b" },
];

export function AppearanceSection({ onDirty }: { onDirty: () => void }) {
  const [theme, setTheme] = useState("papier");
  const [density, setDensity] = useState(false);

  return (
    <SettingsSection
      id="apparence"
      namespace="prefs.appearance"
      title="Apparence"
      description="Personnalisez l'affichage de votre espace de travail."
    >
      <SettingsRow label="Thème" description="S'applique uniquement à votre session.">
        <div className={styles.swatchRow}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={styles.swatch}
              data-active={theme === t.id}
              aria-label={t.label}
              aria-pressed={theme === t.id}
              onClick={() => { setTheme(t.id); onDirty(); }}
            >
              <span className={styles.swatchHalf} style={{ background: t.a }} />
              <span className={styles.swatchHalf} style={{ background: t.b }} />
            </button>
          ))}
        </div>
      </SettingsRow>

      <SettingsRow label="Densité compacte" description="Réduit l'espacement pour afficher plus de contenu.">
        <Toggle checked={density} onChange={(v) => { setDensity(v); onDirty(); }} label="Densité compacte" />
      </SettingsRow>
    </SettingsSection>
  );
}
