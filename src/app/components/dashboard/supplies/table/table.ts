import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHouse, LucideStore, LucideBuilding2 } from "@lucide/angular";

@Component({
  selector: 'component-dashboard-supplies-table',
  imports: [
    LucideHouse,
    LucideStore,
    LucideBuilding2,
    RouterLink
],
  templateUrl: './table.html',
})
export class ComponentDashboardSuppliesTable {}
