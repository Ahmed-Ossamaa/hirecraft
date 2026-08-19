import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserType } from '@/features/users/domain/user-type.enum';
import { JwtUser } from '../types/jwt.types';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If public (no roles), return true
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as JwtUser;

    // If there is no user (not logged in)
    if (!user) {
      throw new ForbiddenException('User payload not found');
    }

    const hasRole = requiredRoles.includes(user.userType);

    // If the user does not have the required role
    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the required permissions for this action.',
      );
    }

    return true;
  }
}
