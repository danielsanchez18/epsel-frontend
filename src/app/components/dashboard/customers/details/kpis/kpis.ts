import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideFileText, LucideDroplets, LucideCreditCard, LucideBadgeAlert } from "@lucide/angular";
import { CustomerService } from '@services/customers/customer.service';

@Component({
  selector: 'component-dashboard-customers-details-kpis',
  imports: [
    CommonModule,
    LucideFileText, LucideDroplets, LucideCreditCard, LucideBadgeAlert
  ],
  templateUrl: './kpis.html',
})
export class ComponentDashboardCustomersDetailsKpis implements OnInit {
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);

  kpis: any = null;
  loading = true;
  error = false;
  customerId: string | null = null;

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') || 
                      this.route.parent?.snapshot.paramMap.get('id') || 
                      null;
    if (this.customerId) {
      this.loadKpis();
    } else {
      this.loading = false;
      this.error = true;
    }
  }

  loadKpis(): void {
    if (!this.customerId) return;
    this.loading = true;
    this.error = false;
    this.customerService.getDetailKpis(this.customerId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.kpis = res.data;
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading customer detail KPIs:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}

