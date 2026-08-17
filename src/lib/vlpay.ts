/* eslint-disable @typescript-eslint/no-explicit-any -- VLPAY's response bodies
   are narrowed inline; see VLPAY API Documentation_v1.pdf for the confirmed
   shapes used here. */
import https from "node:https";
import { HttpsProxyAgent } from "https-proxy-agent";

type JsonResponse = { statusCode: number; body: any };

// VLPAY firewalls their API to a whitelisted source IP (error 40000: "The IP
// address is not whitelisted."). Vercel serverless has no static outbound IP,
// so VLPAY_PROXY_URL must point at a fixed proxy whose IP is registered with
// VLPAY -- e.g. http://user:pass@1.2.3.4:8888. Calls will fail with 40000
// until this is configured.
const vlpayProxyAgent = process.env.VLPAY_PROXY_URL
  ? new HttpsProxyAgent(process.env.VLPAY_PROXY_URL)
  : undefined;

function postJson(urlString: string, payload: unknown, headers: Record<string, string> = {}) {
  return new Promise<JsonResponse>((resolve, reject) => {
    const url = new URL(urlString);
    const rawBody = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: "POST",
        port: 443,
        agent: vlpayProxyAgent,
        rejectUnauthorized: process.env.VLPAY_ALLOW_INSECURE_SSL === "true" ? false : true,
        timeout: 20000,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Content-Length": Buffer.byteLength(rawBody).toString(),
          ...headers,
        },
      },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => (responseBody += chunk));
        res.on("end", () => {
          let parsed: any = responseBody;
          try {
            parsed = JSON.parse(responseBody);
          } catch {}
          resolve({ statusCode: res.statusCode || 500, body: parsed });
        });
      },
    );

    req.on("timeout", () => req.destroy(new Error(`VLPAY request timeout after 20s: ${urlString}`)));
    req.on("error", reject);
    req.write(rawBody);
    req.end();
  });
}

async function getVlpayToken() {
  const baseUrl = process.env.VLPAY_BASE_URL;
  const accessKey = process.env.VLPAY_ACCESS_KEY;
  const secretKey = process.env.VLPAY_SECRET_KEY;

  if (!baseUrl || !accessKey || !secretKey) {
    throw new Error("Missing VLPAY_BASE_URL, VLPAY_ACCESS_KEY, or VLPAY_SECRET_KEY.");
  }

  const response = await postJson(`${baseUrl}/v1/authenticate`, { access_key: accessKey, secret_key: secretKey });
  const data = response.body;

  if (response.statusCode < 200 || response.statusCode >= 300 || !data?.success || !data?.data?.token) {
    throw new Error(data?.data?.message || data?.message || `VLPAY authentication failed. HTTP ${response.statusCode}.`);
  }

  return data.data.token as string;
}

// Token lasts 1hr (per VLPAY docs); refresh at 50min leaves margin. Per-instance
// only -- does not share state across cold starts/serverless instances.
const TOKEN_TTL_MS = 50 * 60 * 1000;
let cachedToken: { token: string; expiresAt: number } | null = null;
let pendingToken: Promise<string> | null = null;

async function getCachedVlpayToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) return cachedToken.token;
  if (pendingToken) return pendingToken;

  pendingToken = getVlpayToken()
    .then((token) => {
      cachedToken = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
      return token;
    })
    .finally(() => {
      pendingToken = null;
    });

  return pendingToken;
}

export type VlpayPayoutParams = {
  amountCentavos: number;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  recipientName: string;
  callbackUrl: string;
  referenceId: string;
  description: string;
};

export type VlpayPayoutResult =
  | { ok: true; orderNo: string; status: string; raw: unknown }
  | { ok: false; errorMessage: string; raw: unknown };

// The only place VLPAY's payout payload shape is built -- see
// VLPAY API Documentation_v1.pdf, section 4 (Payout/Disbursement), for the
// confirmed request/response shape this mirrors.
export async function createVlpayPayout(params: VlpayPayoutParams): Promise<VlpayPayoutResult> {
  const baseUrl = process.env.VLPAY_BASE_URL;
  if (!baseUrl) throw new Error("Missing VLPAY_BASE_URL.");

  const token = await getCachedVlpayToken();

  const payload = {
    destinationAccount: {
      accountNumber: params.accountNumber,
      bankCode: params.bankCode,
      bankName: params.bankName,
      recipientName: params.recipientName,
      type: "PERSONAL",
    },
    amount: params.amountCentavos,
    currency: "PHP",
    country: "PH",
    callbackUrl: params.callbackUrl,
    metadata: {
      description: params.description,
      referenceId: params.referenceId,
    },
  };

  const response = await postJson(`${baseUrl}/v1/transactions/payout`, payload, { Authorization: token });
  const data = response.body as { success?: boolean; data?: Record<string, unknown>; message?: string } | undefined;

  if (response.statusCode < 200 || response.statusCode >= 300 || !data?.success) {
    const message = (data?.data?.message as string | undefined) || data?.message || `HTTP ${response.statusCode}`;
    return { ok: false, errorMessage: String(message), raw: data ?? { error: message } };
  }

  return {
    ok: true,
    orderNo: String(data.data?.orderNo ?? ""),
    status: String(data.data?.status ?? "INIT"),
    raw: data,
  };
}
