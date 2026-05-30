import { Component, Input } from '@angular/core';
import { LucideFileText } from '@lucide/angular';

@Component({
  selector: 'component-dashboard-cobranza-empty',
  imports: [LucideFileText],
  templateUrl: './empty.html',
})
export class ComponentDashboardCobranzaEmpty {
  @Input() title: string = 'No se encontraron registros de cobranza';
  @Input() message: string = 'No hay facturas pendientes o vencidas que coincidan con los criterios de búsqueda.';
}
