import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideBadgeAlert, LucideClipboardList, LucideActivity, LucideBadgeCheck } from "@lucide/angular";
import { IncidentService } from '@core/services/incidents/incident.service';

@Component({
  selector: 'component-dashboard-incidents-kpis',
  imports: [
    CommonModule,
    FormsModule,
    LucideBadgeAlert,
    LucideClipboardList,
    LucideActivity,
    LucideBadgeCheck
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardIncidentsKpis implements OnInit {
  private incidentService = inject(IncidentService);

  total = 0;
  open = 0;
  inProgress = 0;
  resolved = 0;

  selectedPeriod = '';
  periods: { label: string; value: string }[] = [];

  ngOnInit(): void {
    this.generatePeriods();
    this.loadKPIs();
  }

  generatePeriods(): void {
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthName = d.toLocaleString('es-PE', { month: 'long' });
      const label = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
      const value = `${year}-${month.toString().padStart(2, '0')}`;
      this.periods.push({ label, value });
    }
    this.selectedPeriod = this.periods[0].value;
  }

  onPeriodChange(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (this.selectedPeriod) {
      const [year, month] = this.selectedPeriod.split('-');
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

      startDate = start.toISOString();
      endDate = end.toISOString();
    }

    this.incidentService.getKpis(startDate, endDate).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.total = res.data.total;
          this.open = res.data.open;
          this.inProgress = res.data.inProgress;
          this.resolved = res.data.resolved;
        } else {
          this.resetKPIs();
        }
      },
      error: () => {
        this.resetKPIs();
      },
    });
  }

  private resetKPIs(): void {
    this.total = 0;
    this.open = 0;
    this.inProgress = 0;
    this.resolved = 0;
  }
}
