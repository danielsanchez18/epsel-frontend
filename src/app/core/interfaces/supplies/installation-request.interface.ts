export type InstallationRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INSTALLED' | string;

export interface CreateInstallationRequest {
  customerId: string;
  propertyId: string;
  requestedDate?: string;
  observations?: string;
}

export interface InstallationRequestResponse {
  id: string;
  customerId: string;
  customerName: string;
  zoneName: string;
  propertyId: string;
  propertyAddress: string;
  installationCost: number;
  status: InstallationRequestStatus;
  requestedDate: string;
  approvedDate?: string;
  installationDate?: string;
  rejectedDate?: string;
  approvedBy?: string;
  installedBy?: string;
  rejectedBy?: string;
  observations?: string;
}
