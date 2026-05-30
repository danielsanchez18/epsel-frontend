import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideChevronLeft } from '@lucide/angular';
import { BillingService } from '@core/services/billings/billing.service';
import { SupplyService } from '@core/services/supplies/supply.service';
import { PaymentService } from '@core/services/payments/payment.service';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';
import { SupplyDetailsDTO } from '@core/interfaces/supplies/supply.interface';
import { PaymentResponseDTO } from '@interfaces/payments/payment.interface';

// Subcomponents
import { ComponentDashboardCobranzaDetailSupply } from '@components/dashboard/cobranza/details/supply/supply';
import { ComponentDashboardCobranzaDetailBill } from '@components/dashboard/cobranza/details/bill/bill';
import { ComponentDashboardCobranzaDetailActions } from '@components/dashboard/cobranza/details/actions/actions';
import { ComponentDashboardCobranzaDetailCustomer } from '@components/dashboard/cobranza/details/customer/customer';
import { ComponentDashboardCobranzaDetailPayments } from '@components/dashboard/cobranza/details/payments/payments';

@Component({
  selector: 'page-dashboard-cobranza-details',
  imports: [
    CommonModule,
    RouterLink,
    LucideChevronLeft,
    ComponentDashboardCobranzaDetailCustomer,
    ComponentDashboardCobranzaDetailSupply,
    ComponentDashboardCobranzaDetailBill,
    ComponentDashboardCobranzaDetailPayments,
    ComponentDashboardCobranzaDetailActions,
  ],
  templateUrl: './details.html',
})
export class PageDashboardCobranzaDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private billingService = inject(BillingService);
  private supplyService = inject(SupplyService);
  private paymentService = inject(PaymentService);

  billId: string | null = null;
  billing: BillingResponseDTO | null = null;
  supply: SupplyDetailsDTO | null = null;
  payments: PaymentResponseDTO[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.billId = this.route.snapshot.paramMap.get('id');
    if (this.billId) {
      this.loadDetails(this.billId);
    }
  }

  loadDetails(id: string): void {
    this.isLoading = true;
    this.billingService.getById(id).subscribe({
      next: (billingRes) => {
        if (billingRes.success && billingRes.data) {
          this.billing = billingRes.data;

          this.supplyService.getById(this.billing.supplyId).subscribe({
            next: (supplyRes) => {
              if (supplyRes.success && supplyRes.data) {
                this.supply = supplyRes.data;
              }
            },
          });

          this.loadPayments(id);
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadPayments(billingId: string): void {
    this.paymentService.getByBilling(billingId, 0, 50).subscribe({
      next: (paymentsRes) => {
        if (paymentsRes.success && paymentsRes.data) {
          this.payments = paymentsRes.data.content ?? [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onRefresh(): void {
    if (this.billId) {
      this.loadDetails(this.billId);
    }
  }
}
