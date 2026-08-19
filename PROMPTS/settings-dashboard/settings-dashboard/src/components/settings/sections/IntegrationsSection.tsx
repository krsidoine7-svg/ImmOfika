"use client";

import { useState } from "react";
import { SettingsSection } from "../SettingsSection";
import { SettingsRow } from "../SettingsRow";
import { Icon } from "../ui/Icon";
import styles from "./IntegrationsSection.module.css";

type Integration = { id: string; name: string; desc: string; connected: boolean };

export function IntegrationsSection({ onDirty }: { onDirty: () => void }) {
  const [items, setItems] = useState<Integration[]>([
    { id: "figma", name: "Figma", desc: "Aperçus liés dans vos projets", connected: true },
    { id: "slack", name: "Slack", desc: "Alertes envoyées dans un canal", connected: true },
    { id: "github", name: "GitHub", desc: "Lier les demandes à des dépôts", connected: false },
  ]);

  const toggle = (id: string) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)));
    onDirty();
  };

  return (
    <SettingsSection
      id="integrations"
      namespace="org.integrations"
      title="Intégrations"
      description="Connectez les outils que votre équipe utilise déjà."
    >
      {items.map((i) => (
        <SettingsRow key={i.id} label={i.name} description={i.desc}>
          <div className={styles.row}>
            <span />
            <button
              type="button"
              className={styles.connectBtn}
              data-connected={i.connected}
              onClick={() => toggle(i.id)}
            >
              {i.connected ? (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon name="check" size={13} />
                  Connecté
                </span>
              ) : (
                "Connecter"
              )}
            </button>
          </div>
        </SettingsRow>
      ))}
    </SettingsSection>
  );
}
