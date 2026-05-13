import { Component } from '@angular/core';
import { LucideBell, LucideSearch, LucideCircleQuestionMark } from '@lucide/angular';

@Component({
  selector: 'component-dashboard-shared-header',
  imports: [
    LucideBell,
    LucideCircleQuestionMark,
    LucideSearch
],
  templateUrl: './header.html',
})
export class ComponentDashboardSharedHeader {}
