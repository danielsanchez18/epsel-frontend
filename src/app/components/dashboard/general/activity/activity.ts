import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '@services/dashboard/dashboard.service';
import { DashboardActivity } from '@interfaces/dashboard/dashboard.interface';
import {
  LucideCreditCard,
  LucideFileText,
  LucideDroplets,
  LucideWrench,
  LucideHelpCircle,
  LucideHistory,
} from '@lucide/angular';

@Component({
  selector: 'component-dashboard-general-activity',
  imports: [
    CommonModule,
    LucideCreditCard,
    LucideFileText,
    LucideDroplets,
    LucideWrench,
    LucideHelpCircle,
    LucideHistory,
  ],
  templateUrl: './activity.html',
})
export class ComponentDashboardGeneralActivity implements OnInit {
  private dashboardService = inject(DashboardService);

  activities: DashboardActivity[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.isLoading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.activities = res.data.recentActivities || [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.activities = [];
        this.isLoading = false;
      },
    });
  }

  getRelativeTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 0) {
      return 'Hace unos instantes';
    }

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Hace unos instantes';
    }
    if (diffMins < 60) {
      return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    }
    if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    }
    if (diffDays < 30) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    }
    
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
