import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@core/utils/api';
import { Observable } from 'rxjs';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { RoleResponse } from '@interfaces/users/role.interface';

@Injectable({
  providedIn: 'root',
})
export class RoleService {

  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/roles`;

  getAll(): Observable<ApiResponse<RoleResponse[]>> {

    return this.http.get<ApiResponse<RoleResponse[]>>(this.apiUrl);

  }


}
