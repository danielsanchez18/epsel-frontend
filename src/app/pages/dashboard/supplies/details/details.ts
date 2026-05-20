import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComponentDashboardSuppliesDetails } from '@components/dashboard/supplies/details/details';

@Component({
  selector: 'page-dashboard-supplies-details',
  imports: [RouterLink, ComponentDashboardSuppliesDetails],
  templateUrl: './details.html',
})
export class PageDashboardSuppliesDetails {}