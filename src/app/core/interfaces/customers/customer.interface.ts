export type CustomerType = 'PERSON' | 'COMPANY' | string;

export interface CustomerResponse {
  id: string;
  type: CustomerType;
  documentNumber: string;
  fullName: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  createdByName?: string;
  updatedByName?: string;
}

export interface CreateCustomerRequest {
  type: CustomerType;
  documentNumber: string;
  fullName: string;
  phone?: string;
  email?: string;
}

export interface UpdateCustomerRequest {
  fullName?: string;
  phone?: string;
  email?: string;
}
