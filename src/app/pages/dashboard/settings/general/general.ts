import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'page-dashboard-settings-general',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
],
  templateUrl: './general.html',
})
export class PageDashboardSettingsGeneral {}
