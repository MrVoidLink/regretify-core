import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from '../../database/entities/admin-user.entity';
import { MarketPulsePost } from '../../database/entities/market-pulse-post.entity';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { MarketPulsePostsController } from './market-pulse-posts.controller';
import { MarketPulsePostsService } from './market-pulse-posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUser, MarketPulsePost]), AdminAuthModule],
  controllers: [MarketPulsePostsController],
  providers: [MarketPulsePostsService],
})
export class MarketPulsePostsModule {}
