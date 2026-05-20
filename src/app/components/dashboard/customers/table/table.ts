import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideUserCog, LucideBadgeCheck, LucideShieldCheck, LucideUserPen, LucideUserStar, LucideUserSearch, LucideTrash2, LucideCircleX } from '@lucide/angular';
import { CustomerResponse } from '@interfaces/customers/customer.interface';
import { PublicUrlPipe } from '@core/pipes/public-url.pipe';

@Component({
  selector: 'component-dashboard-customers-table',
  imports: [
    CommonModule,
    RouterLink,
],
  templateUrl: './table.html',
})
export class ComponentDashboardCustomersTable {

  @Input() customers: CustomerResponse[] = [];
  @Input() isLoading = false;

}
