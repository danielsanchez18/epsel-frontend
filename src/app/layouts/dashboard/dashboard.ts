import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ComponentDashboardSharedHeader } from '@components/dashboard/shared/header/header';
import { ComponentDashboardSharedSidebar } from '@components/dashboard/shared/sidebar/sidebar';

@Component({
  selector: 'layout-dashboard',
  imports: [
    RouterOutlet,
    ComponentDashboardSharedHeader,
    ComponentDashboardSharedSidebar,
  ],
  templateUrl: './dashboard.html',
})
export class LayoutDashboard {}
