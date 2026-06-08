import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideUploadCloud,
  LucideDownload,
  LucideX,
  LucideCheckCircle2,
  LucideAlertCircle,
  LucideFileSpreadsheet
} from '@lucide/angular';
import { ImportPreviewResponse } from '@core/interfaces/users/user.interface';

@Component({
  selector: 'component-shared-import',
  imports: [
    CommonModule,
    LucideUploadCloud,
    LucideDownload,
    LucideX,
    LucideCheckCircle2,
    LucideAlertCircle,
    LucideFileSpreadsheet
  ],
  templateUrl: './import.html',
})
export class ComponentSharedImport {
  @Input() isLoading: boolean = false;
  @Input() previewData: ImportPreviewResponse<any> | null = null;
  @Input() isModalOpen: boolean = false;

  @Output() onFileSelect = new EventEmitter<File>();
  @Output() onConfirm = new EventEmitter<any[]>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onDownloadTemplate = new EventEmitter<void>();

  selectedFile: File | null = null;

  openModal() {
    this.isModalOpen = true;
    this.reset();
  }

  closeModal() {
    this.isModalOpen = false;
    this.reset();
    this.onCancel.emit();
  }

  reset() {
    this.selectedFile = null;
    this.previewData = null;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.onFileSelect.emit(this.selectedFile);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.onFileSelect.emit(this.selectedFile);
    }
  }

  confirm() {
    if (this.previewData && this.previewData.validData) {
      this.onConfirm.emit(this.previewData.validData);
    }
  }
}
