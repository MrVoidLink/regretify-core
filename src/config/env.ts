export type RuntimeEnvironment = 'development' | 'test' | 'production';

export type RuntimeEnv = {
  nodeEnv: RuntimeEnvironment;
  port: number;
  host: string;
};

function readRuntimeEnvironment(value: string | undefined): RuntimeEnvironment {
  if (value === 'production' || value === 'test') {
    return value;
  }

  return 'development';
}

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function readRuntimeEnv(): RuntimeEnv {
  return {
    nodeEnv: readRuntimeEnvironment(process.env.NODE_ENV),
    port: readNumber(process.env.PORT, 3000),
    host: process.env.HOST ?? '0.0.0.0',
  };
}
