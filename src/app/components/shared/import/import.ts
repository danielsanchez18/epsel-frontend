import { Component } from '@angular/core';
import { LucideArrowUpDown } from "@lucide/angular";

@Component({
  selector: 'component-shared-import',
  imports: [
    LucideArrowUpDown
  ],
  templateUrl: './import.html',
})
export class ComponentSharedImport { }
