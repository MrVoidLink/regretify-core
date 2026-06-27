import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminUser } from './admin-user.entity';

export const MARKET_PULSE_POST_STATUSES = ['draft', 'published'] as const;
export type MarketPulsePostStatus = (typeof MARKET_PULSE_POST_STATUSES)[number];

@Entity({ name: 'market_pulse_posts' })
export class MarketPulsePost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', default: '' })
  excerpt!: string;

  @Column({ type: 'varchar', length: 64, default: '' })
  category!: string;

  @Column({ type: 'varchar', length: 64, default: '' })
  badge!: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  accent!: string;

  @Column({
    name: 'summary_heading',
    type: 'varchar',
    length: 255,
    default: '',
  })
  summaryHeading!: string;

  @Column({ name: 'body_html', type: 'text', default: '' })
  bodyHtml!: string;

  @Column({ type: 'text', default: '' })
  tags!: string;

  @Column({
    name: 'feed_hero_asset_key',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  feedHeroAssetKey!: string | null;

  @Column({
    name: 'story_hero_asset_key',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  storyHeroAssetKey!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status!: MarketPulsePostStatus;

  @Index()
  @Column({ name: 'views_count', type: 'integer', default: 0 })
  viewsCount!: number;

  @Index()
  @Column({ name: 'likes_count', type: 'integer', default: 0 })
  likesCount!: number;

  @Index()
  @Column({ name: 'author_admin_user_id', type: 'uuid' })
  authorAdminUserId!: string;

  @ManyToOne(() => AdminUser, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'author_admin_user_id' })
  authorAdminUser!: AdminUser;

  @Column({ name: 'author_username', type: 'varchar', length: 64 })
  authorUsername!: string;

  @Column({ name: 'author_display_name', type: 'varchar', length: 255 })
  authorDisplayName!: string;

  @Column({ name: 'author_role', type: 'varchar', length: 255 })
  authorRole!: string;

  @Column({
    name: 'author_avatar_asset_key',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  authorAvatarAssetKey!: string | null;

  @Index()
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
