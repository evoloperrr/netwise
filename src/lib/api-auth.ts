import { getGatewayConfig } from "./config";

// Verifies the "Authorization: Bearer <apiKey>" header on public /api/v1/*
// routes against the single live API key stored on GatewayConfig.
export async function verifyApiKey(request: Request): Promise<boolean> {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) return false;

  const config = await getGatewayConfig();
  return token === config.apiKey;
}
