function normalizeUrl(value: string | undefined) {
  return value?.trim().replace(/\/$/, '') || '';
}

export function getObjectStorageConfig() {
  const endpoint = normalizeUrl(process.env.R2_ENDPOINT);
  const publicBaseUrl = normalizeUrl(process.env.R2_PUBLIC_BASE_URL);
  const bucketName = process.env.R2_BUCKET_NAME?.trim() || '';
  const accountId = process.env.R2_ACCOUNT_ID?.trim() || '';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() || '';
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() || '';

  return {
    provider: 'cloudflare-r2' as const,
    accountId,
    bucketName,
    endpoint,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
    isConfigured:
      Boolean(endpoint) &&
      Boolean(bucketName) &&
      Boolean(accessKeyId) &&
      Boolean(secretAccessKey),
  };
}
