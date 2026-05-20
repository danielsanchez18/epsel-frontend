import { Component, Input } from '@angular/core';

@Component({
  selector: 'component-dashboard-applications-empty',
  imports: [],
  templateUrl: './empty.html',
})
export class ComponentDashboardApplicationsEmpty {

  @Input() title: string = 'No tienes solicitudes registradas';
  @Input() message: string = 'Registra una nueva solicitud para empezar a gestionar tu sistema';

}
