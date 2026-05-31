import { Component, inject } from '@angular/core';
import { ComponentDashboardGeneralKpis } from '@components/dashboard/general/kpis/kpis';
import { AuthService } from '@services/auth/auth.service';
import { ComponentDashboardGeneralChartsBarChart } from '@components/dashboard/general/charts/bar-chart/bar-chart';

@Component({
  selector: 'page-dashboard-general',
  imports: [
    ComponentDashboardGeneralKpis,
    ComponentDashboardGeneralChartsBarChart,
  ],
  templateUrl: './general.html',
})
export class PageDashboardGeneral {
  private auth = inject(AuthService);
  usuario = this.auth.getUser();
}
