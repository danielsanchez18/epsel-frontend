import { Component } from '@angular/core';
import { ComponentDashboardBillingKpis } from '@components/dashboard/billing/kpis/kpis';
import { ComponentDashboardBillingList } from '@components/dashboard/billing/list/list';

@Component({
  selector: 'page-dashboard-billing-general',
  imports: [
    ComponentDashboardBillingKpis,
    ComponentDashboardBillingList
  ],
  templateUrl: './general.html',
})
export class PageDashboardBillingGeneral {}
