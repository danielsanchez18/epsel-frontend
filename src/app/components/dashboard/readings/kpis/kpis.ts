import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideClipboardList,
  LucideClipboardPenLine,
  LucideBadgeCheck,
  LucideFileText,
  LucideBan,
  LucideDroplets,
} from '@lucide/angular';
import { MeterReadingService } from '@services/readings/meter-reading.service';

@Component({
  selector: 'component-dashboard-readings-kpis',
  imports: [
    CommonModule,
    LucideClipboardList,
    LucideClipboardPenLine,
    LucideBadgeCheck,
    LucideFileText,
    LucideBan,
    LucideDroplets,
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardReadingsKpis implements OnInit {
  private readingService = inject(MeterReadingService);

  kpis: any = null;
  loading = true;
  error = false;

  periods: { label: string; startDate: string; endDate: string }[] = [];
  selectedPeriod: string = '';

  ngOnInit(): void {
    this.generatePeriods();
    this.loadKpis();
  }

  generatePeriods() {
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const label = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      const value = `${start.toISOString()}|${end.toISOString()}`;

      this.periods.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });

      if (i === 0) {
        this.selectedPeriod = value;
      }
    }
  }

  onPeriodChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedPeriod = target.value;
    this.loadKpis();
  }

  loadKpis(): void {
    this.loading = true;
    this.error = false;

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (this.selectedPeriod) {
      const parts = this.selectedPeriod.split('|');
      startDate = parts[0];
      endDate = parts[1];
    }

    this.readingService.getKpis(startDate, endDate).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.kpis = res.data;
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading readings KPIs:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
