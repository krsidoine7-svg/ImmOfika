"use client";

import styles from "./AvatarUpload.module.css";
import { Icon } from "./Icon";

export function AvatarUpload({ initials, name }: { initials: string; name: string }) {
  return (
    <div>
      <div className={styles.row}>
        <div className={styles.avatar} aria-hidden="true">
          {initials}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.btn}>
            <Icon name="upload" size={15} />
            Changer la photo
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`}>
            Retirer
          </button>
        </div>
      </div>
      <p className={styles.hint}>PNG ou JPG, 512×512px minimum. Visible par {name} et son équipe.</p>
    </div>
  );
}
