import { readRuntimeEnv } from './env';

export function getAppConfig() {
  return readRuntimeEnv();
}
