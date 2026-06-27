import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './config/database.config';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { HealthModule } from './modules/health/health.module';
import { MarketPulsePostsModule } from './modules/market-pulse-posts/market-pulse-posts.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    HealthModule,
    AdminAuthModule,
    MarketPulsePostsModule,
  ],
})
export class AppModule {}
