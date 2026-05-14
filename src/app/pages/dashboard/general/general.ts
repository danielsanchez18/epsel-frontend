import { Component, inject } from '@angular/core';
import { ComponentDashboardGeneralKpis } from "@components/dashboard/general/kpis/kpis";
import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'page-dashboard-general',
  imports: [
    ComponentDashboardGeneralKpis
  ],
  templateUrl: './general.html',
})
export class PageDashboardGeneral {

  private auth = inject(AuthService);
  usuario = this.auth.getUser();

}
