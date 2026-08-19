"use client";

import { useState } from "react";
import { SettingsSection } from "../SettingsSection";
import { SettingsRow } from "../SettingsRow";
import { TextField, TextAreaField, SelectField } from "../ui/TextField";
import { AvatarUpload } from "../ui/AvatarUpload";

export function ProfileSection({ onDirty }: { onDirty: () => void }) {
  const [name, setName] = useState("Awa Koffi");
  const [email, setEmail] = useState("awa.koffi@atelier.co");
  const [bio, setBio] = useState("Product designer basée à Abidjan. Café et grille typographique.");
  const [timezone, setTimezone] = useState("gmt");

  const track = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    onDirty();
  };

  return (
    <SettingsSection
      id="profil"
      namespace="account.profile"
      title="Profil"
      description="Ces informations sont visibles par les membres de votre espace de travail."
    >
      <SettingsRow label="Photo" description="Utilisée dans les commentaires et les mentions.">
        <AvatarUpload initials="AK" name={name} />
      </SettingsRow>

      <SettingsRow label="Nom complet">
        <TextField label="" value={name} onChange={track(setName)} placeholder="Prénom et nom" />
      </SettingsRow>

      <SettingsRow label="Adresse e-mail" description="Sert aussi pour la connexion.">
        <TextField label="" type="email" value={email} onChange={track(setEmail)} placeholder="vous@exemple.com" />
      </SettingsRow>

      <SettingsRow label="Présentation" description="Une phrase courte, visible sur votre carte de profil.">
        <TextAreaField label="" value={bio} onChange={track(setBio)} maxLength={140} />
      </SettingsRow>

      <SettingsRow label="Fuseau horaire" description="Utilisé pour les dates d'échéance et les rappels.">
        <SelectField
          label=""
          value={timezone}
          onChange={track(setTimezone)}
          options={[
            { value: "gmt", label: "GMT — Abidjan, Accra" },
            { value: "cet", label: "CET — Paris, Berlin" },
            { value: "est", label: "EST — New York, Toronto" },
            { value: "jst", label: "JST — Tokyo" },
          ]}
        />
      </SettingsRow>
    </SettingsSection>
  );
}
