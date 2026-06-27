import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'admin_users' })
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 64, default: 'super_admin' })
  role!: string;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  username!: string | null;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  displayName!: string | null;

  @Column({ name: 'author_role', type: 'varchar', length: 255, nullable: true })
  authorRole!: string | null;

  @Column({
    name: 'avatar_asset_key',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  avatarAssetKey!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
