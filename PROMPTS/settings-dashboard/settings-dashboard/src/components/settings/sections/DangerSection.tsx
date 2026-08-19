"use client";

import { Icon } from "../ui/Icon";
import styles from "./DangerSection.module.css";

export function DangerSection() {
  return (
    <section id="zone-sensible" className={styles.section} aria-labelledby="zone-sensible-title">
      <div className={styles.header}>
        <h2 id="zone-sensible-title" className={styles.title}>
          <Icon name="alert" size={17} />
          Zone sensible
        </h2>
        <p className={styles.desc}>Ces actions sont irréversibles. Procédez avec attention.</p>
      </div>
      <div className={styles.row}>
        <div>
          <p className={styles.rowLabel}>Transférer la propriété</p>
          <p className={styles.rowDesc}>Céder le contrôle de cet espace à un autre membre admin.</p>
        </div>
        <button type="button" className={styles.btn}>Transférer</button>
      </div>
      <div className={styles.row}>
        <div>
          <p className={styles.rowLabel}>Supprimer l'espace de travail</p>
          <p className={styles.rowDesc}>Supprime définitivement tous les projets, fichiers et membres associés.</p>
        </div>
        <button type="button" className={styles.btn}>Supprimer</button>
      </div>
    </section>
  );
}
