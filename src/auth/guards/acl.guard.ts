import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { RequestWithUser } from '../interfaces/auth.interface';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class AclGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private logger: CustomLoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      this.logger.error('User not found in request', '', 'AclGuard');
      throw new ForbiddenException('User not found');
    }

    // Super Admin Bypass
    const isSuperAdmin = user.roles?.includes('ADMIN');
    if (isSuperAdmin) {
      this.logger.debug(
        `Super Admin bypass granted for: ${user.email}`,
        'AclGuard',
      );
      return true;
    }

    // Permission Check
    const hasAllPermissions = requiredPermissions.every((permission) =>
      user.permissions?.includes(permission),
    );

    if (!hasAllPermissions) {
      this.logger.error(
        `Access denied. User ${user.email} missing required permissions [${requiredPermissions.join(', ')}]`,
        '',
        'AclGuard',
      );
      throw new ForbiddenException(
        `You do not have the required permissions [${requiredPermissions.join(', ')}] to access this resource`,
      );
    }

    this.logger.log(
      `Access granted for ${user.email} based on permissions [${requiredPermissions.join(', ')}]`,
      'AclGuard',
    );
    return true;
  }
}
