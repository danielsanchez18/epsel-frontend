import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { BillingService } from '@core/services/billings/billing.service';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedExport, ExportOptions } from '@components/shared/export/export';
import { ComponentDashboardBillingTable } from '../table/table';
import { ComponentDashboardBillingEmpty } from '../empty/empty';
import { ExportService } from '@core/services/utils/export.service';

@Component({
  selector: 'component-dashboard-billing-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    ComponentSharedFilters,
    ComponentSharedExport,
    ComponentDashboardBillingTable,
    ComponentDashboardBillingEmpty,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardBillingList implements OnInit {
  private billingService = inject(BillingService);
  private exportService = inject(ExportService);
  private fb = inject(FormBuilder);

  billings: BillingResponseDTO[] = [];
  isLoading = false;
  searchQuery = '';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  filterForm: FormGroup;
  activeFiltersCount = 0;

  constructor() {
    this.filterForm = this.fb.group({
      status: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(page: number = 0): void {
    this.isLoading = true;

    let billingNumber: string | undefined;
    let customerName: string | undefined;
    
    if (this.searchQuery) {
      if (this.searchQuery.toUpperCase().startsWith('FAC')) {
        billingNumber = this.searchQuery;
      } else {
        customerName = this.searchQuery;
      }
    }

    const values = this.filterForm.value;
    let status: string | undefined;
    let overdue: boolean | undefined;

    if (values.status) {
      if (values.status === 'OVERDUE') {
        overdue = true;
      } else {
        status = values.status;
      }
    }

    const startDate = values.startDate || undefined;
    const endDate = values.endDate || undefined;

    this.billingService.search(
      page,
      this.pageSize,
      billingNumber,
      customerName,
      status,
      startDate,
      endDate,
      overdue
    ).subscribe({
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
      }
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
    const filename = `facturas_export_${new Date().getTime()}`;

    if (options.scope === 'CURRENT_PAGE') {
      this.doExport(this.billings, options.format, filename);
    } else {
      let billingNumber: string | undefined;
      let customerName: string | undefined;
      
      if (this.searchQuery) {
        if (this.searchQuery.toUpperCase().startsWith('FAC')) {
          billingNumber = this.searchQuery;
        } else {
          customerName = this.searchQuery;
        }
      }

      const values = this.filterForm.value;
      let status: string | undefined;
      let overdue: boolean | undefined;

      if (values.status) {
        if (values.status === 'OVERDUE') {
          overdue = true;
        } else {
          status = values.status;
        }
      }

      const startDate = values.startDate || undefined;
      const endDate = values.endDate || undefined;
      
      this.billingService.search(
        0,
        10000,
        billingNumber,
        customerName,
        status,
        startDate,
        endDate,
        overdue
      ).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.doExport(res.data.content ?? [], options.format, filename);
          }
        },
        error: (err) => {
          console.error('Error fetching all billings for export', err);
        }
      });
    }
  }

  private doExport(data: BillingResponseDTO[], format: 'CSV' | 'EXCEL', filename: string): void {
    const exportData = data.map(b => {
      let estado: string = b.status;
      if (estado === 'PENDING') estado = 'Pendiente';
      else if (estado === 'PAID') estado = 'Pagada';
      else if (estado === 'CANCELLED') estado = 'Cancelada';

      if (b.dueDate && new Date(b.dueDate) < new Date() && b.status === 'PENDING') {
        estado = 'Vencida';
      }

      return {
        'Número Factura': b.billingNumber || '',
        'Cliente': b.customerName || '',
        'Suministro': b.supplyNumber || '',
        'Periodo': `${b.billingMonth}/${b.billingYear}`,
        'Monto Total': b.totalAmount || 0,
        'Estado': estado,
        'Fecha Emisión': b.billingDate ? new Date(b.billingDate).toLocaleDateString() : '',
        'Fecha Vencimiento': b.dueDate ? new Date(b.dueDate).toLocaleDateString() : ''
      };
    });

    if (format === 'CSV') {
      this.exportService.exportToCsv(exportData, filename);
    } else {
      this.exportService.exportToExcel(exportData, filename);
    }
  }

  generatePDF(bill: BillingResponseDTO): void {
    Swal.fire({
      title: 'Generar PDF',
      text: `Esta función se implementará después. (Factura: ${bill.billingNumber})`,
      icon: 'info',
      confirmButtonColor: '#2563eb'
    });
  }

  registerPayment(bill: BillingResponseDTO): void {
    Swal.fire({
      title: 'Registrar Pago',
      text: `Esta función se implementará después. (Factura: ${bill.billingNumber})`,
      icon: 'info',
      confirmButtonColor: '#2563eb'
    });
  }
}
