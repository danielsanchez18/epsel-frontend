import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '@services/dashboard/dashboard.service';
import { DashboardAlert } from '@interfaces/dashboard/dashboard.interface';
import {
  LucideInfo,
  LucideCheckCircle2,
  LucideBadgeAlert,
  LucideWrench,
} from '@lucide/angular';

@Component({
  selector: 'component-dashboard-general-alerts',
  imports: [
    CommonModule,
    LucideBadgeAlert,
    LucideWrench,
    LucideInfo,
    LucideCheckCircle2,
  ],
  templateUrl: './alerts.html',
})
export class ComponentDashboardGeneralAlerts implements OnInit {
  private dashboardService = inject(DashboardService);

  alerts: DashboardAlert[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.isLoading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.alerts = res.data.alerts || [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.alerts = [];
        this.isLoading = false;
      },
    });
  }
}
