import { applyDecorators, SetMetadata } from '@nestjs/common';
import { CompanyRole } from '@/features/company-members/domain/company-role.enum';
import { ApiExtension } from 'node_modules/@nestjs/swagger/dist/decorators/api-extension.decorator';

export const COMPANY_ROLES_KEY = 'company_roles';

/**
 * enforce one or more allowed company roles on an endpoint or controller.
 * E.g. @RequireCompanyRole(CompanyRole.ADMIN)
 * or   @RequireCompanyRole(CompanyRole.ADMIN, CompanyRole.HIRING_MANAGER)
 */
export const RequireCompanyRole = (...roles: CompanyRole[]) =>
  applyDecorators(
    SetMetadata(COMPANY_ROLES_KEY, roles),
    ApiExtension('x-required-company-roles', roles),
  );
