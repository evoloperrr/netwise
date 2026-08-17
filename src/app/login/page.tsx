import { signIn } from "@/auth";
import styles from "./login.module.css";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "That Google account isn't allowed to access NetWise.",
  Default: "Something went wrong signing you in. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className={styles.mark}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M12 2 20.5 7v10L12 22 3.5 17V7L12 2Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="1.8" fill="currentColor" />
            <path
              d="M12 12 12 2M12 12 20.5 7M12 12 20.5 17M12 12 12 22M12 12 3.5 17M12 12 3.5 7"
              stroke="currentColor"
              strokeWidth="1.1"
            />
          </svg>
        </span>
        <span className={styles.brand}>NetWise</span>
        <span className={styles.sub}>Sign in to the merchant dashboard</span>

        {error ? (
          <div className={styles.error}>{ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default}</div>
        ) : null}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl || "/" });
          }}
          style={{ width: "100%" }}
        >
          <button type="submit" className={styles.googleBtn}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18Z"
              />
              <path
                fill="#FBBC05"
                d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33Z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
              />
            </svg>
            Sign in with Google
          </button>
        </form>

        <span className={styles.footnote}>
          Access is limited to Google accounts your NetWise administrator has approved.
        </span>
      </div>
    </div>
  );
}
