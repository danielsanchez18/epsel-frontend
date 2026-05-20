import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideSquarePen, LucideBadgeCheck, LucideBadgeX } from "@lucide/angular";
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { ComponentDashboardSettingsOperatingZonesAdd } from "@components/dashboard/settings/operating-zones/add/add";
import { ComponentDashboardSettingsOperatingZonesEdit } from "@components/dashboard/settings/operating-zones/edit/edit";
import { ServiceZoneService } from '@services/settings/service-zone.service';
import { ServiceZoneResponse } from '@core/interfaces/settings/settings.interface';
import Swal from 'sweetalert2';

declare var HSStaticMethods: any;

@Component({
  selector: 'page-dashboard-settings-operating-zones',
  imports: [
    CommonModule,
    LucideSquarePen, LucideBadgeCheck, LucideBadgeX,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    ComponentDashboardSettingsOperatingZonesAdd,
    ComponentDashboardSettingsOperatingZonesEdit
  ],
  templateUrl: './operating-zones.html',
})
export class PageDashboardSettingsOperatingZones implements OnInit {
  private serviceZoneService = inject(ServiceZoneService);

  @ViewChild(ComponentDashboardSettingsOperatingZonesEdit) editModal!: ComponentDashboardSettingsOperatingZonesEdit;

  zones: ServiceZoneResponse[] = [];
  isLoading = true;
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  searchQuery = '';

  ngOnInit() {
    this.loadZones();
  }

  loadZones() {
    this.isLoading = true;
    this.serviceZoneService.getAll(this.page, this.size, this.searchQuery).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.zones = res.data.content;
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

  onSearch(query: string) {
    this.searchQuery = query;
    this.page = 0;
    this.loadZones();
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadZones();
  }

  openEdit(zone: ServiceZoneResponse) {
    this.editModal.open(zone);
  }

  changeStatus(zone: ServiceZoneResponse, newStatus: boolean) {
    const actionText = newStatus ? 'habilitar' : 'deshabilitar';

    Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Deseas ${actionText} la zona "${zone.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviceZoneService.changeStatus(zone.id, newStatus).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                title: '¡Éxito!',
                text: res.message || `Zona ${actionText}da exitosamente.`,
                icon: 'success',
                confirmButtonColor: '#2563eb'
              });
              this.loadZones();
            }
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: err.error?.message || `No se pudo ${actionText} la zona.`,
              icon: 'error',
              confirmButtonColor: '#2563eb'
            });
          }
        });
      }
    });
  }
}
