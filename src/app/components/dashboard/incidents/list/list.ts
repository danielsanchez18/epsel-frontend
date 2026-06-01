import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IncidentService } from '@core/services/incidents/incident.service';
import { IncidentResponseDTO, IncidentStatus, IncidentPriority, IncidentType } from '@interfaces/incidents/incident.interface';

import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentDashboardIncidentsTable } from '../table/table';
import { ComponentDashboardIncidentsEmpty } from '../empty/empty';
import { ComponentDashboardIncidentsKpis } from '../kpis/kpis';

@Component({
  selector: 'component-dashboard-incidents-list',
  imports: [
    CommonModule,
    ComponentSharedSearchBox,
    ComponentSharedPaginator,
    ComponentDashboardIncidentsTable,
    ComponentDashboardIncidentsEmpty,
    ComponentDashboardIncidentsKpis
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardIncidentsList implements OnInit {
  private incidentService = inject(IncidentService);

  incidents: IncidentResponseDTO[] = [];
  isLoading = false;
  searchQuery = '';
  
  selectedStatus = '';
  selectedPriority = '';
  selectedType = '';
  selectedStartDate = '';
  selectedEndDate = '';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // KPI counts
  kpiTotal = 0;
  kpiOpen = 0;
  kpiInProgress = 0;
  kpiResolved = 0;

  ngOnInit(): void {
    this.loadData();
    this.loadKpis();
  }

  loadKpis(): void {
    this.incidentService.search(0, 1000).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const all = res.data.content ?? [];
          this.kpiTotal = all.length;
          this.kpiOpen = all.filter(i => i.status === 'OPEN').length;
          this.kpiInProgress = all.filter(i => i.status === 'IN_PROGRESS').length;
          this.kpiResolved = all.filter(i => i.status === 'RESOLVED').length;
        }
      }
    });
  }

  loadData(page: number = 0): void {
    this.isLoading = true;

    const status = this.selectedStatus ? this.selectedStatus as IncidentStatus : undefined;
    const priority = this.selectedPriority ? this.selectedPriority as IncidentPriority : undefined;
    const type = this.selectedType ? this.selectedType as IncidentType : undefined;
    const startDate = this.selectedStartDate || undefined;
    const endDate = this.selectedEndDate || undefined;

    this.incidentService.search(
      page,
      this.pageSize,
      status,
      priority,
      type,
      undefined,
      undefined,
      startDate,
      endDate
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          let items = res.data.content ?? [];

          if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase().trim();
            items = items.filter(item => 
              item.incidentNumber.toLowerCase().includes(query) ||
              (item.customerName && item.customerName.toLowerCase().includes(query)) ||
              item.title.toLowerCase().includes(query) ||
              item.description.toLowerCase().includes(query)
            );
          }

          this.incidents = items;
          this.totalPages = res.data.totalPages ?? 0;
          this.totalElements = res.data.totalElements ?? 0;
          this.currentPage = page;
        } else {
          this.resetList();
        }
        this.isLoading = false;
      },
      error: () => {
        this.resetList();
        this.isLoading = false;
      }
    });
  }

  private resetList(): void {
    this.incidents = [];
    this.totalPages = 0;
    this.totalElements = 0;
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.loadData(0);
  }

  onStatusFilter(status: string): void {
    this.selectedStatus = status;
    this.loadData(0);
  }

  onPriorityFilter(priority: string): void {
    this.selectedPriority = priority;
    this.loadData(0);
  }

  onTypeFilter(type: string): void {
    this.selectedType = type;
    this.loadData(0);
  }

  onStartDateFilter(date: string): void {
    this.selectedStartDate = date;
    this.loadData(0);
  }

  onEndDateFilter(date: string): void {
    this.selectedEndDate = date;
    this.loadData(0);
  }

  onPageChange(page: number): void {
    this.loadData(page);
  }
}
