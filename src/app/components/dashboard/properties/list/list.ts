import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentSharedSearchBox } from "@components/shared/search-box/search-box";
import { ComponentSharedFilters } from "@components/shared/filters/filters";
import { ComponentSharedPaginator } from "@components/shared/paginator/paginator";
import { ComponentSharedImport } from "@components/shared/import/import";
import { UserService } from '@services/users/user.service';
import { ComponentDashboardPropertiesTable } from '../table/table';
import { ComponentDashboardPropertiesEmpty } from '../empty/empty';

@Component({
  selector: 'component-dashboard-properties-list',
  imports: [
    CommonModule,
    ComponentSharedSearchBox,
    ComponentSharedFilters,
    ComponentSharedImport,
    ComponentSharedPaginator,
    ComponentDashboardPropertiesTable,
    ComponentDashboardPropertiesEmpty
],
  templateUrl: './list.html',
})
export class ComponentDashboardPropertiesList {

  private userService = inject(UserService);

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10
  searchQuery = '';
  isLoading = false;


  ngOnInit(): void {
    this.loadUsers();
  }


  loadUsers(page: number = 0): void {

    this.isLoading = true;

    if (this.searchQuery.trim()) {
      this.userService.getAll(
        { search: this.searchQuery },
        this.currentPage,
        this.pageSize,
        "names,asc"
      ).subscribe({
        next: (res: any) => {
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
        }
      });
    } else {

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
