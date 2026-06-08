import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideSettings } from '@lucide/angular';
import { SuppliesOperationsService } from '@services/supplies-operations/supplies-operations.service';
import { SupplyOperationResponseDTO } from '@interfaces/supplies-operations/supplies-operations.interface';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';

@Component({
  selector: 'component-dashboard-supplies-details-operations',
  imports: [CommonModule, LucideSettings, ComponentSharedPaginator],
  templateUrl: './operations.html',
})
export class ComponentDashboardSuppliesDetailsOperations implements OnInit {
  private operationsService = inject(SuppliesOperationsService);

  @Input() supplyId!: string | null;

  operations: SupplyOperationResponseDTO[] = [];
  isLoading = true;

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    if (this.supplyId) {
      this.loadOperations();
    } else {
      this.isLoading = false;
    }
  }

  loadOperations(page: number = 0): void {
    if (!this.supplyId) return;
    this.isLoading = true;
    this.operationsService
      .search(page, this.pageSize, this.supplyId)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.operations = res.data.content ?? [];
            this.totalPages = res.data.totalPages ?? 0;
            this.totalElements = res.data.totalElements ?? 0;
            this.currentPage = page;
          } else {
            this.resetList();
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.resetList();
          this.isLoading = false;
          console.error(err);
        },
      });
  }

  private resetList(): void {
    this.operations = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onPageChange(page: number): void {
    this.loadOperations(page);
  }

  getOperationTypeLabel(type: string): string {
    switch (type) {
      case 'SUSPENSION':
        return 'Suspensión';
      case 'RECONNECTION':
        return 'Reconexión';
      case 'CUT_OFF':
        return 'Corte de Servicio';
      case 'INSTALLATION':
        return 'Instalación';
      default:
        return type;
    }
  }

  getOperationTypeClass(type: string): string {
    switch (type) {
      case 'SUSPENSION':
        return 'bg-yellow-100 text-yellow-700';
      case 'RECONNECTION':
        return 'bg-green-100 text-green-700';
      case 'CUT_OFF':
        return 'bg-red-100 text-red-700';
      case 'INSTALLATION':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}
