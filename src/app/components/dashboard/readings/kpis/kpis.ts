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

  ngOnInit(): void {
    this.loadKpis();
  }

  loadKpis(): void {
    this.loading = true;
    this.error = false;
    this.readingService.getKpis().subscribe({
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
