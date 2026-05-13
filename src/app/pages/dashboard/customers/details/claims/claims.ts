import { Component } from '@angular/core';
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedFilters } from "@components/shared/filters/filters";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { LucideBadgeAlert, LucideBadgeCheck } from "@lucide/angular";

@Component({
  selector: 'page-dashboard-customers-details-claims',
  imports: [
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedPaginator,
    LucideBadgeAlert,
    LucideBadgeCheck
],
  templateUrl: './claims.html',
})
export class PageDashboardCustomersDetailsClaims {}
