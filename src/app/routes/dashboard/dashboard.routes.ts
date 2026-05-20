import { Routes } from "@angular/router";

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@layouts/dashboard/dashboard').then(m => m.LayoutDashboard,),
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/dashboard/general/general').then(m => m.PageDashboardGeneral),
      },
      {
        path: 'personal',
        loadChildren: () => import('@routes/dashboard/workers.routes').then(m => m.WORKERS_ROUTES)
      },
      {
        path: 'clientes',
        loadChildren: () => import('@routes/dashboard/customers.routes').then(m => m.CUSTOMERS_ROUTES)
      },
      {
        path: 'predios',
        loadChildren: () => import('@routes/dashboard/properties.routes').then(m => m.PROPERTIES_ROUTES)
      },
      {
        path: 'solicitudes',
        loadChildren: () => import('@routes/dashboard/applications.routes').then(m => m.APPLICATIONS_ROUTES)
      },
      {
        path: 'suministros',
        loadChildren: () => import('@routes/dashboard/supplies.routes').then(m => m.SUPPLIES_ROUTES)
      },
      {
        path: 'configuracion',
        loadChildren: () => import('@routes/dashboard/settings.routes').then(m => m.SETTINGS_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '',
  }
]
