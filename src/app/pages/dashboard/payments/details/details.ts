import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import {
  LucideDollarSign,
  LucidePrinter,
  LucideBan,
  LucideFileText,
  LucideCreditCard,
} from '@lucide/angular';

import { PaymentService } from '@core/services/payments/payment.service';
import { BillingService } from '@core/services/billings/billing.service';
import { PaymentResponseDTO } from '@interfaces/payments/payment.interface';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';

@Component({
  selector: 'page-dashboard-payments-details',
  imports: [
    CommonModule,
    RouterLink,
    LucideDollarSign,
    LucidePrinter,
    LucideBan,
    LucideFileText,
    LucideCreditCard,
  ],
  templateUrl: './details.html',
})
export class PageDashboardPaymentsDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);
  private billingService = inject(BillingService);

  payment: PaymentResponseDTO | null = null;
  billing: BillingResponseDTO | null = null;
  isLoading = true;
  private routeSub?: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadDetails(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  loadDetails(id: string): void {
    this.isLoading = true;
    this.paymentService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.payment = res.data;
          console.log(this.payment);
          this.loadBillingDetails(res.data.billingId);
        } else {
          this.payment = null;
          this.isLoading = false;
        }
      },
      error: () => {
        this.payment = null;
        this.isLoading = false;
      },
    });
  }

  loadBillingDetails(billingId: string): void {
    this.billingService.getById(billingId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.billing = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'COMPLETED':
        return 'Completado';
      case 'FAILED':
        return 'Fallido';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status || 'Desconocido';
    }
  }

  getPaymentMethodLabel(method?: string): string {
    switch (method) {
      case 'CASH':
        return 'Efectivo';
      case 'CARD':
        return 'Tarjeta';
      case 'YAPE':
        return 'Yape';
      case 'PLIN':
        return 'Plin';
      case 'BANK_TRANSFER':
        return 'Transferencia Bancaria';
      default:
        return method || '';
    }
  }

  getPeriodLabel(month?: number, year?: number): string {
    if (!month || !year) return '-';
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return `${months[month - 1]} ${year}`;
  }

  printReceipt(): void {
    if (!this.payment) return;
    Swal.fire({
      title: 'Imprimir Recibo',
      text: `Enviando recibo ${this.payment.receiptNumber} a la cola de impresión...`,
      icon: 'info',
      confirmButtonColor: '#2563eb',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  cancelPayment(): void {
    if (!this.payment) return;
    Swal.fire({
      title: 'Anular Pago',
      text: `Ingrese el motivo de la anulación para el recibo ${this.payment.receiptNumber}:`,
      input: 'text',
      inputPlaceholder: 'Motivo de la anulación...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Anular Pago',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Debe ingresar un motivo para anular el pago!';
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.isLoading = true;
        this.paymentService
          .cancel(this.payment!.id, { reason: result.value })
          .subscribe({
            next: (res) => {
              if (res.success && res.data) {
                this.payment = res.data;
                this.loadBillingDetails(res.data.billingId);
                Swal.fire({
                  title: 'Pago Anulado',
                  text: 'El pago ha sido anulado exitosamente.',
                  icon: 'success',
                  confirmButtonColor: '#2563eb',
                });
              } else {
                this.isLoading = false;
                Swal.fire({
                  title: 'Error',
                  text: res.message || 'No se pudo anular el pago.',
                  icon: 'error',
                  confirmButtonColor: '#2563eb',
                });
              }
            },
            error: (err) => {
              this.isLoading = false;
              Swal.fire({
                title: 'Error',
                text:
                  err?.error?.message ||
                  'Ocurrió un error al intentar anular el pago.',
                icon: 'error',
                confirmButtonColor: '#2563eb',
              });
            },
          });
      }
    });
  }
}
