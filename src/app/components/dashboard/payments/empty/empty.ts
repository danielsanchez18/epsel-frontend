import { Component, Input } from '@angular/core';
import { LucideCreditCard } from '@lucide/angular';

@Component({
  selector: 'component-dashboard-payments-empty',
  imports: [LucideCreditCard],
  templateUrl: './empty.html',
})
export class ComponentDashboardPaymentsEmpty {
  @Input() title: string = 'No se encontraron pagos';
  @Input() message: string = 'Ajuste los filtros de búsqueda o registre nuevos pagos.';
}
