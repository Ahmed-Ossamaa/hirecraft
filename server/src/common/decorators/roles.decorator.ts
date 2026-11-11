import { UserType } from '@/features/users/domain/user-type.enum';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiExtension } from 'node_modules/@nestjs/swagger/dist/decorators/api-extension.decorator';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserType[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiExtension('x-required-user-types', roles),
  );
