import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '@services/customers/customer.service';
import { CreateCustomerRequest } from '@interfaces/customers/customer.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'component-dashboard-customers-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add.html',
})
export class ComponentDashboardCustomersAdd implements OnInit {

  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;

  private customerService = inject(CustomerService);

  addForm: FormGroup;
  customerTypeSelected: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder) {
    this.addForm = this.fb.group({
      customerType: ['', Validators.required],
      documentNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]]
    });
  }

  ngOnInit() {
    this.addForm.get('customerType')?.valueChanges.subscribe(value => {
      this.customerTypeSelected = value;
      const docControl = this.addForm.get('documentNumber');
      if (value === 'PERSON') {
        docControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
      } else if (value === 'COMPANY') {
        docControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{11}$')]);
      } else {
        docControl?.setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      }
      docControl?.updateValueAndValidity();
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

  allowOnlyLetters(event: KeyboardEvent) {
    const key = event.key;
    // Allow control/navigation keys
    const allowedControls = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedControls.includes(key)) return;
    // Prevent digits
    if (/\d/.test(key)) {
      event.preventDefault();
    }
  }

  handleNamePaste(event: ClipboardEvent) {
    const paste = event.clipboardData?.getData('text') || '';
    if (/\d/.test(paste)) {
      // Filter out digits and insert cleaned text
      event.preventDefault();
      const filtered = paste.replace(/\d/g, '');
      const input = event.target as HTMLInputElement;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const value = input.value || '';
      const newValue = value.slice(0, start) + filtered + value.slice(end);
      input.value = newValue;
      input.dispatchEvent(new Event('input'));
    }
  }

  onSubmit() {
    if (this.addForm.invalid) return;

    this.isLoading = true;

    const formData = this.addForm.value;
    const payload: CreateCustomerRequest = {
      type: formData.customerType,
      documentNumber: formData.documentNumber,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone
    };

    this.customerService.create(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: response.message || 'Cliente creado exitosamente',
            confirmButtonColor: '#2563eb'
          }).then(() => {
            this.closeButton.nativeElement.click();
            window.location.reload();
          });
          this.addForm.reset();
          this.customerTypeSelected = '';
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message || 'Ocurrió un error inesperado al registrar el cliente.',
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
