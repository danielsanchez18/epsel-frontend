import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { PageDashboardPropertiesDetailsGeneral } from '../general/general';
import { SupplyDetailsDTO } from '@core/interfaces/supplies/supply.interface';
import { SupplyService } from '@core/services/supplies/supply.service';
import { LucideBadgeCheck, LucideHouse, LucideStore, LucideBuilding2 } from "@lucide/angular";

@Component({
  selector: 'page-dashboard-properties-details-supplies',
  imports: [CommonModule, RouterLink, ComponentSharedPaginator, LucideBadgeCheck, LucideHouse, LucideStore, LucideBuilding2],
  templateUrl: './supplies.html',
})
export class PageDashboardPropertiesDetailsSupplies implements OnInit, OnDestroy {
  private supplyService = inject(SupplyService);
  private route = inject(ActivatedRoute);
  private parent = inject(PageDashboardPropertiesDetailsGeneral);

  propertyId: string | null = null;
  propertyName = '';
  supplies: SupplyDetailsDTO[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  isLoading = false;

  private propertySub?: Subscription;

  ngOnInit(): void {
    this.propertyId = this.parent.propertyId || this.route.parent?.snapshot.paramMap.get('id') || null;

    this.propertySub = this.parent.property$.subscribe(property => {
      this.propertyName = property?.address || '';
    });

    if (this.propertyId) {
      this.loadSupplies();
    }
  }

  ngOnDestroy(): void {
    this.propertySub?.unsubscribe();
  }

  loadSupplies(page: number = 0): void {
    if (!this.propertyId) {
      this.supplies = [];
      this.totalPages = 0;
      this.totalElements = 0;
      return;
    }

    this.isLoading = true;

    this.supplyService.getByPropertyId(this.propertyId, page, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.supplies = res.data.content ?? [];
          this.totalPages = res.data.totalPages ?? 0;
          this.totalElements = res.data.totalElements ?? 0;
          this.currentPage = page;
        } else {
          this.supplies = [];
          this.totalPages = 0;
          this.totalElements = 0;
        }
        this.isLoading = false;
      },
      error: () => {
        this.supplies = [];
        this.totalPages = 0;
        this.totalElements = 0;
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.loadSupplies(page);
  }

  getTypeLabel(type?: string): string {
    switch (type) {
      case 'BUSINESS':
        return 'Local Comercial';
      case 'INDUSTRIAL':
        return 'Industrial';
      default:
        return 'Casa';
    }
  }

  getTypeIcon(type?: string): 'house' | 'store' | 'building' {
    switch (type) {
      case 'BUSINESS':
        return 'store';
      case 'INDUSTRIAL':
        return 'building';
      default:
        return 'house';
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'PENDING_INSTALLATION':
        return 'bg-blue-100 text-blue-700';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-700';
      case 'CUT_OFF':
        return 'bg-red-100 text-red-700';
      case 'RECONNECTED':
        return 'bg-cyan-100 text-cyan-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'PENDING_INSTALLATION':
        return 'Pendiente';
      case 'SUSPENDED':
        return 'Suspendido';
      case 'CUT_OFF':
        return 'Cortado';
      case 'RECONNECTED':
        return 'Reconectado';
      default:
        return status || 'Sin estado';
    }
  }
}
