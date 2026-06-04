import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideClipboardClock, LucideBadgeCheck, LucideBadgeX, LucideBadgeDollarSign } from "@lucide/angular";
import { InstallationRequestService } from '@services/supplies/installation-request.service';

@Component({
  selector: 'component-dashboard-applications-kpis',
  imports: [
    CommonModule,
    LucideClipboardClock,
    LucideBadgeCheck,
    LucideBadgeX,
    LucideBadgeDollarSign
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardApplicationsKpis implements OnInit {
  private requestService = inject(InstallationRequestService);

  kpis: any = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadKpis();
  }

  loadKpis(): void {
    this.loading = true;
    this.error = false;
    this.requestService.getKpis().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.kpis = res.data;
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading application KPIs:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}

