import { PrismaClient } from '@prisma/client';

// Workaround for Vercel serverless functions
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#example-with-a-single-prismaclient-in-a-nextjs-api-route
const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;