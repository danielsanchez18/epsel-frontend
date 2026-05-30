import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideClipboardList, LucideImage, LucideImageOff } from '@lucide/angular';
import { MeterReadingService } from '@services/readings/meter-reading.service';
import { MeterReadingResponseDTO } from '@interfaces/readings/meter-reading.interface';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';

@Component({
  selector: 'component-dashboard-supplies-details-readings',
  imports: [
    CommonModule,
    LucideClipboardList,
    LucideImage,
    LucideImageOff,
    ComponentSharedPaginator,
  ],
  templateUrl: './readings.html',
})
export class ComponentDashboardSuppliesDetailsReadings implements OnInit {
  private readingService = inject(MeterReadingService);

  @Input() supplyNumber!: string | null;

  readings: MeterReadingResponseDTO[] = [];
  isLoading = true;

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    if (this.supplyNumber) {
      this.loadReadings();
    } else {
      this.isLoading = false;
    }
  }

  loadReadings(page: number = 0): void {
    if (!this.supplyNumber) return;
    this.isLoading = true;
    this.readingService.search(
      this.supplyNumber,
      undefined,
      undefined,
      undefined,
      undefined,
      page,
      this.pageSize
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.readings = res.data.content ?? [];
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
    this.readings = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onPageChange(page: number): void {
    this.loadReadings(page);
  }

  getPeriodLabel(dateStr: string): string {
    if (!dateStr) return '';
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Oct',
      'Nov',
      'Dic',
    ];
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      return `${months[monthIdx] || parts[1]} ${year}`;
    }
    return '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'RECORDED':
        return 'bg-yellow-100 text-yellow-700';
      case 'VALIDATED':
        return 'bg-green-100 text-green-700';
      case 'BILLED':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'RECORDED':
        return 'Registrada';
      case 'VALIDATED':
        return 'Validada';
      case 'BILLED':
        return 'Facturada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  }
}
