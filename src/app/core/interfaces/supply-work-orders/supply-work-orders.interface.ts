export type WorkOrderStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type WorkOrderType =
  | 'INSTALLATION'
  | 'SUSPENSION'
  | 'CUT_OFF'
  | 'RECONNECTION'
  | 'INSPECTION'
  | 'METER_CHANGE';

export interface CreateSupplyWorkOrderDTO {
  supplyId: string;
  type: WorkOrderType;
  reason: string;
  observations?: string;
  scheduledDate?: string; // YYYY-MM-DD
}

export interface AssignWorkOrderDTO {
  observations?: string;
}

export interface StartWorkOrderDTO {
  observations?: string;
}

export interface CompleteWorkOrderDTO {
  observations: string;
  meterNumber?: string;
}

export interface CancelWorkOrderDTO {
  observations: string;
}

export interface SupplyWorkOrderResponseDTO {
  id: string;
  supplyId: string;
  supplyNumber: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  requestedDate: string; // YYYY-MM-DD
  scheduledDate?: string; // YYYY-MM-DD
  completedDate?: string; // YYYY-MM-DD
  reason: string;
  observations?: string;
  customerName: string;
  propertyAddress: string;
}
