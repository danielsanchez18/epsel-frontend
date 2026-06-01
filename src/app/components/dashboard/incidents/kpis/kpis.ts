import { Component, Input } from '@angular/core';
import { LucideBadgeAlert, LucideClipboardList, LucideActivity, LucideBadgeCheck } from "@lucide/angular";

@Component({
  selector: 'component-dashboard-incidents-kpis',
  imports: [
    LucideBadgeAlert,
    LucideClipboardList,
    LucideActivity,
    LucideBadgeCheck
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardIncidentsKpis {
  @Input() total = 8;
  @Input() open = 4;
  @Input() inProgress = 2;
  @Input() resolved = 2;
}
