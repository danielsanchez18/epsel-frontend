import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ComponentDashboardApplicationsDetails } from '@components/dashboard/applications/details/details';

@Component({
  selector: 'page-dashboard-applications-details',
  imports: [
    RouterLink,
    ComponentDashboardApplicationsDetails
],
  templateUrl: './details.html',
})
export class PageDashboardApplicationsDetails {}
