import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Exporta un array de objetos JSON a un archivo CSV y forzará su descarga.
   * @param data Array de objetos a exportar
   * @param filename Nombre del archivo (sin extensión)
   */
  exportToCsv(data: any[], filename: string): void {
    if (!data || !data.length) {
      console.warn('No hay datos para exportar a CSV');
      return;
    }

    const replacer = (key: string, value: any) => value === null ? '' : value;
    const header = Object.keys(data[0]);
    
    const csv = data.map(row => 
      header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
    );
    
    csv.unshift(header.join(','));
    const csvArray = csv.join('\r\n');

    const blob = new Blob([csvArray], { type: 'text/csv' });
    this.saveAsFile(blob, `${filename}.csv`);
  }

  /**
   * Exporta un array de objetos JSON a un archivo Excel (.xlsx) y forzará su descarga.
   * @param data Array de objetos a exportar
   * @param filename Nombre del archivo (sin extensión)
   */
  exportToExcel(data: any[], filename: string): void {
    if (!data || !data.length) {
      console.warn('No hay datos para exportar a Excel');
      return;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'Datos': worksheet }, SheetNames: ['Datos'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    this.saveAsFile(blob, `${filename}.xlsx`);
  }

  /**
   * Utilidad para crear un enlace temporal y forzar la descarga del Blob.
   */
  private saveAsFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer]);
    const url = window.URL.createObjectURL(data);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Evitar problemas en Firefox
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
