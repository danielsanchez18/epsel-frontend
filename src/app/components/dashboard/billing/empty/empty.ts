import { Component, Input } from '@angular/core';
import { LucideFileText } from '@lucide/angular';

@Component({
  selector: 'component-dashboard-billing-empty',
  imports: [LucideFileText],
  templateUrl: './empty.html',
})
export class ComponentDashboardBillingEmpty {
  @Input() title: string = 'No se encontraron facturas';
  @Input() message: string = 'Ajuste los filtros de búsqueda o registre nuevas lecturas para facturar.';
}
