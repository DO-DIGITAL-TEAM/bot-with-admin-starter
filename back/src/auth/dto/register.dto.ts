import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, IsEnum } from 'class-validator';
import { Roles } from 'src/admins/entities/admin.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEnum(Roles)
  role: Roles;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minSymbols: 1,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
  })
  password: string;
}
