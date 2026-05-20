export type PropertyType = 'HOUSE' | 'BUSINESS' | 'INDUSTRIAL' | string;

export interface PropertyResponse {
  id: string;
  customerId: string;
  customerName?: string;
  type: PropertyType;
  cadastralCode: string;
  address: string;
  latitude?: number;
  longitude?: number;
  reference?: string;
  zoneId: string;
  zoneName?: string;
}

export interface CreatePropertyRequest {
  customerId: string;
  type: PropertyType;
  address: string;
  cadastralCode: string;
  latitude?: number;
  longitude?: number;
  reference?: string;
  zoneId: string;
}

export interface UpdatePropertyRequest {
  type?: PropertyType;
  address?: string;
  reference?: string;
  cadastralCode?: string;
  latitude?: number;
  longitude?: number;
  zoneId?: string;
}
