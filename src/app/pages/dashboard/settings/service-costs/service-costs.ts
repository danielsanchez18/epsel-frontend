import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { LucideSettings, LucideBadgeCheck, LucideSquarePen, LucideTrash2, LucideBadgeX, LucideCable, LucideCircleDollarSign, LucideScissors, LucideMoreHorizontal } from "@lucide/angular";
import { ComponentDashboardSettingsServiceCostsAdd } from "@components/dashboard/settings/service-costs/add/add";
import { ComponentDashboardSettingsServiceCostsEdit } from "@components/dashboard/settings/service-costs/edit/edit";
import { ServiceFeeService } from '@services/settings/service-fee.service';
import { ServiceFeeConfigurationResponse } from '@core/interfaces/settings/settings.interface';
import Swal from 'sweetalert2';

declare var HSStaticMethods: any;

@Component({
  selector: 'page-dashboard-settings-service-costs',
  imports: [
    CommonModule,
    ComponentSharedPaginator,
    LucideSettings, LucideBadgeCheck, LucideSquarePen, LucideBadgeX, LucideCable, LucideCircleDollarSign, LucideScissors, LucideMoreHorizontal,
    ComponentDashboardSettingsServiceCostsAdd,
    ComponentDashboardSettingsServiceCostsEdit
],
  templateUrl: './service-costs.html',
})
export class PageDashboardSettingsServiceCosts implements OnInit {
  private serviceFeeService = inject(ServiceFeeService);

  @ViewChild(ComponentDashboardSettingsServiceCostsEdit) editModal!: ComponentDashboardSettingsServiceCostsEdit;

  costs: ServiceFeeConfigurationResponse[] = [];
  isLoading = true;
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  selectedFeeType = '';

  ngOnInit() {
    this.loadCosts();
  }

  loadCosts() {
    this.isLoading = true;
    this.serviceFeeService.getAll(this.page, this.size, undefined, this.selectedFeeType).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.costs = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
        }
        this.isLoading = false;
        setTimeout(() => {
          if (typeof HSStaticMethods !== 'undefined') {
            HSStaticMethods.autoInit();
          }
        }, 100);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedFeeType = target.value;
    this.page = 0;
    this.loadCosts();
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadCosts();
  }

  getFeeIcon(type: string): any {
    switch (type) {
      case 'INSTALLATION': return 'lucideSettings';
      case 'RECONNECTION': return 'lucideCable';
      case 'CUT': return 'lucideScissors';
      case 'PENALTY': return 'lucideCircleDollarSign';
      case 'OTHER': return 'lucideMoreHorizontal';
      default: return 'lucideMoreHorizontal';
    }
  }

  getFeeLabel(type: string): string {
    switch (type) {
      case 'INSTALLATION': return 'Instalación';
      case 'RECONNECTION': return 'Reconexión';
      case 'CUT': return 'Corte';
      case 'PENALTY': return 'Multa';
      case 'OTHER': return 'Otro';
      default: return type;
    }
  }

  openEdit(cost: ServiceFeeConfigurationResponse) {
    this.editModal.open(cost);
  }

  changeStatus(cost: ServiceFeeConfigurationResponse, newStatus: boolean) {
    const actionText = newStatus ? 'habilitar' : 'deshabilitar';

    Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Deseas ${actionText} el costo de "${this.getFeeLabel(cost.feeType)}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviceFeeService.update(cost.id, { active: newStatus }).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                title: '¡Éxito!',
                text: `Costo ${actionText}do exitosamente.`,
                icon: 'success',
                confirmButtonColor: '#2563eb'
              });
              this.loadCosts();
            }
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: err.error?.message || `No se pudo ${actionText} el costo.`,
              icon: 'error',
              confirmButtonColor: '#2563eb'
            });
          }
        });
      }
    });
  }
}
