import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplyWorkOrderResponseDTO } from '@interfaces/supply-work-orders/supply-work-orders.interface';

@Component({
  selector: 'component-dashboard-work-orders-table',
  imports: [CommonModule],
  templateUrl: './table.html',
})
export class ComponentDashboardWorkOrdersTable {
  @Input() workOrders: SupplyWorkOrderResponseDTO[] = [];
  @Input() isLoading = false;
  @Input() pageOffset = 0;

  @Output() assign = new EventEmitter<SupplyWorkOrderResponseDTO>();
  @Output() start = new EventEmitter<SupplyWorkOrderResponseDTO>();
  @Output() complete = new EventEmitter<SupplyWorkOrderResponseDTO>();
  @Output() cancel = new EventEmitter<SupplyWorkOrderResponseDTO>();
  @Output() view = new EventEmitter<SupplyWorkOrderResponseDTO>();

  formatOrderNumber(index: number): string {
    const num = index + 1 + this.pageOffset;
    return `OT-${String(num).padStart(6, '0')}`;
  }

  // Translates the English types to Spanish
  translateType(type: string): string {
    switch (type) {
      case 'INSTALLATION':
        return 'Instalación';
      case 'SUSPENSION':
        return 'Suspensión';
      case 'CUT_OFF':
        return 'Corte';
      case 'RECONNECTION':
        return 'Reconexión';
      case 'INSPECTION':
        return 'Inspección';
      case 'METER_CHANGE':
        return 'Cambio de Medidor';
      default:
        return type;
    }
  }

  // Translates the English status to Spanish
  translateStatus(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'ASSIGNED':
        return 'Asignada';
      case 'IN_PROGRESS':
        return 'En progreso';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'FAILED':
        return 'Fallida';
      default:
        return status;
    }
  }

  // Status badges classes
  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  onAssign(order: SupplyWorkOrderResponseDTO, event: Event): void {
    event.stopPropagation();
    this.assign.emit(order);
  }

  onStart(order: SupplyWorkOrderResponseDTO, event: Event): void {
    event.stopPropagation();
    this.start.emit(order);
  }

  onComplete(order: SupplyWorkOrderResponseDTO, event: Event): void {
    event.stopPropagation();
    this.complete.emit(order);
  }

  onCancel(order: SupplyWorkOrderResponseDTO, event: Event): void {
    event.stopPropagation();
    this.cancel.emit(order);
  }

  onView(order: SupplyWorkOrderResponseDTO, event: Event): void {
    event.stopPropagation();
    this.view.emit(order);
  }
}
