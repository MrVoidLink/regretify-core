import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { getAdminAuthConfig } from '../../config/auth.config';
import { AdminUser } from '../../database/entities/admin-user.entity';
import { LoginAdminDto } from './dto/login-admin.dto';
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
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.bootstrapAdminUser();
  }

  async login(input: LoginAdminDto) {
    const admin = await this.adminUsersRepository.findOne({
      where: { email: input.email.trim().toLowerCase() },
    });

    if (!admin || admin.status !== 'active') {
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

    if (!admin || admin.status !== 'active') {
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

    if (!admin || admin.status !== 'active') {
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

    if (input.authorRole !== undefined) {
      admin.authorRole = input.authorRole.trim();
    }

    if (input.avatarAssetKey !== undefined) {
      admin.avatarAssetKey = input.avatarAssetKey?.trim() || null;
    }

    await this.adminUsersRepository.save(admin);
    return this.serializeAdmin(admin);
  }

  async verifyAccessToken(token: string) {
    const authConfig = getAdminAuthConfig();

    if (!authConfig.jwtSecret) {
      throw new UnauthorizedException('Admin auth is not configured.');
    }

    return this.jwtService.verifyAsync<AdminAccessTokenPayload>(token, {
      secret: authConfig.jwtSecret,
    });
  }

  private async issueAccessToken(admin: AdminUser) {
    const authConfig = getAdminAuthConfig();

    if (!authConfig.jwtSecret) {
      throw new UnauthorizedException('Admin auth is not configured.');
    }

    const payload: AdminAccessTokenPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
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
      role: admin.role,
      status: admin.status,
      username: admin.username,
      displayName: admin.displayName,
      authorRole: admin.authorRole,
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
      .map(
        (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
      )
      .join(' ');
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

    if (!existingAdmin) {
      const defaultUsername =
        authConfig.bootstrapEmail.split('@')[0]?.trim().toLowerCase() || 'admin';

      await this.adminUsersRepository.save(
        this.adminUsersRepository.create({
          email: authConfig.bootstrapEmail,
          passwordHash,
          role: authConfig.bootstrapRole,
          status: 'active',
          username: defaultUsername,
          displayName: this.formatDisplayNameFromEmail(
            authConfig.bootstrapEmail,
          ),
          authorRole: 'Regretify market pulse editor.',
        }),
      );

      this.logger.log(
        `Bootstrapped admin user for ${authConfig.bootstrapEmail}.`,
      );
      return;
    }

    let shouldSave = false;

    if (existingAdmin.role !== authConfig.bootstrapRole) {
      existingAdmin.role = authConfig.bootstrapRole;
      shouldSave = true;
    }

    if (existingAdmin.status !== 'active') {
      existingAdmin.status = 'active';
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

    if (!existingAdmin.authorRole?.trim()) {
      existingAdmin.authorRole = 'Regretify market pulse editor.';
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
