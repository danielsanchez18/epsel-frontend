import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncidentService } from '@services/incidents/incident.service';
import { IncidentResponseDTO, IncidentStatus, IncidentType } from '@interfaces/incidents/incident.interface';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { LucideBadgeAlert, LucidePlus } from '@lucide/angular';

@Component({
  selector: 'component-dashboard-supplies-details-incidents',
  imports: [
    CommonModule,
    RouterLink,
    ComponentSharedPaginator,
    LucideBadgeAlert,
    LucidePlus
  ],
  templateUrl: './incidents.html',
})
export class ComponentDashboardSuppliesDetailsIncidents implements OnInit {
  private incidentService = inject(IncidentService);

  @Input() supplyId!: string | null;
  @Input() supplyNumber!: string | null;

  incidents: IncidentResponseDTO[] = [];
  isLoading = true;

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    if (this.supplyId) {
      this.loadIncidents();
    } else {
      this.isLoading = false;
    }
  }

  loadIncidents(page: number = 0): void {
    if (!this.supplyId) return;
    this.isLoading = true;
    this.incidentService
      .search(page, this.pageSize, undefined, undefined, undefined, undefined, this.supplyId)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.incidents = res.data.content ?? [];
            this.totalPages = res.data.totalPages ?? 0;
            this.totalElements = res.data.totalElements ?? 0;
            this.currentPage = page;
          } else {
            this.resetList();
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading supply incidents:', err);
          this.resetList();
          this.isLoading = false;
        },
      });
  }

  private resetList(): void {
    this.incidents = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onPageChange(page: number): void {
    this.loadIncidents(page);
  }

  getTypeLabel(type?: IncidentType): string {
    switch (type) {
      case 'BILLING_COMPLAINT': return 'Reclamo por recibo elevado';
      case 'PAYMENT_COMPLAINT': return 'Pago no reflejado';
      case 'SERVICE_INTERRUPTION': return 'Interrupción del servicio';
      case 'LOW_PRESSURE': return 'Baja presión de agua';
      case 'WATER_LEAK': return 'Fuga de agua';
      case 'METER_DAMAGE': return 'Medidor dañado';
      case 'METER_REPLACEMENT': return 'Reemplazo de medidor';
      case 'ABNORMAL_CONSUMPTION': return 'Consumo anormal';
      case 'OCR_ANOMALY': return 'Anomalía OCR';
      case 'READING_ANOMALY': return 'Anomalía de lectura';
      case 'SUPPLY_CUT_COMPLAINT': return 'Reclamo por corte';
      case 'OTHER': return 'Otro';
      default: return type || '-';
    }
  }

  getStatusLabel(status?: IncidentStatus): string {
    switch (status) {
      case 'OPEN': return 'Abierta';
      case 'IN_PROGRESS': return 'En proceso';
      case 'RESOLVED': return 'Resuelta';
      case 'CLOSED': return 'Cerrada';
      case 'REJECTED': return 'Rechazada';
      default: return status || '-';
    }
  }

  getStatusClass(status?: IncidentStatus): string {
    switch (status) {
      case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'IN_PROGRESS': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'RESOLVED': return 'text-green-600 bg-green-50 border-green-100';
      case 'CLOSED': return 'text-gray-600 bg-gray-50 border-gray-100';
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-500 bg-gray-50';
    }
  }
}
