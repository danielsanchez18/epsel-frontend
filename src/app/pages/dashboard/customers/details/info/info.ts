import { Component } from '@angular/core';
import { LucideBadgeInfo, LucideCalendar1, LucideCalendarCheck, LucideUserCheck } from "@lucide/angular";
import { ComponentDashboardCustomersDetailsKpis } from "@components/dashboard/customers/details/kpis/kpis";

@Component({
  selector: 'page-dashboard-customers-details-info',
  imports: [
    LucideBadgeInfo, LucideCalendar1, LucideCalendarCheck, LucideUserCheck,
    ComponentDashboardCustomersDetailsKpis
],
  templateUrl: './info.html',
})
export class PageDashboardCustomersDetailsInfo {}
