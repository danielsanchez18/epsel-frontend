import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

@Component({
  selector: 'component-shared-paginator',
  imports: [
    LucideChevronLeft,
    LucideChevronRight,
  ],
  templateUrl: './paginator.html',
})
export class ComponentSharedPaginator {
  @Input() page: number = 0;
  @Input() totalPages: number = 0;
  @Input() totalElements: number = 0;

  @Output() pageChange = new EventEmitter<number>();

  get safeTotalPages(): number {
    return Math.max(this.totalPages, 1);
  }

  get safeCurrentPage(): number {
    return Math.min(Math.max(this.page + 1, 1), this.safeTotalPages);
  }

  get canGoPrevious(): boolean {
    return this.page > 0;
  }

  get canGoNext(): boolean {
    return this.totalPages > 0 && this.page < this.totalPages - 1;
  }

  onPrevious(): void {
    if (this.canGoPrevious) {
      this.pageChange.emit(this.page - 1);
    }
  }

  onNext(): void {
    if (this.canGoNext) {
      this.pageChange.emit(this.page + 1);
    }
  }
}
