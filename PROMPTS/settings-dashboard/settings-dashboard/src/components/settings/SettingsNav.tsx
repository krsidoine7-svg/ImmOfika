"use client";

import { NAV_GROUPS } from "@/lib/settings-nav";
import { Icon } from "./ui/Icon";
import styles from "./SettingsNav.module.css";

export function SettingsNav({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className={styles.nav} aria-label="Navigation des paramètres">
      <div className={styles.brand}>
        <span className={styles.brandTitle}>Paramètres</span>
        <span className={styles.brandSub}>config · v2.4</span>
      </div>

      {NAV_GROUPS.map((group) => (
        <div className={styles.group} key={group.title}>
          <p className={styles.groupTitle}>{group.title}</p>
          <ul className={styles.list}>
            <span className={styles.rail} aria-hidden="true" />
            {group.items.map((item) => (
              <li key={item.id} className={styles.item} data-active={activeId === item.id}>
                <button
                  type="button"
                  className={styles.itemBtn}
                  onClick={() => onSelect(item.id)}
                  aria-current={activeId === item.id ? "true" : undefined}
                >
                  <span className={styles.dot} aria-hidden="true" />
                  <Icon name={item.icon} size={16} className={styles.icon} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
