import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, DoCheck } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageDashboardWorkersDetailsGeneral } from '../general/general';
import { UserService } from '@services/users/user.service';
import { RoleService } from '@services/users/role.service';
import { RoleResponse } from '@core/interfaces/users/role.interface';
import { UpdateUser } from '@core/interfaces/users/user.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'page-dashboard-workers-details-security',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './security.html',
})
export class PageDashboardWorkersDetailsSecurity implements OnInit, DoCheck {

  public parent = inject(PageDashboardWorkersDetailsGeneral);
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  roles: RoleResponse[] = [];
  selectedRoleId: string = '';
  originalRoleId: string = '';
  isInitialized = false;

  ngOnInit(): void {
    this.roleService.getAll().subscribe({
      next: (res) => this.roles = res.data ?? [],
      error: (err) => console.error('Error cargando roles', err)
    });
  }

  ngDoCheck(): void {
    if (!this.isInitialized && this.parent.user && this.roles.length > 0) {
       const userRole = this.parent.user.role;
       const foundRole = this.roles.find(r => r.name === userRole);
       if (foundRole) {
         this.originalRoleId = foundRole.id;
         this.selectedRoleId = foundRole.id;
       }
       this.isInitialized = true;
    }
  }

  get showSaveRoleBtn(): boolean {
    return !!this.selectedRoleId && this.selectedRoleId !== this.originalRoleId;
  }

  get isSuspended(): boolean {
    return this.parent.user?.status === 'SUSPENDED';
  }

  get isActive(): boolean {
    return this.parent.user?.status === 'ACTIVE';
  }

  get isEditable(): boolean {
    return this.parent.user?.status === 'ACTIVE';
  }

  async saveRole(): Promise<void> {
    if (!this.isEditable) {
      void Swal.fire('No editable', 'No se pueden editar datos de un trabajador inactivo o eliminado.', 'info');
      return;
    }
    if (!this.showSaveRoleBtn) return;

    const result = await Swal.fire({
      title: '¿Cambiar rol?',
      text: 'Se modificará el rol actual del usuario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const u = this.parent.user!;
      const payload: UpdateUser = {
        names: u.names,
        lastNames: u.lastNames,
        phone: u.phone,
        email: u.email,
        roleId: this.selectedRoleId
      };

      this.userService.update(this.parent.user!.id!, payload).subscribe({
        next: (resp) => {
          this.parent.user = resp.data;
          this.originalRoleId = this.selectedRoleId;
          void Swal.fire('Rol actualizado', 'El rol ha sido cambiado.', 'success');
        },
        error: (err) => void Swal.fire('Error', err.error?.message || 'No se pudo cambiar el rol', 'error')
      });
    }
  }

  async toggleStatus(): Promise<void> {
    const isCurrentlyActive = this.isActive;
    const newStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
    const actionText = isCurrentlyActive ? 'Deshabilitar' : 'Habilitar';

    const result = await Swal.fire({
      title: `¿${actionText} cuenta?`,
      text: `El usuario pasará a estado ${actionText.toLowerCase()}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${actionText.toLowerCase()}`,
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      this.userService.changeStatus(this.parent.user!.id!, newStatus).subscribe({
        next: () => {
          this.parent.user!.status = newStatus;
          void Swal.fire('Estado actualizado', `Cuenta ha sido ${newStatus === 'ACTIVE' ? 'habilitada' : 'deshabilitada'}.`, 'success');
        },
        error: (err) => void Swal.fire('Error', err.error?.message || 'No se pudo cambiar estado', 'error')
      });
    }
  }

  async deleteAccount(): Promise<void> {
    if (!this.isEditable) {
      void Swal.fire('No editable', 'No se pueden editar datos de un trabajador inactivo o eliminado.', 'info');
      return;
    }
    const result = await Swal.fire({
      title: '¿Eliminar cuenta?',
      text: 'Esta acción deshabilitará la cuenta de forma irreversible.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      this.userService.delete(this.parent.user!.id!).subscribe({
        next: () => {
          this.parent.user!.status = 'SUSPENDED';
          void Swal.fire('Cuenta eliminada', 'El usuario ha sido suspendido permanentemente.', 'success');
        },
        error: (err) => void Swal.fire('Error', err.error?.message || 'No se pudo eliminar cuenta', 'error')
      });
    }
  }

}
