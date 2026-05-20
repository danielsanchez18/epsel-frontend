import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropertyResponse } from '@interfaces/properties/properties.interface';
import { LucideHouse, LucideStore, LucideBuilding2 } from "@lucide/angular";

@Component({
  selector: 'component-dashboard-properties-table',
  imports: [
    LucideHouse,
    LucideStore,
    LucideBuilding2,
    RouterLink
],
  templateUrl: './table.html',
})
export class ComponentDashboardPropertiesTable {

  @Input() properties: PropertyResponse[] = [];
  @Input() isLoading = false;

}
