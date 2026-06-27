import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminAccessTokenGuard } from '../admin-auth/guards/admin-access-token.guard';
import type { AuthenticatedAdmin } from '../admin-auth/types/admin-auth.types';
import { ListMarketPulsePostsDto } from './dto/list-market-pulse-posts.dto';
import { UpsertMarketPulsePostDto } from './dto/upsert-market-pulse-post.dto';
import { MarketPulsePostsService } from './market-pulse-posts.service';

@Controller('admin/market-pulse/posts')
@UseGuards(AdminAccessTokenGuard)
export class MarketPulsePostsController {
  constructor(
    private readonly marketPulsePostsService: MarketPulsePostsService,
  ) {}

  @Post('drafts')
  createDraft(
    @Req() request: Request & { admin: AuthenticatedAdmin },
    @Body() input: UpsertMarketPulsePostDto,
  ) {
    return this.marketPulsePostsService.createDraft(request.admin, input);
  }

  @Post('published')
  createPublishedPost(
    @Req() request: Request & { admin: AuthenticatedAdmin },
    @Body() input: UpsertMarketPulsePostDto,
  ) {
    return this.marketPulsePostsService.createPublishedPost(
      request.admin,
      input,
    );
  }

  @Get()
  listPosts(@Query() query: ListMarketPulsePostsDto) {
    return this.marketPulsePostsService.listPosts(query);
  }

  @Get(':id')
  getPost(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.marketPulsePostsService.getPostById(id);
  }

  @Patch(':id')
  updatePost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: Request & { admin: AuthenticatedAdmin },
    @Body() input: UpsertMarketPulsePostDto,
  ) {
    return this.marketPulsePostsService.updatePost(id, request.admin, input);
  }

  @Post(':id/publish')
  publishPost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: Request & { admin: AuthenticatedAdmin },
  ) {
    return this.marketPulsePostsService.publishPost(id, request.admin);
  }

  @Delete(':id')
  deletePost(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.marketPulsePostsService.deletePost(id);
  }
}
