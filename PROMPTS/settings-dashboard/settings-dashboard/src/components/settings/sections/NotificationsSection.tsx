"use client";

import { useState } from "react";
import { SettingsSection } from "../SettingsSection";
import { SettingsRow } from "../SettingsRow";
import { Toggle } from "../ui/Toggle";
import { SelectField } from "../ui/TextField";

type Pref = { key: string; label: string; description: string; value: boolean };

export function NotificationsSection({ onDirty }: { onDirty: () => void }) {
  const [prefs, setPrefs] = useState<Pref[]>([
    { key: "comments", label: "Commentaires", description: "Quand quelqu'un commente votre travail.", value: true },
    { key: "mentions", label: "Mentions", description: "Quand quelqu'un vous mentionne directement.", value: true },
    { key: "digest", label: "Résumé hebdomadaire", description: "Un récapitulatif chaque lundi matin.", value: false },
    { key: "product", label: "Nouveautés produit", description: "Annonces de fonctionnalités et changements.", value: false },
  ]);
  const [delivery, setDelivery] = useState("instant");

  const toggle = (key: string, v: boolean) => {
    setPrefs((p) => p.map((item) => (item.key === key ? { ...item, value: v } : item)));
    onDirty();
  };

  return (
    <SettingsSection
      id="notifications"
      namespace="prefs.notifications"
      title="Notifications"
      description="Choisissez ce qui mérite une alerte."
    >
      {prefs.map((p) => (
        <SettingsRow key={p.key} label={p.label} description={p.description}>
          <Toggle checked={p.value} onChange={(v) => toggle(p.key, v)} label={p.label} />
        </SettingsRow>
      ))}
      <SettingsRow label="Fréquence d'envoi" description="Pour les notifications par e-mail.">
        <SelectField
          label=""
          value={delivery}
          onChange={(v) => { setDelivery(v); onDirty(); }}
          options={[
            { value: "instant", label: "Immédiate" },
            { value: "hourly", label: "Groupée toutes les heures" },
            { value: "daily", label: "Résumé quotidien" },
          ]}
        />
      </SettingsRow>
    </SettingsSection>
  );
}
