import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideUserCheck, LucideUsers, LucideClockAlert, LucideUserPlus } from "@lucide/angular";
import { CustomerService } from '@services/customers/customer.service';

@Component({
  selector: 'component-dashboard-customers-kpis',
  imports: [
    CommonModule,
    LucideUsers,
    LucideUserCheck,
    LucideClockAlert,
    LucideUserPlus
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardCustomersKpis implements OnInit {
  private customerService = inject(CustomerService);

  kpis: any = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadKpis();
  }

  loadKpis(): void {
    this.loading = true;
    this.error = false;
    this.customerService.getKpis().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.kpis = res.data;
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading customer KPIs:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}

