"use client";

import styles from "./SaveBar.module.css";

export function SaveBar({
  dirty,
  saving,
  onDiscard,
  onSave,
}: {
  dirty: boolean;
  saving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  return (
    <div className={styles.bar} data-hidden={!dirty} role="status" aria-live="polite">
      <span className={styles.msg}>
        <span className={styles.dot} aria-hidden="true" />
        Modifications non enregistrées
      </span>
      <div className={styles.actions}>
        <button type="button" className={`${styles.btn} ${styles.discard}`} onClick={onDiscard}>
          Annuler
        </button>
        <button type="button" className={`${styles.btn} ${styles.save}`} onClick={onSave} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
