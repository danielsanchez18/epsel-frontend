import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WaterTariffService } from '@services/settings/water-tariff.service';
import { ServiceZoneService } from '@services/settings/service-zone.service';
import { ServiceZoneResponse } from '@core/interfaces/settings/settings.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'component-dashboard-settings-water-tariffs-add',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add.html',
})
export class ComponentDashboardSettingsWaterTariffsAdd implements OnInit {

  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;

  private waterTariffService = inject(WaterTariffService);
  private serviceZoneService = inject(ServiceZoneService);
  private fb = inject(FormBuilder);

  addForm: FormGroup;
  isLoading = false;
  zones: ServiceZoneResponse[] = [];

  constructor() {
    this.addForm = this.fb.group({
      zoneId: ['', [Validators.required]],
      pricePerM3: [null, [Validators.required, Validators.min(0)]],
      fixedCharge: [null, [Validators.required, Validators.min(0)]],
      taxPercentage: [18, [Validators.required, Validators.min(0), Validators.max(100)]],
      effectiveDate: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadZones();
  }

  loadZones() {
    // Cargamos un límite alto de zonas activas para el select
    this.serviceZoneService.getAll(0, 1000, '', true).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.zones = res.data.content;
        }
      }
    });
  }

  onSubmit() {
    if (this.addForm.invalid) return;

    this.isLoading = true;
    const payload = this.addForm.value;

    this.waterTariffService.create(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res.message || 'Tarifa de agua creada exitosamente',
            confirmButtonColor: '#2563eb'
          }).then(() => {
            if (this.closeButton) {
              this.closeButton.nativeElement.click();
            }
            window.location.reload();
          });
          this.addForm.reset({ pricePerM3: null, fixedCharge: null, taxPercentage: 18, zoneId: '', effectiveDate: '' });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'Ocurrió un error al registrar la tarifa',
            confirmButtonColor: '#2563eb'
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Error de conexión con el servidor.',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

}
