import { TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PublicUrlPipe } from '@core/pipes/public-url.pipe';
import { ApiResponse } from '@interfaces/shared/api-response.interface';
import { UserResponse } from '@interfaces/users/user.interface';
import { LucideActivity, LucideLock, LucideUser, LucideMail } from '@lucide/angular';
import { UserService } from '@services/users/user.service';

@Component({
  selector: 'page-dashboard-workers-details-general',
  imports: [
    RouterModule,
    LucideUser, LucideActivity, LucideLock,
    PublicUrlPipe,
    LucideMail
],
  templateUrl: './general.html',
})
export class PageDashboardWorkersDetailsGeneral implements OnInit {

  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  user: UserResponse | null = null;
  isLoading = true;


  ngOnInit(): void {
    const id = this.route.pathFromRoot
      .map((route) => route.snapshot.paramMap.get('id'))
      .find((value): value is string => !!value);

    if (!id) {
      this.isLoading = false;
      return;
    }

    this.userService.getById(id).subscribe({
      next: (response: ApiResponse<UserResponse>) => {
        this.user = response.data;
        this.isLoading = false;
        console.log('Usuario cargado:', this.user);
      },
      error: (error) => {
        console.error('Error al cargar la información del usuario', error);
        this.isLoading = false;
      }
    });
  }


}
