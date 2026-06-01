import { Component } from '@angular/core';
import { ComponentDashboardIncidentsList } from '@components/dashboard/incidents/list/list';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'page-dashboard-incidents-general',
  imports: [
    ComponentDashboardIncidentsList,
    RouterLink
  ],
  templateUrl: './general.html',
})
export class PageDashboardIncidentsGeneral {}
