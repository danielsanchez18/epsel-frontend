import { Component } from '@angular/core';
import { ComponentDashboardApplicationsKpis } from "@components/dashboard/applications/kpis/kpis";
import { ComponentDashboardApplicationsList } from "@components/dashboard/applications/list/list";
import { ComponentDashboardApplicationsAdd } from "@components/dashboard/applications/add/add";

@Component({
  selector: 'page-dashboard-applications-general',
  imports: [
    ComponentDashboardApplicationsKpis,
    ComponentDashboardApplicationsList,
    ComponentDashboardApplicationsAdd
],
  templateUrl: './general.html',
})
export class PageDashboardApplicationsGeneral {}
