import styles from "./SettingsRow.module.css";

export function SettingsRow({
  label,
  description,
  children,
  stack = false,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  stack?: boolean;
}) {
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <span className={styles.label}>{label}</span>
        {description ? <span className={styles.desc}>{description}</span> : null}
      </div>
      <div className={stack ? styles.controlStack : styles.control}>{children}</div>
    </div>
  );
}
