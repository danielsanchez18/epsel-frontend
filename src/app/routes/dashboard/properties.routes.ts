import { Routes } from "@angular/router";

export const PROPERTIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/dashboard/properties/general/general').then(m => m.PageDashboardPropertiesGeneral),
  },
  {
    path: ':id',
    loadComponent: () => import('@pages/dashboard/properties/details/general/general').then(m => m.PageDashboardPropertiesDetailsGeneral),
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/dashboard/properties/details/info/info').then(m => m.PageDashboardPropertiesDetailsInfo),
      },
      {
        path: 'clientes-asociados',
        loadComponent: () => import('@pages/dashboard/properties/details/affiliated-clients/affiliated-clients').then(m => m.PageDashboardPropertiesDetailsAffiliatedClients),
      },
      {
        path: 'suministros',
        loadComponent: () => import('@pages/dashboard/properties/details/supplies/supplies').then(m => m.PageDashboardPropertiesDetailsSupplies),
      },
      {
        path: 'consumo',
        loadComponent: () => import('@pages/dashboard/properties/details/consumption/consumption').then(m => m.PageDashboardPropertiesDetailsConsumption),
      },
      {
        path: 'facturacion',
        loadComponent: () => import('@pages/dashboard/properties/details/billing/billing').then(m => m.PageDashboardPropertiesDetailsBilling),
      },
      {
        path: 'incidencias',
        loadComponent: () => import('@pages/dashboard/properties/details/claims/claims').then(m => m.PageDashboardPropertiesDetailsClaims),
      },
      {
        path: 'ordenes-de-trabajo',
        loadComponent: () => import('@pages/dashboard/properties/details/work-orders/work-orders').then(m => m.PageDashboardPropertiesDetailsWorkOrders),
      },
      {
        path: 'documentos',
        loadComponent: () => import('@pages/dashboard/properties/details/documents/documents').then(m => m.PageDashboardPropertiesDetailsDocuments),
      },
      {
        path: 'historial',
        loadComponent: () => import('@pages/dashboard/properties/details/history/history').then(m => m.PageDashboardPropertiesDetailsHistory),
      }
    ]
  }
]
