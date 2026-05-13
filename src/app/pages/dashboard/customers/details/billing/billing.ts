import { Component } from '@angular/core';
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedFilters } from "@components/shared/filters/filters";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { LucideBadgeCheck, LucideDownload, LucidePrinter, LucideBadgeAlert } from "@lucide/angular";

@Component({
  selector: 'page-dashboard-customers-details-billing',
  imports: [
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedPaginator,
    LucideBadgeCheck, LucideDownload, LucidePrinter,
    LucideBadgeAlert
],
  templateUrl: './billing.html',
})
export class PageDashboardCustomersDetailsBilling {}
