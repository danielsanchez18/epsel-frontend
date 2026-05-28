import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideClock,
  LucideBadgeAlert,
  LucideBadgeCheck,
  LucideBadgeDollarSign,
} from '@lucide/angular';
import { BillingService } from '@core/services/billings/billing.service';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';

@Component({
  selector: 'component-dashboard-billing-kpis',
  imports: [
    CommonModule,
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

  ngOnInit(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    this.billingService.search(0, 1000).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.calculate(res.data.content);
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

  private calculate(list: BillingResponseDTO[]): void {
    this.pendingCount = list.filter((b) => b.status === 'PENDING').length;
    this.overdueCount = list.filter((b) => b.status === 'OVERDUE').length;
    this.paidCount = list.filter((b) => b.status === 'PAID').length;

    this.totalCollected = list
      .filter((b) => b.status === 'PAID')
      .reduce(
        (sum, b) => sum + (Number(b.amountPaid) || Number(b.totalAmount)),
        0,
      );

    this.totalPending = list
      .filter((b) => b.status === 'PENDING' || b.status === 'OVERDUE')
      .reduce(
        (sum, b) => sum + (Number(b.totalAmount) - (Number(b.amountPaid) || 0)),
        0,
      );
  }
}
