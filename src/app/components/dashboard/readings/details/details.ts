import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import {
  LucideImage,
  LucideAlertTriangle,
  LucideCheck,
  LucideX,
  LucideFileText,
} from '@lucide/angular';

import { MeterReadingService } from '@services/readings/meter-reading.service';
import { SupplyService } from '@services/supplies/supply.service';
import { BillingService } from '@services/billings/billing.service';
import {
  MeterReadingResponseDTO,
  ReadingStatus,
} from '@interfaces/readings/meter-reading.interface';
import { SupplyDetailsDTO } from '@interfaces/supplies/supply.interface';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';
import { PublicUrlPipe } from '@core/pipes/public-url.pipe';

@Component({
  selector: 'component-dashboard-readings-details',
  imports: [
    CommonModule,
    RouterLink,
    LucideImage,
    LucideAlertTriangle,
    LucideCheck,
    LucideX,
    LucideFileText,
    PublicUrlPipe,
  ],
  templateUrl: './details.html',
})
export class ComponentDashboardReadingsDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private readingService = inject(MeterReadingService);
  private supplyService = inject(SupplyService);
  private billingService = inject(BillingService);

  reading: MeterReadingResponseDTO | null = null;
  supply: SupplyDetailsDTO | null = null;
  billing: BillingResponseDTO | null = null;
  history: MeterReadingResponseDTO[] = [];

  isLoading = true;
  private sub?: Subscription;

  ngOnInit(): void {
    const parentRoute = this.route.parent;
    if (parentRoute) {
      this.sub = parentRoute.paramMap.subscribe((params) => {
        const id = params.get('id') || this.route.snapshot.paramMap.get('id');
        if (id) {
          this.loadData(id);
        }
      });
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(id);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadData(id: string): void {
    this.isLoading = true;
    this.readingService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.reading = res.data;
          this.loadSupplyAndHistory(res.data.supplyId, res.data.supplyNumber);
          if (res.data.status === 'BILLED') {
            this.loadBilling(res.data.supplyId, res.data.id);
          } else {
            this.billing = null;
          }
        } else {
          this.reading = null;
          this.isLoading = false;
        }
      },
      error: () => {
        this.reading = null;
        this.isLoading = false;
      },
    });
  }

  loadBilling(supplyId: string, readingId: string): void {
    this.billingService.getBySupply(supplyId, 0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.billing = res.data.content.find((b) => b.readingId === readingId) || null;
        }
      },
      error: () => {
        this.billing = null;
      },
    });
  }

  loadSupplyAndHistory(supplyId: string, supplyNumber: string): void {
    this.supplyService.getById(supplyId).subscribe({
      next: (res) => {
        this.supply = res.success ? res.data : null;
      },
      error: () => {
        this.supply = null;
      },
    });

    this.readingService
      .search(supplyNumber, undefined, undefined, undefined, undefined, 0, 5)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.history = res.data.content || [];
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
      case 'RECORDED':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'VALIDATED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'BILLED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'RECORDED':
        return 'Registrado';
      case 'VALIDATED':
        return 'Validado';
      case 'BILLED':
        return 'Facturado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status || 'Sin estado';
    }
  }

  validateReading(): void {
    if (!this.reading) return;

    Swal.fire({
      title: '¿Validar lectura?',
      text: 'Esta acción cambiará el estado de la lectura a VALIDADA.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, validar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
    }).then((result) => {
      if (result.isConfirmed) {
        this.readingService.validate(this.reading!.id).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                title: '¡Validada!',
                text: 'La lectura ha sido validada exitosamente.',
                icon: 'success',
                confirmButtonColor: '#2563eb',
              }).then(() => this.loadData(this.reading!.id));
            }
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: err.error?.message || 'No se pudo validar la lectura.',
              icon: 'error',
              confirmButtonColor: '#2563eb',
            });
          },
        });
      }
    });
  }

  cancelReading(): void {
    if (!this.reading) return;

    Swal.fire({
      title: '¿Cancelar lectura?',
      text: 'Por favor, ingrese el motivo de la cancelación:',
      input: 'textarea',
      inputPlaceholder: 'Escriba las observaciones aquí...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#ef4444',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '¡Debe ingresar un motivo para cancelar!';
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.readingService.cancel(this.reading!.id, result.value).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                title: '¡Cancelada!',
                text: 'La lectura ha sido cancelada.',
                icon: 'success',
                confirmButtonColor: '#2563eb',
              }).then(() => this.loadData(this.reading!.id));
            }
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: err.error?.message || 'No se pudo cancelar la lectura.',
              icon: 'error',
              confirmButtonColor: '#2563eb',
            });
          },
        });
      }
    });
  }

  generateInvoice(): void {
    if (!this.reading) return;

    Swal.fire({
      title: '¿Generar factura?',
      text: 'Se emitirá la factura correspondiente al consumo registrado.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Generar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.billingService.generate(this.reading!.id).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.success) {
              this.billing = res.data;
              if (this.reading) {
                this.reading.status = 'BILLED';
              }
              Swal.fire({
                title: '¡Factura Generada!',
                text: 'La factura ha sido emitida y enviada al cliente.',
                icon: 'success',
                confirmButtonColor: '#2563eb',
              }).then(() => this.loadData(this.reading!.id));
            }
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire({
              title: 'Error',
              text: err.error?.message || 'No se pudo generar la factura.',
              icon: 'error',
              confirmButtonColor: '#2563eb',
            });
          },
        });
      }
    });
  }

  viewInvoice(): void {
    if (!this.reading) return;

    const bill = this.billing;
    const invoiceNumber = bill ? bill.billingNumber : `FAC-2026-${this.reading.supplyNumber.slice(-4)}`;
    const consumption = bill ? bill.consumption : this.reading.consumption;
    const amount = bill ? bill.totalAmount.toFixed(2) : (consumption * 2.5).toFixed(2);
    const readingDate = bill ? new Date(bill.billingDate) : new Date(this.reading.readingDate);
    const dueDate = bill ? new Date(bill.dueDate).toLocaleDateString('es-PE') : new Date(
      readingDate.getTime() + 15 * 24 * 60 * 60 * 1000,
    ).toLocaleDateString('es-PE');

    Swal.fire({
      title: `Factura: ${invoiceNumber}`,
      html: `
        <div class="text-left space-y-2.5 p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm">
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Suministro:</span>
            <span class="font-semibold text-gray-900">${bill ? bill.supplyNumber : this.reading.supplyNumber}</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Cliente:</span>
            <span class="font-semibold text-gray-900">${bill ? bill.customerName : (this.supply?.customerName || '-')}</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Consumo Facturado:</span>
            <span class="font-semibold text-blue-700">${consumption} m³</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Cargo Fijo:</span>
            <span class="font-semibold text-gray-900">S/. ${bill ? bill.fixedCharge.toFixed(2) : '0.00'}</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Tarifa de Agua:</span>
            <span class="font-semibold text-gray-900">S/. ${bill ? (bill.unitPrice).toFixed(2) : '2.50'} / m³</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Subtotal:</span>
            <span class="font-semibold text-gray-900">S/. ${bill ? bill.subtotal.toFixed(2) : amount}</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">IGV (${bill ? bill.taxPercentage : '18'}%):</span>
            <span class="font-semibold text-gray-900">S/. ${bill ? bill.taxAmount.toFixed(2) : '0.00'}</span>
          </div>
          ${bill && bill.lateFeeAmount > 0 ? `
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-red-500">Mora por pago tardío:</span>
            <span class="font-semibold text-red-600">S/. ${bill.lateFeeAmount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Total a pagar:</span>
            <span class="font-bold text-green-700 text-base">S/. ${amount}</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-1.5">
            <span class="font-medium text-gray-500">Fecha de Emisión:</span>
            <span class="font-semibold text-gray-900">${readingDate.toLocaleDateString('es-PE')}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-500">Vencimiento:</span>
            <span class="font-semibold text-red-600">${dueDate}</span>
          </div>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#2563eb',
    });
  }

  getInvoiceDueDate(): string {
    if (this.billing) {
      return new Date(this.billing.dueDate).toLocaleDateString('es-PE');
    }
    if (!this.reading) return '-';
    const readingDate = new Date(this.reading.readingDate);
    const dueDate = new Date(readingDate.getTime() + 15 * 24 * 60 * 60 * 1000);
    return dueDate.toLocaleDateString('es-PE');
  }

  getInvoiceAmount(): string {
    if (this.billing) {
      return this.billing.totalAmount.toFixed(2);
    }
    if (!this.reading) return '0.00';
    return (this.reading.consumption * 2.5).toFixed(2);
  }

  getBillingStatusClass(status?: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  }

  getBillingStatusLabel(status?: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'PAID':
        return 'Pagado';
      case 'OVERDUE':
        return 'Vencido';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return 'Pendiente';
    }
  }
}
