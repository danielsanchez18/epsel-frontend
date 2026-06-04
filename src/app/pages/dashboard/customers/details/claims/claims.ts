import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IncidentService } from '@services/incidents/incident.service';
import { PageDashboardCustomersDetailsGeneral } from '../general/general';
import {
  IncidentResponseDTO,
  IncidentStatus,
  IncidentType,
} from '@interfaces/incidents/incident.interface';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { LucideBadgeInfo } from '@lucide/angular';

@Component({
  selector: 'page-dashboard-customers-details-claims',
  imports: [
    CommonModule,
    RouterModule,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    LucideBadgeInfo,
  ],
  templateUrl: './claims.html',
})
export class PageDashboardCustomersDetailsClaims implements OnInit {
  private incidentService = inject(IncidentService);
  private route = inject(ActivatedRoute);
  private parent = inject(PageDashboardCustomersDetailsGeneral);

  customerId: string | null = null;
  incidents: IncidentResponseDTO[] = [];
  filteredIncidents: IncidentResponseDTO[] = [];
  isLoading = true;

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  searchQuery = '';

  ngOnInit(): void {
    this.customerId =
      this.parent.customerId ||
      this.route.parent?.snapshot.paramMap.get('id') ||
      null;
    if (this.customerId) {
      this.loadIncidents();
    } else {
      this.isLoading = false;
    }
  }

  loadIncidents(page: number = 0): void {
    if (!this.customerId) return;
    this.isLoading = true;
    this.incidentService
      .search(
        page,
        this.pageSize,
        undefined,
        undefined,
        undefined,
        this.customerId,
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.incidents = res.data.content || [];
            this.totalPages = res.data.totalPages || 0;
            this.totalElements = res.data.totalElements || 0;
            this.currentPage = page;
            this.applyFilter();
          } else {
            this.resetList();
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading customer claims:', err);
          this.resetList();
          this.isLoading = false;
        },
      });
  }

  private resetList() {
    this.incidents = [];
    this.filteredIncidents = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onPageChange(page: number): void {
    this.loadIncidents(page);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredIncidents = [...this.incidents];
    } else {
      const q = this.searchQuery.toLowerCase().trim();
      this.filteredIncidents = this.incidents.filter(
        (inc) =>
          inc.incidentNumber.toLowerCase().includes(q) ||
          inc.title.toLowerCase().includes(q) ||
          this.getTypeLabel(inc.type).toLowerCase().includes(q),
      );
    }
  }

  getTypeLabel(type?: IncidentType): string {
    switch (type) {
      case 'BILLING_COMPLAINT':
        return 'Reclamo por recibo elevado';
      case 'PAYMENT_COMPLAINT':
        return 'Pago no reflejado';
      case 'SERVICE_INTERRUPTION':
        return 'Interrupción del servicio';
      case 'LOW_PRESSURE':
        return 'Baja presión de agua';
      case 'WATER_LEAK':
        return 'Fuga de agua';
      case 'METER_DAMAGE':
        return 'Medidor dañado';
      case 'METER_REPLACEMENT':
        return 'Reemplazo de medidor';
      case 'ABNORMAL_CONSUMPTION':
        return 'Consumo anormal';
      case 'OCR_ANOMALY':
        return 'Anomalía OCR';
      case 'READING_ANOMALY':
        return 'Anomalía de lectura';
      case 'SUPPLY_CUT_COMPLAINT':
        return 'Reclamo por corte';
      case 'OTHER':
        return 'Otro';
      default:
        return type || '-';
    }
  }

  getStatusLabel(status?: IncidentStatus): string {
    switch (status) {
      case 'OPEN':
        return 'Abierta';
      case 'IN_PROGRESS':
        return 'En proceso';
      case 'RESOLVED':
        return 'Resuelta';
      case 'CLOSED':
        return 'Cerrada';
      case 'REJECTED':
        return 'Rechazada';
      default:
        return status || '-';
    }
  }

  getStatusClass(status?: IncidentStatus): string {
    switch (status) {
      case 'OPEN':
        return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS':
        return 'text-amber-600 bg-amber-100';
      case 'RESOLVED':
        return 'text-green-600 bg-green-100';
      case 'CLOSED':
        return 'text-black bg-gray-100';
      case 'REJECTED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-black bg-gray-100';
    }
  }
}
