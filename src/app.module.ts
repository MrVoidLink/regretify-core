import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './config/database.config';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    HealthModule,
    AdminAuthModule,
  ],
})
export class AppModule {}
