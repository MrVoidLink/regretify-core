import { join } from 'node:path';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getDatabaseConfig() {
  return {
    host: process.env.DATABASE_HOST ?? '127.0.0.1',
    port: readNumber(process.env.DATABASE_PORT, 5432),
    name: process.env.DATABASE_NAME ?? 'regretify',
    user: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
  };
}

export function getTypeOrmConfig(): TypeOrmModuleOptions {
  const database = getDatabaseConfig();

  return {
    type: 'postgres',
    host: database.host,
    port: database.port,
    username: database.user,
    password: database.password,
    database: database.name,
    autoLoadEntities: true,
    synchronize: false,
    migrationsRun: true,
    migrations: [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],
  };
}
