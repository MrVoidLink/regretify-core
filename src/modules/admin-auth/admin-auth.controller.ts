import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { AdminAccessTokenGuard } from './guards/admin-access-token.guard';
import type { AuthenticatedAdmin } from './types/admin-auth.types';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  login(@Body() input: LoginAdminDto) {
    return this.adminAuthService.login(input);
  }

  @Get('me')
  @UseGuards(AdminAccessTokenGuard)
  me(@Req() request: Request & { admin: AuthenticatedAdmin }) {
    return this.adminAuthService.getProfile(request.admin);
  }

  @Patch('me/profile')
  @UseGuards(AdminAccessTokenGuard)
  updateProfile(
    @Req() request: Request & { admin: AuthenticatedAdmin },
    @Body() input: UpdateAdminProfileDto,
  ) {
    return this.adminAuthService.updateProfile(request.admin, input);
  }

  @Post('me/avatar')
  @UseGuards(AdminAccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  uploadProfileAvatar(
    @Req() request: Request & { admin: AuthenticatedAdmin },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    return this.adminAuthService.uploadProfileAvatar(request.admin, file);
  }
}
