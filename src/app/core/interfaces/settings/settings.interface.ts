export interface BillingConfigurationResponse {
  id: string;
  monthsBeforeCut: number;
  lateInterestPercentage: number;
  graceDays: number;
  active: boolean;
}

export interface UpdateBillingConfigurationRequest {
  monthsBeforeCut: number;
  lateInterestPercentage: number;
  graceDays: number;
}

export interface ServiceZoneResponse {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface CreateServiceZoneRequest {
  name: string;
  description: string;
}

export interface UpdateServiceZoneRequest {
  name?: string;
  description?: string;
  active?: boolean;
}

export type ServiceFeeType = 'CONNECTION' | 'RECONNECTION' | 'MAINTENANCE' | 'OTHER' | string;

export interface ServiceFeeConfigurationResponse {
  id: string;
  zoneId: string;
  zoneName: string;
  feeType: ServiceFeeType;
  amount: number;
  active: boolean;
}

export interface CreateServiceFeeConfigurationRequest {
  zoneId: string;
  feeType: ServiceFeeType;
  amount: number;
}

export interface UpdateServiceFeeConfigurationRequest {
  amount?: number;
  active?: boolean;
}

export interface WaterTariffConfigurationResponse {
  id: string;
  zoneId: string;
  zoneName: string;
  pricePerM3: number;
  fixedCharge: number;
  taxPercentage: number;
  effectiveDate: string;
  active: boolean;
}

export interface CreateWaterTariffConfigurationRequest {
  zoneId: string;
  pricePerM3: number;
  fixedCharge: number;
  taxPercentage: number;
  effectiveDate: string;
}
