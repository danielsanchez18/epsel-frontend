import { Component } from '@angular/core';
import { LucideBadgeInfo, LucideCalendar1, LucideCalendarCheck, LucideUserCheck } from "@lucide/angular";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'page-dashboard-properties-details-info',
  imports: [
    LucideBadgeInfo, LucideCalendar1, LucideCalendarCheck, LucideUserCheck,
],
  templateUrl: './info.html',
})
export class PageDashboardPropertiesDetailsInfo {}
