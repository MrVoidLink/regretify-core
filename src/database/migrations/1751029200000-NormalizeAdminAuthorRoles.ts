import type { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeAdminAuthorRoles1751029200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE admin_users
      SET author_role = CASE
        WHEN lower(role) = 'super_admin' THEN 'Regretify platform administrator.'
        ELSE 'Regretify market pulse editor.'
      END
    `);

    await queryRunner.query(`
      UPDATE market_pulse_posts AS post
      SET author_role = CASE
        WHEN lower(admin.role) = 'super_admin' THEN 'Regretify platform administrator.'
        ELSE 'Regretify market pulse editor.'
      END
      FROM admin_users AS admin
      WHERE admin.id = post.author_admin_user_id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE admin_users
      SET author_role = 'Regretify market pulse editor.'
    `);

    await queryRunner.query(`
      UPDATE market_pulse_posts
      SET author_role = 'Regretify market pulse editor.'
    `);
  }
}
