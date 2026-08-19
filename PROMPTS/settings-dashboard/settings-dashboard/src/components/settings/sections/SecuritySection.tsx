"use client";

import { useState } from "react";
import { SettingsSection } from "../SettingsSection";
import { SettingsRow } from "../SettingsRow";
import { TextField } from "../ui/TextField";
import { Toggle } from "../ui/Toggle";
import { Badge } from "../ui/Badge";
import { Icon } from "../ui/Icon";

const SESSIONS = [
  { device: "MacBook Pro · Chrome", location: "Abidjan, CI", current: true },
  { device: "iPhone 15 · App", location: "Abidjan, CI", current: false },
];

export function SecuritySection({ onDirty }: { onDirty: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <SettingsSection
      id="securite"
      namespace="account.security"
      title="Sécurité"
      description="Protégez l'accès à votre compte."
      badge={<Badge tone="accent">Recommandé</Badge>}
    >
      <SettingsRow label="Mot de passe" description="Dernière modification il y a 3 mois.">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 380 }}>
          <TextField
            label="Mot de passe actuel"
            type="password"
            value={current}
            onChange={(v) => { setCurrent(v); onDirty(); }}
            placeholder="••••••••"
          />
          <TextField
            label="Nouveau mot de passe"
            type="password"
            value={next}
            onChange={(v) => { setNext(v); onDirty(); }}
            placeholder="12 caractères minimum"
          />
        </div>
      </SettingsRow>

      <SettingsRow
        label="Authentification à deux facteurs"
        description="Exige un code depuis votre application d'authentification à chaque connexion."
      >
        <Toggle
          checked={twoFactor}
          onChange={(v) => { setTwoFactor(v); onDirty(); }}
          label="Authentification à deux facteurs"
        />
      </SettingsRow>

      <SettingsRow label="Sessions actives" description="Déconnectez les appareils que vous ne reconnaissez pas.">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          {SESSIONS.map((s) => (
            <div
              key={s.device}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 13.5,
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{s.device}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 12.5 }}>{s.location}</span>
              </div>
              {s.current ? (
                <Badge tone="accent">Cet appareil</Badge>
              ) : (
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--danger)",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Icon name="external" size={14} />
                  Déconnecter
                </button>
              )}
            </div>
          ))}
        </div>
      </SettingsRow>
    </SettingsSection>
  );
}
