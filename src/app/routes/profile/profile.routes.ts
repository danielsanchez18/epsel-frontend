import { Routes } from "@angular/router";

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@layouts/profile/profile').then(m => m.LayoutProfile,),
    children: [
    ]
  }
]
