import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComponentDashboardWorkersKpis } from "@components/dashboard/workers/kpis/kpis";
import { ComponentDashboardWorkersList } from "@components/dashboard/workers/list/list";

@Component({
  selector: 'page-dashboard-workers-general',
  imports: [
    ComponentDashboardWorkersKpis,
    RouterLink,
    ComponentDashboardWorkersList
],
  templateUrl: './general.html',
})
export class PageDashboardWorkersGeneral {}
