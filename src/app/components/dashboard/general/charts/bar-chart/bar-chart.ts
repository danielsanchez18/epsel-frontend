import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideChartColumn,
  LucideChevronDown,
  LucideChevronRight,
} from '@lucide/angular';
import { DashboardService } from '@services/dashboard/dashboard.service';
import { DashboardChart } from '@interfaces/dashboard/dashboard.interface';
import ApexCharts, { ApexOptions } from 'apexcharts';

@Component({
  selector: 'component-dashboard-general-charts-bar-chart',
  imports: [
    CommonModule,
    RouterLink,
    LucideChevronDown,
    LucideChartColumn,
    LucideChevronRight,
  ],
  templateUrl: './bar-chart.html',
})
export class ComponentDashboardGeneralChartsBarChart
  implements OnInit, OnDestroy
{
  private dashboardService = inject(DashboardService);

  categories = [
    {
      name: 'Facturación',
      link: '/dashboard/facturacion',
      quantity: 0,
      minRange: 0,
      maxRange: 10000,
      isActive: true,
    },
    {
      name: 'Cobros',
      link: '/dashboard/cobros',
      quantity: 0,
      minRange: 0,
      maxRange: 10000,
      isActive: false,
    },
    {
      name: 'Consumo',
      link: '/dashboard/consumo',
      quantity: 0,
      minRange: 0,
      maxRange: 1000,
      isActive: false,
    },
  ];

  selectedCategory = this.categories[0];
  quantityDisplay: number = 0;
  progressPercentage: number = 0;
  isLoading = true;

  billingData: DashboardChart[] = [];
  paymentData: DashboardChart[] = [];
  consumptionData: DashboardChart[] = [];
  chart: any = null;

  ngOnInit() {
    this.loadChartData();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private getLast6MonthsData(data: DashboardChart[]): DashboardChart[] {
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const result: DashboardChart[] = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = monthNames[d.getMonth()];

      const existing = data.find((item) =>
        item.label
          .toLowerCase()
          .startsWith(monthLabel.toLowerCase().slice(0, 3)),
      );

      result.push({
        label: monthLabel,
        value: existing ? existing.value : 0,
      });
    }
    return result;
  }

  loadChartData() {
    this.isLoading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.billingData = res.data.billingChart || [];
          this.paymentData = res.data.paymentChart || [];
          this.consumptionData = res.data.consumptionChart || [];
          this.updateCategoryTotals();
          this.animateAll();

          // Renderize chart after DOM updates
          setTimeout(() => {
            this.initializeChart();
          }, 0);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard chart data:', err);
        this.isLoading = false;
      },
    });
  }

  private updateCategoryTotals() {
    const billingSum = this.billingData.reduce(
      (sum, item) => sum + item.value,
      0,
    );
    const paymentSum = this.paymentData.reduce(
      (sum, item) => sum + item.value,
      0,
    );
    const consumptionSum = this.consumptionData.reduce(
      (sum, item) => sum + item.value,
      0,
    );

    const billingCat = this.categories.find(
      (cat) => cat.name === 'Facturación',
    )!;
    billingCat.quantity = billingSum;
    billingCat.maxRange = Math.ceil((billingSum * 1.25) / 1000) * 1000 || 10000;

    const paymentCat = this.categories.find((cat) => cat.name === 'Cobros')!;
    paymentCat.quantity = paymentSum;
    paymentCat.maxRange = Math.ceil((paymentSum * 1.25) / 1000) * 1000 || 10000;

    const consumptionCat = this.categories.find((cat) => cat.name === 'Consumo')!;
    consumptionCat.quantity = consumptionSum;
    consumptionCat.maxRange = Math.ceil((consumptionSum * 1.25) / 100) * 100 || 1000;

    this.selectedCategory =
      this.categories.find((cat) => cat.isActive) || this.categories[0];
  }

  selectCategory(categoryName: string) {
    this.categories.forEach(
      (cat) => (cat.isActive = cat.name === categoryName),
    );
    this.selectedCategory = this.categories.find(
      (cat) => cat.name === categoryName,
    )!;

    this.animateAll();
    this.updateChartData();
  }

  private animateAll() {
    this.animateQuantity(this.selectedCategory.quantity);
    const percent =
      (this.selectedCategory.quantity / this.selectedCategory.maxRange) * 100;
    this.animateProgress(percent);
  }

  private animateQuantity(target: number, duration: number = 1000) {
    const start = performance.now();
    const initial = this.quantityDisplay;

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      this.quantityDisplay = Math.floor(
        initial + (target - initial) * progress,
      );

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  private animateProgress(targetPercent: number, duration: number = 1000) {
    const start = performance.now();
    const initial = this.progressPercentage;

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      this.progressPercentage = initial + (targetPercent - initial) * progress;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  private getCategoryColor(name: string): string[] {
    switch (name) {
      case 'Facturación':
        return ['#2563eb']; // Blue
      case 'Cobros':
        return ['#10b981']; // Emerald/Green
      case 'Consumo':
        return ['#f59e0b']; // Amber/Orange
      default:
        return ['#2563eb'];
    }
  }

  private initializeChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const activeData =
      this.selectedCategory.name === 'Facturación'
        ? this.billingData
        : this.selectedCategory.name === 'Cobros'
        ? this.paymentData
        : this.consumptionData;
    const last6Data = this.getLast6MonthsData(activeData);
    const categories = last6Data.map((item) => item.label);
    const seriesData = last6Data.map((item) => item.value);

    const chartOptions: ApexOptions = {
      series: [
        {
          name: this.selectedCategory.name,
          data: seriesData,
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 5,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 400,
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '40%',
          borderRadius: 4,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: '#9ca3af',
            fontSize: '13px',
            fontFamily: 'Inter, ui-sans-serif',
            fontWeight: 400,
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          align: 'left',
          minWidth: 0,
          maxWidth: 140,
          style: {
            colors: '#9ca3af',
            fontSize: '13px',
            fontFamily: 'Inter, ui-sans-serif',
            fontWeight: 400,
          },
          formatter: (value: number) => {
            if (this.selectedCategory.name === 'Consumo') {
              return `${value} m³`;
            }
            return value >= 1000 ? `S/ ${(value / 1000).toFixed(0)}k` : `S/ ${value}`;
          },
        },
      },
      states: {
        hover: {
          filter: {
            type: 'darken',
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value: number) => {
            if (this.selectedCategory.name === 'Consumo') {
              return `${value.toLocaleString('en-US')} m³`;
            }
            return `S/ ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
          },
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '60%',
              },
            },
          },
        },
      ],
      colors: this.getCategoryColor(this.selectedCategory.name),
    };

    const container = document.querySelector(
      '#hs-single-bar-chart',
    ) as HTMLElement;
    if (container) {
      this.chart = new ApexCharts(container, chartOptions);
      this.chart.render();
    }
  }

  private updateChartData(): void {
    if (!this.chart) return;

    const activeData =
      this.selectedCategory.name === 'Facturación'
        ? this.billingData
        : this.selectedCategory.name === 'Cobros'
        ? this.paymentData
        : this.consumptionData;
    const last6Data = this.getLast6MonthsData(activeData);
    const categories = last6Data.map((item) => item.label);
    const seriesData = last6Data.map((item) => item.value);

    this.chart.updateOptions({
      xaxis: {
        categories: categories,
      },
      colors: this.getCategoryColor(this.selectedCategory.name),
      yaxis: {
        labels: {
          align: 'left',
          minWidth: 0,
          maxWidth: 140,
          style: {
            colors: '#9ca3af',
            fontSize: '13px',
            fontFamily: 'Inter, ui-sans-serif',
            fontWeight: 400,
          },
          formatter: (value: number) => {
            if (this.selectedCategory.name === 'Consumo') {
              return `${value} m³`;
            }
            return value >= 1000 ? `S/ ${(value / 1000).toFixed(0)}k` : `S/ ${value}`;
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value: number) => {
            if (this.selectedCategory.name === 'Consumo') {
              return `${value.toLocaleString('en-US')} m³`;
            }
            return `S/ ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
          },
        },
      },
    });

    this.chart.updateSeries([
      {
        name: this.selectedCategory.name,
        data: seriesData,
      },
    ]);
  }
}
