import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideUsers,
  LucideHome,
  LucideAlertCircle,
  LucideBan,
  LucideFileText,
  LucideAlertTriangle,
  LucideTrendingUp,
  LucideDollarSign,
  LucideDroplets,
} from '@lucide/angular';
import { DashboardService } from '@services/dashboard/dashboard.service';
import { DashboardKpi } from '@interfaces/dashboard/dashboard.interface';

@Component({
  selector: 'component-dashboard-general-kpis',
  imports: [
    CommonModule,
    LucideUsers,
    LucideHome,
    LucideAlertCircle,
    LucideBan,
    LucideFileText,
    LucideAlertTriangle,
    LucideTrendingUp,
    LucideDollarSign,
    LucideDroplets,
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardGeneralKpis implements OnInit {
  private dashboardService = inject(DashboardService);

  kpis: DashboardKpi | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    this.isLoading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.kpis = res.data.kpis;
        }
        this.isLoading = false;
      },
      error: () => {
        this.kpis = null;
        this.isLoading = false;
      },
    });
  }
}
