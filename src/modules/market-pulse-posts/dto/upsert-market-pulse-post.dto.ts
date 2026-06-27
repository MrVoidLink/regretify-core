import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpsertMarketPulsePostDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  badge?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  accent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  summaryHeading?: string;

  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  feedHeroAssetKey?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  storyHeroAssetKey?: string | null;
}
