import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtUser } from '../types/jwt.types';
import { UserType } from '@/features/users/domain/user-type.enum';
import { CompanyRole } from '@/features/company-members/domain/company-role.enum';
import { COMPANY_ROLES_KEY } from '../decorators/company-role.decorator';

@Injectable()
export class CompanyRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<CompanyRole[]>(
      COMPANY_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no specific company roles are required on this route, allow through
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as JwtUser | undefined;

    if (!user) {
      throw new ForbiddenException('User payload not found.');
    }

    if (user.userType !== UserType.EMPLOYER) {
      throw new ForbiddenException('Only employers can perform this action.');
    }

    if (!user.companyId || !user.role) {
      throw new ForbiddenException(
        'User is not associated with an active company.',
      );
    }

    const userRole = user.role as CompanyRole;
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        'You do not have the required permissions for this action.',
      );
    }

    // isolation: if companyId is in URL params, it must match user's company
    const paramCompanyId = request.params?.companyId;
    if (paramCompanyId && paramCompanyId !== user.companyId) {
      throw new ForbiddenException(
        'You do not have permission to manage another company.',
      );
    }

    return true;
  }
}
