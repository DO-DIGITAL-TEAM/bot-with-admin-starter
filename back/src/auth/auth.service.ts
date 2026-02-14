import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { Admin } from 'src/admins/entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode } from 'src/common/enums/error-code.enum';
import { ConfigService } from '@nestjs/config';
import { AdminsService } from 'src/admins/admins.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const admin = await this.adminsService.findOneByEmailWithPassword(email);
    const isMatch = await bcrypt.compare(password, admin.password.value);

    if (!isMatch) {
      throw new UnauthorizedException(ErrorCode.WrongPassword)
    }

    if (!admin.is_active) {
      throw new UnauthorizedException(ErrorCode.BlockedAdmin)
    }

    const payload = { id: admin.id, username: admin.username };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async register(
    admin: Admin | null,
    {
      username,
      email,
      role,
      password,
    }: RegisterDto,
  ): Promise<Admin> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    return this.adminsService.create(
      admin,
      {
        username,
        email,
        role,
        password: hashedPassword,
      },
    );
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        { secret: this.configService.get<string>('JWT_SECRET') }
      );

      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
