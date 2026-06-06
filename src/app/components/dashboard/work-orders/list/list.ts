import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { SupplyWorkOrdersService } from '@services/supply-work-orders/supply-work-orders.service';
import {
  SupplyWorkOrderResponseDTO,
  WorkOrderStatus,
  WorkOrderType,
} from '@interfaces/supply-work-orders/supply-work-orders.interface';
import { ComponentDashboardWorkOrdersTable } from '../table/table';
import { ComponentDashboardWorkOrdersEmpty } from '../empty/empty';

@Component({
  selector: 'component-dashboard-work-orders-list',
  imports: [
    CommonModule,
    FormsModule,
    ComponentDashboardWorkOrdersTable,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    ComponentDashboardWorkOrdersEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardWorkOrdersList implements OnInit {
  private workOrdersService = inject(SupplyWorkOrdersService);
  private router = inject(Router);

  workOrders: SupplyWorkOrderResponseDTO[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  sort: string = 'createdAt,desc';
  searchQuery = ''; // bound to supplyId / supplyNumber search
  isLoading = false;

  // Selected filters
  selectedType: WorkOrderType | '' = '';
  selectedStatus: WorkOrderStatus | '' = '';

  types: { value: WorkOrderType; label: string }[] = [
    { value: 'INSTALLATION', label: 'Instalación' },
    { value: 'SUSPENSION', label: 'Suspensión' },
    { value: 'CUT_OFF', label: 'Corte' },
    { value: 'RECONNECTION', label: 'Reconexión' },
    { value: 'INSPECTION', label: 'Inspección' },
    { value: 'METER_CHANGE', label: 'Cambio de Medidor' },
  ];

  statuses: { value: WorkOrderStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'ASSIGNED', label: 'Asignada' },
    { value: 'IN_PROGRESS', label: 'En progreso' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Cancelada' },
    { value: 'FAILED', label: 'Fallida' },
  ];

  ngOnInit(): void {
    this.loadWorkOrders();
  }

  loadWorkOrders(page: number = 0): void {
    this.isLoading = true;
    const typeFilter = this.selectedType ? this.selectedType : undefined;
    const statusFilter = this.selectedStatus ? this.selectedStatus : undefined;
    const searchFilter = this.searchQuery.trim()
      ? this.searchQuery.trim()
      : undefined;

    this.workOrdersService
      .search(
        page,
        this.pageSize,
        this.sort,
        searchFilter,
        typeFilter,
        statusFilter,
      )
      .subscribe({
        next: (res: any) => {
          this.workOrders = res.data.content;
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(
            '[ComponentWorkOrdersList] Error loading work orders',
            err.message,
          );
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadWorkOrders(page);
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.currentPage = 0;
    this.loadWorkOrders(0);
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadWorkOrders(0);
  }

  get pageOffset(): number {
    return this.currentPage * this.pageSize;
  }

  // Translates the English types to Spanish for detailed view
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

  // Translates the English status to Spanish for detailed view
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

  // Action methods
  onAssign(order: SupplyWorkOrderResponseDTO): void {
    Swal.fire({
      title: 'Asignar Orden',
      text: `¿Deseas asignar la orden ${order.supplyNumber}? Puedes agregar observaciones opcionales:`,
      input: 'textarea',
      inputPlaceholder: 'Observaciones de la asignación...',
      showCancelButton: true,
      confirmButtonText: 'Asignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        const obs = result.value || '';
        this.workOrdersService
          .assign(order.id, { observations: obs })
          .subscribe({
            next: () => {
              Swal.fire(
                '¡Asignada!',
                'La orden ha sido asignada correctamente.',
                'success',
              );
              this.loadWorkOrders(this.currentPage);
            },
            error: (err) => {
              Swal.fire(
                'Error',
                err.error?.message || 'No se pudo asignar la orden.',
                'error',
              );
            },
          });
      }
    });
  }

  onStart(order: SupplyWorkOrderResponseDTO): void {
    Swal.fire({
      title: 'Iniciar Trabajo',
      text: `¿Estás seguro de iniciar los trabajos para la orden ${order.supplyNumber}?`,
      input: 'textarea',
      inputPlaceholder: 'Observaciones de inicio...',
      showCancelButton: true,
      confirmButtonText: 'Iniciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        const obs = result.value || '';
        this.workOrdersService
          .start(order.id, { observations: obs })
          .subscribe({
            next: () => {
              Swal.fire(
                '¡Iniciada!',
                'La orden de trabajo ahora está en progreso.',
                'success',
              );
              this.loadWorkOrders(this.currentPage);
            },
            error: (err) => {
              Swal.fire(
                'Error',
                err.error?.message || 'No se pudo iniciar la orden.',
                'error',
              );
            },
          });
      }
    });
  }

  onComplete(order: SupplyWorkOrderResponseDTO): void {
    if (order.type === 'INSTALLATION') {
      Swal.fire({
        title: 'Completar Instalación',
        html: `
          <div class="text-left space-y-3 font-sans text-gray-800">
            <p class="text-xs text-gray-500">Suministro: <strong>${order.supplyNumber}</strong> | Cliente: <strong>${order.customerName}</strong></p>
            
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-700">Número de Medidor (Obligatorio):</label>
              <input id="swal-install-meter" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-hidden bg-white text-gray-800" placeholder="Ingrese el número de serie del medidor" />
            </div>
            
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-700">Observaciones/Informe (Obligatorio):</label>
              <textarea id="swal-install-obs" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-hidden bg-white text-gray-800" placeholder="Ingrese observaciones del trabajo realizado..." rows="3"></textarea>
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Completar Instalación',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6b7280',
        preConfirm: () => {
          const meterInput = document.getElementById(
            'swal-install-meter',
          ) as HTMLInputElement;
          const obsInput = document.getElementById(
            'swal-install-obs',
          ) as HTMLTextAreaElement;

          const meter = meterInput.value.trim();
          const obs = obsInput.value.trim();

          if (!meter) {
            Swal.showValidationMessage('El número de medidor es obligatorio.');
            return false;
          }
          if (!obs) {
            Swal.showValidationMessage('Las observaciones son obligatorias.');
            return false;
          }

          return {
            observations: obs,
            meterNumber: meter,
          };
        },
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.workOrdersService.complete(order.id, result.value).subscribe({
            next: () => {
              Swal.fire(
                '¡Completada!',
                'La orden de instalación ha sido completada y el suministro activado.',
                'success',
              );
              this.loadWorkOrders(this.currentPage);
            },
            error: (err) => {
              Swal.fire(
                'Error',
                err.error?.message || 'No se pudo completar la orden.',
                'error',
              );
            },
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Completar Trabajo',
        text: `Ingrese las observaciones o informe final para la orden ${order.supplyNumber}:`,
        input: 'textarea',
        inputPlaceholder: 'Detalles del trabajo realizado (obligatorio)...',
        inputValidator: (value) => {
          if (!value) {
            return '¡Debes ingresar detalles para completar la orden!';
          }
          return null;
        },
        showCancelButton: true,
        confirmButtonText: 'Completar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6b7280',
      }).then((result) => {
        if (result.isConfirmed) {
          const obs = result.value;
          this.workOrdersService
            .complete(order.id, { observations: obs })
            .subscribe({
              next: () => {
                Swal.fire(
                  '¡Completada!',
                  'La orden de trabajo ha sido completada con éxito.',
                  'success',
                );
                this.loadWorkOrders(this.currentPage);
              },
              error: (err) => {
                Swal.fire(
                  'Error',
                  err.error?.message || 'No se pudo completar la orden.',
                  'error',
                );
              },
            });
        }
      });
    }
  }

  onCancel(order: SupplyWorkOrderResponseDTO): void {
    Swal.fire({
      title: 'Cancelar Orden de Trabajo',
      text: `Ingrese el motivo de la cancelación para la orden ${order.supplyNumber}:`,
      input: 'textarea',
      inputPlaceholder: 'Motivo de la cancelación (obligatorio)...',
      inputValidator: (value) => {
        if (!value) {
          return '¡Debes especificar el motivo de cancelación!';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'Cancelar Orden',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        const obs = result.value;
        this.workOrdersService
          .cancel(order.id, { observations: obs })
          .subscribe({
            next: () => {
              Swal.fire(
                '¡Cancelada!',
                'La orden de trabajo ha sido cancelada.',
                'success',
              );
              this.loadWorkOrders(this.currentPage);
            },
            error: (err) => {
              Swal.fire(
                'Error',
                err.error?.message || 'No se pudo cancelar la orden.',
                'error',
              );
            },
          });
      }
    });
  }

  onView(order: SupplyWorkOrderResponseDTO): void {
    this.router.navigate(['/dashboard/ordenes', order.id]);
  }
}
