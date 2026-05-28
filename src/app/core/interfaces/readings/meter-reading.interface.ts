export type ReadingStatus = 'RECORDED' | 'VALIDATED' | 'BILLED' | 'CANCELLED';

export interface CreateMeterReadingDTO {
  supplyId: string;
  currentReading: number;
  readingDate: string; // YYYY-MM-DD
  meterPhotoUrl?: string | null;
  ocrValue?: string | null;
  observations?: string | null;
}

export interface MeterReadingResponseDTO {
  id: string;
  supplyId: string;
  supplyNumber: string;
  customerName?: string;
  meterNumber?: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  readingDate: string; // YYYY-MM-DD
  status: ReadingStatus;
  meterPhotoUrl?: string | null;
  ocrValue?: string | null;
  observations?: string | null;
}
