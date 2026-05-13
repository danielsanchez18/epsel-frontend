import { Component } from '@angular/core';
import { LucideUserCheck, LucideUsers, LucideClockAlert, LucideUserPlus } from "@lucide/angular";

@Component({
  selector: 'component-dashboard-customers-kpis',
  imports: [
    LucideUsers,
    LucideUserCheck,
    LucideClockAlert,
    LucideUserPlus
],
  templateUrl: './kpis.html',
})
export class ComponentDashboardCustomersKpis {}
