import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDroplet } from '@lucide/angular';
import { SupplyDetailsDTO } from '@core/interfaces/supplies/supply.interface';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';

@Component({
  selector: 'component-dashboard-cobranza-detail-supply',
  imports: [CommonModule, LucideDroplet],
  templateUrl: './supply.html',
})
export class ComponentDashboardCobranzaDetailSupply {
  @Input() supply: SupplyDetailsDTO | null = null;
  @Input() billing: BillingResponseDTO | null = null;
}
