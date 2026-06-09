import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideClock,
  LucideBadgeAlert,
  LucideBadgeDollarSign,
  LucideUsers,
  LucideScissors,
} from '@lucide/angular';
import { BillingService } from '@core/services/billings/billing.service';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';

@Component({
  selector: 'component-dashboard-cobranza-kpis',
  imports: [
    CommonModule,
    LucideClock,
    LucideBadgeAlert,
    LucideBadgeDollarSign,
    LucideUsers,
    LucideScissors,
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardCobranzaKpis implements OnInit {
  private billingService = inject(BillingService);

  pendingCount = 0;
  overdueCount = 0;
  totalPendingAmount = 0;
  totalOverdueAmount = 0;
  delinquentCustomersCount = 0;
  suppliesToCutCount = 0;

  ngOnInit(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    this.billingService.search(0, 10000, undefined, undefined, ['PENDING', 'PARTIALLY_PAID', 'OVERDUE']).subscribe({
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
    this.totalPendingAmount = 0;
    this.totalOverdueAmount = 0;
    this.delinquentCustomersCount = 0;
    this.suppliesToCutCount = 0;
  }

  private calculate(list: BillingResponseDTO[]): void {
    // Facturas pendientes (PENDING o PARTIALLY_PAID)
    this.pendingCount = list.filter((b) => b.status === 'PENDING' || b.status === 'PARTIALLY_PAID').length;
    
    // Facturas vencidas (OVERDUE)
    this.overdueCount = list.filter((b) => b.status === 'OVERDUE').length;

    // Monto pendiente total (PENDING o PARTIALLY_PAID)
    this.totalPendingAmount = list
      .filter((b) => b.status === 'PENDING' || b.status === 'PARTIALLY_PAID')
      .reduce((sum, b) => sum + (Number(b.totalAmount) - (Number(b.amountPaid) || 0)), 0);

    // Monto vencido total (OVERDUE)
    this.totalOverdueAmount = list
      .filter((b) => b.status === 'OVERDUE')
      .reduce((sum, b) => sum + (Number(b.totalAmount) - (Number(b.amountPaid) || 0)), 0);

    // Clientes morosos (Clientes distintos con al menos 1 factura OVERDUE)
    const delinquentCustomers = new Set(
      list.filter((b) => b.status === 'OVERDUE').map((b) => b.customerName)
    );
    this.delinquentCustomersCount = delinquentCustomers.size;

    // Suministros por cortar (Suministros distintos con 2 o más facturas OVERDUE)
    const supplyOverdueCounts: Record<string, number> = {};
    list.filter((b) => b.status === 'OVERDUE').forEach((b) => {
      supplyOverdueCounts[b.supplyNumber] = (supplyOverdueCounts[b.supplyNumber] || 0) + 1;
    });
    this.suppliesToCutCount = Object.values(supplyOverdueCounts).filter((count) => count >= 2).length;
  }
}
