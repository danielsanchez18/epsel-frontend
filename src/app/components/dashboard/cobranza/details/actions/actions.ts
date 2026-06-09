import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import {
  LucidePlay,
  LucideCreditCard,
  LucidePrinter,
  LucideFileDown,
  LucideScissors,
} from '@lucide/angular';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';
import { SupplyDetailsDTO } from '@interfaces/supplies/supply.interface';
import { PaymentService } from '@core/services/payments/payment.service';
import { SupplyService } from '@core/services/supplies/supply.service';
import { AuthService } from '@core/services/auth/auth.service';
import { SupplyWorkOrdersService } from '@services/supply-work-orders/supply-work-orders.service';

@Component({
  selector: 'component-dashboard-cobranza-detail-actions',
  imports: [
    CommonModule,
    LucidePlay,
    LucideCreditCard,
    LucidePrinter,
    LucideFileDown,
    LucideScissors,
  ],
  templateUrl: './actions.html',
})
export class ComponentDashboardCobranzaDetailActions {
  private paymentService = inject(PaymentService);
  private supplyService = inject(SupplyService);
  private authService = inject(AuthService);
  private supplyWorkOrdersService = inject(SupplyWorkOrdersService);

  _billing: BillingResponseDTO | null = null;
  @Input() supply: SupplyDetailsDTO | null = null;
  activeWorkOrder: any = null;

  @Input()
  set billing(value: BillingResponseDTO | null) {
    this._billing = value;
    if (value) {
      this.loadActiveWorkOrder(value.supplyId);
    } else {
      this.activeWorkOrder = null;
    }
  }

  get billing(): BillingResponseDTO | null {
    return this._billing;
  }

  @Output() refresh = new EventEmitter<void>();

  loadActiveWorkOrder(supplyId: string): void {
    this.supplyWorkOrdersService.search(0, 100, 'createdAt,desc', supplyId).subscribe({
      next: (res: any) => {
        const orders = res.data.content || [];
        this.activeWorkOrder = orders.find((o: any) => 
          (o.type === 'SUSPENSION' || o.type === 'CUT_OFF') && 
          (o.status === 'PENDING' || o.status === 'ASSIGNED' || o.status === 'IN_PROGRESS')
        ) || null;
      },
      error: () => {
        this.activeWorkOrder = null;
      }
    });
  }

  translateType(type: string): string {
    switch (type) {
      case 'INSTALLATION': return 'Instalación';
      case 'SUSPENSION': return 'Suspensión';
      case 'CUT_OFF': return 'Corte';
      case 'RECONNECTION': return 'Reconexión';
      case 'INSPECTION': return 'Inspección';
      case 'METER_CHANGE': return 'Cambio de Medidor';
      default: return type;
    }
  }

  translateStatus(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'ASSIGNED': return 'Asignada';
      case 'IN_PROGRESS': return 'En progreso';
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      case 'FAILED': return 'Fallida';
      default: return status;
    }
  }

  getPendingAmount(): number {
    if (!this.billing) return 0;
    return (
      Number(this.billing.totalAmount) - (Number(this.billing.amountPaid) || 0)
    );
  }

  getDaysOverdue(dueDate: string, status: string): number {
    if (status === 'PAID' || status === 'CANCELLED') {
      return 0;
    }
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (today <= due) {
      return 0;
    }
    const diffTime = Math.abs(today.getTime() - due.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  onPay(): void {
    if (!this.billing) return;
    const bill = this.billing;
    const pendingAmount = this.getPendingAmount();
    const userId = this.authService.getUser()?.userId;

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
              this.refresh.emit();
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

  onPrintBill(): void {
    if (!this.billing) return;
    Swal.fire({
      title: 'Imprimir Factura',
      text: `¿Desea enviar a la cola de impresión la factura ${this.billing.billingNumber}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Imprimir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Enviado a imprimir',
          text: `La factura ${this.billing?.billingNumber} fue enviada a imprimir con éxito.`,
          icon: 'success',
          confirmButtonColor: '#2563eb',
        });
      }
    });
  }

  onGenerateAviso(): void {
    if (!this.billing) return;
    Swal.fire({
      title: 'Generar Aviso de Cobranza',
      text: `¿Desea generar y descargar el aviso de cobranza para el suministro ${this.billing.supplyNumber}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Generar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Aviso Generado',
          text: `El aviso de cobranza para la factura ${this.billing?.billingNumber} se ha generado e impreso con éxito.`,
          icon: 'success',
          confirmButtonColor: '#2563eb',
        });
      }
    });
  }

  onSuspendSupply(): void {
    if (!this.billing || !this.supply) return;
    const bill = this.billing;
    const isSuspended = this.supply.status === 'SUSPENDED';

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
                  this.refresh.emit();
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
                  this.refresh.emit();
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
