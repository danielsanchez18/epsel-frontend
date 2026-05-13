import { Component } from '@angular/core';
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedFilters } from "@components/shared/filters/filters";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { LucidePrinter, LucideDownload, LucideCreditCard, LucideHandCoins } from "@lucide/angular";

@Component({
  selector: 'page-dashboard-customers-details-payments',
  imports: [
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
export class PageDashboardCustomersDetailsPayments {}
