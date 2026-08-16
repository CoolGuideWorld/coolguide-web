"use client";

import { useEffect, useState } from "react";
import styles from "@/app/studio/studio.module.css";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioSidebar from "@/components/studio/StudioSidebar";

type StudioShellProps = {
  displayName: string;
  children: React.ReactNode;
};

export default function StudioShell({ displayName, children }: StudioShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((open) => !open);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen]);

  return (
    <div className={styles.studioShell}>
      <StudioSidebar displayName={displayName} isOpen={sidebarOpen} onNavigate={closeSidebar} />

      {sidebarOpen ? (
        <button
          type="button"
          className={styles.mobileBackdrop}
          aria-label="Fermer le menu Studio"
          onClick={closeSidebar}
        />
      ) : null}

      <div className={styles.mainColumn}>
        <StudioHeader displayName={displayName} onToggleMenu={toggleSidebar} />
        <main className={styles.contentArea}>{children}</main>
      </div>
    </div>
  );
}
