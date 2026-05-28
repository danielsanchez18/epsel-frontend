import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComponentDashboardReadingsDetails } from '@components/dashboard/readings/details/details';

@Component({
  selector: 'page-dashboard-readings-details',
  imports: [RouterLink, ComponentDashboardReadingsDetails],
  templateUrl: './details.html',
})
export class PageDashboardReadingsDetails {}
