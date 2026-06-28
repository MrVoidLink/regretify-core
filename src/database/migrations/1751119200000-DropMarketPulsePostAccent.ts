import type { MigrationInterface, QueryRunner } from 'typeorm';
import { TableColumn } from 'typeorm';

export class DropMarketPulsePostAccent1751119200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasAccentColumn = await queryRunner.hasColumn(
      'market_pulse_posts',
      'accent',
    );

    if (hasAccentColumn) {
      await queryRunner.dropColumn('market_pulse_posts', 'accent');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasAccentColumn = await queryRunner.hasColumn(
      'market_pulse_posts',
      'accent',
    );

    if (!hasAccentColumn) {
      await queryRunner.addColumn(
        'market_pulse_posts',
        new TableColumn({
          name: 'accent',
          type: 'varchar',
          length: '120',
          default: "''",
        }),
      );
    }
  }
}
