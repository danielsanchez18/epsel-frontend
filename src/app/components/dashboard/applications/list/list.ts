import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedExport, ExportOptions } from '@components/shared/export/export';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentDashboardApplicationsTable } from '../table/table';
import { ComponentDashboardApplicationsEmpty } from '../empty/empty';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedImport } from '@components/shared/import/import';
import { InstallationRequestService } from '@services/supplies/installation-request.service';
import { InstallationRequestResponse, InstallationRequestStatus } from '@interfaces/supplies/installation-request.interface';
import { ExportService } from '@core/services/utils/export.service';

@Component({
  selector: 'component-dashboard-applications-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComponentSharedSearchBox,
    ComponentSharedExport,
    ComponentSharedFilters,
    ComponentDashboardApplicationsTable,
    ComponentDashboardApplicationsEmpty,
    ComponentSharedPaginator,
    ComponentSharedImport
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardApplicationsList implements OnInit {
  @ViewChild('importComponent') importComponent!: ComponentSharedImport;

  private requestService = inject(InstallationRequestService);
  private exportService = inject(ExportService);
  private fb = inject(FormBuilder);

  requests: InstallationRequestResponse[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  sort = 'createdAt,desc';
  searchQuery = '';
  isLoading = false;
  isImportLoading = false;
  importPreviewData: any = null;

  filterForm: FormGroup;
  activeFiltersCount = 0;

  constructor() {
    this.filterForm = this.fb.group({
      status: [''],
      zoneName: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(page: number = 0): void {
    this.isLoading = true;

    const statusFilter = this.filterForm.value.status || undefined;
    const zoneNameFilter = this.filterForm.value.zoneName || undefined;
    const startDate = this.filterForm.value.startDate || undefined;
    const endDate = this.filterForm.value.endDate || undefined;

    this.requestService
      .findAll(page, this.pageSize, this.sort, this.searchQuery || undefined, statusFilter as InstallationRequestStatus, zoneNameFilter, startDate, endDate)
      .subscribe({
        next: (res: any) => {
          this.requests = res.data.content;
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          this.currentPage = page;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(
            '[ComponentDashboardApplicationsList] Error loading requests',
            err?.message || err,
          );
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.loadRequests(page);
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.loadRequests(0);
  }

  applyFilters(): void {
    const values = this.filterForm.value;
    let count = 0;
    Object.keys(values).forEach(key => {
      if (values[key]) count++;
    });
    this.activeFiltersCount = count;
    this.currentPage = 0;
    this.loadRequests(0);
  }

  clearFilters(): void {
    this.filterForm.reset({
      status: '',
      zoneName: '',
      startDate: '',
      endDate: ''
    });
    this.activeFiltersCount = 0;
    this.currentPage = 0;
    this.loadRequests(0);
  }

  handleExport(options: ExportOptions): void {
    const filename = `solicitudes_export_${new Date().getTime()}`;

    if (options.scope === 'CURRENT_PAGE') {
      this.doExport(this.requests, options.format, filename);
    } else {
      // Export all records
      const statusFilter = this.filterForm.value.status || undefined;
      const zoneNameFilter = this.filterForm.value.zoneName || undefined;
      const startDate = this.filterForm.value.startDate || undefined;
      const endDate = this.filterForm.value.endDate || undefined;
      
      this.requestService.findAll(0, 10000, this.sort, this.searchQuery || undefined, statusFilter as InstallationRequestStatus, zoneNameFilter, startDate, endDate)
        .subscribe({
          next: (res: any) => {
            this.doExport(res.data.content, options.format, filename);
          },
          error: (err) => {
            console.error('Error fetching all applications for export', err);
          }
        });
    }
  }

  private doExport(data: any[], format: 'CSV' | 'EXCEL', filename: string): void {
    const exportData = data.map(r => {
      let estado = r.status;
      if (estado === 'PENDING') estado = 'Pendiente';
      else if (estado === 'APPROVED') estado = 'Aprobada';
      else if (estado === 'REJECTED') estado = 'Rechazada';
      else if (estado === 'COMPLETED') estado = 'Completada';

      return {
        'Número Solicitud': r.requestNumber || '',
        'Fecha Solicitud': r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '',
        'Estado': estado,
        'Cliente': r.customer?.name || r.customer?.businessName || '',
        'Documento Cliente': r.customer?.documentNumber || '',
        'Predio / Dirección': r.property?.address || '',
        'Zona': r.property?.serviceZone?.name || '',
        'Costo Instalación': r.installationCost || 0,
        'Trabajador Asignado': r.assignedWorker ? `${r.assignedWorker.name} ${r.assignedWorker.lastName}` : 'No asignado'
      };
    });

    if (format === 'CSV') {
      this.exportService.exportToCsv(exportData, filename);
    } else {
      this.exportService.exportToExcel(exportData, filename);
    }
  }

  handleFileSelect(file: File) {
    this.isImportLoading = true;
    this.requestService.previewImport(file).subscribe({
      next: (res: any) => {
        this.importPreviewData = res.data;
        this.isImportLoading = false;
      },
      error: (err) => {
        console.error('Error en previsualización de importación', err);
        this.isImportLoading = false;
      }
    });
  }

  handleImportConfirm(validData: any[]) {
    this.isImportLoading = true;
    this.requestService.createBulk(validData).subscribe({
      next: () => {
        this.isImportLoading = false;
        this.importPreviewData = null;
        if (this.importComponent) {
          this.importComponent.closeModal();
        }
        this.loadRequests(0);
      },
      error: (err) => {
        console.error('Error importando registros', err);
        this.isImportLoading = false;
      }
    });
  }

  handleDownloadTemplate() {
    const data = [
      {
        'Documento Cliente (DNI/RUC)': '73324545',
        'Código Catastral': 'CAT-001-A',
        'Referencia Interna': 'Solicitud de Juan',
        'Fecha de Solicitud (YYYY-MM-DD)': '2026-06-08',
        'Observaciones': 'Ninguna'
      },
      {
        'Documento Cliente (DNI/RUC)': '42112121',
        'Código Catastral': 'CAT-002-B',
        'Referencia Interna': 'Instalacion local',
        'Fecha de Solicitud (YYYY-MM-DD)': '2026-06-09',
        'Observaciones': 'Urgente'
      }
    ];
    this.exportService.exportToCsv(data, 'solicitudes_plantilla');
  }
}
