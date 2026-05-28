import { Component } from '@angular/core';
import { LucideClipboardList, LucideClipboardPenLine, LucideBadgeCheck, LucideFileText, LucideBan } from "@lucide/angular";

@Component({
  selector: 'component-dashboard-readings-kpis',
  imports: [
    LucideClipboardList,
    LucideClipboardPenLine,
    LucideBadgeCheck,
    LucideFileText,
    LucideBan
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardReadingsKpis {}
