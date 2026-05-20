import { Component } from '@angular/core';
import { LucideClipboardClock, LucideBadgeCheck, LucideBadgeX, LucideBadgeDollarSign } from "@lucide/angular";

@Component({
  selector: 'component-dashboard-applications-kpis',
  imports: [
    LucideClipboardClock,
    LucideBadgeCheck,
    LucideBadgeX,
    LucideBadgeDollarSign
],
  templateUrl: './kpis.html',
})
export class ComponentDashboardApplicationsKpis {}
