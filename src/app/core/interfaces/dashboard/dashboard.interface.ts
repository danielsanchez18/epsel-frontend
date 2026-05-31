export interface KpiMetric {
  value: number;
  change: number;
  changeText: string;
}

export interface DashboardKpi {
  totalCustomers: KpiMetric;
  totalProperties: KpiMetric;
  activeSupplies: KpiMetric;
  suspendedSupplies: KpiMetric;
  cutOffSupplies: KpiMetric;
  pendingBillings: KpiMetric;
  overdueBillings: KpiMetric;
  totalBilledMonth: KpiMetric;
  totalCollectedMonth: KpiMetric;
  totalPendingCollection: KpiMetric;
}

export interface DashboardAlert {
  title: string;
  description: string;
  severity: string;
}

export interface DashboardChart {
  label: string;
  value: number;
}

export interface DashboardActivity {
  action: string;
  description: string;
  date: string;
}

export interface DashboardResponse {
  kpis: DashboardKpi;
  alerts: DashboardAlert[];
  billingChart: DashboardChart[];
  paymentChart: DashboardChart[];
  consumptionChart: DashboardChart[];
  recentActivities: DashboardActivity[];
}
