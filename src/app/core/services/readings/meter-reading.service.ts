import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import {
  CreateMeterReadingDTO,
  MeterReadingResponseDTO,
  ReadingStatus,
} from '@interfaces/readings/meter-reading.interface';

@Injectable({
  providedIn: 'root',
})
export class MeterReadingService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/readings`;

  create(
    dto: CreateMeterReadingDTO,
    meterPhoto?: File
  ): Observable<ApiResponse<MeterReadingResponseDTO>> {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (meterPhoto) {
      form.append('meterPhoto', meterPhoto);
    }
    return this.http.post<ApiResponse<MeterReadingResponseDTO>>(this.baseUrl, form);
  }

  getById(id: string): Observable<ApiResponse<MeterReadingResponseDTO>> {
    return this.http.get<ApiResponse<MeterReadingResponseDTO>>(
      `${this.baseUrl}/${id}`,
    );
  }

  search(
    search?: string,
    zoneId?: string,
    status?: ReadingStatus,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 10,
    sort?: string,
  ): Observable<
    ApiResponse<PaginatedResponse<MeterReadingResponseDTO>['data']>
  > {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort?.toString() || 'createdAt,desc');

    if (search) params = params.set('search', search);
    if (zoneId) params = params.set('zoneId', zoneId);
    if (status) params = params.set('status', status);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (sort) params = params.set('sort', sort);

    return this.http.get<
      ApiResponse<PaginatedResponse<MeterReadingResponseDTO>['data']>
    >(this.baseUrl, { params });
  }

  validate(id: string): Observable<ApiResponse<MeterReadingResponseDTO>> {
    return this.http.put<ApiResponse<MeterReadingResponseDTO>>(
      `${this.baseUrl}/${id}/validate`,
      null,
    );
  }

  cancel(
    id: string,
    observations?: string,
  ): Observable<ApiResponse<MeterReadingResponseDTO>> {
    let params = new HttpParams();
    if (observations) {
      params = params.set('observations', observations);
    }
    return this.http.put<ApiResponse<MeterReadingResponseDTO>>(
      `${this.baseUrl}/${id}/cancel`,
      null,
      { params },
    );
  }
}
