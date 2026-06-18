export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';

export type IncidentType =
  | 'BILLING_COMPLAINT'
  | 'PAYMENT_COMPLAINT'
  | 'SERVICE_INTERRUPTION'
  | 'LOW_PRESSURE'
  | 'WATER_LEAK'
  | 'METER_DAMAGE'
  | 'METER_REPLACEMENT'
  | 'ABNORMAL_CONSUMPTION'
  | 'OCR_ANOMALY'
  | 'READING_ANOMALY'
  | 'SUPPLY_CUT_COMPLAINT'
  | 'OTHER';

export interface CreateIncidentDTO {
  customerId?: string;
  propertyId?: string;
  supplyId?: string;
  type: IncidentType;
  priority: IncidentPriority;
  title: string;
  description: string;
}

export interface ResolveIncidentDTO {
  resolution: string;
}

export interface IncidentResponseDTO {
  id: string;
  incidentNumber: string;
  customerId?: string;
  customerName?: string;
  propertyId?: string;
  supplyId?: string;
  supplyNumber?: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  title: string;
  description: string;
  reportedDate: string;
  resolvedDate?: string;
  resolution?: string;
}

export interface IncidentKpiDTO {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}
