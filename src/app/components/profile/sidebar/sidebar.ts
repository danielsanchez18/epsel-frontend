import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  LucideLayout,
  LucideLock,
  LucideLogOut,
  LucideUser,
} from '@lucide/angular';
import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'component-profile-sidebar',
  imports: [
    RouterModule,
    LucideUser,
    LucideLock,
    LucideLayout,
    LucideLogOut,
  ],
  templateUrl: './sidebar.html',
})
export class ComponentProfileSidebar {
  private authService = inject(AuthService);

  onLogout() {
    this.authService.logout();
  }
}
