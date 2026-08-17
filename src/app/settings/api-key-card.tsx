"use client";

import { useState } from "react";

import styles from "@/components/ui.module.css";

function mask(key: string) {
  return `${key.slice(0, 11)}${"•".repeat(24)}${key.slice(-4)}`;
}

export function ApiKeyCard({ apiKey: initialApiKey }: { apiKey: string }) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function copyKey() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function regenerate() {
    if (!window.confirm("Regenerate the API key? Anything using the current key will stop working immediately.")) {
      return;
    }
    setRegenerating(true);
    const response = await fetch("/api/config/regenerate-key", { method: "POST" });
    const payload = await response.json();
    if (payload.ok) {
      setApiKey(payload.apiKey);
      setRevealed(true);
    }
    setRegenerating(false);
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeadText}>
          <h2>API key</h2>
          <p>Use this key to authenticate requests against the gateway integration.</p>
        </div>
      </div>
      <div className={styles.summaryList}>
        <div className={styles.summaryRow}>
          <code className={styles.mono} style={{ fontSize: 13 }}>
            {revealed ? apiKey : mask(apiKey)}
          </code>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className={styles.ghostButton} onClick={() => setRevealed((v) => !v)}>
              {revealed ? "Hide" : "Show"}
            </button>
            <button type="button" className={styles.ghostButton} onClick={copyKey}>
              {copied ? "Copied!" : "Copy"}
            </button>
            <button type="button" className={styles.ghostButton} onClick={regenerate} disabled={regenerating}>
              {regenerating ? "Regenerating…" : "Regenerate"}
            </button>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 22px 22px" }}>
        <p className={styles.hint} style={{ marginBottom: 8 }}>
          Record a payment from your own site:
        </p>
        <pre
          style={{
            margin: 0,
            padding: "12px 14px",
            background: "var(--surface-alt)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            fontSize: 12,
            lineHeight: 1.6,
            overflowX: "auto",
          }}
        >
{`# Cash-in
curl -X POST ${typeof window !== "undefined" ? window.location.origin : "https://www.netwisepay.com"}/api/v1/cash-ins \\
  -H "Authorization: Bearer ${revealed ? apiKey : "<API_KEY>"}" \\
  -H "Content-Type: application/json" \\
  -d '{"reference":"ORDER-123","channel":"GCash","amount":500}'

# Cash-out (withdrawal)
curl -X POST ${typeof window !== "undefined" ? window.location.origin : "https://www.netwisepay.com"}/api/v1/cash-outs \\
  -H "Authorization: Bearer ${revealed ? apiKey : "<API_KEY>"}" \\
  -H "Content-Type: application/json" \\
  -d '{"amount":500,"bank":"GCash","destination":"09171234567","recipientName":"Juan Dela Cruz"}'`}
        </pre>
        <a
          href="/netwise-pay-api-docs.html"
          download="NetWise-Pay-API-Docs.html"
          className={styles.ghostButton}
          style={{ marginTop: 12, textDecoration: "none" }}
        >
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 3v9.5M10 12.5 6.7 9.2M10 12.5l3.3-3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 14.5v1.8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download full API docs (.html)
        </a>
      </div>
    </section>
  );
}
