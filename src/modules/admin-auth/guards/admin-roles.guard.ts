import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { normalizeAdminRole, type AdminRole } from '../admin-role.constants';
import { ADMIN_ROLES_KEY } from '../decorators/admin-roles.decorator';
import type { AuthenticatedAdmin } from '../types/admin-auth.types';

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ADMIN_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { admin?: AuthenticatedAdmin }>();
    const currentRole = normalizeAdminRole(request.admin?.role);

    if (!requiredRoles.includes(currentRole)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    return true;
  }
}
