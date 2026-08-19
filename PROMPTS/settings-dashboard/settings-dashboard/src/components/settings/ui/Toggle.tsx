"use client";

import styles from "./Toggle.module.css";

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className={styles.wrap}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        data-on={checked}
        className={styles.track}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} />
      </button>
    </label>
  );
}
