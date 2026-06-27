import type { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeAdminRoles1751022000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE admin_users
      SET role = 'super_admin'
      WHERE role IS NULL OR lower(role) = 'admin'
    `);

    await queryRunner.query(`
      ALTER TABLE admin_users
      ALTER COLUMN role SET DEFAULT 'super_admin'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE admin_users
      SET role = 'admin'
      WHERE lower(role) = 'super_admin'
    `);

    await queryRunner.query(`
      ALTER TABLE admin_users
      ALTER COLUMN role SET DEFAULT 'admin'
    `);
  }
}
