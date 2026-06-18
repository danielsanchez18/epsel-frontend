import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { BillingService } from '@core/services/billings/billing.service';
import { SupplyService } from '@core/services/supplies/supply.service';
import { PaymentService } from '@core/services/payments/payment.service';
import { SupplyWorkOrdersService } from '@services/supply-work-orders/supply-work-orders.service';
import { AuthService } from '@core/services/auth/auth.service';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentDashboardCobranzaTable } from '../table/table';
import { ComponentDashboardCobranzaEmpty } from '../empty/empty';

import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'component-dashboard-cobranza-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    ComponentSharedFilters,
    ComponentDashboardCobranzaTable,
    ComponentDashboardCobranzaEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardCobranzaList implements OnInit {
  @Output() filtersChanged = new EventEmitter<{startDate?: string, endDate?: string}>();

  private billingService = inject(BillingService);
  private supplyService = inject(SupplyService);
  private paymentService = inject(PaymentService);
  private supplyWorkOrdersService = inject(SupplyWorkOrdersService);
  private authService = inject(AuthService);

  billings: BillingResponseDTO[] = [];
  isLoading = false;
  searchQuery = '';
  selectedStatus = 'ALL_PENDING';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  filterForm = new FormGroup({
    status: new FormControl('ALL_PENDING'),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });
  activeFiltersCount = 0;

  ngOnInit(): void {
    this.updateActiveFiltersCount();
    this.loadData();
  }

  updateActiveFiltersCount(): void {
    let count = 0;
    const values = this.filterForm.value;
    if (values.status && values.status !== 'ALL_PENDING') count++;
    if (values.startDate) count++;
    if (values.endDate) count++;
    this.activeFiltersCount = count;
  }

  applyFilters(): void {
    this.updateActiveFiltersCount();
    this.filtersChanged.emit({
      startDate: this.filterForm.value.startDate || undefined,
      endDate: this.filterForm.value.endDate || undefined,
    });
    this.loadData(0);
  }

  loadData(page: number = 0): void {
    this.isLoading = true;

    let billingNumber: string | undefined;
    let customerName: string | undefined;
    let status: string | string[] | undefined;
    let overdue: boolean | undefined;

    if (this.searchQuery) {
      if (this.searchQuery.toUpperCase().startsWith('FAC')) {
        billingNumber = this.searchQuery;
      } else {
        customerName = this.searchQuery;
      }
    }

    const formValues = this.filterForm.value;
    let selectedStatus = formValues.status || 'ALL_PENDING';

    if (selectedStatus === 'OVERDUE') {
      status = 'OVERDUE';
    } else if (selectedStatus === 'PENDING') {
      status = 'PENDING';
    } else if (selectedStatus === 'PARTIALLY_PAID') {
      status = 'PARTIALLY_PAID';
    } else if (selectedStatus === 'ALL_PENDING') {
      status = ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'];
    }

    let startDate = formValues.startDate || undefined;
    let endDate = formValues.endDate || undefined;

    this.billingService
      .search(
        page,
        this.pageSize,
        billingNumber,
        customerName,
        status,
        startDate,
        endDate,
        overdue,
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.billings = res.data.content ?? [];
            this.totalPages = res.data.totalPages ?? 0;
            this.totalElements = res.data.totalElements ?? 0;
            this.currentPage = page;
          } else {
            this.resetList();
          }
          this.isLoading = false;
        },
        error: () => {
          this.resetList();
          this.isLoading = false;
        },
      });
  }

  private resetList(): void {
    this.billings = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.loadData(0);
  }

  onPageChange(page: number): void {
    this.loadData(page);
  }

  registerPayment(bill: BillingResponseDTO): void {
    const pendingAmount =
      Number(bill.totalAmount) - (Number(bill.amountPaid) || 0);
    const userId =
      this.authService.getUser()?.userId ||
      '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    Swal.fire({
      title: 'Registrar Pago',
      html: `
        <div class="text-left space-y-3">
          <p class="text-xs text-gray-500">Factura: <strong>${bill.billingNumber}</strong> | Suministro: <strong>${bill.supplyNumber}</strong></p>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-700">Monto Pendiente:</label>
            <input id="swal-payment-amount-display" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 font-semibold" value="S/. ${pendingAmount.toFixed(2)}" disabled />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-700">Monto a Pagar (S/.):</label>
            <input id="swal-payment-amount" type="number" step="0.01" max="${pendingAmount}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-hidden" value="${pendingAmount.toFixed(2)}" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-700">Método de Pago:</label>
            <select id="swal-payment-method" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-hidden bg-white">
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta (Débito/Crédito)</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
              <option value="BANK_TRANSFER">Transferencia Bancaria</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-700">N° de Operación (Opcional):</label>
            <input id="swal-payment-op" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-hidden" placeholder="Ej: 98218392" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-700">Observaciones (Opcional):</label>
            <textarea id="swal-payment-obs" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-hidden" placeholder="Ingrese alguna observación..."></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Registrar Pago',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const amountInput = document.getElementById(
          'swal-payment-amount',
        ) as HTMLInputElement;
        const methodSelect = document.getElementById(
          'swal-payment-method',
        ) as HTMLSelectElement;
        const opInput = document.getElementById(
          'swal-payment-op',
        ) as HTMLInputElement;
        const obsInput = document.getElementById(
          'swal-payment-obs',
        ) as HTMLTextAreaElement;

        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
          Swal.showValidationMessage(
            'Por favor, ingrese un monto de pago válido.',
          );
          return false;
        }
        if (amount > pendingAmount + 0.01) {
          Swal.showValidationMessage(
            `El monto a pagar no puede exceder el monto pendiente (S/. ${pendingAmount.toFixed(2)}).`,
          );
          return false;
        }

        return {
          billingId: bill.id,
          amount: amount,
          paymentMethod: methodSelect.value,
          operationNumber: opInput.value || undefined,
          observations: obsInput.value || undefined,
          registeredBy: userId,
        };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.paymentService.create(result.value).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                title: 'Pago Registrado',
                text: `El pago de S/. ${result.value.amount.toFixed(2)} para la factura ${bill.billingNumber} ha sido registrado con éxito.`,
                icon: 'success',
                confirmButtonColor: '#2563eb',
              });
              this.loadData(this.currentPage);
            } else {
              Swal.fire({
                title: 'Error',
                text: res.message || 'No se pudo registrar el pago.',
                icon: 'error',
                confirmButtonColor: '#2563eb',
              });
            }
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al procesar el pago en el servidor.',
              icon: 'error',
              confirmButtonColor: '#2563eb',
            });
          },
        });
      }
    });
  }

  generateAviso(bill: BillingResponseDTO): void {
    Swal.fire({
      title: 'Generar Aviso de Cobranza',
      text: `¿Desea generar e imprimir el aviso de cobranza para la factura ${bill.billingNumber} del suministro ${bill.supplyNumber}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Generar e Imprimir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Aviso Generado',
          text: `El aviso de cobranza para la factura ${bill.billingNumber} se ha enviado a la cola de impresión con éxito.`,
          icon: 'success',
          confirmButtonColor: '#2563eb',
        });
      }
    });
  }

  suspendSupply(bill: BillingResponseDTO): void {
    this.supplyService.getById(bill.supplyId).subscribe({
      next: (supplyRes) => {
        if (supplyRes.success && supplyRes.data) {
          const supply = supplyRes.data;
          const isSuspended = supply.status === 'SUSPENDED';

          if (isSuspended) {
            Swal.fire({
              title: 'Generar Orden de Corte',
              text: `El suministro ${bill.supplyNumber} ya se encuentra suspendido. ¿Desea generar una orden de CORTE DEFINITIVO?`,
              input: 'text',
              inputPlaceholder: 'Ingrese el motivo del corte (obligatorio)...',
              showCancelButton: true,
              confirmButtonText: 'Generar Orden',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#dc2626',
              preConfirm: (reason) => {
                if (!reason || reason.trim() === '') {
                  Swal.showValidationMessage(
                    'Debe ingresar un motivo para generar la orden de corte.',
                  );
                  return false;
                }
                return reason;
              },
            }).then((result) => {
              if (result.isConfirmed && result.value) {
                this.supplyWorkOrdersService
                  .create({
                    supplyId: bill.supplyId,
                    type: 'CUT_OFF',
                    reason: result.value,
                    scheduledDate: new Date().toISOString().split('T')[0]
                  })
                  .subscribe({
                    next: (res) => {
                      if (res.success) {
                        Swal.fire({
                          title: 'Orden Generada',
                          text: `La orden de corte para el suministro ${bill.supplyNumber} ha sido generada con éxito.`,
                          icon: 'success',
                          confirmButtonColor: '#2563eb',
                        });
                        this.loadData(this.currentPage);
                      } else {
                        Swal.fire({
                          title: 'Error',
                          text: res.message || 'No se pudo generar la orden de corte.',
                          icon: 'error',
                          confirmButtonColor: '#2563eb',
                        });
                      }
                    },
                    error: () => {
                      Swal.fire({
                        title: 'Error',
                        text: 'Ocurrió un error al generar la orden de corte en el servidor.',
                        icon: 'error',
                        confirmButtonColor: '#2563eb',
                      });
                    },
                  });
              }
            });
          } else {
            Swal.fire({
              title: 'Suspender Suministro',
              text: `¿Está seguro que desea suspender el suministro ${bill.supplyNumber} del cliente ${bill.customerName}?`,
              input: 'text',
              inputPlaceholder: 'Ingrese el motivo de la suspensión (obligatorio)...',
              showCancelButton: true,
              confirmButtonText: 'Suspender',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#dc2626',
              preConfirm: (reason) => {
                if (!reason || reason.trim() === '') {
                  Swal.showValidationMessage(
                    'Debe ingresar un motivo para suspender el suministro.',
                  );
                  return false;
                }
                return reason;
              },
            }).then((result) => {
              if (result.isConfirmed && result.value) {
                this.supplyService
                  .suspend(bill.supplyId, { reason: result.value })
                  .subscribe({
                    next: (res) => {
                      if (res.success) {
                        Swal.fire({
                          title: 'Suministro Suspendido',
                          text: `El suministro ${bill.supplyNumber} ha sido suspendido con éxito.`,
                          icon: 'success',
                          confirmButtonColor: '#2563eb',
                        });
                        this.loadData(this.currentPage);
                      } else {
                        Swal.fire({
                          title: 'Error',
                          text: res.message || 'No se pudo suspender el suministro.',
                          icon: 'error',
                          confirmButtonColor: '#2563eb',
                        });
                      }
                    },
                    error: () => {
                      Swal.fire({
                        title: 'Error',
                        text: 'Ocurrió un error al suspender el suministro en el servidor.',
                        icon: 'error',
                        confirmButtonColor: '#2563eb',
                      });
                    },
                  });
              }
            });
          }
        }
      }
    });
  }
}
