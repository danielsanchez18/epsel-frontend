import { RoleType } from "./role.interface";

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' ;

export interface CreateUser {
  dni: string;
  names: string;
  lastNames: string;
  phone: string;
  email: string;
  password: string;
  photoUrl?: string;
  roleId: string;
}

export interface UpdateUser {
  names?: string;
  lastNames?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  roleId?: string;
}

export interface UserResponse {
  id: string;
  dni: string;
  names: string;
  lastNames: string;
  phone: string;
  email: string;
  status: UserStatus;
  photoUrl?: string;
  role: RoleType;
  createdAt: string;
  updatedAt: string;
}

export interface UserSearch {
  search?: string;
  status?: UserStatus;
  role?: RoleType;
  startDate?: string;
  endDate?: string;
}

export interface ImportError {
  rowNumber: number;
  errors: string[];
}

export interface ImportPreviewResponse<T> {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  validData: T[];
  errors: ImportError[];
}
