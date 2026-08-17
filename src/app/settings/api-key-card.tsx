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
    </section>
  );
}
