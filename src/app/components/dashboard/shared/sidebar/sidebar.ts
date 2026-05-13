import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideUserCog, LucideUsers, LucideChartLine, LucideDynamicIcon, LucideLayoutDashboard, LucideDroplets, LucideClipboardPenLine, LucideCreditCard, LucideFileText, LucideHandCoins, LucideHeadset, LucideClipboardList, LucideSettings, LucideActivity, LucideBuilding2, LucideBadgeAlert } from "@lucide/angular";

@Component({
  selector: 'component-dashboard-shared-sidebar',
  imports: [
    RouterModule,
    CommonModule,
    LucideDynamicIcon,
    LucideLayoutDashboard
],
  templateUrl: './sidebar.html',
})
export class ComponentDashboardSharedSidebar {

  // routes = [
  //   { name: 'Estadísticas', path: 'estadisticas', icon: LucideChartLine },
  //   { name: 'Personal', path: 'personal', icon: LucideUserCog },
  //   { name: 'Clientes', path: 'clientes', icon: LucideUsers },
  //   { name: 'Suministros', path: 'suministros', icon: LucideDroplets },
  //   { name: 'Lecturas', path: 'lecturas', icon: LucideClipboardPenLine },
  //   { name: 'Facturación', path: 'facturacion', icon: LucideFileText },
  //   { name: 'Pagos', path: 'pagos', icon: LucideCreditCard },
  //   { name: 'Cobranza', path: 'cobranza', icon: LucideHandCoins },
  //   { name: 'Operaciones', path: 'operaciones', icon: LucideChartLine },
  //   { name: 'Reclamos y Atención', path: 'reclamos', icon: LucideHeadset },
  //   { name: 'Reportes', path: 'reportes', icon: LucideClipboardList },
  //   { name: 'Configuración', path: 'configuracion', icon: LucideSettings },
  //   { name: 'Auditoría', path: 'auditoria', icon: LucideActivity },
  // ]

  routes = [
    {
      nameCategory: 'Gestión Comercial',
      links: [
        { name: 'Clientes', path: 'clientes', icon: LucideUsers },
        { name: 'Predios', path: 'predios', icon: LucideBuilding2 },
        { name: 'Solicitudes', path: 'solicitudes', icon: LucideClipboardPenLine },
      ]
    },
    {
      nameCategory: 'Operaciones de Campo',
      links: [
        { name: 'Suministros', path: 'suministros', icon: LucideDroplets },
        { name: 'Lecturas', path: 'lecturas', icon: LucideClipboardPenLine },
        { name: 'Incidencias', path: 'incidencias', icon: LucideBadgeAlert },
        { name: 'Cortes y Reconexiones', path: 'cortes', icon: LucideActivity },
      ]
    },
    {
      nameCategory: 'Facturación y Finanzas',
      links: [
        { name: 'Facturación', path: 'facturacion', icon: LucideFileText },
        { name: 'Pagos', path: 'pagos', icon: LucideCreditCard },
        { name: 'Cobranza', path: 'cobranza', icon: LucideHandCoins },
      ]
    },
    {
      nameCategory: 'Administración del Sistema',
      links: [
        { name: 'Personal', path: 'personal', icon: LucideUserCog },
        { name: 'Configuración', path: 'configuracion', icon: LucideSettings },
      ]
    }
  ]

}
