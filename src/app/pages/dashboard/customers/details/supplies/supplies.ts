import { Component } from '@angular/core';
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedFilters } from "@components/shared/filters/filters";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { LucideBadgeCheck } from "@lucide/angular";

@Component({
  selector: 'page-dashboard-customers-details-supplies',
  imports: [
    ComponentSharedSearchBox, ComponentSharedFilters,
    ComponentSharedPaginator,
    LucideBadgeCheck
],
  templateUrl: './supplies.html',
})
export class PageDashboardCustomerDetailsSupplies {}
