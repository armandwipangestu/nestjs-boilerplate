import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { RequestWithUser } from '../interfaces/auth.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private logger: CustomLoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      this.logger.error(`User not found`, '', 'RolesGuard.canActivate');
      throw new ForbiddenException('User not found');
    }

    if (!requiredRoles.includes(user.role)) {
      this.logger.error(
        `User role ${user.role} is not authorized to access this resource`,
        '',
        'RolesGuard.canActivate',
      );
      throw new ForbiddenException(
        `User role ${user.role} is not authorized to access this resource`,
      );
    }

    this.logger.log(
      `User role ${user.role} is authorized to access this resource`,
      'RolesGuard.canActivate',
    );
    return true;
  }
}
