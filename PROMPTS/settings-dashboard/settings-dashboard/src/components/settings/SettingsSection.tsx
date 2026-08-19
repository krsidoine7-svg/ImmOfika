import styles from "./SettingsSection.module.css";

export function SettingsSection({
  id,
  namespace,
  title,
  description,
  badge,
  footer,
  children,
}: {
  id: string;
  namespace: string;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>{namespace}</span>
        <div className={styles.titleRow}>
          <h2 id={`${id}-title`} className={styles.title}>
            {title}
          </h2>
          {badge}
        </div>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
}
