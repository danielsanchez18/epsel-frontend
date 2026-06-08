import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideSlidersHorizontal } from '@lucide/angular';

@Component({
  selector: 'component-shared-filters',
  imports: [
    CommonModule,
    LucideSlidersHorizontal
  ],
  templateUrl: './filters.html',
})
export class ComponentSharedFilters {
  @Input() activeFiltersCount: number = 0;
  @Input() offcanvasId: string = 'hs-offcanvas-filters';
}
