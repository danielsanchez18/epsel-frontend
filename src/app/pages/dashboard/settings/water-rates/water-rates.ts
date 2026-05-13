import { Component } from '@angular/core';
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedFilters } from "@components/shared/filters/filters";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { LucideTrash2, LucideBadgeX, LucideSquarePen, LucideBadgeCheck } from "@lucide/angular";

@Component({
  selector: 'page-dashboard-settings-water-rates',
  imports: [
    ComponentSharedSearchBox, ComponentSharedFilters, ComponentSharedPaginator,
    LucideTrash2,
    LucideBadgeX,
    LucideSquarePen,
    LucideBadgeCheck
],
  templateUrl: './water-rates.html',
})
export class PageDashboardSettingsWaterRates {}
