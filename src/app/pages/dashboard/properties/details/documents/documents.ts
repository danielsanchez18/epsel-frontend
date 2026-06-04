import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { LucideFileText, LucideUpload } from '@lucide/angular';
import { PageDashboardPropertiesDetailsGeneral } from '../general/general';

@Component({
  selector: 'page-dashboard-properties-details-documents',
  imports: [
    CommonModule,
    LucideFileText,
    LucideUpload,
  ],
  templateUrl: './documents.html',
})
export class PageDashboardPropertiesDetailsDocuments implements OnInit {
  private parent = inject(PageDashboardPropertiesDetailsGeneral);
  private route = inject(ActivatedRoute);

  propertyId: string | null = null;
  documents: any[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.propertyId =
      this.parent.propertyId ||
      this.route.parent?.snapshot.paramMap.get('id') ||
      null;
  }
}
