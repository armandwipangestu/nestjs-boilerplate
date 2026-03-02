import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { RequestWithUser } from '../interfaces/auth.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class AclGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private logger: CustomLoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      this.logger.error(`User not found`, '', 'AclGuard.canActivate');
      throw new ForbiddenException('User not found');
    }

    const isSuperAdmin = user.roles?.includes('ADMIN');
    if (isSuperAdmin) {
      this.logger.debug(
        `Super Admin bypass granted for: ${user.email}`,
        'AclGuard',
      );
      return true;
    }

    const roleMatch = requiredRoles
      ? requiredRoles.some((role) => user.roles?.includes(role))
      : true;

    const permissionMatch = requiredPermissions
      ? requiredPermissions.every((permission) =>
          user.permissions?.includes(permission),
        )
      : true;

    if (!roleMatch || !permissionMatch) {
      const issues: string[] = [];
      if (!roleMatch && requiredRoles) issues.push(`roles [${requiredRoles.join(', ')}]`);
      if (!permissionMatch && requiredPermissions) issues.push(`permissions [${requiredPermissions.join(', ')}]`);

      this.logger.error(
        `Access denied. User ${user.email} missing: ${issues.join(' and ')}`,
        '',
        'AclGuard',
      );
      throw new ForbiddenException(
        `You do not have the required ${issues.join(' and ')} to access this resource`,
      );
    }

    this.logger.log(
      `Access granted for ${user.email} based on permissions [${user.permissions?.join(', ')}]`,
      'AclGuard',
    );
    return true;
  }
}
