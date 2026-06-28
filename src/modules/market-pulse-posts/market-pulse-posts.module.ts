import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from '../../database/entities/admin-user.entity';
import { MarketPulsePost } from '../../database/entities/market-pulse-post.entity';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { ObjectStorageModule } from '../object-storage/object-storage.module';
import { MarketPulsePostAssetsController } from './market-pulse-post-assets.controller';
import { MarketPulsePostsController } from './market-pulse-posts.controller';
import { MarketPulsePostsService } from './market-pulse-posts.service';
import { PublicMarketPulsePostsController } from './public-market-pulse-posts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, MarketPulsePost]),
    AdminAuthModule,
    ObjectStorageModule,
  ],
  controllers: [
    MarketPulsePostsController,
    MarketPulsePostAssetsController,
    PublicMarketPulsePostsController,
  ],
  providers: [MarketPulsePostsService],
})
export class MarketPulsePostsModule {}
