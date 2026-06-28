import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MARKET_PULSE_POST_STATUSES } from '../../../database/entities/market-pulse-post.entity';

export const MARKET_PULSE_POST_SORT_VALUES = [
  'newest-created',
  'oldest-created',
  'most-views',
  'least-views',
  'most-likes',
  'least-likes',
  'latest-published',
  'oldest-published',
] as const;

export type MarketPulsePostSort =
  (typeof MARKET_PULSE_POST_SORT_VALUES)[number];

export class ListMarketPulsePostsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(MARKET_PULSE_POST_STATUSES)
  status?: (typeof MARKET_PULSE_POST_STATUSES)[number];

  @IsOptional()
  @IsIn(MARKET_PULSE_POST_SORT_VALUES)
  sort?: MarketPulsePostSort;

  @IsOptional()
  @IsString()
  publishedFrom?: string;

  @IsOptional()
  @IsString()
  publishedTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
