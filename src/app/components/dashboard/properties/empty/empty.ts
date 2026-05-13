import { Component, Input } from '@angular/core';

@Component({
  selector: 'component-dashboard-properties-empty',
  imports: [],
  templateUrl: './empty.html',
})
export class ComponentDashboardPropertiesEmpty {

  @Input() title: string = 'No tienes propiedades registradas';
  @Input() message: string = 'Registra una nueva propiedad para empezar a gestionar tu sistema';

}
