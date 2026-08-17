import { randomBytes } from "crypto";

import { prisma } from "./prisma";

function generateApiKey() {
  return `nw_live_${randomBytes(24).toString("hex")}`;
}

// Lazily creates the singleton config row (id=1) with sane defaults on
// first read, instead of requiring a separate seed step to be remembered.
export async function getGatewayConfig() {
  return prisma.gatewayConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, apiKey: generateApiKey() },
  });
}

export async function regenerateApiKey() {
  return prisma.gatewayConfig.update({
    where: { id: 1 },
    data: { apiKey: generateApiKey() },
  });
}
