import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { LoginAdminDto } from './dto/login-admin.dto';
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
}
