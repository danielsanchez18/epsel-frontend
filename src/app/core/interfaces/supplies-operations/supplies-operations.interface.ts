export type SupplyOperationType =
  | 'INSTALLATION'
  | 'SUSPENSION'
  | 'CUT_OFF'
  | 'RECONNECTION'
  | 'METER_CHANGE'
  | 'OWNER_CHANGE'
  | 'STATUS_CHANGE'
  | string;

export interface CreateSupplyOperationDTO {
  supplyId: string;
  operationType: SupplyOperationType;
  operationDate: string; // YYYY-MM-DD
  reason?: string;
  observations?: string;
}

export interface SupplyOperationResponseDTO {
  id: string;
  supplyId: string;
  supplyNumber: string;
  operationType: SupplyOperationType;
  operationDate: string; // YYYY-MM-DD
  reason?: string;
  performedBy: string;
  observations?: string;
}
