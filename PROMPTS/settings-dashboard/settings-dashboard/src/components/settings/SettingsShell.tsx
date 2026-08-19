"use client";

import { useCallback, useState } from "react";
import { SettingsNav } from "./SettingsNav";
import { SaveBar } from "./SaveBar";
import { ProfileSection } from "./sections/ProfileSection";
import { SecuritySection } from "./sections/SecuritySection";
import { WorkspaceSection } from "./sections/WorkspaceSection";
import { MembersSection } from "./sections/MembersSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { AppearanceSection } from "./sections/AppearanceSection";
import { BillingSection } from "./sections/BillingSection";
import { IntegrationsSection } from "./sections/IntegrationsSection";
import { DangerSection } from "./sections/DangerSection";
import styles from "./SettingsShell.module.css";

export function SettingsShell() {
  const [activeId, setActiveId] = useState("profil");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const markDirty = useCallback(() => setDirty(true), []);

  const scrollTo = (id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSave = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setDirty(false);
    }, 700);
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>atelier / paramètres</span>
        <h1 className={styles.title}>Paramètres</h1>
      </header>

      <div className={styles.layout}>
        <SettingsNav activeId={activeId} onSelect={scrollTo} />

        <div className={styles.content}>
          <ProfileSection onDirty={markDirty} />
          <SecuritySection onDirty={markDirty} />
          <WorkspaceSection onDirty={markDirty} />
          <MembersSection onDirty={markDirty} />
          <NotificationsSection onDirty={markDirty} />
          <AppearanceSection onDirty={markDirty} />
          <BillingSection />
          <IntegrationsSection onDirty={markDirty} />
          <DangerSection />

          <SaveBar
            dirty={dirty}
            saving={saving}
            onDiscard={() => setDirty(false)}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
