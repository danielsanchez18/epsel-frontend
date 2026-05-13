import { Component } from '@angular/core';
import { LucideBadgeCheck, LucideBadgeAlert, LucideDroplets, LucideBuilding2, LucideDropletOff } from "@lucide/angular";

@Component({
  selector: 'component-dashboard-properties-kpis',
  imports: [
    LucideBadgeCheck,
    LucideBadgeAlert,
    LucideBuilding2,
    LucideDropletOff
],
  templateUrl: './kpis.html',
})
export class ComponentDashboardPropertiesKpis {}
