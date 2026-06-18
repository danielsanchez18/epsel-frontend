import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideClock,
  LucideBadgeAlert,
  LucideBadgeCheck,
  LucideBadgeDollarSign,
} from '@lucide/angular';
import { BillingService } from '@core/services/billings/billing.service';

@Component({
  selector: 'component-dashboard-billing-kpis',
  imports: [
    CommonModule,
    FormsModule,
    LucideClock,
    LucideBadgeAlert,
    LucideBadgeCheck,
    LucideBadgeDollarSign,
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardBillingKpis implements OnInit {
  private billingService = inject(BillingService);

  pendingCount = 0;
  overdueCount = 0;
  paidCount = 0;
  totalCollected = 0;
  totalPending = 0;

  selectedPeriod = '';
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
      const month = d.getMonth() + 1;
      const monthName = d.toLocaleString('es-PE', { month: 'long' });
      const label = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
      const value = `${year}-${month.toString().padStart(2, '0')}`;
      this.periods.push({ label, value });
    }
    this.selectedPeriod = this.periods[0].value;
  }

  onPeriodChange(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (this.selectedPeriod) {
      const [year, month] = this.selectedPeriod.split('-');
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

      startDate = start.toISOString();
      endDate = end.toISOString();
    }

    this.billingService.getKpis(startDate, endDate).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.pendingCount = res.data.pendingCount;
          this.overdueCount = res.data.overdueCount;
          this.paidCount = res.data.paidCount;
          this.totalCollected = res.data.totalCollected;
          this.totalPending = res.data.totalPending;
        } else {
          this.resetKPIs();
        }
      },
      error: () => {
        this.resetKPIs();
      },
    });
  }

  private resetKPIs(): void {
    this.pendingCount = 0;
    this.overdueCount = 0;
    this.paidCount = 0;
    this.totalCollected = 0;
    this.totalPending = 0;
  }
}
