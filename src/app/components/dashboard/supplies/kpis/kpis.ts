import { Component } from '@angular/core';
import { LucideBadgeCheck, LucideBadgeAlert, LucideDroplets } from "@lucide/angular";

@Component({
  selector: 'component-dashboard-supplies-kpis',
  imports: [
    LucideDroplets,
    LucideBadgeCheck,
    LucideBadgeAlert
],
  templateUrl: './kpis.html',
})
export class ComponentDashboardSuppliesKpis {}
