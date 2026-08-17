"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import styles from "./sidebar.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const items: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10.5 10 4l7 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9.5V16a1 1 0 0 0 1 1h3v-4a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v4h3a1 1 0 0 0 1-1V9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/cash-ins",
    label: "Cash-ins",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 3v10.5M10 13.5 6 9.5M10 13.5l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 15.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/cash-outs",
    label: "Cash-outs",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 16.5V6M10 6l-4 4M10 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 15.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M10 3.5v1.4M10 15.1v1.4M16.5 10h-1.4M4.9 10H3.5M14.6 5.4l-1 1M6.4 13.6l-1 1M14.6 14.6l-1-1M6.4 6.4l-1-1"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path
              d="M12 2 20.5 7v10L12 22 3.5 17V7L12 2Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="2" r="1.6" fill="currentColor" />
            <circle cx="20.5" cy="7" r="1.6" fill="currentColor" />
            <circle cx="20.5" cy="17" r="1.6" fill="currentColor" />
            <circle cx="12" cy="22" r="1.6" fill="currentColor" />
            <circle cx="3.5" cy="17" r="1.6" fill="currentColor" />
            <circle cx="3.5" cy="7" r="1.6" fill="currentColor" />
            <circle cx="12" cy="12" r="1.8" fill="currentColor" />
            <path d="M12 12 12 2M12 12 20.5 7M12 12 20.5 17M12 12 12 22M12 12 3.5 17M12 12 3.5 7" stroke="currentColor" strokeWidth="1.1" />
          </svg>
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandName}>NetWise</span>
          <span className={styles.brandSub}>Think Smart. Connect Wise.</span>
        </span>
      </div>

      <nav className={styles.nav}>
        <span className={styles.navGroupLabel}>Overview</span>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.navFooter}>
        <div className={styles.envPill}>
          <span className={styles.envDot} />
          Sandbox data · not connected
        </div>
      </div>
    </aside>
  );
}
