import { Component, Input } from '@angular/core';

@Component({
  selector: 'component-dashboard-incidents-empty',
  imports: [],
  templateUrl: './empty.html',
})
export class ComponentDashboardIncidentsEmpty {

  @Input() title: string = 'No hay incidencias registradas';
  @Input() message: string = 'Las incidencias del sistema se mostrarán en esta sección.';

}
