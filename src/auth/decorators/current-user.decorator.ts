import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload, RequestWithUser } from '../interfaces/auth.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
