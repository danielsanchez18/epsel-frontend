import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import {
  LucideUser,
  LucideDroplets,
  LucideDollarSign,
  LucideHistory,
  LucidePrinter,
  LucideDownload,
  LucideBan,
  LucideCreditCard,
} from '@lucide/angular';

import { BillingService } from '@core/services/billings/billing.service';
import { SupplyService } from '@core/services/supplies/supply.service';
import { MeterReadingService } from '@services/readings/meter-reading.service';

import { BillingResponseDTO } from '@interfaces/billings/billing.interface';
import { SupplyDetailsDTO } from '@interfaces/supplies/supply.interface';
import { MeterReadingResponseDTO } from '@interfaces/readings/meter-reading.interface';

@Component({
  selector: 'page-dashboard-billing-details',
  imports: [
    CommonModule,
    RouterLink,
    LucideUser,
    LucideDroplets,
    LucideDollarSign,
    LucideHistory,
    LucidePrinter,
    LucideDownload,
    LucideBan,
    LucideCreditCard,
  ],
  templateUrl: './details.html',
})
export class PageDashboardBillingDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private billingService = inject(BillingService);
  private supplyService = inject(SupplyService);
  private readingService = inject(MeterReadingService);

  billing: BillingResponseDTO | null = null;
  supply: SupplyDetailsDTO | null = null;
  reading: MeterReadingResponseDTO | null = null;
  history: BillingResponseDTO[] = [];

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
    this.billingService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.billing = res.data;
          this.loadRelatedData(res.data);
        } else {
          this.billing = null;
          this.isLoading = false;
        }
      },
      error: () => {
        this.billing = null;
        this.isLoading = false;
      },
    });
  }

  loadRelatedData(bill: BillingResponseDTO): void {
    const supplyReq = this.supplyService
      .getById(bill.supplyId)
      .pipe(catchError(() => of({ success: false, data: null })));

    const readingReq = this.readingService
      .getById(bill.readingId)
      .pipe(catchError(() => of({ success: false, data: null })));

    const historyReq = this.billingService
      .getBySupply(bill.supplyId, 0, 5)
      .pipe(catchError(() => of({ success: false, data: null })));

    forkJoin([supplyReq, readingReq, historyReq]).subscribe({
      next: ([supplyRes, readingRes, historyRes]) => {
        this.supply = supplyRes.success ? supplyRes.data : null;
        this.reading = readingRes.success ? readingRes.data : null;
        this.history =
          historyRes.success && historyRes.data && historyRes.data.content
            ? historyRes.data.content.filter(
                (b: BillingResponseDTO) => b.id !== bill.id,
              )
            : [];
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

  getStatusLabel(status?: string): string {
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
        return status || 'Desconocido';
    }
  }

  getPeriodLabel(month?: number, year?: number): string {
    if (!month || !year) return '';
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

  getRemainingBalance(): number {
    if (!this.billing) return 0;
    const rem =
      Number(this.billing.totalAmount) - Number(this.billing.amountPaid);
    return rem < 0 ? 0 : rem;
  }

  // Action placeholders
  generatePDF(): void {
    Swal.fire({
      title: 'Generar PDF',
      text: 'Se procederá a generar el archivo PDF de la factura.',
      icon: 'success',
      confirmButtonColor: '#2563eb',
    });
  }

  printInvoice(): void {
    Swal.fire({
      title: 'Imprimir Factura',
      text: 'Enviando documento a la cola de impresión...',
      icon: 'info',
      confirmButtonColor: '#2563eb',
    });
  }

  registerPayment(): void {
    Swal.fire({
      title: 'Registrar Pago',
      text: 'Esta funcionalidad se habilitará en la siguiente fase de pagos.',
      icon: 'info',
      confirmButtonColor: '#2563eb',
    });
  }

  cancelInvoice(): void {
    Swal.fire({
      title: 'Anular Factura',
      text: 'Esta funcionalidad se habilitará en la siguiente fase de administración.',
      icon: 'warning',
      confirmButtonColor: '#ef4444',
    });
  }
}
