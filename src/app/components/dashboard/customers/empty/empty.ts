import { Component, Input } from '@angular/core';

@Component({
  selector: 'component-dashboard-customers-empty',
  imports: [],
  templateUrl: './empty.html',
})
export class ComponentDashboardCustomersEmpty {

  @Input() title: string = 'No tienes clientes registrados';
  @Input() message: string = 'Registra un nuevo cliente para empezar a gestionar tu sistema';

}
