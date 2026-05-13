import { Routes } from "@angular/router";

export const SUPPLIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/dashboard/supplies/general/general').then(m => m.PageDashboardSuppliesGeneral),
  },

]
