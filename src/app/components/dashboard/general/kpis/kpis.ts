import { Component } from '@angular/core';
import { LucideUserCheck, LucideBadgeCheck, LucideClipboardCheck, LucideBadgeAlert } from "@lucide/angular";

@Component({
  selector: 'component-dashboard-general-kpis',
  imports: [
    LucideUserCheck, LucideBadgeCheck, LucideClipboardCheck, LucideBadgeAlert
],
  templateUrl: './kpis.html',
})
export class ComponentDashboardGeneralKpis {}
