"use client";

import { useState } from "react";
import { SettingsSection } from "../SettingsSection";
import { SettingsRow } from "../SettingsRow";
import { TextField, SelectField } from "../ui/TextField";
import { Badge } from "../ui/Badge";

type Member = { name: string; email: string; role: "Propriétaire" | "Admin" | "Membre"; initials: string };

const MEMBERS: Member[] = [
  { name: "Awa Koffi", email: "awa.koffi@atelier.co", role: "Propriétaire", initials: "AK" },
  { name: "Yves Bamba", email: "yves.bamba@atelier.co", role: "Admin", initials: "YB" },
  { name: "Léa Girard", email: "lea.girard@atelier.co", role: "Membre", initials: "LG" },
];

export function MembersSection({ onDirty }: { onDirty: () => void }) {
  const [invite, setInvite] = useState("");
  const [role, setRole] = useState("membre");

  return (
    <SettingsSection
      id="membres"
      namespace="workspace.members"
      title="Membres et rôles"
      description="Invitez des collaborateurs et gérez leurs permissions."
      footer="3 membres · 2 places restantes sur votre forfait actuel."
    >
      <SettingsRow label="Inviter par e-mail" description="Un lien d'invitation valable 7 jours sera envoyé.">
        <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 420 }}>
          <div style={{ flex: 1 }}>
            <TextField label="" type="email" value={invite} onChange={(v) => { setInvite(v); onDirty(); }} placeholder="collegue@exemple.com" />
          </div>
          <div style={{ width: 132 }}>
            <SelectField
              label=""
              value={role}
              onChange={(v) => { setRole(v); onDirty(); }}
              options={[
                { value: "membre", label: "Membre" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </div>
          <button
            type="button"
            style={{
              padding: "0 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Inviter
          </button>
        </div>
      </SettingsRow>

      <SettingsRow label="Membres actuels">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          {MEMBERS.map((m) => (
            <div key={m.email} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--surface-sunken)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                  }}
                >
                  {m.initials}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{m.name}</span>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{m.email}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge tone={m.role === "Propriétaire" ? "pro" : "neutral"}>{m.role}</Badge>
                {m.role !== "Propriétaire" ? (
                  <button type="button" aria-label={`Retirer ${m.name}`} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12.5 }}>
                    Retirer
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </SettingsRow>
    </SettingsSection>
  );
}
