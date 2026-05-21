import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { RoleType } from '@core/interfaces/users/role.interface';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (!authService.isAuthenticated()) {
    void router.navigate(['/']);
    return false;
  }

  const user = authService.getUser();
  if (!user || !user.role) {
    void router.navigate(['/']);
    return false;
  }

  // Obtener roles requeridos desde data de la ruta
  const requiredRoles: RoleType[] = route.data['roles'] || [];

  // Si no hay roles especificados, permitir acceso (solo requiere autenticación)
  if (requiredRoles.length === 0) {
    return true;
  }

  // Verificar si el rol del usuario está en los roles permitidos
  if (requiredRoles.includes(user.role)) {
    return true;
  }

  // Acceso denegado
  console.warn(`[RoleGuard] Usuario con rol ${user.role} intentó acceder a módulo que requiere: ${requiredRoles.join(', ')}`);
  void router.navigate(['/dashboard']);
  return false;
};
