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
import { FormsModule } from '@angular/forms';

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
    FormsModule,
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardGeneralKpis implements OnInit {
  private dashboardService = inject(DashboardService);

  kpis: DashboardKpi | null = null;
  isLoading = true;

  selectedPeriod = ''; // format: "YYYY-MM"
  periods: { label: string; value: string }[] = [];

  ngOnInit(): void {
    this.generatePeriods();
    this.loadKPIs();
  }

  generatePeriods(): void {
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-12
      const monthName = d.toLocaleString('es-PE', { month: 'long' });
      const label = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
      const value = `${year}-${month}`;
      this.periods.push({ label, value });
    }
    this.selectedPeriod = this.periods[0].value;
  }

  onPeriodChange(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    this.isLoading = true;
    let month: number | undefined;
    let year: number | undefined;

    if (this.selectedPeriod) {
      const parts = this.selectedPeriod.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
    }

    this.dashboardService.getDashboard(month, year).subscribe({
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
