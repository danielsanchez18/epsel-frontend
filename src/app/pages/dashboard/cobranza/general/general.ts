import { Component } from '@angular/core';
import { ComponentDashboardCobranzaKpis } from '@components/dashboard/cobranza/kpis/kpis';
import { ComponentDashboardCobranzaList } from '@components/dashboard/cobranza/list/list';

@Component({
  selector: 'page-dashboard-cobranza-general',
  imports: [ComponentDashboardCobranzaKpis, ComponentDashboardCobranzaList],
  templateUrl: './general.html',
})
export class PageDashboardCobranzaGeneral {}
