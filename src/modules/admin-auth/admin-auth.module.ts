import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getAdminAuthConfig } from '../../config/auth.config';
import { AdminUser } from '../../database/entities/admin-user.entity';
import { AdminAuthController } from './admin-auth.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminAccessTokenGuard } from './guards/admin-access-token.guard';
import { AdminRolesGuard } from './guards/admin-roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser]),
    JwtModule.registerAsync({
      useFactory: () => {
        const authConfig = getAdminAuthConfig();

        return {
          secret: authConfig.jwtSecret || 'replace-in-portainer',
          signOptions: {
            expiresIn: authConfig.jwtExpiresInSeconds,
          },
        };
      },
    }),
  ],
  controllers: [AdminAuthController, AdminUsersController],
  providers: [AdminAuthService, AdminAccessTokenGuard, AdminRolesGuard],
  exports: [AdminAuthService, AdminAccessTokenGuard, AdminRolesGuard],
})
export class AdminAuthModule {}
