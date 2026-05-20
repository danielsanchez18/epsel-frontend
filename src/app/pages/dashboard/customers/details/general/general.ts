import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LucideMail, LucideUser, LucideCreditCard, LucideFileText, LucideBadgeAlert, LucideDroplets } from "@lucide/angular";
import { BehaviorSubject } from 'rxjs';
import { CustomerService } from '@services/customers/customer.service';
import { CustomerResponse } from '@interfaces/customers/customer.interface';

@Component({
  selector: 'page-dashboard-customers-details-general',
  imports: [
    CommonModule,
    RouterModule,
    LucideMail, LucideUser, LucideCreditCard, LucideFileText, LucideBadgeAlert,
    LucideDroplets
],
  templateUrl: './general.html',
})
export class PageDashboardCustomersDetailsGeneral implements OnInit {
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);

  private customerSubject = new BehaviorSubject<CustomerResponse | null>(null);
  public customer$ = this.customerSubject.asObservable();

  customerId: string | null = null;
  isLoading = true;

  ngOnInit() {
    this.customerId = this.route.snapshot.paramMap.get('id') || null;
    if (this.customerId) {
      this.loadCustomer();
    }
  }

  loadCustomer() {
    this.isLoading = true;
    this.customerService.getById(this.customerId!).subscribe({
      next: (res) => {
        if (res.success) {
          this.customerSubject.next(res.data);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customer:', err);
        this.isLoading = false;
      }
    });
  }

  updateCustomerData(data: CustomerResponse) {
    this.customerSubject.next(data);
  }
}
