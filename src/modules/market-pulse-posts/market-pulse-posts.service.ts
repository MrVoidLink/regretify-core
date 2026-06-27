import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AdminUser } from '../../database/entities/admin-user.entity';
import {
  type MarketPulsePostStatus,
  MarketPulsePost,
} from '../../database/entities/market-pulse-post.entity';
import { type AuthenticatedAdmin } from '../admin-auth/types/admin-auth.types';
import {
  ListMarketPulsePostsDto,
  type MarketPulsePostSort,
} from './dto/list-market-pulse-posts.dto';
import { UpsertMarketPulsePostDto } from './dto/upsert-market-pulse-post.dto';

type PostAuthorSnapshot = {
  authorAdminUserId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorRole: string;
  authorAvatarAssetKey: string | null;
};

@Injectable()
export class MarketPulsePostsService {
  constructor(
    @InjectRepository(MarketPulsePost)
    private readonly marketPulsePostsRepository: Repository<MarketPulsePost>,
    @InjectRepository(AdminUser)
    private readonly adminUsersRepository: Repository<AdminUser>,
  ) {}

  async createDraft(
    authenticatedAdmin: AuthenticatedAdmin,
    input: UpsertMarketPulsePostDto,
  ) {
    return this.createPost(authenticatedAdmin, input, 'draft');
  }

  async createPublishedPost(
    authenticatedAdmin: AuthenticatedAdmin,
    input: UpsertMarketPulsePostDto,
  ) {
    return this.createPost(authenticatedAdmin, input, 'published');
  }

