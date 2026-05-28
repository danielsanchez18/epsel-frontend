import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { LucideLoader } from '@lucide/angular';

import { SupplyService } from '@services/supplies/supply.service';
import { MeterReadingService } from '@services/readings/meter-reading.service';
import { SupplyResponseDTO } from '@core/interfaces/supplies/supply.interface';
import { CreateMeterReadingDTO } from '@interfaces/readings/meter-reading.interface';

@Component({
  selector: 'component-dashboard-readings-add',
  imports: [CommonModule, ReactiveFormsModule, LucideLoader],
  templateUrl: './add.html',
})
export class ComponentDashboardReadingsAdd implements OnInit {
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;

  private fb = inject(FormBuilder);
  private supplyService = inject(SupplyService);
  private readingService = inject(MeterReadingService);

  addForm: FormGroup;
  searchSupplyForm: FormGroup;

  supplies: SupplyResponseDTO[] = [];
  selectedSupply: SupplyResponseDTO | null = null;

  isSearching = false;
  isLoading = false;

  selectedImage?: File | null = null;
  imagePreview?: string | null = null;

  constructor() {
    this.searchSupplyForm = this.fb.group({
      supplyNumber: [''],
    });

    this.addForm = this.fb.group({
      supplyId: ['', [Validators.required]],
      currentReading: ['', [Validators.required, Validators.min(0)]],
      observations: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.onSupplySearch();
  }

  onSupplySearch() {
    this.searchSupplyForm.get('supplyNumber')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(term => {
        if (term && term.length >= 3) {
          this.isSearching = true;
          return this.supplyService.findAll(0, 5, term);
        } else {
          this.supplies = [];
          return of(null);
        }
      })
    ).subscribe({
      next: (res) => {
        this.isSearching = false;
        if (res && res.success && res.data) {
          this.supplies = res.data.content;
        }
      },
      error: () => {
        this.isSearching = false;
        this.supplies = [];
      }
    });
  }

  selectSupply(supply: SupplyResponseDTO) {
    this.selectedSupply = supply;
    this.addForm.patchValue({ supplyId: supply.id });
    this.supplies = [];
    this.searchSupplyForm.get('supplyNumber')?.setValue(supply.supplyNumber, { emitEvent: false });
  }

  resetSupplySelection() {
    this.selectedSupply = null;
    this.addForm.patchValue({ supplyId: '' });
    this.searchSupplyForm.reset();
    this.supplies = [];
    this.selectedImage = null;
    this.imagePreview = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedImage = null;
      this.imagePreview = null;
      return;
    }

    const file = input.files[0];
    const maxSize = 1_048_576; // 1MB
    if (file.size > maxSize) {
      Swal.fire({
        title: 'Imagen muy pesada',
        text: 'La imagen debe pesar máximo 1MB.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb'
      });
      input.value = '';
      this.selectedImage = null;
      this.imagePreview = null;
      return;
    }

    this.selectedImage = file;
    this.imagePreview = URL.createObjectURL(file);
  }

  onSubmit() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    if (this.selectedSupply && this.selectedSupply.lastReading !== undefined) {
      const current = Number(this.addForm.value.currentReading);
      if (current < this.selectedSupply.lastReading) {
        Swal.fire({
          icon: 'warning',
          title: 'Lectura incoherente',
          text: `La lectura actual (${current}) no puede ser menor que la última lectura registrada (${this.selectedSupply.lastReading}).`,
          confirmButtonColor: '#2563eb'
        });
        return;
      }
    }

    this.isLoading = true;

    const mockPhotoUrl = this.selectedImage 
      ? 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400'
      : null;

    const payload: CreateMeterReadingDTO = {
      supplyId: this.addForm.value.supplyId,
      currentReading: Number(this.addForm.value.currentReading),
      readingDate: new Date().toISOString().slice(0, 10), // Today YYYY-MM-DD
      meterPhotoUrl: mockPhotoUrl,
      observations: this.addForm.value.observations || null,
      ocrValue: this.selectedImage ? String(Math.floor(this.addForm.value.currentReading)) : null
    };

    this.readingService.create(payload, this.selectedImage ?? undefined).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res.message || 'Lectura de medidor registrada exitosamente.',
            confirmButtonColor: '#2563eb'
          }).then(() => {
            this.closeButton.nativeElement.click();
            window.location.reload();
          });
          this.addForm.reset();
          this.resetSupplySelection();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'Ocurrió un error inesperado al registrar la lectura.',
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

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      event.key !== 'Backspace' &&
      event.key !== 'Tab' &&
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      (charCode < 48 || charCode > 57)
    ) {
      event.preventDefault();
    }
  }
}
