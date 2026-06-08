import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { LucideLoader } from '@lucide/angular';

import { SupplyService } from '@services/supplies/supply.service';
import { MeterReadingService } from '@services/readings/meter-reading.service';
import { OcrService } from '@services/ocr/ocr.service';
import { SupplyResponseDTO } from '@core/interfaces/supplies/supply.interface';
import { CreateMeterReadingDTO } from '@interfaces/readings/meter-reading.interface';

@Component({
  selector: 'component-dashboard-readings-ocr',
  imports: [CommonModule, ReactiveFormsModule, LucideLoader],
  templateUrl: './ocr.html',
})
export class ComponentDashboardReadingsOcr implements OnInit {
  @ViewChild('closeButtonOcr') closeButton!: ElementRef<HTMLButtonElement>;

  private fb = inject(FormBuilder);
  private supplyService = inject(SupplyService);
  private readingService = inject(MeterReadingService);
  private ocrService = inject(OcrService);

  ocrForm: FormGroup;
  searchSupplyForm: FormGroup;

  supplies: SupplyResponseDTO[] = [];
  selectedSupply: SupplyResponseDTO | null = null;

  isSearching = false;
  isLoading = false;
  isOcrLoading = false;

  selectedImage?: File | null = null;
  imagePreview?: string | null = null;

  ocrConfidence: number | null = null;

  constructor() {
    this.searchSupplyForm = this.fb.group({
      supplyNumber: [''],
    });

    this.ocrForm = this.fb.group({
      supplyId: ['', [Validators.required]],
      currentReading: ['', [Validators.required, Validators.min(0)]],
      observations: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit() {
    this.onSupplySearch();
  }

  onSupplySearch() {
    this.searchSupplyForm
      .get('supplyNumber')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term && term.length >= 3) {
            this.isSearching = true;
            return this.supplyService.findAll(0, 5, term);
          } else {
            this.supplies = [];
            return of(null);
          }
        }),
      )
      .subscribe({
        next: (res) => {
          this.isSearching = false;
          if (res && res.success && res.data) {
            this.supplies = res.data.content;
          }
        },
        error: () => {
          this.isSearching = false;
          this.supplies = [];
        },
      });
  }

  selectSupply(supply: SupplyResponseDTO) {
    this.selectedSupply = supply;
    this.ocrForm.patchValue({ supplyId: supply.id });
    this.supplies = [];
    this.searchSupplyForm
      .get('supplyNumber')
      ?.setValue(supply.supplyNumber, { emitEvent: false });
  }

  resetSupplySelection() {
    this.selectedSupply = null;
    this.ocrForm.patchValue({ supplyId: '' });
    this.searchSupplyForm.reset();
    this.supplies = [];
    this.selectedImage = null;
    this.imagePreview = null;
    this.ocrConfidence = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedImage = null;
      this.imagePreview = null;
      this.ocrConfidence = null;
      this.ocrForm.patchValue({ currentReading: '' });
      return;
    }

    const file = input.files[0];
    const maxSize = 5_242_880; // 5MB para permitir fotos de cǭmara de alta resolucin
    if (file.size > maxSize) {
      Swal.fire({
        title: 'Imagen muy pesada',
        text: 'La imagen debe pesar mǭximo 5MB.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb',
      });
      input.value = '';
      this.selectedImage = null;
      this.imagePreview = null;
      return;
    }

    this.selectedImage = file;
    this.imagePreview = URL.createObjectURL(file);

    // Procesar OCR automǭticamente al subir la foto
    this.processOcr(file);
  }

  processOcr(file: File) {
    this.isOcrLoading = true;
    this.ocrConfidence = null;
    this.ocrService.readMeter(file).subscribe({
      next: (res) => {
        this.isOcrLoading = false;
        if (res.success && res.data) {
          if (res.data.reading !== null && res.data.reading !== undefined) {
            this.ocrForm.patchValue({ currentReading: res.data.reading });
            this.ocrConfidence = res.data.confidence;

            // Validar si la lectura es coherente con la anterior automǭticamente y avisar
            if (
              this.selectedSupply &&
              this.selectedSupply.lastReading !== undefined
            ) {
              if (res.data.reading < this.selectedSupply.lastReading) {
                Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'warning',
                  title:
                    'La lectura detectada es menor a la anterior. Verifica la imagen.',
                  showConfirmButton: false,
                  timer: 5000,
                });
              } else {
                Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'success',
                  title: 'Lectura detectada correctamente.',
                  showConfirmButton: false,
                  timer: 3000,
                });
              }
            }
          } else {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: 'No se detect ningǧn nǧmero legible.',
              showConfirmButton: false,
              timer: 3000,
            });
            this.ocrForm.patchValue({ currentReading: '' });
          }
        }
      },
      error: (err) => {
        this.isOcrLoading = false;
        console.error('Error OCR', err);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al procesar la imagen con OCR.',
          showConfirmButton: false,
          timer: 3000,
        });
      },
    });
  }

  onSubmit() {
    if (this.ocrForm.invalid) {
      this.ocrForm.markAllAsTouched();
      return;
    }

    if (this.selectedSupply && this.selectedSupply.lastReading !== undefined) {
      const current = Number(this.ocrForm.value.currentReading);
      if (current < this.selectedSupply.lastReading) {
        Swal.fire({
          icon: 'warning',
          title: 'Lectura incoherente',
          text: `La lectura actual (${current}) no puede ser menor que la ǧltima lectura registrada (${this.selectedSupply.lastReading}).`,
          confirmButtonColor: '#2563eb',
        });
        return;
      }
    }

    this.isLoading = true;

    const payload: CreateMeterReadingDTO = {
      supplyId: this.ocrForm.value.supplyId,
      currentReading: Number(this.ocrForm.value.currentReading),
      readingDate: new Date().toISOString().slice(0, 10), // Today YYYY-MM-DD
      meterPhotoUrl: null, // El backend deberǭa encargarse de subirla
      observations: this.ocrForm.value.observations || null,
      ocrValue: this.selectedImage
        ? String(this.ocrForm.value.currentReading)
        : null,
    };

    // Usamos el selectedImage real para enviarlo como foto del medidor
    this.readingService
      .create(payload, this.selectedImage ?? undefined)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            Swal.fire({
              icon: 'success',
              title: 'Éxito!',
              text:
                res.message || 'Lectura de medidor registrada exitosamente.',
              confirmButtonColor: '#2563eb',
            }).then(() => {
              this.closeButton.nativeElement.click();
              window.location.reload();
            });
            this.ocrForm.reset();
            this.resetSupplySelection();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text:
                res.message ||
                'Ocurri un error inesperado al registrar la lectura.',
              confirmButtonColor: '#2563eb',
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || 'Error de conexin con el servidor.',
            confirmButtonColor: '#2563eb',
          });
        },
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
