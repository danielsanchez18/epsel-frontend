import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentSharedSearchBox } from '@components/shared/search-box/search-box';
import { ComponentSharedFilters } from '@components/shared/filters/filters';
import { ComponentSharedPaginator } from '@components/shared/paginator/paginator';
import { ComponentSharedImport } from '@components/shared/import/import';
import { ComponentDashboardWorkersTable } from '../table/table';
import { UserService } from '@services/users/user.service';
import { UserResponse } from '@interfaces/users/user.interface';
import { ComponentDashboardWorkersEmpty } from '../empty/empty';

@Component({
  selector: 'component-dashboard-workers-list',
  imports: [
    CommonModule,
    ComponentDashboardWorkersTable,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedImport,
    ComponentSharedPaginator,
    ComponentDashboardWorkersEmpty,
    ComponentDashboardWorkersTable,
  ],
  templateUrl: './list.html',
})
export class ComponentDashboardWorkersList {
  private userService = inject(UserService);

  users: UserResponse[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  searchQuery = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 0): void {
    this.isLoading = true;

    if (this.searchQuery.trim()) {
      this.userService
        .getAll(
          { search: this.searchQuery },
          this.currentPage,
          this.pageSize,
          'createdAt,desc',
        )
        .subscribe({
          next: (res: any) => {
            this.users = res.data.content;
            this.totalPages = res.data.totalPages;
            this.totalElements = res.data.totalElements;
            this.isLoading = false;
          },
          error: (err) => {
            console.error(
              '[ComponentWorkersOverviewList] Error loading trabajadores',
              err.message,
            );
            this.isLoading = false;
          },
        });
    } else {
      this.userService
        .getAll(
          { search: this.searchQuery },
          page,
          this.pageSize,
          'createdAt,desc',
        )
        .subscribe({
          next: (res: any) => {
            this.users = res.data.content;
            this.totalPages = res.data.totalPages;
            this.totalElements = res.data.totalElements;
            this.isLoading = false;
          },
          error: (err) => {
            console.error(
              '[ComponentWorkersOverviewList] Error loading trabajadores',
              err.message,
            );
            this.isLoading = false;
          },
        });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers(page);
  }

  onSearchQuery(query: string): void {
    this.searchQuery = query;
    this.currentPage = 0;
    this.loadUsers(0);
  }
}
