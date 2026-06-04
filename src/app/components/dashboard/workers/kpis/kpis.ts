import { Component, OnInit, inject } from '@angular/core';
import { LucideUserCheck, LucideBadgeCheck, LucideClipboardCheck, LucideBadgeAlert } from "@lucide/angular";
import { UserService } from '@services/users/user.service';

@Component({
  selector: 'component-dashboard-workers-kpis',
  imports: [
    LucideUserCheck, LucideBadgeCheck, LucideClipboardCheck, LucideBadgeAlert
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardWorkersKpis implements OnInit {
  private userService = inject(UserService);

  kpis: any = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadKpis();
  }

  loadKpis(): void {
    this.loading = true;
    this.error = false;
    this.userService.getKpis().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.kpis = res.data;
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading worker KPIs:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
