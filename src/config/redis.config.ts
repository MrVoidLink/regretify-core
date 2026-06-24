function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getRedisConfig() {
  return {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: readNumber(process.env.REDIS_PORT, 6379),
  };
}
