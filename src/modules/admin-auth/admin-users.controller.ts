import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminRoles } from './decorators/admin-roles.decorator';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { ADMIN_ROLE_SUPER_ADMIN } from './admin-role.constants';
import { AdminAuthService } from './admin-auth.service';
import { AdminAccessTokenGuard } from './guards/admin-access-token.guard';
import { AdminRolesGuard } from './guards/admin-roles.guard';
import type { AuthenticatedAdmin } from './types/admin-auth.types';

@Controller('admin/admin-users')
@UseGuards(AdminAccessTokenGuard, AdminRolesGuard)
@AdminRoles(ADMIN_ROLE_SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Get()
  listAdminUsers() {
    return this.adminAuthService.listAdminUsers();
  }

  @Post()
  createAdminUser(
    @Req() request: Request & { admin: AuthenticatedAdmin },
    @Body() input: CreateAdminUserDto,
  ) {
    return this.adminAuthService.createAdminUser(request.admin, input);
  }

  @Patch(':id')
  updateAdminUser(
    @Req() request: Request & { admin: AuthenticatedAdmin },
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateAdminUserDto,
  ) {
    return this.adminAuthService.updateAdminUser(request.admin, id, input);
  }
}
