import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IncidentService } from '@services/incidents/incident.service';
import { SupplyService } from '@services/supplies/supply.service';
import { PageDashboardPropertiesDetailsGeneral } from '../general/general';
import {
  IncidentResponseDTO,
  IncidentStatus,
  IncidentType,
} from '@interfaces/incidents/incident.interface';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { LucideBadgeInfo } from '@lucide/angular';

@Component({
  selector: 'page-dashboard-properties-details-claims',
  imports: [
    CommonModule,
    RouterModule,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    LucideBadgeInfo,
  ],
  templateUrl: './claims.html',
})
export class PageDashboardPropertiesDetailsClaims implements OnInit {
  private incidentService = inject(IncidentService);
  private supplyService = inject(SupplyService);
  private route = inject(ActivatedRoute);
  private parent = inject(PageDashboardPropertiesDetailsGeneral);

  propertyId: string | null = null;
  incidents: IncidentResponseDTO[] = [];
  filteredIncidents: IncidentResponseDTO[] = [];
  isLoading = true;

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  searchQuery = '';

  ngOnInit(): void {
    this.propertyId =
      this.parent.propertyId ||
      this.route.parent?.snapshot.paramMap.get('id') ||
      null;
    if (this.propertyId) {
      this.loadIncidents();
    } else {
      this.isLoading = false;
    }
  }

  loadIncidents(page: number = 0): void {
    if (!this.propertyId) return;
    this.isLoading = true;

    // Load supplies for this property, then search incidents by each supply
    this.supplyService.getByPropertyId(this.propertyId, 0, 100).subscribe({
      next: (suppliesRes) => {
        if (
          suppliesRes.success &&
          suppliesRes.data &&
          suppliesRes.data.content &&
          suppliesRes.data.content.length > 0
        ) {
          const supplyIds = suppliesRes.data.content.map((s) => s.id);
          const incidentRequests = supplyIds.map((id) =>
            this.incidentService
              .search(page, this.pageSize, undefined, undefined, undefined, undefined, id)
              .pipe(
                catchError(() =>
                  of({
                    success: true,
                    data: { content: [], totalPages: 0, totalElements: 0 },
                  }),
                ),
              ),
          );

          forkJoin(incidentRequests).subscribe({
            next: (results) => {
              const allIncidents: IncidentResponseDTO[] = [];
              let combinedTotal = 0;
              let maxPages = 0;

              results.forEach((res: any) => {
                if (res && res.success && res.data) {
                  if (res.data.content) {
                    allIncidents.push(...res.data.content);
                  }
                  combinedTotal += res.data.totalElements || 0;
                  maxPages = Math.max(maxPages, res.data.totalPages || 0);
                }
              });

              // Deduplicate by id in case an incident appears in multiple supplies
              const seen = new Set<string>();
              this.incidents = allIncidents.filter((inc) => {
                if (seen.has(inc.id)) return false;
                seen.add(inc.id);
                return true;
              });

              this.totalElements = this.incidents.length;
              this.totalPages = maxPages;
              this.currentPage = page;
              this.applyFilter();
              this.isLoading = false;
            },
            error: () => {
              this.resetList();
              this.isLoading = false;
            },
          });
        } else {
          this.resetList();
          this.isLoading = false;
        }
      },
      error: () => {
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
