export type NavItem = {
  id: string;
  namespace: string;
  label: string;
  icon:
    | "user"
    | "shield"
    | "building"
    | "users"
    | "bell"
    | "card"
    | "plug"
    | "palette"
    | "alert";
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Compte",
    items: [
      { id: "profil", namespace: "account.profile", label: "Profil", icon: "user" },
      { id: "securite", namespace: "account.security", label: "Sécurité", icon: "shield" },
    ],
  },
  {
    title: "Espace de travail",
    items: [
      { id: "workspace", namespace: "workspace.general", label: "Général", icon: "building" },
      { id: "membres", namespace: "workspace.members", label: "Membres et rôles", icon: "users" },
    ],
  },
  {
    title: "Préférences",
    items: [
      { id: "notifications", namespace: "prefs.notifications", label: "Notifications", icon: "bell" },
      { id: "apparence", namespace: "prefs.appearance", label: "Apparence", icon: "palette" },
    ],
  },
  {
    title: "Organisation",
    items: [
      { id: "facturation", namespace: "org.billing", label: "Facturation", icon: "card" },
      { id: "integrations", namespace: "org.integrations", label: "Intégrations", icon: "plug" },
      { id: "zone-sensible", namespace: "org.danger", label: "Zone sensible", icon: "alert" },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
