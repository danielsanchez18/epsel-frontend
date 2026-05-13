import { Component } from '@angular/core';
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedFilters } from "@components/shared/filters/filters";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { LucideSettings, LucideBadgeCheck, LucideSquarePen, LucideTrash2, LucideBadgeX, LucideCable, LucideCircleDollarSign, LucideScissors } from "@lucide/angular";

@Component({
  selector: 'page-dashboard-settings-service-costs',
  imports: [
    ComponentSharedSearchBox, ComponentSharedFilters, ComponentSharedPaginator,
    LucideSettings,
    LucideBadgeCheck,
    LucideSquarePen,
    LucideTrash2,
    LucideBadgeX,
    LucideCable,
    LucideCircleDollarSign,
    LucideScissors
],
  templateUrl: './service-costs.html',
})
export class PageDashboardSettingsServiceCosts {}
