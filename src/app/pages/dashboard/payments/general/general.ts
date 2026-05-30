import { Component } from '@angular/core';
import { ComponentDashboardPaymentsKpis } from '@components/dashboard/payments/kpis/kpis';
import { ComponentDashboardPaymentsList } from '@components/dashboard/payments/list/list';

@Component({
  selector: 'page-dashboard-payments-general',
  imports: [
    ComponentDashboardPaymentsKpis,
    ComponentDashboardPaymentsList
  ],
  templateUrl: './general.html',
})
export class PageDashboardPaymentsGeneral {}
