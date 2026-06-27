import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ADMIN_ROLES, ADMIN_USER_STATUSES } from '../admin-role.constants';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  @IsIn(ADMIN_ROLES)
  role?: (typeof ADMIN_ROLES)[number];

  @IsOptional()
  @IsString()
  @IsIn(ADMIN_USER_STATUSES)
  status?: (typeof ADMIN_USER_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password?: string;
}
