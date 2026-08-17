import { prisma } from "./prisma";

// Lazily creates the singleton config row (id=1) with sane defaults on
// first read, instead of requiring a separate seed step to be remembered.
export async function getGatewayConfig() {
  return prisma.gatewayConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}
