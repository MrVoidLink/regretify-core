function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getAdminAuthConfig() {
  return {
    jwtSecret: process.env.ADMIN_AUTH_JWT_SECRET?.trim() || '',
    jwtExpiresInSeconds: readNumber(
      process.env.ADMIN_AUTH_JWT_EXPIRES_IN_SECONDS,
      60 * 60 * 12,
    ),
    bootstrapEmail:
      process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase() || '',
    bootstrapPassword: process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim() || '',
    bootstrapRole: process.env.ADMIN_BOOTSTRAP_ROLE?.trim() || 'super_admin',
  };
}
