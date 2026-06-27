import type { MigrationInterface, QueryRunner } from 'typeorm';
import { TableIndex } from 'typeorm';

export class AddMarketPulsePostQueryIndexes1751025600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndices('market_pulse_posts', [
      new TableIndex({
        name: 'IDX_market_pulse_posts_status',
        columnNames: ['status'],
      }),
      new TableIndex({
        name: 'IDX_market_pulse_posts_created_at',
        columnNames: ['created_at'],
      }),
      new TableIndex({
        name: 'IDX_market_pulse_posts_views_count',
        columnNames: ['views_count'],
      }),
      new TableIndex({
        name: 'IDX_market_pulse_posts_likes_count',
        columnNames: ['likes_count'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'market_pulse_posts',
      'IDX_market_pulse_posts_likes_count',
    );
    await queryRunner.dropIndex(
      'market_pulse_posts',
      'IDX_market_pulse_posts_views_count',
    );
    await queryRunner.dropIndex(
      'market_pulse_posts',
      'IDX_market_pulse_posts_created_at',
    );
    await queryRunner.dropIndex(
      'market_pulse_posts',
      'IDX_market_pulse_posts_status',
    );
  }
}
