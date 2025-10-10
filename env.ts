export const env = {
  // From Blob Storage Integration
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,

  // From Neon Database Integration
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
  NEON_PROJECT_ID: process.env.NEON_PROJECT_ID,
  PGDATABASE: process.env.PGDATABASE,
  PGHOST: process.env.PGHOST,
  PGHOST_UNPOOLED: process.env.PGHOST_UNPOOLED,
  PGPASSWORD: process.env.PGPASSWORD,
  PGUSER: process.env.PGUSER,
  POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
  POSTGRES_URL: process.env.POSTGRES_URL,
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
  POSTGRES_URL_NO_SSL: process.env.POSTGRES_URL_NO_SSL,
  POSTGRES_USER: process.env.POSTGRES_USER,

  // From Upstash Search Integration
  UPSTASH_SEARCH_REST_READONLY_TOKEN:
    process.env.UPSTASH_SEARCH_REST_READONLY_TOKEN,
  UPSTASH_SEARCH_REST_TOKEN: process.env.UPSTASH_SEARCH_REST_TOKEN,
  UPSTASH_SEARCH_REST_URL: process.env.UPSTASH_SEARCH_REST_URL,
};

for (const [key, value] of Object.entries(env)) {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}
