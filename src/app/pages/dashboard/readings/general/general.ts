import { Component } from '@angular/core';
import { ComponentDashboardReadingsKpis } from '@components/dashboard/readings/kpis/kpis';
import { ComponentDashboardReadingsList } from '@components/dashboard/readings/list/list';
import { ComponentDashboardReadingsAdd } from '@components/dashboard/readings/add/add';

@Component({
  selector: 'page-dashboard-readings-general',
  imports: [
    ComponentDashboardReadingsKpis,
    ComponentDashboardReadingsList,
    ComponentDashboardReadingsAdd
  ],
  templateUrl: './general.html',
})
export class PageDashboardReadingsGeneral {}
