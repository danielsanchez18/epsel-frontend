export type RoleType = 'ADMIN' | 'SUPERVISOR' | 'TECHNICIAN' | 'VERIFIER' | 'MANAGEMENT' ;

export interface RoleResponse {
  id: string;
  name: RoleType;
  description: string;
}

