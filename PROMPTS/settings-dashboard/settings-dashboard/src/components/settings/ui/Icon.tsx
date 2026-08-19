type IconName =
  | "user"
  | "shield"
  | "building"
  | "users"
  | "bell"
  | "card"
  | "plug"
  | "palette"
  | "alert"
  | "check"
  | "chevron"
  | "upload"
  | "eye"
  | "eye-off"
  | "external";

const paths: Record<IconName, React.ReactNode> = {
  user: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M4.5 20c1.4-3.6 4.4-5.4 7.5-5.4s6.1 1.8 7.5 5.4" />
    </>
  ),
  shield: <path d="M12 3.5 5 6v5.2c0 4.4 3 7.7 7 9.3 4-1.6 7-4.9 7-9.3V6l-7-2.5Z" />,
  building: (
    <>
      <rect x="4.5" y="4" width="8.5" height="16" rx="1" />
      <rect x="14" y="9" width="5.5" height="11" rx="1" />
      <path d="M7 8h1M7 11.5h1M7 15h1" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="2.9" />
      <circle cx="16.5" cy="9.5" r="2.3" />
      <path d="M3.6 19.5c1.1-3 3.3-4.5 5.6-4.5s4.5 1.5 5.6 4.5" />
      <path d="M15 15.4c2 .2 3.6 1.7 4.5 4.1" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16.2V10a6 6 0 0 1 12 0v6.2l1.4 1.8H4.6L6 16.2Z" />
      <path d="M10.2 20.5a1.9 1.9 0 0 0 3.6 0" />
    </>
  ),
  card: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="1.6" />
      <path d="M3.5 10.2h17" />
      <path d="M7 14.2h4" />
    </>
  ),
  plug: (
    <>
      <path d="M9 3.5v4M15 3.5v4" />
      <path d="M6.5 7.5h11v3.2a5.5 5.5 0 0 1-11 0V7.5Z" />
      <path d="M12 15.7v4.8" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1 0 1.7-.8 1.7-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7h2c2.2 0 3.6-1.7 3.6-4.2 0-4-3.9-7-8-7Z" />
      <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.6" cy="14.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.2" cy="8.2" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 3 20h18L12 4Z" />
      <path d="M12 10.5v4M12 17.2v.1" />
    </>
  ),
  check: <path d="M4.5 12.5 9 17l10.5-10.5" />,
  chevron: <path d="M9 5.5 15.5 12 9 18.5" />,
  upload: (
    <>
      <path d="M12 15.5V4.5M8 8.3 12 4l4 4.3" />
      <path d="M4.5 15.5v3a1.6 1.6 0 0 0 1.6 1.6h11.8a1.6 1.6 0 0 0 1.6-1.6v-3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M3.5 3.5l17 17" />
      <path d="M10.6 5.7A9.9 9.9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16.8 16.8 0 0 1-3.3 4.1M6.6 6.9C4 8.7 2.5 12 2.5 12S6 18.5 12 18.5c1.1 0 2.1-.2 3-.5" />
      <path d="M9.9 10a2.6 2.6 0 0 0 3.6 3.7" />
    </>
  ),
  external: (
    <>
      <path d="M9 5.5H6.6A2.1 2.1 0 0 0 4.5 7.6v9.8a2.1 2.1 0 0 0 2.1 2.1h9.8a2.1 2.1 0 0 0 2.1-2.1V15" />
      <path d="M14 4.5h5.5V10M19.3 4.7l-8 8" />
    </>
  ),
};

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
