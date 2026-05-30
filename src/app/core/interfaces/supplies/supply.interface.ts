export type SupplyStatus =
  | 'PENDING_INSTALLATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CUT_OFF'
  | 'INACTIVE'
  | string;

export type SupplyType = 'HOUSE' | 'BUSINESS' | 'INDUSTRIAL' | string;

export interface ReconnectSupplyDTO {
  reason: string;
  observations?: string;
}

export interface SuspendSupplyDTO {
  reason: string;
}

export interface SupplyResponseDTO {
  id: string;
  supplyNumber: string;
  meterNumber: string;
  internalReference?: string;
  status: SupplyStatus;
  customerName: string;
  customerDocument: string;
  propertyId: string;
  propertyAddress: string;
  zoneName: string;
  supplyType: SupplyType;
  lastReading: number;
  installationDate?: string;
  activationDate?: string;
}

export interface SupplyDetailsDTO {
  id: string;
  supplyNumber: string;
  meterNumber: string;
  internalReference?: string;
  status: SupplyStatus;
  customerName: string;
  customerDocument: string;
  customerPhone?: string;
  propertyAddress: string;
  propertyReference?: string;
  cadastralCode?: string;
  zoneName: string;
  supplyType: SupplyType;
  lastReading?: number;
  latitude?: number;
  longitude?: number;
  installationDate?: string;
  activationDate?: string;
  cutOffDate?: string;
  reconnectionDate?: string;
  cutOffReason?: string;
  createdAt?: string;
}
