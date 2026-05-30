import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { RoleType } from '@core/interfaces/users/role.interface';
import {
  LucideUserCog,
  LucideUsers,
  LucideDynamicIcon,
  LucideLayoutDashboard,
  LucideDroplets,
  LucideClipboardPenLine,
  LucideCreditCard,
  LucideFileText,
  LucideHandCoins,
  LucideClipboardList,
  LucideSettings,
  LucideActivity,
  LucideBuilding2,
  LucideBadgeAlert,
  LucideClipboardPaste,
} from '@lucide/angular';

@Component({
  selector: 'component-dashboard-shared-sidebar',
  imports: [
    RouterModule,
    CommonModule,
    LucideDynamicIcon,
    LucideLayoutDashboard,
  ],
  templateUrl: './sidebar.html',
})
export class ComponentDashboardSharedSidebar {
  private auth = inject(AuthService);

  routes = [
    {
      nameCategory: 'Gestión Comercial',
      links: [
        { name: 'Clientes', path: 'clientes', icon: LucideUsers },
        { name: 'Predios', path: 'predios', icon: LucideBuilding2 },
        {
          name: 'Solicitudes',
          path: 'solicitudes',
          icon: LucideClipboardPenLine,
        },
      ],
    },
    {
      nameCategory: 'Operaciones de Campo',
      links: [
        { name: 'Suministros', path: 'suministros', icon: LucideDroplets },
        { name: 'Lecturas', path: 'lecturas', icon: LucideClipboardPenLine },
        { name: 'Incidencias', path: 'incidencias', icon: LucideBadgeAlert },
        {
          name: 'Órdenes de Trabajo',
          path: 'ordenes',
          icon: LucideClipboardPaste,
        },
      ],
    },
    {
      nameCategory: 'Facturación y Finanzas',
      links: [
        { name: 'Facturación', path: 'facturacion', icon: LucideFileText },
        { name: 'Pagos', path: 'pagos', icon: LucideCreditCard },
        { name: 'Cobranza', path: 'cobranza', icon: LucideHandCoins },
      ],
    },
    {
      nameCategory: 'Administración del Sistema',
      links: [
        { name: 'Personal', path: 'personal', icon: LucideUserCog },
        { name: 'Configuración', path: 'configuracion', icon: LucideSettings },
      ],
    },
  ];

  private categoryAllowedRoles: Record<string, RoleType[]> = {
    'Gestión Comercial': ['ADMIN', 'MANAGEMENT', 'SUPERVISOR'],
    'Operaciones de Campo': ['ADMIN', 'TECHNICIAN', 'MANAGEMENT', 'SUPERVISOR'],
    'Facturación y Finanzas': ['ADMIN', 'MANAGEMENT'],
    'Administración del Sistema': ['ADMIN', 'MANAGEMENT'],
  };

  get filteredRoutes() {
    const user = this.auth.getUser();
    const role: RoleType | undefined = user?.role;
    if (!role) return [];

    return this.routes.filter((cat) => {
      const allowed = this.categoryAllowedRoles[cat.nameCategory];
      // Si no hay regla para la categoría, mostrar por defecto
      if (!allowed || allowed.length === 0) return true;
      return allowed.includes(role);
    });
  }
}
