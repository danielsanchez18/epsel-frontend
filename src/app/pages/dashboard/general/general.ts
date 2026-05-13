import { Component } from '@angular/core';
import { ComponentDashboardGeneralKpis } from "@components/dashboard/general/kpis/kpis";

@Component({
  selector: 'page-dashboard-general',
  imports: [
    ComponentDashboardGeneralKpis
  ],
  templateUrl: './general.html',
})
export class PageDashboardGeneral {}
