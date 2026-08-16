"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/app/studio/studio.module.css";

type StudioNavItemProps = {
  href: string;
  label: string;
  onNavigate?: () => void;
};

export default function StudioNavItem({ href, label, onNavigate }: StudioNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`${styles.navItem}${isActive ? ` ${styles.navItemActive}` : ""}`}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}
