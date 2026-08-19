"use client";

import { useState } from "react";
import { SettingsSection } from "../SettingsSection";
import { SettingsRow } from "../SettingsRow";
import { TextField, SelectField } from "../ui/TextField";

export function WorkspaceSection({ onDirty }: { onDirty: () => void }) {
  const [name, setName] = useState("Atelier Studio");
  const [slug, setSlug] = useState("atelier-studio");
  const [language, setLanguage] = useState("fr");

  const track = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    onDirty();
  };

  return (
    <SettingsSection
      id="workspace"
      namespace="workspace.general"
      title="Espace de travail"
      description="Ces réglages s'appliquent à toute l'équipe."
    >
      <SettingsRow label="Nom de l'espace">
        <TextField label="" value={name} onChange={track(setName)} />
      </SettingsRow>

      <SettingsRow label="Identifiant" description="Utilisé dans l'URL de votre espace.">
        <TextField label="" prefix="atelier.co/" value={slug} onChange={track(setSlug)} />
      </SettingsRow>

      <SettingsRow label="Langue par défaut" description="Appliquée aux nouveaux membres.">
        <SelectField
          label=""
          value={language}
          onChange={track(setLanguage)}
          options={[
            { value: "fr", label: "Français" },
            { value: "en", label: "English" },
            { value: "es", label: "Español" },
          ]}
        />
      </SettingsRow>
    </SettingsSection>
  );
}
