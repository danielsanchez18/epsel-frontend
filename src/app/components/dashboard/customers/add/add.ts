import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'component-dashboard-customers-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add.html',
})
export class ComponentDashboardCustomersAdd implements OnInit {

  addForm: FormGroup;
  customerTypeSelected: string = '';

  constructor(private fb: FormBuilder) {
    this.addForm = this.fb.group({
      customerType: ['', Validators.required],
      documentNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      names: ['', Validators.required],
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
        docControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{20}$')]);
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

}
