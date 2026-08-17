import type { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import styles from "./sidebar.module.css";

type PageShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageShell({ title, description, actions, children }: PageShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className={styles.topbarActions}>{actions}</div> : null}
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
