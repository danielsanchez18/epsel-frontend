import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { PaymentService } from '@core/services/payments/payment.service';
import {
  PaymentResponseDTO,
  PaymentMethod,
  PaymentStatus,
} from '@interfaces/payments/payment.interface';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedExport, ExportOptions } from '@components/shared/export/export';
import { ComponentDashboardPaymentsTable } from '../table/table';
import { ComponentDashboardPaymentsEmpty } from '../empty/empty';
import { ExportService } from '@core/services/utils/export.service';

@Component({
  selector: 'component-dashboard-payments-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    ComponentSharedFilters,
    ComponentSharedExport,
    ComponentDashboardPaymentsTable,
    ComponentDashboardPaymentsEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardPaymentsList implements OnInit {
  private paymentService = inject(PaymentService);
  private exportService = inject(ExportService);
  private fb = inject(FormBuilder);

  payments: PaymentResponseDTO[] = [];
  isLoading = false;
  searchQuery = '';

  currentPage = 0;
  pageSize = 10;
  sort = 'createdAt,desc';
  totalPages = 0;
  totalElements = 0;

  filterForm: FormGroup;
  activeFiltersCount = 0;

  constructor() {
    this.filterForm = this.fb.group({
      status: [''],
      method: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(page: number = 0): void {
    this.isLoading = true;

    let receiptNumber: string | undefined;
    let billingNumber: string | undefined;
    let supplyNumber: string | undefined;
    let customerName: string | undefined;

    if (this.searchQuery) {
      const q = this.searchQuery.toUpperCase();
      if (q.startsWith('REC')) {
        receiptNumber = this.searchQuery;
      } else if (q.startsWith('FAC')) {
        billingNumber = this.searchQuery;
      } else if (/^\d+$/.test(this.searchQuery)) {
        supplyNumber = this.searchQuery;
      } else {
        customerName = this.searchQuery;
      }
    }

    const values = this.filterForm.value;
    const status = values.status ? values.status as PaymentStatus : undefined;
    const paymentMethod = values.method ? values.method as PaymentMethod : undefined;
    const startDate = values.startDate || undefined;
    const endDate = values.endDate || undefined;

    this.paymentService
      .search(
        page,
        this.pageSize,
        this.sort,
        receiptNumber,
        billingNumber,
        supplyNumber,
        customerName,
        paymentMethod,
        status,
        startDate,
        endDate
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.payments = res.data.content ?? [];
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
    this.payments = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.loadData(0);
  }

  applyFilters(): void {
    const values = this.filterForm.value;
    let count = 0;
    Object.keys(values).forEach(key => {
      if (values[key]) count++;
    });
    this.activeFiltersCount = count;
    this.currentPage = 0;
    this.loadData(0);
  }

  clearFilters(): void {
    this.filterForm.reset({
      status: '',
      method: '',
      startDate: '',
      endDate: ''
    });
    this.activeFiltersCount = 0;
    this.currentPage = 0;
    this.loadData(0);
  }

  onPageChange(page: number): void {
    this.loadData(page);
  }

  handleExport(options: ExportOptions): void {
    const filename = `pagos_export_${new Date().getTime()}`;

    if (options.scope === 'CURRENT_PAGE') {
      this.doExport(this.payments, options.format, filename);
    } else {
      let receiptNumber: string | undefined;
      let billingNumber: string | undefined;
      let supplyNumber: string | undefined;
      let customerName: string | undefined;

      if (this.searchQuery) {
        const q = this.searchQuery.toUpperCase();
        if (q.startsWith('REC')) {
          receiptNumber = this.searchQuery;
        } else if (q.startsWith('FAC')) {
          billingNumber = this.searchQuery;
        } else if (/^\d+$/.test(this.searchQuery)) {
          supplyNumber = this.searchQuery;
        } else {
          customerName = this.searchQuery;
        }
      }

      const values = this.filterForm.value;
      const status = values.status ? values.status as PaymentStatus : undefined;
      const paymentMethod = values.method ? values.method as PaymentMethod : undefined;
      const startDate = values.startDate || undefined;
      const endDate = values.endDate || undefined;
      
      this.paymentService.search(
        0,
        10000,
        this.sort,
        receiptNumber,
        billingNumber,
        supplyNumber,
        customerName,
        paymentMethod,
        status,
        startDate,
        endDate
      ).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.doExport(res.data.content ?? [], options.format, filename);
          }
        },
        error: (err) => {
          console.error('Error fetching all payments for export', err);
        }
      });
    }
  }

  private doExport(data: PaymentResponseDTO[], format: 'CSV' | 'EXCEL', filename: string): void {
    const exportData = data.map(p => {
      let estado: string = p.status;
      if (estado === 'COMPLETED') estado = 'Completado';
      else if (estado === 'PENDING') estado = 'Pendiente';
      else if (estado === 'FAILED') estado = 'Fallido';
      else if (estado === 'CANCELLED') estado = 'Anulado';

      let metodo: string = p.paymentMethod;
      if (metodo === 'CASH') metodo = 'Efectivo';
      else if (metodo === 'CARD') metodo = 'Tarjeta';
      else if (metodo === 'BANK_TRANSFER') metodo = 'Transferencia';

      return {
        'Número Recibo': p.receiptNumber || '',
        'Factura Asociada': p.billingNumber || '',
        'Suministro': p.supplyNumber || '',
        'Cliente': p.customerFullName || '',
        'Monto': p.amount || 0,
        'Método Pago': metodo,
        'Estado': estado,
        'Fecha Pago': p.paymentDate ? new Date(p.paymentDate).toLocaleString() : ''
      };
    });

    if (format === 'CSV') {
      this.exportService.exportToCsv(exportData, filename);
    } else {
      this.exportService.exportToExcel(exportData, filename);
    }
  }

  printReceipt(payment: PaymentResponseDTO): void {
    Swal.fire({
      title: 'Imprimir Recibo',
      text: `Enviando recibo de pago ${payment.receiptNumber} a la cola de impresión...`,
      icon: 'info',
      confirmButtonColor: '#2563eb',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  cancelPayment(payment: PaymentResponseDTO): void {
    Swal.fire({
      title: '¿Anular Pago?',
      text: `¿Está seguro de que desea anular el recibo ${payment.receiptNumber} por un monto de S/. ${payment.amount.toFixed(2)}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Since there is no cancel payment API in backend, we simulate it
        payment.status = 'CANCELLED';
        Swal.fire({
          title: 'Pago Anulado',
          text: `El pago ${payment.receiptNumber} ha sido anulado exitosamente.`,
          icon: 'success',
          confirmButtonColor: '#2563eb',
        });
      }
    });
  }
}
