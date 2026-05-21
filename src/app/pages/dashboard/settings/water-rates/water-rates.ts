import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { LucideBadgeX, LucideBadgeCheck, LucideClock } from "@lucide/angular";
import { ComponentDashboardSettingsWaterTariffsAdd } from "@components/dashboard/settings/water-rates/add/add";
import { WaterTariffService } from '@services/settings/water-tariff.service';
import { WaterTariffConfigurationResponse } from '@core/interfaces/settings/settings.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'page-dashboard-settings-water-rates',
  imports: [
    CommonModule,
    ComponentSharedSearchBox, ComponentSharedPaginator,
    LucideBadgeX,
    LucideBadgeCheck,
    ComponentDashboardSettingsWaterTariffsAdd,
    LucideClock
],
  templateUrl: './water-rates.html',
})
export class PageDashboardSettingsWaterRates implements OnInit {
  private waterTariffService = inject(WaterTariffService);

  tariffs: WaterTariffConfigurationResponse[] = [];
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  searchTerm = '';

  isLoading = false;

  ngOnInit() {
    this.loadTariffs();
  }

  loadTariffs() {
    this.isLoading = true;
    this.waterTariffService.getAll(this.page, this.size, this.searchTerm).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.tariffs = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadTariffs();
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.page = 0;
    this.loadTariffs();
  }

  changeStatus(tariff: WaterTariffConfigurationResponse, newStatus: boolean) {
    const actionText = newStatus ? 'habilitar' : 'deshabilitar';
    Swal.fire({
      title: `¿Estás seguro de ${actionText} la tarifa para ${tariff.zoneName}?`,
      text: "Podrás cambiar esto más adelante.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d33',
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (!newStatus) {
           this.waterTariffService.disable(tariff.id).subscribe({
              next: (res) => {
                if (res.success) {
                  Swal.fire({
                    title: 'Status actualizado',
                    text: res.message || `La tarifa ha sido deshabilitada.`,
                    icon: 'success',
                    confirmButtonColor: '#2563eb'
                  });
                  this.loadTariffs();
                } else {
                  Swal.fire('Error', res.message || 'No se pudo actualizar', 'error');
                }
              },
              error: (err) => Swal.fire('Error', err.error?.message || 'Error en el servidor', 'error')
           });
        } else {
            // El API service proporcionado solo expone "disable"
            Swal.fire('Atención', 'La habilitación de tarifas aún no está soportada por el API.', 'info');
        }
      }
    });
  }


}

