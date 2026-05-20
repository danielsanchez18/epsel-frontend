import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideBadgeInfo, LucideCalendar1, LucideCalendarCheck, LucideUserCheck } from "@lucide/angular";
import { PageDashboardPropertiesDetailsGeneral } from '../general/general';
import { PropertyService } from '@services/properties/property.service';
import { PropertyResponse, UpdatePropertyRequest } from '@core/interfaces/properties/properties.interface';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'page-dashboard-properties-details-info',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideBadgeInfo, LucideUserCheck,
],
  templateUrl: './info.html',
})
export class PageDashboardPropertiesDetailsInfo implements OnInit, OnDestroy {

  private propertyService = inject(PropertyService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private parent = inject(PageDashboardPropertiesDetailsGeneral);

  editForm: FormGroup;
  property: PropertyResponse | null = null;
  propertyId: string | null = null;

  isLoading = true;
  isSaving = false;
  hasChanges = false;
  private sub!: Subscription;

  constructor() {
    this.editForm = this.fb.group({
      cadastralCode: ['', [Validators.required, Validators.maxLength(50)]],
      latitude: [null, [Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.min(-180), Validators.max(180)]],
      address: ['', [Validators.required, Validators.maxLength(255)]],
      reference: ['', [Validators.maxLength(255)]]
    });

    this.editForm.valueChanges.subscribe(val => {
      if (!this.property) return;
      this.hasChanges =
        val.cadastralCode !== this.property.cadastralCode ||
        val.latitude !== this.property.latitude ||
        val.longitude !== this.property.longitude ||
        val.address !== this.property.address ||
        (val.reference || '') !== (this.property.reference || '');
    });
  }

  ngOnInit() {
    // Obtenemos el ID desde la ruta de manera responsiva (asumiendo que está en el parent, e.g. /properties/:id/info)
    this.sub = this.route.parent!.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.propertyId = id;
        this.loadProperty(id);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  loadProperty(id: string) {
    this.isLoading = true;
    this.propertyService.getById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.property = res.data;
          this.editForm.patchValue({
            cadastralCode: this.property.cadastralCode,
            latitude: this.property.latitude,
            longitude: this.property.longitude,
            address: this.property.address,
            reference: this.property.reference
          }, { emitEvent: false }); // evita que se marque como "hasChanges" de inmediato
          this.hasChanges = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  saveChanges() {
    if (this.editForm.invalid || !this.propertyId) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload: UpdatePropertyRequest = this.editForm.value;

    this.propertyService.update(this.propertyId, payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success && res.data) {
          this.property = res.data;
          this.hasChanges = false;
          // Actualizamos de nuevo por si el servidor limpió algo
          this.editForm.patchValue(this.property, { emitEvent: false });

          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Los datos del predio han sido guardados correctamente.',
            confirmButtonColor: '#2563eb'
          });
        }
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Hubo un problema al intentar guardar los cambios.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  getTypeLabel(type: string): string {
    if (type === 'HOUSE') return 'Casa';
    if (type === 'BUSINESS') return 'Local comercial';
    if (type === 'INDUSTRIAL') return 'Industrial';
    return type;
  }

}
