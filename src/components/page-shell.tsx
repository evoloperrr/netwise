import type { ReactNode } from "react";

import { auth, signOut } from "@/auth";
import { Sidebar } from "./sidebar";
import styles from "./sidebar.module.css";

type PageShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export async function PageShell({ title, description, actions, children }: PageShellProps) {
  const session = await auth();

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          <div className={styles.topbarActions}>
            {actions}
            {session?.user ? (
              <div className={styles.accountChip}>
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="" className={styles.accountAvatar} />
                ) : null}
                <span className={styles.accountEmail}>{session.user.email}</span>
              </div>
            ) : null}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className={styles.ghostButton}>
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
