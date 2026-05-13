import { Component } from '@angular/core';
import { LucideSquarePen, LucideBadgeCheck, LucideTrash2 } from "@lucide/angular";
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedFilters } from "@components/shared/filters/filters";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";

@Component({
  selector: 'page-dashboard-settings-operating-zones',
  imports: [
    LucideSquarePen, LucideBadgeCheck,
    LucideTrash2,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedPaginator
],
  templateUrl: './operating-zones.html',
})
export class PageDashboardSettingsOperatingZones {}
