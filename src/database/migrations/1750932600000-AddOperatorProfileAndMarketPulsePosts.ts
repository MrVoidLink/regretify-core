import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddOperatorProfileAndMarketPulsePosts1750932600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('admin_users', [
      new TableColumn({
        name: 'username',
        type: 'varchar',
        length: '64',
        isNullable: true,
      }),
      new TableColumn({
        name: 'display_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'author_role',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'avatar_asset_key',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    ]);

    await queryRunner.createIndex(
      'admin_users',
      new TableIndex({
        name: 'IDX_admin_users_username_unique',
        columnNames: ['username'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'market_pulse_posts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'excerpt',
            type: 'text',
            default: "''",
          },
          {
            name: 'category',
            type: 'varchar',
            length: '64',
            default: "''",
          },
          {
            name: 'badge',
            type: 'varchar',
            length: '64',
            default: "''",
          },
          {
            name: 'accent',
            type: 'varchar',
            length: '120',
            default: "''",
          },
          {
            name: 'summary_heading',
            type: 'varchar',
            length: '255',
            default: "''",
          },
          {
            name: 'body_html',
            type: 'text',
            default: "''",
          },
          {
            name: 'tags',
            type: 'text',
            default: "''",
          },
          {
            name: 'feed_hero_asset_key',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'story_hero_asset_key',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '32',
            default: "'draft'",
          },
          {
            name: 'views_count',
            type: 'integer',
            default: '0',
          },
          {
            name: 'likes_count',
            type: 'integer',
            default: '0',
          },
          {
            name: 'author_admin_user_id',
            type: 'uuid',
          },
          {
            name: 'author_username',
            type: 'varchar',
            length: '64',
          },
          {
            name: 'author_display_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'author_role',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'author_avatar_asset_key',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'published_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_market_pulse_posts_author_admin_user_id',
            columnNames: ['author_admin_user_id'],
            referencedTableName: 'admin_users',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }),
        ],
      }),
      true,
    );

    await queryRunner.createIndices('market_pulse_posts', [
      new TableIndex({
        name: 'IDX_market_pulse_posts_author_admin_user_id',
        columnNames: ['author_admin_user_id'],
      }),
      new TableIndex({
        name: 'IDX_market_pulse_posts_published_at',
        columnNames: ['published_at'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('market_pulse_posts', true);
    await queryRunner.dropIndex(
      'admin_users',
      'IDX_admin_users_username_unique',
    );
    await queryRunner.dropColumns('admin_users', [
      'username',
      'display_name',
      'author_role',
      'avatar_asset_key',
    ]);
  }
}
