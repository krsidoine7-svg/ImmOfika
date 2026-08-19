"use client";

import { SettingsSection } from "../SettingsSection";
import { SettingsRow } from "../SettingsRow";
import { Badge } from "../ui/Badge";
import styles from "./BillingSection.module.css";

export function BillingSection() {
  return (
    <SettingsSection
      id="facturation"
      namespace="org.billing"
      title="Facturation"
      description="Gérez votre forfait et vos moyens de paiement."
      footer="Prochain prélèvement le 1er août 2026 · 49 000 XOF"
    >
      <SettingsRow label="Forfait actuel">
        <div className={styles.planCard}>
          <div>
            <div className={styles.planName}>
              Studio <Badge tone="pro">Pro</Badge>
            </div>
            <div className={styles.planMeta}>Facturé mensuellement · 5 places incluses</div>
          </div>
          <button type="button" className={styles.upgradeBtn}>
            Changer de forfait
          </button>
        </div>
      </SettingsRow>

      <SettingsRow label="Places utilisées" description="Ajoutez des places dans Membres et rôles.">
        <div style={{ width: "100%" }}>
          <div className={styles.usageTrack}>
            <div className={styles.usageFill} style={{ width: "60%" }} />
          </div>
          <div className={styles.usageLabel}>
            <span>3 sur 5 places</span>
            <span>60%</span>
          </div>
        </div>
      </SettingsRow>

      <SettingsRow label="Moyen de paiement">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontSize: 13.5,
          }}
        >
          <span>Visa se terminant par 4291</span>
          <button type="button" style={{ background: "none", border: "none", color: "var(--accent-strong)", fontSize: 13 }}>
            Modifier
          </button>
        </div>
      </SettingsRow>
    </SettingsSection>
  );
}
