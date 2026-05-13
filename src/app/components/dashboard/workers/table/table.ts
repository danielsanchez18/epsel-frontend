import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideUserCog, LucideBadgeCheck, LucideShieldCheck, LucideUserPen, LucideUserStar, LucideUserSearch, LucideTrash2, LucideCircleX } from '@lucide/angular';
import { UserResponse } from '@interfaces/users/user.interface';
import { PublicUrlPipe } from '@core/pipes/public-url.pipe';

@Component({
  selector: 'component-dashboard-workers-table',
  imports: [
    CommonModule,
    RouterLink,
    LucideUserCog, LucideBadgeCheck, LucideShieldCheck, LucideUserPen, LucideUserStar, LucideUserSearch,
    PublicUrlPipe,
    LucideTrash2,
    LucideCircleX
],
  templateUrl: './table.html',
})
export class ComponentDashboardWorkersTable {

  @Input() users: UserResponse[] = [];
  @Input() isLoading = false;

}
