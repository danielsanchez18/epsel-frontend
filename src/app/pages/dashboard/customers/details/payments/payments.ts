import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedFilters } from "@components/shared/filters/filters";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { LucidePrinter, LucideDownload, LucideCreditCard, LucideHandCoins } from "@lucide/angular";
import { PaymentService } from '@services/payments/payment.service';

@Component({
  selector: 'page-dashboard-customers-details-payments',
  imports: [
    CommonModule,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedPaginator,
    LucidePrinter,
    LucideDownload,
    LucideCreditCard,
    LucideHandCoins
  ],
  templateUrl: './payments.html',
})
export class PageDashboardCustomersDetailsPayments implements OnInit {
  private paymentService = inject(PaymentService);
  private route = inject(ActivatedRoute);

  payments: any[] = [];
  customerId: string | null = null;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  isLoading = true;

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') || 
                      this.route.parent?.snapshot.paramMap.get('id') || 
                      null;
    if (this.customerId) {
      this.loadPayments();
    }
  }

  loadPayments(page: number = 0): void {
    if (!this.customerId) return;
    this.isLoading = true;
    this.currentPage = page;
    this.paymentService.getByCustomer(this.customerId, page, this.pageSize).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.payments = res.data.content;
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customer payments:', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.loadPayments(page);
  }
}

