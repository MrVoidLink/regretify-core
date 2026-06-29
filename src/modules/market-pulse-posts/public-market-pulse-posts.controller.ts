import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ListMarketPulsePostsDto } from './dto/list-market-pulse-posts.dto';
import { MarketPulsePostsService } from './market-pulse-posts.service';

@Controller('market-pulse/posts')
export class PublicMarketPulsePostsController {
  constructor(
    private readonly marketPulsePostsService: MarketPulsePostsService,
  ) {}

  @Get()
  listPublishedPosts(@Query() query: ListMarketPulsePostsDto) {
    return this.marketPulsePostsService.listPublishedPosts(query);
  }

  @Get(':slug')
  getPublishedPostBySlug(@Param('slug') slug: string) {
    return this.marketPulsePostsService.getPublishedPostBySlug(slug);
  }

  @Post(':slug/views')
  recordPublishedPostView(@Param('slug') slug: string) {
    return this.marketPulsePostsService.recordPublishedPostView(slug);
  }
}
