import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBuilding2, LucideHouse, LucideStore } from '@lucide/angular';

import { SupplyResponseDTO } from '@core/interfaces/supplies/supply.interface';

@Component({
  selector: 'component-dashboard-supplies-table',
  imports: [CommonModule, LucideHouse, LucideStore, LucideBuilding2, RouterLink],
  templateUrl: './table.html',
})
export class ComponentDashboardSuppliesTable {
  @Input() items: SupplyResponseDTO[] = [];

  getTypeLabel(type?: string): string {
    switch (type) {
      case 'BUSINESS':
        return 'Local Comercial';
      case 'INDUSTRIAL':
        return 'Industrial';
      default:
        return 'Casa';
    }
  }

  getTypeIcon(type?: string): 'house' | 'store' | 'building' {
    switch (type) {
      case 'BUSINESS':
        return 'store';
      case 'INDUSTRIAL':
        return 'building';
      default:
        return 'house';
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-700';
      case 'CUT_OFF':
        return 'bg-red-100 text-red-700';
      case 'RECONNECTED':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'SUSPENDED':
        return 'Suspendido';
      case 'CUT_OFF':
        return 'Cortado';
      case 'RECONNECTED':
        return 'Reconectado';
      default:
        return status || 'Sin estado';
    }
  }
}
