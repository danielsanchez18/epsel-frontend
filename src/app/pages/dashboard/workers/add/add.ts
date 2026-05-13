import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComponentDashboardWorkersAdd } from "@components/dashboard/workers/add/add";

@Component({
  selector: 'page-dashboard-workers-add',
  imports: [
    ComponentDashboardWorkersAdd,
    RouterLink
  ],
  templateUrl: './add.html',
})
export class PageDashboardWorkersAdd {}
