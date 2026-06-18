import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@core/utils/api';
import { Observable } from 'rxjs';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import { CreateUser, UpdateUser, UserResponse, UserStatus, UserSearch, ImportPreviewResponse } from '@core/interfaces/users/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/users`;


  create(dto: CreateUser, image?: File): Observable<ApiResponse<UserResponse>> {

    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

    if (image) form.append('image', image);

    return this.http.post<ApiResponse<UserResponse>>(this.apiUrl, form);

  }


  update(id: string, dto: UpdateUser, image?: File): Observable<ApiResponse<UserResponse>> {

    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

    if (image) form.append('image', image);

    return this.http.put<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}`, form);

  }


  getById(id: string): Observable<ApiResponse<UserResponse>> {

    return this.http.get<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}`);

  }


  getAll(
    search: UserSearch = {},
    page?: number, size?: number, sort?: string
  ): Observable<ApiResponse<PaginatedResponse<UserResponse>>> {

    let params = new HttpParams();

    if (page != null) params = params.set('page', String(page));
    if (size != null) params = params.set('size', String(size));
    if (sort) params = params.set('sort', sort);

    Object.keys(search).forEach(k => {
      const v = (search as any)[k];
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });

    return this.http.get<ApiResponse<PaginatedResponse<UserResponse>>>(this.apiUrl, { params });

  }


  changeStatus(id: string, status: UserStatus): Observable<ApiResponse<void>> {

    const params = new HttpParams().set('status', status as string);

    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/status`, null, { params });

  }


  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}`, null);
  }

  getKpis(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/kpis`);
  }

  previewImport(file: File): Observable<ApiResponse<ImportPreviewResponse<CreateUser>>> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ApiResponse<ImportPreviewResponse<CreateUser>>>(`${this.apiUrl}/import/preview`, form);
  }

  createBulk(dtos: CreateUser[]): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/bulk`, dtos);
  }

  resetPassword(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/reset-password`, null);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/profile/change-password`, data);
  }

}
