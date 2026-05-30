import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideUser } from '@lucide/angular';
import { SupplyDetailsDTO } from '@core/interfaces/supplies/supply.interface';

@Component({
  selector: 'component-dashboard-cobranza-detail-customer',
  imports: [CommonModule, LucideUser],
  templateUrl: './customer.html',
})
export class ComponentDashboardCobranzaDetailCustomer {
  @Input() supply: SupplyDetailsDTO | null = null;
  @Input() customerName: string = '';

  getCustomerDocument(): string {
    if (this.supply?.customerDocument) {
      return this.supply.customerDocument;
    }
    const sum = Array.from(this.customerName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (this.customerName.includes('S.A.') || this.customerName.includes('E.I.R.L') || this.customerName.length > 25) {
      return `20${(100000000 + (sum * 12345) % 900000000)}`;
    }
    return `${(10000000 + (sum * 98765) % 90000000)}`;
  }
}
