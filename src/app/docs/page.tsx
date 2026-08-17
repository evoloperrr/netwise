import type { Metadata } from "next";

import styles from "./docs.module.css";

export const metadata: Metadata = {
  title: "NetWise Pay API",
  description: "Integration reference for connecting a members website to NetWise Pay's cash-in and cash-out endpoints.",
};

export default function DocsPage() {
  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>N</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>NetWise Pay</span>
            <span className={styles.brandSub}>API Reference</span>
          </span>
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navLabel}>Getting started</div>
          <a className={styles.navLink} href="#auth">
            Authentication
          </a>
          <a className={styles.navLink} href="#statuses">
            Status values
          </a>
          <a className={styles.navLink} href="#errors">
            Errors
          </a>
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navLabel}>Cash-ins</div>
          <a className={styles.navLink} href="#create-cash-in">
            <span className={`${styles.m} ${styles.mPost}`}>POST</span> Create
          </a>
          <a className={styles.navLink} href="#get-cash-in">
            <span className={`${styles.m} ${styles.mGet}`}>GET</span> Retrieve
          </a>
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navLabel}>Cash-outs</div>
          <a className={styles.navLink} href="#create-cash-out">
            <span className={`${styles.m} ${styles.mPost}`}>POST</span> Create
          </a>
          <a className={styles.navLink} href="#get-cash-out">
            <span className={`${styles.m} ${styles.mGet}`}>GET</span> Retrieve
          </a>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>v1 · members-site integration</span>
          <h1>Connect your site to NetWise Pay</h1>
          <p className={styles.lede}>
            Four endpoints let your members website record payments and submit withdrawals, backed by the same
            settlement dashboard your team already uses. You send us one request; we handle the gateway call, the
            fee math, and the record-keeping.
          </p>

          <div className={styles.quickfacts}>
            <div className={styles.quickfact}>
              <div className={styles.quickfactLabel}>Base URL</div>
              <div className={styles.quickfactValue}>https://www.netwisepay.com</div>
            </div>
            <div className={styles.quickfact}>
              <div className={styles.quickfactLabel}>Content type</div>
              <div className={styles.quickfactValue}>application/json</div>
            </div>
          </div>
        </div>

        <section className={styles.docBlock} id="auth">
          <h2>Authentication</h2>
          <p className={styles.sectionDesc}>
            Every request needs your API key in the <code>Authorization</code> header, as a Bearer token. Find
            (and regenerate) your key under <strong>Settings → API key</strong> in the dashboard.
          </p>
          <pre className={styles.codeBlock}>
            <span className={"c"}># Header on every request</span>
            {"\n"}Authorization: Bearer <span className={"s"}>nw_live_••••••••••••••••••••••••••••••••••••</span>
          </pre>
          <div className={styles.note} style={{ marginTop: 14 }}>
            <strong>Keep this server-side.</strong> This key belongs to your backend, not the browser — never call
            these endpoints from client-side JavaScript, and never commit the key to a repo.
          </div>
        </section>

        <section className={styles.docBlock} id="create-cash-in">
          <h2>Cash-ins</h2>
          <p className={styles.sectionDesc}>
            Records a payment your site has already collected from a member — GCash, Maya, GoTyme, QRPH, or a
            card charge — so it shows up in the settlement dashboard with the correct fee split.
          </p>

          <div className={styles.endpoint}>
            <div className={styles.endpointHead}>
              <span className={`${styles.method} ${styles.methodPost}`}>POST</span>
              <span className={styles.path}>/api/v1/cash-ins</span>
            </div>
            <p className={styles.endpointDesc}>
              Create a cash-in record. A 2.5% processing fee is deducted from <code>amount</code> automatically
              (configurable in Settings). Fails with <code>409</code> if the reference was already used.
            </p>
            <div className={`${styles.endpointBody} ${styles.twoCol}`}>
              <div>
                <div className={styles.codeLabel}>Body</div>
                <table className={styles.fieldTable}>
                  <tbody>
                    <tr>
                      <th>Field</th>
                      <th>Type</th>
                      <th></th>
                    </tr>
                    <tr>
                      <td>
                        <code>reference</code>
                      </td>
                      <td>string</td>
                      <td>
                        <span className={styles.req}>required</span>
                        <br />
                        Your own unique order ID
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>channel</code>
                      </td>
                      <td>string</td>
                      <td>
                        <span className={styles.req}>required</span>
                        <br />
                        <code>GCash</code> · <code>Maya</code> · <code>GoTyme</code> · <code>QRPH</code> ·{" "}
                        <code>Card</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>amount</code>
                      </td>
                      <td>number</td>
                      <td>
                        <span className={styles.req}>required</span>
                        <br />
                        Gross amount in PHP
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <div className={styles.codeLabel}>Request</div>
                <pre className={styles.codeBlock}>
{`curl -X POST \\
  https://www.netwisepay.com/api/v1/cash-ins \\
  -H "Authorization: Bearer nw_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "reference": "ORDER-1042",
    "channel": "GCash",
    "amount": 500
  }'`}
                </pre>
              </div>
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              <div className={styles.codeLabel}>Response · 201 Created</div>
              <pre className={styles.codeBlock}>
{`{
  "ok": true,
  "cashIn": {
    "id": 14,
    "reference": "ORDER-1042",
    "channel": "GCash",
    "grossPhp": 500,
    "feePhp": 12.5,
    "netCreditPhp": 487.5,
    "status": "pending",
    "createdAt": "2026-08-17T14:02:11.000Z"
  }
}`}
              </pre>
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              <div className={styles.note}>
                This endpoint <strong>records</strong> the payment — it does not itself open a GCash/Maya prompt
                or generate a QR code. Collect payment on your own site first, then call this to log it. A team
                member marks it <code>approved</code> once reconciled.
              </div>
            </div>
          </div>

          <div className={styles.endpoint} id="get-cash-in">
            <div className={styles.endpointHead}>
              <span className={`${styles.method} ${styles.methodGet}`}>GET</span>
              <span className={styles.path}>/api/v1/cash-ins?reference=ORDER-1042</span>
            </div>
            <p className={styles.endpointDesc}>Look up a cash-in&apos;s current status by the reference you gave it.</p>
            <div className={`${styles.endpointBody} ${styles.twoCol}`}>
              <div>
                <div className={styles.codeLabel}>Query</div>
                <table className={styles.fieldTable}>
                  <tbody>
                    <tr>
                      <th>Param</th>
                      <th></th>
                    </tr>
                    <tr>
                      <td>
                        <code>reference</code>
                      </td>
                      <td>
                        <span className={styles.req}>required</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <div className={styles.codeLabel}>Request</div>
                <pre className={styles.codeBlock}>
{`curl \\
  "https://www.netwisepay.com/api/v1/cash-ins?reference=ORDER-1042" \\
  -H "Authorization: Bearer nw_live_..."`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.docBlock} id="create-cash-out">
          <h2>Cash-outs</h2>
          <p className={styles.sectionDesc}>
            Submits a real withdrawal. This calls VLPAY directly on your behalf — the recipient is paid out for
            real once it succeeds, so treat every call as final.
          </p>

          <div className={styles.endpoint}>
            <div className={styles.endpointHead}>
              <span className={`${styles.method} ${styles.methodPost}`}>POST</span>
              <span className={styles.path}>/api/v1/cash-outs</span>
            </div>
            <p className={styles.endpointDesc}>Create and submit a withdrawal for disbursement.</p>
            <div className={`${styles.endpointBody} ${styles.twoCol}`}>
              <div>
                <div className={styles.codeLabel}>Body</div>
                <table className={styles.fieldTable}>
                  <tbody>
                    <tr>
                      <th>Field</th>
                      <th>Type</th>
                      <th></th>
                    </tr>
                    <tr>
                      <td>
                        <code>amount</code>
                      </td>
                      <td>number</td>
                      <td>
                        <span className={styles.req}>required</span>
                        <br />
                        PHP, within the dashboard&apos;s configured min/max
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>bank</code>
                      </td>
                      <td>string</td>
                      <td>
                        <span className={styles.req}>required</span>
                        <br />
                        See supported values below
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>destination</code>
                      </td>
                      <td>string</td>
                      <td>
                        <span className={styles.req}>required</span>
                        <br />
                        Account number, or mobile number for e-wallets
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>recipientName</code>
                      </td>
                      <td>string</td>
                      <td>
                        <span className={styles.req}>required</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <div className={styles.codeLabel}>Request</div>
                <pre className={styles.codeBlock}>
{`curl -X POST \\
  https://www.netwisepay.com/api/v1/cash-outs \\
  -H "Authorization: Bearer nw_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 500,
    "bank": "GCash",
    "destination": "09171234567",
    "recipientName": "Juan Dela Cruz"
  }'`}
                </pre>
              </div>
            </div>
            <div style={{ padding: "0 20px 6px" }}>
              <div className={styles.codeLabel}>
                Supported <code>bank</code> values
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "6px 0 14px" }}>
                <code>GCash</code> · <code>Maya</code> · <code>GoTyme Bank</code> · <code>Maya Bank</code> ·{" "}
                <code>BDO Unibank</code> · <code>BPI</code> · <code>UnionBank</code>
              </p>
              <div className={styles.codeLabel}>Response · 201 Created</div>
              <pre className={styles.codeBlock}>
{`{
  "ok": true,
  "cashOut": {
    "id": 9,
    "reference": "NW-1755440531-a1b2c3",
    "recipientName": "Juan Dela Cruz",
    "destination": "09171234567",
    "bank": "GCash",
    "grossPhp": 500,
    "feePhp": 25,
    "netPhp": 475,
    "status": "processing",
    "vlpayOrderNo": "DIS26010617538674688"
  }
}`}
              </pre>
              <div className={styles.note} style={{ marginTop: 14 }}>
                <strong>
                  <code>processing</code> is not final.
                </strong>{" "}
                VLPAY confirms success or failure asynchronously. Poll{" "}
                <a href="#get-cash-out">GET below</a> using the <code>reference</code> you received until{" "}
                <code>status</code> becomes <code>approved</code> or <code>rejected</code>.
              </div>
            </div>
          </div>

          <div className={styles.endpoint} id="get-cash-out">
            <div className={styles.endpointHead}>
              <span className={`${styles.method} ${styles.methodGet}`}>GET</span>
              <span className={styles.path}>/api/v1/cash-outs?reference=NW-...</span>
            </div>
            <p className={styles.endpointDesc}>Look up a withdrawal&apos;s current status.</p>
            <div className={`${styles.endpointBody} ${styles.twoCol}`}>
              <div>
                <div className={styles.codeLabel}>Query</div>
                <table className={styles.fieldTable}>
                  <tbody>
                    <tr>
                      <th>Param</th>
                      <th></th>
                    </tr>
                    <tr>
                      <td>
                        <code>reference</code>
                      </td>
                      <td>
                        <span className={styles.req}>required</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <div className={styles.codeLabel}>Request</div>
                <pre className={styles.codeBlock}>
{`curl \\
  "https://www.netwisepay.com/api/v1/cash-outs?reference=NW-1755440531-a1b2c3" \\
  -H "Authorization: Bearer nw_live_..."`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.docBlock} id="statuses">
          <h2>Status values</h2>
          <p className={styles.sectionDesc}>What each status on a record means.</p>

          <div className={styles.statusGrid}>
            <div className={styles.statusCard}>
              <h3>CashIn.status</h3>
              <span className={`${styles.pill} ${styles.pillWarning}`}>pending</span>
              <span className={`${styles.pill} ${styles.pillSuccess}`}>approved</span>
              <span className={`${styles.pill} ${styles.pillDanger}`}>rejected</span>
              <p>Set by a team member after reconciling against what actually landed. Not automated.</p>
            </div>
            <div className={styles.statusCard}>
              <h3>CashOut.status</h3>
              <span className={`${styles.pill} ${styles.pillWarning}`}>processing</span>
              <span className={`${styles.pill} ${styles.pillSuccess}`}>approved</span>
              <span className={`${styles.pill} ${styles.pillDanger}`}>rejected</span>
              <p>
                <code>processing</code> → VLPAY confirms via webhook → <code>approved</code>/<code>rejected</code>.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.docBlock} id="errors">
          <h2>Errors</h2>
          <p className={styles.sectionDesc}>
            Every error responds with <code>{`{ "ok": false, "error": "..." }`}</code> and one of these HTTP
            statuses.
          </p>

          <table className={styles.errTable}>
            <tbody>
              <tr>
                <th>Status</th>
                <th>Meaning</th>
              </tr>
              <tr>
                <td>
                  <code>401</code>
                </td>
                <td>Missing or invalid Authorization header.</td>
              </tr>
              <tr>
                <td>
                  <code>422</code>
                </td>
                <td>A required field is missing or out of range — error says which.</td>
              </tr>
              <tr>
                <td>
                  <code>409</code>
                </td>
                <td>
                  <em>Cash-ins only:</em> that reference was already used.
                </td>
              </tr>
              <tr>
                <td>
                  <code>503</code>
                </td>
                <td>
                  <em>Cash-outs only:</em> withdrawals are currently disabled from Settings.
                </td>
              </tr>
              <tr>
                <td>
                  <code>404</code>
                </td>
                <td>
                  <em>GET only:</em> no record with that reference.
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer className={styles.pageFooter}>
          NetWise Pay API v1 · Questions about a specific integration go to your NetWise Pay contact, not VLPAY
          support.
        </footer>
      </main>
    </div>
  );
}
