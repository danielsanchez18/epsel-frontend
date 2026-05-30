import { Component, Input } from '@angular/core';

@Component({
  selector: 'component-dashboard-work-orders-empty',
  imports: [],
  templateUrl: './empty.html',
})
export class ComponentDashboardWorkOrdersEmpty {

  @Input() title: string = 'No tienes órdenes de trabajo registradas';
  @Input() message: string = 'Las órdenes de trabajo aparecerán aquí una vez que sean creadas en el sistema.';

}
