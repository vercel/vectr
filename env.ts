export const env = {
  // From Blob Storage Integration
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,

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
