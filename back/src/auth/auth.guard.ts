import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AdminsService } from 'src/admins/admins.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authSerivce: AuthService,
    private adminsSerivce: AdminsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const authData = await this.authSerivce.verifyToken(token);
    request.user = await this.adminsSerivce.findOne(authData.id)

    if (!request.user.is_active) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
