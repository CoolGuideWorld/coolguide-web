"use client";

import styles from "@/app/studio/studio.module.css";

type StudioHeaderProps = {
  displayName: string;
  onToggleMenu: () => void;
};

export default function StudioHeader({ displayName, onToggleMenu }: StudioHeaderProps) {
  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuButton}
        aria-label="Ouvrir le menu Studio"
        onClick={onToggleMenu}
      >
        ☰
      </button>

      <div className={styles.searchWrap}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Rechercher une ville, un circuit, un POI..."
          readOnly
          aria-label="Recherche globale"
        />
      </div>

      <div className={styles.topbarUser}>
        <p className={styles.topbarUserName}>{displayName}</p>
        <p className={styles.topbarUserRole}>Administrateur</p>
      </div>
    </header>
  );
}
