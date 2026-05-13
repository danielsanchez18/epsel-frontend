import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideMail, LucideUser, LucideCreditCard, LucideFileText, LucideBadgeAlert, LucideDroplets } from "@lucide/angular";

@Component({
  selector: 'page-dashboard-customers-details-general',
  imports: [
    RouterModule,
    LucideMail, LucideUser, LucideCreditCard, LucideFileText, LucideBadgeAlert,
    LucideDroplets
],
  templateUrl: './general.html',
})
export class PageDashboardCustomersDetailsGeneral {}
