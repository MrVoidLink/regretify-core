import { IsIn } from 'class-validator';

export const MARKET_PULSE_POST_ASSET_KINDS = [
  'feed-hero',
  'story-hero',
  'inline',
] as const;

export type MarketPulsePostAssetKind =
  (typeof MARKET_PULSE_POST_ASSET_KINDS)[number];

export class UploadMarketPulsePostAssetDto {
  @IsIn(MARKET_PULSE_POST_ASSET_KINDS)
  kind!: MarketPulsePostAssetKind;
}
