import { Component, Input } from '@angular/core';

@Component({
  selector: 'component-dashboard-properties-empty',
  imports: [],
  templateUrl: './empty.html',
})
export class ComponentDashboardSuppliesEmpty {

  @Input() title: string = 'No tienes suministros registrados';
  @Input() message: string = 'Registra un nuevo suministro para empezar a gestionar tu sistema';

}
