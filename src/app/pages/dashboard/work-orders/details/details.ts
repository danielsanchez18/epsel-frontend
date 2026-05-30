import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupplyWorkOrdersService } from '@services/supply-work-orders/supply-work-orders.service';
import { SupplyService } from '@core/services/supplies/supply.service';
import { SuppliesOperationsService } from '@core/services/supplies-operations/supplies-operations.service';
import { SupplyWorkOrderResponseDTO, WorkOrderStatus, WorkOrderType } from '@interfaces/supply-work-orders/supply-work-orders.interface';
import { SupplyDetailsDTO } from '@core/interfaces/supplies/supply.interface';
import { SupplyOperationResponseDTO } from '@interfaces/supplies-operations/supplies-operations.interface';

@Component({
  selector: 'page-dashboard-work-orders-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './details.html',
})
export class PageDashboardWorkOrdersDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workOrdersService = inject(SupplyWorkOrdersService);
  private supplyService = inject(SupplyService);
  private operationsService = inject(SuppliesOperationsService);

  order: SupplyWorkOrderResponseDTO | null = null;
  supply: SupplyDetailsDTO | null = null;
  operations: SupplyOperationResponseDTO[] = [];

  isLoading = true;

  // Motivos extracted from operations or fallback to current work order
  reasonSuspension = '-';
  reasonCutOff = '-';
  reasonReconnection = '-';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWorkOrderDetails(id);
    } else {
      this.isLoading = false;
    }
  }

  loadWorkOrderDetails(id: string): void {
    this.isLoading = true;
    this.workOrdersService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.order = res.data;
          this.loadAdditionalData(res.data.supplyId);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching work order details:', err);
        this.isLoading = false;
      }
    });
  }

  loadAdditionalData(supplyId: string): void {
    let pendingRequests = 2;

    const checkLoading = () => {
      pendingRequests--;
      if (pendingRequests === 0) {
        this.extractReasons();
        this.isLoading = false;
      }
    };

    // Load supply details
    this.supplyService.getById(supplyId).subscribe({
      next: (res) => {
        if (res.success) {
          this.supply = res.data;
        }
        checkLoading();
      },
      error: (err) => {
        console.error('Error loading supply details:', err);
        checkLoading();
      }
    });

    // Load operations history
    this.operationsService.search(0, 100, supplyId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.operations = res.data.content || [];
          // Sort operations chronologically by date
          this.operations.sort((a, b) => new Date(a.operationDate).getTime() - new Date(b.operationDate).getTime());
        }
        checkLoading();
      },
      error: (err) => {
        console.error('Error loading operations:', err);
        checkLoading();
      }
    });
  }

  extractReasons(): void {
    // 1. Suspension Reason
    const suspOp = [...this.operations].reverse().find(op => op.operationType === 'SUSPENSION');
    if (suspOp && suspOp.reason) {
      this.reasonSuspension = suspOp.reason;
    } else if (this.order?.type === 'SUSPENSION') {
      this.reasonSuspension = this.order.reason;
    }

    // 2. Cut-off Reason
    const cutOp = [...this.operations].reverse().find(op => op.operationType === 'CUT_OFF');
    if (cutOp && cutOp.reason) {
      this.reasonCutOff = cutOp.reason;
    } else if (this.order?.type === 'CUT_OFF') {
      this.reasonCutOff = this.order.reason;
    }

    // 3. Reconnection Reason
    const reconOp = [...this.operations].reverse().find(op => op.operationType === 'RECONNECTION');
    if (reconOp && reconOp.reason) {
      this.reasonReconnection = reconOp.reason;
    } else if (this.order?.type === 'RECONNECTION') {
      this.reasonReconnection = this.order.reason;
    }
  }

  get formattedOrderNumber(): string {
    if (!this.order) return '';
    return `OT-${this.order.id.substring(0, 8).toUpperCase()}`;
  }

  translateType(type?: WorkOrderType): string {
    switch (type) {
      case 'INSTALLATION': return 'Instalación';
      case 'SUSPENSION': return 'Suspensión';
      case 'CUT_OFF': return 'Corte';
      case 'RECONNECTION': return 'Reconexión';
      case 'INSPECTION': return 'Inspección';
      case 'METER_CHANGE': return 'Cambio de Medidor';
      default: return type || '-';
    }
  }

  translateStatus(status?: WorkOrderStatus): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'ASSIGNED': return 'Asignada';
      case 'IN_PROGRESS': return 'En progreso';
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      case 'FAILED': return 'Fallida';
      default: return status || '-';
    }
  }

  translateSupplyStatus(status?: string): string {
    switch (status) {
      case 'PENDING_INSTALLATION': return 'Instalación Pendiente';
      case 'ACTIVE': return 'Activo';
      case 'SUSPENDED': return 'Suspendido';
      case 'CUT_OFF': return 'Cortado';
      case 'INACTIVE': return 'Inactivo';
      default: return status || '-';
    }
  }

  translateSupplyType(type?: string): string {
    switch (type) {
      case 'HOUSE': return 'Doméstico';
      case 'BUSINESS': return 'Comercial';
      case 'INDUSTRIAL': return 'Industrial';
      default: return type || '-';
    }
  }

  translateOperationType(type: string): string {
    switch (type) {
      case 'INSTALLATION': return 'Instalación';
      case 'SUSPENSION': return 'Suspensión';
      case 'CUT_OFF': return 'Corte';
      case 'RECONNECTION': return 'Reconexión';
      case 'METER_CHANGE': return 'Cambio de Medidor';
      case 'OWNER_CHANGE': return 'Cambio de Titular';
      case 'STATUS_CHANGE': return 'Cambio de Estado';
      default: return type;
    }
  }

  getStatusClass(status?: WorkOrderStatus): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getSupplyStatusClass(status?: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CUT_OFF': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  formatDate(value?: string | null | any): string {
    if (!value) return '-';
    if (Array.isArray(value)) {
      const [year, month, day] = value;
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleDateString('es-PE', { timeZone: 'UTC' });
    } catch {
      return value;
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/ordenes']);
  }
}
