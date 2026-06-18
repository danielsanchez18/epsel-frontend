import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideCalendar,
  LucideCreditCard,
  LucideSmartphone,
  LucideHandCoins,
  LucideBadgeDollarSign,
} from '@lucide/angular';
import { PaymentService } from '@core/services/payments/payment.service';
import { PaymentResponseDTO } from '@interfaces/payments/payment.interface';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'component-dashboard-payments-kpis',
  imports: [
    CommonModule,
    FormsModule,
    LucideCalendar,
    LucideCreditCard,
    LucideSmartphone,
    LucideHandCoins,
    LucideBadgeDollarSign,
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardPaymentsKpis implements OnInit {
  private paymentService = inject(PaymentService);

  totalToday = 0;
  totalMonth = 0;
  totalCash = 0;
  totalYape = 0;
  totalTransfer = 0;

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

    this.paymentService.getKpis(startDate, endDate).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.totalToday = res.data.totalToday;
          this.totalMonth = res.data.totalPeriod;
          this.totalCash = res.data.totalCash;
          this.totalYape = res.data.totalYape;
          this.totalTransfer = res.data.totalTransfer;
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
    this.totalToday = 0;
    this.totalMonth = 0;
    this.totalCash = 0;
    this.totalYape = 0;
    this.totalTransfer = 0;
  }
}
