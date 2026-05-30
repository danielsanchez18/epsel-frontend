import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupplyService } from '@core/services/supplies/supply.service';

// Tab Components
import { ComponentDashboardSuppliesDetails } from '@components/dashboard/supplies/details/details';
import { ComponentDashboardSuppliesDetailsBillings } from '@components/dashboard/supplies/details/tabs/billings/billings';
import { ComponentDashboardSuppliesDetailsPayments } from '@components/dashboard/supplies/details/tabs/payments/payments';
import { ComponentDashboardSuppliesDetailsReadings } from '@components/dashboard/supplies/details/tabs/readings/readings';
import { ComponentDashboardSuppliesDetailsOperations } from '@components/dashboard/supplies/details/tabs/operations/operations';

@Component({
  selector: 'page-dashboard-supplies-details',
  imports: [
    CommonModule,
    RouterLink,
    ComponentDashboardSuppliesDetails,
    ComponentDashboardSuppliesDetailsBillings,
    ComponentDashboardSuppliesDetailsPayments,
    ComponentDashboardSuppliesDetailsReadings,
    ComponentDashboardSuppliesDetailsOperations,
  ],
  templateUrl: './details.html',
})
export class PageDashboardSuppliesDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private supplyService = inject(SupplyService);

  supplyId: string | null = null;
  supplyNumber: string | null = null;
  activeTab = 'info';
  isLoading = true;

  ngOnInit(): void {
    this.supplyId = this.route.snapshot.paramMap.get('id');
    if (this.supplyId) {
      this.loadSupply(this.supplyId);
    }
  }

  loadSupply(id: string): void {
    this.isLoading = true;
    this.supplyService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.supplyNumber = res.data.supplyNumber;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
