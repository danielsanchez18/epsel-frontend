import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideBadgeInfo, LucideCalendar1, LucideCalendarCheck, LucideUserCheck, LucideUser } from "@lucide/angular";
import { ComponentDashboardCustomersDetailsKpis } from "@components/dashboard/customers/details/kpis/kpis";
import { CustomerService } from '@services/customers/customer.service';
import { CustomerResponse, UpdateCustomerRequest } from '@interfaces/customers/customer.interface';
import { PageDashboardCustomersDetailsGeneral } from '../general/general';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'page-dashboard-customers-details-info',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideBadgeInfo, LucideCalendar1, LucideCalendarCheck, LucideUserCheck, LucideUser,
    ComponentDashboardCustomersDetailsKpis,
    DatePipe
],
  templateUrl: './info.html',
})
export class PageDashboardCustomersDetailsInfo implements OnInit, OnDestroy {
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private parent = inject(PageDashboardCustomersDetailsGeneral);

  editForm: FormGroup;
  customer: CustomerResponse | null = null;
  customerId: string | null = null;

  isLoading = true;
  isSaving = false;
  hasChanges = false;
  private sub!: Subscription;

  constructor() {
    this.editForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]]
    });
  }

  ngOnInit(): void {
    this.customerId = this.parent.customerId || this.route.parent?.snapshot.paramMap.get('id') || null;

    this.sub = this.parent.customer$.subscribe(customer => {
      if (customer) {
        this.customer = customer;
        this.editForm.patchValue({
          fullName: customer.fullName,
          email: customer.email || '',
          phone: customer.phone || ''
        }, { emitEvent: false });
        this.isLoading = false;
        this.hasChanges = false;
      }
    });

    this.editForm.valueChanges.subscribe(value => {
      this.checkChanges(value);
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  checkChanges(currentValue: any): void {
    if (!this.customer) return;

    const initialFullName = this.customer.fullName || '';
    const initialEmail = this.customer.email || '';
    const initialPhone = this.customer.phone || '';

    const currentFullName = currentValue.fullName || '';
    const currentEmail = currentValue.email || '';
    const currentPhone = currentValue.phone || '';

    if (
      initialFullName !== currentFullName ||
      initialEmail !== currentEmail ||
      initialPhone !== currentPhone
    ) {
      this.hasChanges = true;
    } else {
      this.hasChanges = false;
    }
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

  copyToClipboard(text: string | null | undefined): void {
      if (text) {
        navigator.clipboard.writeText(text);
        void Swal.fire({ title: '¡Copiado!', text: 'El valor ha sido copiado al portapapeles.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    }

  onSubmit(): void {
    if (this.editForm.invalid || !this.hasChanges || !this.customerId) return;

    this.isSaving = true;

    const payload: UpdateCustomerRequest = {
      fullName: this.editForm.value.fullName,
      email: this.editForm.value.email || undefined,
      phone: this.editForm.value.phone || undefined
    };

    this.customerService.update(this.customerId, payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: res.message || 'La información del cliente ha sido actualizada.',
            confirmButtonColor: '#2563eb'
          });
          this.hasChanges = false;
          this.parent.updateCustomerData(res.data);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'No se pudo actualizar la información.',
            confirmButtonColor: '#2563eb'
          });
        }
      },
      error: (err) => {
        this.isSaving = false;
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
