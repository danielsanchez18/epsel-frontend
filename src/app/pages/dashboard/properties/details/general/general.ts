import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'page-dashboard-properties-details-general',
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './general.html',
})
export class PageDashboardPropertiesDetailsGeneral {

  routes = [
    { name: 'Clientes Asociados', path: 'clientes-asociados' },
    { name: 'Suministros', path: 'suministros' },
    { name: 'Consumo', path: 'consumo' },
    { name: 'Facturación', path: 'facturacion' },
    { name: 'Incidencias', path: 'incidencias' },
    { name: 'Órdenes de Trabajo', path: 'ordenes-de-trabajo' },
    { name: 'Documentos', path: 'documentos' },
    { name: 'Historial', path: 'historial' },

  ]

}
