import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from 'src/utils/enums';
import { ROLES_KEY } from 'src/utils/constants';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/role.guard';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Decorator that assigns required roles to a route handler or controller.
 * This metadata can be retrieved by guards to enforce role-based access control.
 *
 * @note if no roles are specified, the route is accessible to all authenticated users.
 * @param roles - Array of role names required to access the decorated route
 * @returns A method or class decorator function
 *
 * @example
 */
export default function AuthRoles(...roles: UserRole[]) {
  const rolesDescription =
    roles.length > 0
      ? `Requires roles: ${roles.join(', ')}`
      : 'Accessible to all authenticated users';

  return applyDecorators(
    Roles(...roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ description: rolesDescription }),
  );
}