  async listPosts(query: ListMarketPulsePostsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const queryBuilder = this.marketPulsePostsRepository.createQueryBuilder('post');

    if (query.status) {
      queryBuilder.andWhere('post.status = :status', { status: query.status });
    }

    if (query.publishedFrom) {
      queryBuilder.andWhere('post.published_at >= :publishedFrom', {
        publishedFrom: new Date(`${query.publishedFrom}T00:00:00.000Z`),
      });
    }

    if (query.publishedTo) {
      queryBuilder.andWhere('post.published_at <= :publishedTo', {
        publishedTo: new Date(`${query.publishedTo}T23:59:59.999Z`),
      });
    }

    this.applySort(queryBuilder, query.sort ?? 'newest-created');

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    const [draftCount, publishedCount, totalCount] = await Promise.all([
      this.marketPulsePostsRepository.count({ where: { status: 'draft' } }),
      this.marketPulsePostsRepository.count({ where: { status: 'published' } }),
      this.marketPulsePostsRepository.count(),
    ]);

    return {
      items: items.map((item) => this.serializePost(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary: {
        total: totalCount,
        draft: draftCount,
        published: publishedCount,
      },
    };
  }

  async getPostById(id: string) {
    const post = await this.findPostOrFail(id);
    return this.serializePost(post);
  }

  async updatePost(
    id: string,
    authenticatedAdmin: AuthenticatedAdmin,
    input: UpsertMarketPulsePostDto,
  ) {
    const post = await this.findPostOrFail(id);
    await this.assertSlugAvailable(input.slug, post.id);

    const authorSnapshot = await this.buildAuthorSnapshot(authenticatedAdmin);
    this.assignPostFields(post, input, authorSnapshot);

    await this.marketPulsePostsRepository.save(post);
    return this.serializePost(post);
  }

  async publishPost(id: string, authenticatedAdmin: AuthenticatedAdmin) {
    const post = await this.findPostOrFail(id);
    const authorSnapshot = await this.buildAuthorSnapshot(authenticatedAdmin);

    this.assertPublishable(post);

    post.status = 'published';
    post.publishedAt = new Date();
    post.authorAdminUserId = authorSnapshot.authorAdminUserId;
    post.authorUsername = authorSnapshot.authorUsername;
    post.authorDisplayName = authorSnapshot.authorDisplayName;
    post.authorRole = authorSnapshot.authorRole;
    post.authorAvatarAssetKey = authorSnapshot.authorAvatarAssetKey;

    await this.marketPulsePostsRepository.save(post);
    return this.serializePost(post);
  }

  async deletePost(id: string) {
    const post = await this.findPostOrFail(id);
    await this.marketPulsePostsRepository.remove(post);

    return { success: true };
  }

  private async createPost(
    authenticatedAdmin: AuthenticatedAdmin,
    input: UpsertMarketPulsePostDto,
    status: MarketPulsePostStatus,
  ) {
    await this.assertSlugAvailable(input.slug);

    const authorSnapshot = await this.buildAuthorSnapshot(authenticatedAdmin);
    const post = this.marketPulsePostsRepository.create({
      status,
      publishedAt: status === 'published' ? new Date() : null,
      viewsCount: 0,
      likesCount: 0,
    });

    this.assignPostFields(post, input, authorSnapshot);

    if (status === 'published') {
      this.assertPublishable(post);
    }

    await this.marketPulsePostsRepository.save(post);
    return this.serializePost(post);
  }

  private async buildAuthorSnapshot(authenticatedAdmin: AuthenticatedAdmin) {
    const admin = await this.adminUsersRepository.findOne({
      where: { id: authenticatedAdmin.sub },
    });

    if (!admin || admin.status !== 'active') {
      throw new UnauthorizedException('Admin account is not active.');
    }

    return {
      authorAdminUserId: admin.id,
      authorUsername: admin.username?.trim() || admin.email.split('@')[0] || 'operator',
      authorDisplayName:
        admin.displayName?.trim() || this.formatDisplayNameFromEmail(admin.email),
      authorRole: admin.authorRole?.trim() || 'Regretify market pulse editor.',
      authorAvatarAssetKey: admin.avatarAssetKey?.trim() || null,
    } satisfies PostAuthorSnapshot;
  }

  private assignPostFields(
    post: MarketPulsePost,
    input: UpsertMarketPulsePostDto,
    authorSnapshot: PostAuthorSnapshot,
  ) {
    post.title = input.title.trim();
    post.slug = input.slug.trim().toLowerCase();
    post.excerpt = input.excerpt?.trim() ?? '';
    post.category = input.category?.trim() ?? '';
    post.badge = input.badge?.trim() ?? '';
    post.accent = input.accent?.trim() ?? '';
    post.summaryHeading = input.summaryHeading?.trim() ?? '';
    post.bodyHtml = input.bodyHtml?.trim() ?? '';
    post.tags = input.tags?.trim() ?? '';
    post.feedHeroAssetKey = input.feedHeroAssetKey?.trim() || null;
    post.storyHeroAssetKey = input.storyHeroAssetKey?.trim() || null;
    post.authorAdminUserId = authorSnapshot.authorAdminUserId;
    post.authorUsername = authorSnapshot.authorUsername;
    post.authorDisplayName = authorSnapshot.authorDisplayName;
    post.authorRole = authorSnapshot.authorRole;
    post.authorAvatarAssetKey = authorSnapshot.authorAvatarAssetKey;
  }

  private assertPublishable(post: MarketPulsePost) {
    const requiredFields: Array<[string, string]> = [
      ['title', post.title],
      ['slug', post.slug],
      ['excerpt', post.excerpt],
      ['category', post.category],
      ['badge', post.badge],
      ['summaryHeading', post.summaryHeading],
      ['bodyHtml', post.bodyHtml],
    ];

    const missingField = requiredFields.find(([, value]) => !value.trim());

    if (missingField) {
      throw new BadRequestException(
        `Cannot publish a post without ${missingField[0]}.`,
      );
    }
  }

  private async assertSlugAvailable(slug: string, currentPostId?: string) {
    const existingPost = await this.marketPulsePostsRepository.findOne({
      where: { slug: slug.trim().toLowerCase() },
    });

    if (existingPost && existingPost.id !== currentPostId) {
      throw new ConflictException('Slug is already in use.');
    }
  }

  private async findPostOrFail(id: string) {
    const post = await this.marketPulsePostsRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Market Pulse post was not found.');
    }

    return post;
  }

  private applySort(
    queryBuilder: SelectQueryBuilder<MarketPulsePost>,
    sort: MarketPulsePostSort,
  ) {
    switch (sort) {
      case 'oldest-created':
        queryBuilder.orderBy('post.created_at', 'ASC');
        break;
      case 'most-views':
        queryBuilder.orderBy('post.views_count', 'DESC');
        break;
      case 'least-views':
        queryBuilder.orderBy('post.views_count', 'ASC');
        break;
      case 'most-likes':
        queryBuilder.orderBy('post.likes_count', 'DESC');
        break;
      case 'least-likes':
        queryBuilder.orderBy('post.likes_count', 'ASC');
        break;
      case 'latest-published':
        queryBuilder.orderBy('post.published_at', 'DESC', 'NULLS LAST');
        break;
      case 'oldest-published':
        queryBuilder.orderBy('post.published_at', 'ASC', 'NULLS LAST');
        break;
      case 'newest-created':
      default:
        queryBuilder.orderBy('post.created_at', 'DESC');
        break;
    }
  }

  private formatDisplayNameFromEmail(email: string) {
    const localPart = email.split('@')[0] ?? 'operator';

    return localPart
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map(
        (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
      )
      .join(' ');
  }

  private serializePost(post: MarketPulsePost) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      badge: post.badge,
      accent: post.accent,
      summaryHeading: post.summaryHeading,
      bodyHtml: post.bodyHtml,
      tags: post.tags,
      feedHeroAssetKey: post.feedHeroAssetKey,
      storyHeroAssetKey: post.storyHeroAssetKey,
      status: post.status,
      viewsCount: post.viewsCount,
      likesCount: post.likesCount,
      author: {
        adminUserId: post.authorAdminUserId,
        username: post.authorUsername,
        displayName: post.authorDisplayName,
        authorRole: post.authorRole,
        avatarAssetKey: post.authorAvatarAssetKey,
      },
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
