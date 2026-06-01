import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@layouts/dashboard/dashboard').then((m) => m.LayoutDashboard),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@pages/dashboard/general/general').then(
            (m) => m.PageDashboardGeneral,
          ),
      },
      {
        path: 'personal',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGEMENT'] },
        loadChildren: () =>
          import('@routes/dashboard/workers.routes').then(
            (m) => m.WORKERS_ROUTES,
          ),
      },
      {
        path: 'clientes',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGEMENT', 'SUPERVISOR'] },
        loadChildren: () =>
          import('@routes/dashboard/customers.routes').then(
            (m) => m.CUSTOMERS_ROUTES,
          ),
      },
      {
        path: 'predios',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGEMENT', 'SUPERVISOR'] },
        loadChildren: () =>
          import('@routes/dashboard/properties.routes').then(
            (m) => m.PROPERTIES_ROUTES,
          ),
      },
      {
        path: 'solicitudes',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'TECHNICIAN', 'SUPERVISOR'] },
        loadChildren: () =>
          import('@routes/dashboard/applications.routes').then(
            (m) => m.APPLICATIONS_ROUTES,
          ),
      },
      {
        path: 'suministros',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'TECHNICIAN', 'SUPERVISOR'] },
        loadChildren: () =>
          import('@routes/dashboard/supplies.routes').then(
            (m) => m.SUPPLIES_ROUTES,
          ),
      },
      {
        path: 'incidencias',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'TECHNICIAN', 'MANAGEMENT', 'SUPERVISOR'] },
        loadChildren: () =>
          import('@routes/dashboard/incidents.routes').then(
            (m) => m.INCIDENTS_ROUTES,
          ),
      },
      {
        path: 'lecturas',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'TECHNICIAN', 'SUPERVISOR'] },
        loadChildren: () =>
          import('@routes/dashboard/readings.routes').then(
            (m) => m.READINGS_ROUTES,
          ),
      },
      {
        path: 'ordenes',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'TECHNICIAN', 'MANAGEMENT', 'SUPERVISOR'] },
        loadChildren: () =>
          import('@routes/dashboard/work-orders.routes').then(
            (m) => m.WORK_ORDERS_ROUTES,
          ),
      },
      {
        path: 'facturacion',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGEMENT'] },
        loadChildren: () =>
          import('@routes/dashboard/billing.routes').then(
            (m) => m.BILLING_ROUTES,
          ),
      },
      {
        path: 'cobranza',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGEMENT'] },
        loadChildren: () =>
          import('@routes/dashboard/cobranza.routes').then(
            (m) => m.COBRANZA_ROUTES,
          ),
      },
      {
        path: 'pagos',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGEMENT'] },
        loadChildren: () =>
          import('@routes/dashboard/payments.routes').then(
            (m) => m.PAYMENTS_ROUTES,
          ),
      },
      {
        path: 'configuracion',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGEMENT'] },
        loadChildren: () =>
          import('@routes/dashboard/settings.routes').then(
            (m) => m.SETTINGS_ROUTES,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
