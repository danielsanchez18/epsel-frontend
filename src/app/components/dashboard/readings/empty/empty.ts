import { Component, Input } from '@angular/core';

@Component({
  selector: 'component-dashboard-readings-empty',
  imports: [],
  templateUrl: './empty.html',
})
export class ComponentDashboardReadingsEmpty {

  @Input() title: string = 'No hay lecturas registradas';
  @Input() message: string = 'Registra una nueva lectura de medidor para comenzar el proceso de facturación';

}
