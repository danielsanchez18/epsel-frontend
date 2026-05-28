import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideImage, LucideAlertTriangle } from '@lucide/angular';

import { MeterReadingResponseDTO } from '@core/interfaces/readings/meter-reading.interface';

@Component({
  selector: 'component-dashboard-readings-table',
  imports: [
    CommonModule,
    RouterLink,
    LucideImage,
    LucideAlertTriangle
  ],
  templateUrl: './table.html',
})
export class ComponentDashboardReadingsTable {
  @Input() items: MeterReadingResponseDTO[] = [];

  getStatusClass(status?: string): string {
    switch (status) {
      case 'RECORDED':
        return 'bg-amber-100 text-amber-700';
      case 'VALIDATED':
        return 'bg-blue-100 text-blue-700';
      case 'BILLED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
}
