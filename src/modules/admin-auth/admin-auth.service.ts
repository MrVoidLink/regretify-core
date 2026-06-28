import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { getAdminAuthConfig } from '../../config/auth.config';
import { AdminUser } from '../../database/entities/admin-user.entity';
import { MarketPulsePost } from '../../database/entities/market-pulse-post.entity';
import {
  ADMIN_ROLE_SUPER_ADMIN,
  ADMIN_USER_STATUS_ACTIVE,
  getDefaultAuthorRoleForAdminRole,
  normalizeAdminRole,
  normalizeAdminStatus,
} from './admin-role.constants';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import type {
  AdminAccessTokenPayload,
  AuthenticatedAdmin,
} from './types/admin-auth.types';

@Injectable()
export class AdminAuthService implements OnModuleInit {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUsersRepository: Repository<AdminUser>,
    @InjectRepository(MarketPulsePost)
    private readonly marketPulsePostsRepository: Repository<MarketPulsePost>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.bootstrapAdminUser();
  }

  async login(input: LoginAdminDto) {
    const admin = await this.adminUsersRepository.findOne({
      where: { email: input.email.trim().toLowerCase() },
    });

    if (
      !admin ||
      normalizeAdminStatus(admin.status) !== ADMIN_USER_STATUS_ACTIVE
    ) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    const passwordMatches = await compare(input.password, admin.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    return {
      accessToken: await this.issueAccessToken(admin),
      admin: this.serializeAdmin(admin),
    };
  }

  async getProfile(authenticatedAdmin: AuthenticatedAdmin) {
    const admin = await this.adminUsersRepository.findOne({
      where: { id: authenticatedAdmin.sub },
    });

    if (
      !admin ||
      normalizeAdminStatus(admin.status) !== ADMIN_USER_STATUS_ACTIVE
    ) {
      throw new UnauthorizedException('Admin account is not active.');
    }

    return this.serializeAdmin(admin);
  }

  async updateProfile(
    authenticatedAdmin: AuthenticatedAdmin,
    input: UpdateAdminProfileDto,
  ) {
    const admin = await this.adminUsersRepository.findOne({
      where: { id: authenticatedAdmin.sub },
    });

    if (
      !admin ||
      normalizeAdminStatus(admin.status) !== ADMIN_USER_STATUS_ACTIVE
    ) {
      throw new UnauthorizedException('Admin account is not active.');
    }

    if (input.username) {
      const normalizedUsername = input.username.trim().toLowerCase();

      const existingWithUsername = await this.adminUsersRepository.findOne({
        where: { username: normalizedUsername },
      });

      if (existingWithUsername && existingWithUsername.id !== admin.id) {
        throw new ConflictException('Username is already in use.');
      }

      admin.username = normalizedUsername;
    }

    if (input.displayName !== undefined) {
      admin.displayName = input.displayName.trim();
    }

    if (input.avatarAssetKey !== undefined) {
      admin.avatarAssetKey = input.avatarAssetKey?.trim() || null;
    }

    admin.authorRole = getDefaultAuthorRoleForAdminRole(admin.role);

    await this.adminUsersRepository.save(admin);
    await this.syncMarketPulseAuthorSnapshot(admin);
    return this.serializeAdmin(admin);
  }

  async listAdminUsers() {
    const items = await this.adminUsersRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      items: items.map((item) => this.serializeAdmin(item)),
    };
  }

  async createAdminUser(
    authenticatedAdmin: AuthenticatedAdmin,
    input: CreateAdminUserDto,
  ) {
    this.assertSuperAdmin(authenticatedAdmin);

    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedRole = normalizeAdminRole(input.role);

    const existingAdmin = await this.adminUsersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingAdmin) {
      throw new ConflictException(
        'An admin account with this email already exists.',
      );
    }

    const passwordHash = await hash(input.password, 12);
    const username = await this.buildAvailableUsername(normalizedEmail);

    const admin = this.adminUsersRepository.create({
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      status: ADMIN_USER_STATUS_ACTIVE,
      username,
      displayName: this.formatDisplayNameFromEmail(normalizedEmail),
      authorRole: getDefaultAuthorRoleForAdminRole(normalizedRole),
      avatarAssetKey: null,
    });

    await this.adminUsersRepository.save(admin);
    return this.serializeAdmin(admin);
  }

  async updateAdminUser(
    authenticatedAdmin: AuthenticatedAdmin,
    adminUserId: string,
    input: UpdateAdminUserDto,
  ) {
    this.assertSuperAdmin(authenticatedAdmin);

    if (adminUserId === authenticatedAdmin.sub) {
      throw new ForbiddenException(
        'You cannot change your own role, status, or password from this screen.',
      );
    }

    const admin = await this.adminUsersRepository.findOne({
      where: { id: adminUserId },
    });

    if (!admin) {
      throw new NotFoundException('Admin user was not found.');
    }

    const nextRole =
      input.role !== undefined
        ? normalizeAdminRole(input.role)
        : normalizeAdminRole(admin.role);
    const nextStatus =
      input.status !== undefined
        ? normalizeAdminStatus(input.status)
        : normalizeAdminStatus(admin.status);

    await this.assertSuperAdminRetention(admin, nextRole, nextStatus);

    admin.role = nextRole;
    admin.status = nextStatus;
    admin.authorRole = getDefaultAuthorRoleForAdminRole(nextRole);

    if (input.password !== undefined) {
      if (!input.password.trim()) {
        throw new BadRequestException('Password cannot be empty.');
      }

      admin.passwordHash = await hash(input.password, 12);
    }

    await this.adminUsersRepository.save(admin);
    await this.syncMarketPulseAuthorSnapshot(admin);
    return this.serializeAdmin(admin);
  }

  private async syncMarketPulseAuthorSnapshot(admin: AdminUser) {
    await this.marketPulsePostsRepository.update(
      { authorAdminUserId: admin.id },
      {
        authorUsername:
          admin.username?.trim() || admin.email.split('@')[0] || 'operator',
        authorDisplayName:
          admin.displayName?.trim() ||
          this.formatDisplayNameFromEmail(admin.email),
        authorRole: getDefaultAuthorRoleForAdminRole(admin.role),
        authorAvatarAssetKey: admin.avatarAssetKey?.trim() || null,
      },
    );
  }

  async verifyAccessToken(token: string) {
    const authConfig = getAdminAuthConfig();

    if (!authConfig.jwtSecret) {
      throw new UnauthorizedException('Admin auth is not configured.');
    }

    const payload = await this.jwtService.verifyAsync<AdminAccessTokenPayload>(
      token,
      {
        secret: authConfig.jwtSecret,
      },
    );

    const admin = await this.adminUsersRepository.findOne({
      where: { id: payload.sub },
    });

    if (
      !admin ||
      normalizeAdminStatus(admin.status) !== ADMIN_USER_STATUS_ACTIVE
    ) {
      throw new UnauthorizedException('Admin account is not active.');
    }

    return {
      sub: admin.id,
      email: admin.email,
      role: normalizeAdminRole(admin.role),
      status: normalizeAdminStatus(admin.status),
    } satisfies AdminAccessTokenPayload;
  }

  private async issueAccessToken(admin: AdminUser) {
    const authConfig = getAdminAuthConfig();

    if (!authConfig.jwtSecret) {
      throw new UnauthorizedException('Admin auth is not configured.');
    }

    const payload: AdminAccessTokenPayload = {
      sub: admin.id,
      email: admin.email,
      role: normalizeAdminRole(admin.role),
      status: normalizeAdminStatus(admin.status),
    };

    return this.jwtService.signAsync(payload, {
      secret: authConfig.jwtSecret,
      expiresIn: authConfig.jwtExpiresInSeconds,
    });
  }

  private serializeAdmin(admin: AdminUser) {
    return {
      id: admin.id,
      email: admin.email,
      role: normalizeAdminRole(admin.role),
      status: normalizeAdminStatus(admin.status),
      username: admin.username,
      displayName: admin.displayName,
      authorRole: getDefaultAuthorRoleForAdminRole(admin.role),
      avatarAssetKey: admin.avatarAssetKey,
      avatarUrl: admin.avatarAssetKey,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  private formatDisplayNameFromEmail(email: string) {
    const localPart = email.split('@')[0] ?? 'operator';

    return localPart
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private buildUsernameBaseFromEmail(email: string) {
    return (
      email
        .split('@')[0]
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'admin'
    );
  }

  private async buildAvailableUsername(email: string) {
    const baseUsername = this.buildUsernameBaseFromEmail(email);
    let nextUsername = baseUsername;
    let suffix = 2;

    // Keep usernames deterministic while avoiding unique collisions.
    while (
      await this.adminUsersRepository.exists({
        where: { username: nextUsername },
      })
    ) {
      nextUsername = `${baseUsername}-${suffix}`;
      suffix += 1;
    }

    return nextUsername;
  }

  private assertSuperAdmin(authenticatedAdmin: AuthenticatedAdmin) {
    if (
      normalizeAdminRole(authenticatedAdmin.role) !== ADMIN_ROLE_SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only a super admin can manage admin users.',
      );
    }
  }

  private async assertSuperAdminRetention(
    admin: AdminUser,
    nextRole: string,
    nextStatus: string,
  ) {
    const currentRole = normalizeAdminRole(admin.role);
    const currentStatus = normalizeAdminStatus(admin.status);
    const willRemainActiveSuperAdmin =
      nextRole === ADMIN_ROLE_SUPER_ADMIN &&
      nextStatus === ADMIN_USER_STATUS_ACTIVE;

    if (
      currentRole !== ADMIN_ROLE_SUPER_ADMIN ||
      currentStatus !== ADMIN_USER_STATUS_ACTIVE ||
      willRemainActiveSuperAdmin
    ) {
      return;
    }

    const activeSuperAdminCount = await this.adminUsersRepository.count({
      where: {
        role: ADMIN_ROLE_SUPER_ADMIN,
        status: ADMIN_USER_STATUS_ACTIVE,
      },
    });

    if (activeSuperAdminCount <= 1) {
      throw new ConflictException(
        'At least one active super admin must remain in the system.',
      );
    }
  }

  private async bootstrapAdminUser() {
    const authConfig = getAdminAuthConfig();

    if (!authConfig.bootstrapEmail || !authConfig.bootstrapPassword) {
      this.logger.warn(
        'Admin bootstrap credentials are not set. Skipping admin seed.',
      );
      return;
    }

    const passwordHash = await hash(authConfig.bootstrapPassword, 12);
    const existingAdmin = await this.adminUsersRepository.findOne({
      where: { email: authConfig.bootstrapEmail },
    });
    const normalizedBootstrapRole = normalizeAdminRole(
      authConfig.bootstrapRole,
    );

    if (!existingAdmin) {
      const defaultUsername =
        authConfig.bootstrapEmail.split('@')[0]?.trim().toLowerCase() ||
        'admin';

      await this.adminUsersRepository.save(
        this.adminUsersRepository.create({
          email: authConfig.bootstrapEmail,
          passwordHash,
          role: normalizedBootstrapRole,
          status: ADMIN_USER_STATUS_ACTIVE,
          username: defaultUsername,
          displayName: this.formatDisplayNameFromEmail(
            authConfig.bootstrapEmail,
          ),
          authorRole: getDefaultAuthorRoleForAdminRole(normalizedBootstrapRole),
        }),
      );

      this.logger.log(
        `Bootstrapped admin user for ${authConfig.bootstrapEmail}.`,
      );
      return;
    }

    let shouldSave = false;

    if (normalizeAdminRole(existingAdmin.role) !== normalizedBootstrapRole) {
      existingAdmin.role = normalizedBootstrapRole;
      shouldSave = true;
    }

    if (
      normalizeAdminStatus(existingAdmin.status) !== ADMIN_USER_STATUS_ACTIVE
    ) {
      existingAdmin.status = ADMIN_USER_STATUS_ACTIVE;
      shouldSave = true;
    }

    const defaultUsername =
      authConfig.bootstrapEmail.split('@')[0]?.trim().toLowerCase() || 'admin';

    if (!existingAdmin.username?.trim()) {
      existingAdmin.username = defaultUsername;
      shouldSave = true;
    }

    if (!existingAdmin.displayName?.trim()) {
      existingAdmin.displayName = this.formatDisplayNameFromEmail(
        authConfig.bootstrapEmail,
      );
      shouldSave = true;
    }

    const nextBootstrapAuthorRole = getDefaultAuthorRoleForAdminRole(
      normalizedBootstrapRole,
    );

    if (existingAdmin.authorRole !== nextBootstrapAuthorRole) {
      existingAdmin.authorRole = nextBootstrapAuthorRole;
      shouldSave = true;
    }

    const passwordMatches = await compare(
      authConfig.bootstrapPassword,
      existingAdmin.passwordHash,
    );

    if (!passwordMatches) {
      existingAdmin.passwordHash = passwordHash;
      shouldSave = true;
    }

    if (shouldSave) {
      await this.adminUsersRepository.save(existingAdmin);
      this.logger.log(
        `Updated bootstrapped admin user for ${authConfig.bootstrapEmail}.`,
      );
    }
  }
}
