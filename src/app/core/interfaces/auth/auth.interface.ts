import { RoleType } from "@interfaces/users/role.interface";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  fullName: string;
  email: string;
  role: RoleType;
}
