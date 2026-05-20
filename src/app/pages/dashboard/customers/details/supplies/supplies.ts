import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedFilters } from "@components/shared/filters/filters";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { ComponentDashboardSuppliesEmpty } from '@components/dashboard/supplies/empty/empty';
import { SupplyService } from '@core/services/supplies/supply.service';
import { SupplyResponseDTO } from '@core/interfaces/supplies/supply.interface';
import { PageDashboardCustomersDetailsGeneral } from '../general/general';
import { LucideBadgeCheck, LucideBuilding2, LucideHouse, LucideStore, LucideSearch } from "@lucide/angular";

@Component({
  selector: 'page-dashboard-customers-details-supplies',
  imports: [
    CommonModule,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    ComponentDashboardSuppliesEmpty,
    RouterLink,
    LucideBadgeCheck,
    LucideBuilding2,
    LucideHouse,
    LucideStore,
  ],
  templateUrl: './supplies.html',
})
export class PageDashboardCustomerDetailsSupplies implements OnInit {
  private supplyService = inject(SupplyService);
  private route = inject(ActivatedRoute);
  private parent = inject(PageDashboardCustomersDetailsGeneral);

  supplies: SupplyResponseDTO[] = [];
  customerId: string | null = null;
  customerName = '';
  searchQuery = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  isLoading = false;

  ngOnInit(): void {
    this.customerId = this.parent.customerId || this.route.parent?.snapshot.paramMap.get('id') || null;

    this.parent.customer$.subscribe(customer => {
      this.customerName = customer?.fullName || '';
    });

    if (this.customerId) {
      this.loadSupplies();
    }
  }

  loadSupplies(page: number = 0): void {
    if (!this.customerId) {
      this.supplies = [];
      this.totalPages = 0;
      this.totalElements = 0;
      return;
    }

    this.isLoading = true;

    this.supplyService.findAll(
      page,
      this.pageSize,
      this.searchQuery.trim() || undefined,
      undefined,
      undefined,
      this.customerId
    ).subscribe({
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

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.loadSupplies(0);
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
