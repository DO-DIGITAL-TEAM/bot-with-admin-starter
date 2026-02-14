import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Roles } from '../entities/admin.entity';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsNotEmpty()
  @IsEnum(Roles)
  role: Roles;
  
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsNotEmpty()
  password: string;
}
