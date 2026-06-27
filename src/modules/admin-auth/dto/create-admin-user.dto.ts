import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { ADMIN_ROLES } from '../admin-role.constants';

export class CreateAdminUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password!: string;

  @IsString()
  @IsIn(ADMIN_ROLES)
  role!: (typeof ADMIN_ROLES)[number];
}
