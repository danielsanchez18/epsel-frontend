import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideClock,
  LucideBadgeAlert,
  LucideBadgeDollarSign,
  LucideUsers,
  LucideScissors,
} from '@lucide/angular';
import { CollectionService } from '@core/services/collections/collection.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'component-dashboard-cobranza-kpis',
  imports: [
    CommonModule,
    FormsModule,
    LucideClock,
    LucideBadgeAlert,
    LucideBadgeDollarSign,
    LucideUsers,
    LucideScissors,
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardCobranzaKpis implements OnInit {
  private collectionService = inject(CollectionService);

  pendingCount = 0;
  overdueCount = 0;
  totalPendingAmount = 0;
  totalOverdueAmount = 0;
  delinquentCustomersCount = 0;
  suppliesToCutCount = 0;

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

  loadKPIs(startDate?: string, endDate?: string): void {
    // Si no pasan fechas específicas desde afuera (por ej. desde el filtro general), usamos el mes seleccionado.
    if (!startDate && !endDate && this.selectedPeriod) {
      const [year, month] = this.selectedPeriod.split('-');
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59); // último día del mes
      
      startDate = start.toISOString();
      endDate = end.toISOString();
    }
    this.collectionService.getKpis(startDate, endDate).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.pendingCount = res.data.pendingCount;
          this.overdueCount = res.data.overdueCount;
          this.totalPendingAmount = res.data.totalPendingAmount;
          this.totalOverdueAmount = res.data.totalOverdueAmount;
          this.delinquentCustomersCount = res.data.delinquentCustomersCount;
          this.suppliesToCutCount = res.data.suppliesToCutCount;
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
}
