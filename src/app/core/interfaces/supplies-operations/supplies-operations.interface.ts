export type SupplyOperationType = 'SUSPENSION' | 'RECONNECTION' | 'CUT_OFF' | string;

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
