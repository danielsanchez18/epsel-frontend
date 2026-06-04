import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideBadgeCheck, LucideBadgeAlert, LucideBuilding2, LucideDropletOff } from "@lucide/angular";
import { PropertyService } from '@services/properties/property.service';

@Component({
  selector: 'component-dashboard-properties-kpis',
  imports: [
    CommonModule,
    LucideBadgeCheck,
    LucideBadgeAlert,
    LucideBuilding2,
    LucideDropletOff
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardPropertiesKpis implements OnInit {
  private propertyService = inject(PropertyService);

  kpis: any = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadKpis();
  }

  loadKpis(): void {
    this.loading = true;
    this.error = false;
    this.propertyService.getKpis().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.kpis = res.data;
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading property KPIs:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}

