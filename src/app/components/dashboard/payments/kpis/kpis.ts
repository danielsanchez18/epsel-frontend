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

@Component({
  selector: 'component-dashboard-payments-kpis',
  imports: [
    CommonModule,
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

  ngOnInit(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    this.paymentService.search(0, 1000).subscribe({
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
    this.totalToday = 0;
    this.totalMonth = 0;
    this.totalCash = 0;
    this.totalYape = 0;
    this.totalTransfer = 0;
  }

  private calculate(list: PaymentResponseDTO[]): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter COMPLETED status payments (since PENDING or CANCELLED may not represent actual revenue)
    const completedPayments = list.filter((p) => p.status === 'COMPLETED');

    this.totalToday = completedPayments
      .filter((p) => {
        if (!p.paymentDate) return false;
        return p.paymentDate.startsWith(todayStr);
      })
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    this.totalMonth = completedPayments
      .filter((p) => {
        if (!p.paymentDate) return false;
        const d = new Date(p.paymentDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    this.totalCash = completedPayments
      .filter((p) => p.paymentMethod === 'CASH')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    this.totalYape = completedPayments
      .filter((p) => p.paymentMethod === 'YAPE')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Transferencias: BANK_TRANSFER + PLIN + CARD
    this.totalTransfer = completedPayments
      .filter(
        (p) =>
          p.paymentMethod === 'BANK_TRANSFER' ||
          p.paymentMethod === 'PLIN' ||
          p.paymentMethod === 'CARD',
      )
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }
}
