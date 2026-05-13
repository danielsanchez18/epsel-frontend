import { Component } from '@angular/core';
import { ComponentDashboardSuppliesKpis } from "@components/dashboard/supplies/kpis/kpis";
import { RouterLink } from '@angular/router';
import { ComponentDashboardSuppliesList } from "@components/dashboard/supplies/list/list";

@Component({
  selector: 'page-dashboard-supplies-general',
  imports: [
    RouterLink,
    ComponentDashboardSuppliesKpis,
    ComponentDashboardSuppliesList
],
  templateUrl: './general.html',
})
export class PageDashboardSuppliesGeneral {}
