"use client";

import { logoutStudioAction } from "@/app/studio/actions";
import styles from "@/app/studio/studio.module.css";
import StudioNavItem from "@/components/studio/StudioNavItem";
import { studioAdminNav, studioMainNav } from "@/components/studio/studioNavigation";

type StudioSidebarProps = {
  displayName: string;
  isOpen: boolean;
  onNavigate?: () => void;
};

export default function StudioSidebar({ displayName, isOpen, onNavigate }: StudioSidebarProps) {
  return (
    <aside className={`${styles.sidebar}${isOpen ? ` ${styles.sidebarOpen}` : ""}`}>
      <div className={styles.sidebarBrand}>
        <p className={styles.sidebarTitle}>CoolGuide Studio</p>
        <p className={styles.sidebarSubtitle}>Pilotage administratif</p>
      </div>

      <nav className={styles.sidebarNav} aria-label="Navigation Studio principale">
        {studioMainNav.map((item) => (
          <StudioNavItem key={item.href} href={item.href} label={item.label} onNavigate={onNavigate} />
        ))}

        <div className={styles.sidebarNavBottom}>
          {studioAdminNav.map((item) => (
            <StudioNavItem key={item.href} href={item.href} label={item.label} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      <div className={styles.sidebarUser}>
        <p className={styles.sidebarUserName}>{displayName}</p>
        <p className={styles.sidebarUserRole}>Administrateur</p>

        <form action={logoutStudioAction}>
          <button type="submit" className={styles.logoutButtonGhost}>
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
