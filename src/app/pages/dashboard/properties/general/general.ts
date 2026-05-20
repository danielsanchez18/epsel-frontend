import { Component } from '@angular/core';
import { ComponentDashboardPropertiesKpis } from "@components/dashboard/properties/kpis/kpis";
import { ComponentDashboardPropertiesAdd } from "@components/dashboard/properties/add/add";
import { ComponentDashboardPropertiesList } from "@components/dashboard/properties/list/list";

@Component({
  selector: 'page-dashboard-properties-general',
  imports: [
    ComponentDashboardPropertiesKpis,
    ComponentDashboardPropertiesAdd,
    ComponentDashboardPropertiesList
],
  templateUrl: './general.html',
})
export class PageDashboardPropertiesGeneral {


}
