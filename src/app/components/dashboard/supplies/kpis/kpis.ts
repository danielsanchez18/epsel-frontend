import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideBadgeCheck, LucideBadgeAlert, LucideDroplets } from "@lucide/angular";
import { SupplyService } from '@core/services/supplies/supply.service';

@Component({
  selector: 'component-dashboard-supplies-kpis',
  imports: [
    CommonModule,
    LucideDroplets,
    LucideBadgeCheck,
    LucideBadgeAlert
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardSuppliesKpis implements OnInit {
  private supplyService = inject(SupplyService);

  kpis: any = {
    totalSupplies: 0,
    suppliesChangeThisMonth: 0,
    activeSupplies: 0,
    activeSuppliesPercentage: 0,
    suspendedSupplies: 0,
    suspendedSuppliesChangeThisMonth: 0,
    pendingReconnections: 0,
    reconnectionsThisMonth: 0
  };

  ngOnInit(): void {
    this.loadKpis();
  }

  loadKpis(): void {
    this.supplyService.getKpis().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.kpis = res.data;
        }
      },
      error: (err) => {
        console.error('Error loading supply KPIs:', err);
      }
    });
  }
}
