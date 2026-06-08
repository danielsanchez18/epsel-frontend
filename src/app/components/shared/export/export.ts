import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDownload, LucideFileSpreadsheet, LucideFileText } from '@lucide/angular';

export interface ExportOptions {
  scope: 'CURRENT_PAGE' | 'ALL_RECORDS';
  format: 'CSV' | 'EXCEL';
}

@Component({
  selector: 'component-shared-export',
  standalone: true,
  imports: [CommonModule, LucideDownload, LucideFileSpreadsheet, LucideFileText],
  templateUrl: './export.html',
})
export class ComponentSharedExport {
  @Output() onExport = new EventEmitter<ExportOptions>();

  triggerExport(scope: 'CURRENT_PAGE' | 'ALL_RECORDS', format: 'CSV' | 'EXCEL') {
    this.onExport.emit({ scope, format });
  }
}
