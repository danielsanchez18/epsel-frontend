import { Routes } from "@angular/router";

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/dashboard/settings/general/general').then(m => m.PageDashboardSettingsGeneral),
    children: [
      {
        path: 'zonas-operativas',
        loadComponent: () => import('@pages/dashboard/settings/operating-zones/operating-zones').then(m => m.PageDashboardSettingsOperatingZones),
      },
      {
        path: 'reglas-financieras',
        loadComponent: () => import('@pages/dashboard/settings/financial-rules/financial-rules').then(m => m.PageDashboardSettingsFinancialRules),
      },
      {
        path: 'costos-servicio',
        loadComponent: () => import('@pages/dashboard/settings/service-costs/service-costs').then(m => m.PageDashboardSettingsServiceCosts),
      },
      {
        path: 'tarifas-agua',
        loadComponent: () => import('@pages/dashboard/settings/water-rates/water-rates').then(m => m.PageDashboardSettingsWaterRates),
      },
      {
        path: '**',
        redirectTo: 'zonas-operativas'
      }
    ]
  },
]
