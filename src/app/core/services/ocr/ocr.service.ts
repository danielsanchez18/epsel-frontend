import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';

export interface OcrResponseDTO {
  reading: number | null;
  confidence: number;
  texts: string[];
  numbers: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/ocr`;

  readMeter(file: File): Observable<ApiResponse<OcrResponseDTO>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<OcrResponseDTO>>(`${this.apiUrl}/read`, formData);
  }
}
