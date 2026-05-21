import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideBell, LucideSearch, LucideCircleQuestionMark, LucideUserCircle, LucideLogOut } from '@lucide/angular';
import { AuthService } from '@services/auth/auth.service';
import { UserService } from '@core/services/users/user.service';
import { UserResponse } from '@core/interfaces/users/user.interface';
import { PublicUrlPipe } from '@core/pipes/public-url.pipe';

@Component({
  selector: 'component-dashboard-shared-header',
  imports: [
    CommonModule,
    LucideBell,
    LucideCircleQuestionMark,
    LucideSearch,
    LucideUserCircle,
    PublicUrlPipe,
    LucideLogOut
],
  templateUrl: './header.html',
})
export class ComponentDashboardSharedHeader implements OnInit {

  private auth = inject(AuthService);
  private userService = inject(UserService);

  sessionUser = this.auth.getUser();
  usuario: UserResponse | null = null;

  ngOnInit() {
    if (this.sessionUser?.userId) {
      this.userService.getById(this.sessionUser.userId).subscribe({
        next: (response) => {
          this.usuario = response.data;
        }
      });
    }
  }

  onLogout() {
    this.auth.logout();
  }

}
