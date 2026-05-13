import { Component } from '@angular/core';
import { LucideUser, LucideBadgeX, LucideUserCheck } from "@lucide/angular";

@Component({
  selector: 'page-dashboard-properties-details-affiliated-clients',
  imports: [
    LucideUser,
    LucideBadgeX,
    LucideUserCheck
],
  templateUrl: './affiliated-clients.html',
})
export class PageDashboardPropertiesDetailsAffiliatedClients {}
