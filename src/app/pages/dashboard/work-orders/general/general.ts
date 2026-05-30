import { Component } from '@angular/core';
import { ComponentDashboardWorkOrdersList } from '@components/dashboard/work-orders/list/list';

@Component({
  selector: 'page-dashboard-work-orders-general',
  imports: [ComponentDashboardWorkOrdersList],
  templateUrl: './general.html',
})
export class PageDashboardWorkOrdersGeneral {}
