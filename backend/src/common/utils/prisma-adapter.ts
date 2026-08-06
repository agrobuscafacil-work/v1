import { PrismaPg } from '@prisma/adapter-pg';

export function createPrismaPgAdapter(connectionString?: string, ssl = false) {
  return new PrismaPg({
    connectionString: connectionString || '',
    ...(ssl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}
