import { Component, inject } from '@angular/core';
import { ComponentDashboardGeneralKpis } from '@components/dashboard/general/kpis/kpis';
import { AuthService } from '@services/auth/auth.service';
import { ComponentDashboardGeneralChartsBarChart } from '@components/dashboard/general/charts/bar-chart/bar-chart';
import { ComponentDashboardGeneralAlerts } from '@components/dashboard/general/alerts/alerts';
import { ComponentDashboardGeneralActivity } from '@components/dashboard/general/activity/activity';

@Component({
  selector: 'page-dashboard-general',
  imports: [
    ComponentDashboardGeneralKpis,
    ComponentDashboardGeneralChartsBarChart,
    ComponentDashboardGeneralAlerts,
    ComponentDashboardGeneralActivity,
  ],
  templateUrl: './general.html',
})
export class PageDashboardGeneral {
  private auth = inject(AuthService);
  usuario = this.auth.getUser();
}
