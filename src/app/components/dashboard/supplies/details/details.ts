import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { SupplyDetailsDTO } from '@core/interfaces/supplies/supply.interface';
import { SupplyService } from '@core/services/supplies/supply.service';

@Component({
  selector: 'component-dashboard-supplies-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './details.html',
})
export class ComponentDashboardSuppliesDetails implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private supplyService = inject(SupplyService);

  supply: SupplyDetailsDTO | null = null;
  isLoading = true;

  private sub?: Subscription;

  ngOnInit(): void {
    const parentRoute = this.route.parent;
    if (parentRoute) {
      this.sub = parentRoute.paramMap.subscribe(params => {
        const id = params.get('id') || this.route.snapshot.paramMap.get('id');
        if (id) {
          this.loadSupply(id);
        }
      });
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSupply(id);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadSupply(id: string): void {
    this.isLoading = true;
    this.supplyService.getById(id).subscribe({
      next: (res) => {
        this.supply = res.success ? res.data : null;
        this.isLoading = false;
      },
      error: () => {
        this.supply = null;
        this.isLoading = false;
      }
    });
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'SUSPENDED': return 'Suspendido';
      case 'CUT_OFF': return 'Cortado';
      case 'RECONNECTED': return 'Reconectado';
      default: return status || 'Sin estado';
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CUT_OFF': return 'bg-red-100 text-red-700 border-red-200';
      case 'RECONNECTED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  formatDate(value?: string | null): string {
    return value ? new Date(value).toLocaleDateString('es-PE') : '-';
  }
}