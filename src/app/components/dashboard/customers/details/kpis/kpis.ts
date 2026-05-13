import { Component } from '@angular/core';
import { LucideFileText, LucideDroplets, LucideCreditCard, LucideBadgeAlert } from "@lucide/angular";

@Component({
  selector: 'component-dashboard-customers-details-kpis',
  imports: [
    LucideFileText, LucideDroplets, LucideCreditCard, LucideBadgeAlert
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardCustomersDetailsKpis {}
