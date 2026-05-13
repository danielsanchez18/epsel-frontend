import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideSearch, LucideX } from '@lucide/angular';

@Component({
  selector: 'component-shared-search-box',
  imports: [
    CommonModule,
    FormsModule,
    LucideSearch, LucideX
  ],
  templateUrl: './search-box.html',
})
export class ComponentSharedSearchBox {

  @Input() placeholder: string = 'Buscar...';
  @Input() searchQuery: string = '';
  @Output() searchQueryChange = new EventEmitter<string>();


  onSearchInput(): void {
    this.searchQueryChange.emit(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchInput();
  }

}
