import { Component, Input } from '@angular/core';
import { InstallationRequestResponse } from '@interfaces/supplies/installation-request.interface';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'component-dashboard-applications-table',
  imports: [
    CommonModule,
    RouterLink
],
  templateUrl: './table.html',
})
export class ComponentDashboardApplicationsTable {
  @Input() items: InstallationRequestResponse[] = [];
}
