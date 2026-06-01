import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IncidentResponseDTO, IncidentPriority, IncidentStatus, IncidentType } from '@interfaces/incidents/incident.interface';

@Component({
  selector: 'component-dashboard-incidents-table',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './table.html',
})
export class ComponentDashboardIncidentsTable {
  @Input() items: IncidentResponseDTO[] = [];

  getTypeLabel(type?: IncidentType): string {
    switch (type) {
      case 'BILLING_COMPLAINT': return 'Facturación';
      case 'PAYMENT_COMPLAINT': return 'Pago no reflejado';
      case 'SERVICE_INTERRUPTION': return 'Sin Agua / Corte';
      case 'LOW_PRESSURE': return 'Baja presión';
      case 'WATER_LEAK': return 'Fuga';
      case 'METER_DAMAGE': return 'Medidor dañado';
      case 'METER_REPLACEMENT': return 'Reemplazo medidor';
      case 'ABNORMAL_CONSUMPTION': return 'Consumo anormal';
      case 'OCR_ANOMALY': return 'Error OCR';
      case 'READING_ANOMALY': return 'Error lectura';
      case 'SUPPLY_CUT_COMPLAINT': return 'Reclamo por corte';
      case 'OTHER': return 'Otro';
      default: return type || '-';
    }
  }

  getPriorityLabel(priority?: IncidentPriority): string {
    switch (priority) {
      case 'LOW': return 'Baja';
      case 'MEDIUM': return 'Media';
      case 'HIGH': return 'Alta';
      case 'CRITICAL': return 'Crítica';
      default: return priority || '-';
    }
  }

  getPriorityClass(priority?: IncidentPriority): string {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-700';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700';
      case 'HIGH': return 'bg-amber-100 text-amber-700';
      case 'CRITICAL': return 'bg-red-100 text-red-700 font-bold';
      default: return 'bg-gray-100 text-gray-700';
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
      case 'OPEN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  formatDate(value?: string | null): string {
    return value ? new Date(value).toLocaleDateString('es-PE') : '-';
  }
}
