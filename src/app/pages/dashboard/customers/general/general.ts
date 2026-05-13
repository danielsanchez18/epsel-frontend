import { Component } from '@angular/core';
import { ComponentDashboardCustomersKpis } from "@components/dashboard/customers/kpis/kpis";
import { ComponentDashboardCustomersAdd } from "@components/dashboard/customers/add/add";
import { ComponentDashboardCustomersList } from "@components/dashboard/customers/list/list";

@Component({
  selector: 'page-dashboard-customers-general',
  imports: [
    ComponentDashboardCustomersKpis,
    ComponentDashboardCustomersAdd,
    ComponentDashboardCustomersList
],
  templateUrl: './general.html',
})
export class PageDashboardCustomersGeneral {}
