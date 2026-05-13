import { Component, Input } from '@angular/core';

@Component({
  selector: 'component-dashboard-workers-empty',
  imports: [],
  templateUrl: './empty.html',
})
export class ComponentDashboardWorkersEmpty {

  @Input() title: string = 'No tienes personal registrado';
  @Input() message: string = 'Registra un nuevo personal para empezar a gestionar tu sistema';

}
