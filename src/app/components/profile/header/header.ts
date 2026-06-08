import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicUrlPipe } from '@core/pipes/public-url.pipe';
import { UserResponse } from '@interfaces/users/user.interface';
import { AuthService } from '@services/auth/auth.service';
import { UserService } from '@services/users/user.service';
import {
  LucideBell,
  LucideCircleQuestionMark,
  LucideUserCircle,
  LucideLogOut,
  LucideUser,
  LucideSettings,
  LucideLock,
} from '@lucide/angular';

@Component({
  selector: 'component-profile-header',
  imports: [
    CommonModule,
    LucideBell,
    LucideCircleQuestionMark,
    LucideUserCircle,
    LucideUser,
    LucideSettings,
    LucideLock,
    PublicUrlPipe,
    LucideLogOut,
    RouterLink,
  ],
  templateUrl: './header.html',
})
export class ComponentProfileHeader {
  private auth = inject(AuthService);
  private userService = inject(UserService);

  sessionUser = this.auth.getUser();
  usuario: UserResponse | null = null;

  ngOnInit() {
    if (this.sessionUser?.userId) {
      this.userService.getById(this.sessionUser.userId).subscribe({
        next: (response) => {
          this.usuario = response.data;
        },
      });
    }
  }

  onLogout() {
    this.auth.logout();
  }
}
