import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReportService, ReportSummary, MonthlyData,
  StatusData, CategoryData, ItemData, RatingData
} from '../../../core/services/report.service';

// ── Color palette ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Pending:   '#f59e0b',
  Confirmed: '#3b82f6',
  Preparing: '#8b5cf6',
  Ready:     '#06b6d4',
  Delivered: '#22c55e',
  Cancelled: '#ef4444',
};
const BAR_COLORS = ['#f97316','#fb923c','#fdba74','#fed7aa','#fef3c7','#fde68a','#fcd34d'];

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    @media print {
      .no-print { display: none !important; }
      .print-page { page-break-inside: avoid; }
    }
  `],
  template: `
    <!-- Loading -->
    @if (loading()) {
      <div class="flex flex-col items-center justify-center h-80 gap-4">
        <div class="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-400 text-sm font-medium">Loading report data...</p>
      </div>
    }

    @if (!loading() && data()) {
      <div class="space-y-8" id="report-content">

        <!-- ── Top bar ──────────────────────────────────────────────────────── -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
            <p class="text-gray-500 text-sm mt-0.5">BabaSai Restaurant — Complete Performance Overview</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button (click)="exportCSV()"
              class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              ⬇ Export CSV
            </button>
            <button (click)="printReport()"
              class="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              🖨 Print / PDF
            </button>
          </div>
        </div>

        <!-- ── KPI Cards ─────────────────────────────────────────────────────── -->
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 print-page">
          @for (card of kpiCards(); track card.label) {
            <div class="rounded-2xl p-5 text-white shadow-md" [style.background]="card.color">
              <p class="text-xs font-medium opacity-80">{{ card.label }}</p>
              <p class="text-2xl font-black mt-1 leading-tight">{{ card.value }}</p>
              @if (card.sub) {
                <p class="text-xs opacity-70 mt-1">{{ card.sub }}</p>
              }
            </div>
          }
        </div>

        <!-- ── Row 1: Monthly Revenue Bar + Orders by Status Donut ───────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 print-page">

          <!-- Monthly Revenue Bar Chart -->
          <div class="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="font-bold text-gray-800 mb-1">Monthly Revenue</h2>
            <p class="text-gray-400 text-xs mb-5">Last 6 months</p>

            @if (data()!.monthly.length > 0) {
              <div class="space-y-3">
                @for (m of data()!.monthly; track m.month) {
                  <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-500 w-16 flex-shrink-0 text-right">{{ m.month }}</span>
                    <div class="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                      <div
                        class="h-full rounded-full flex items-center px-3 transition-all duration-700"
                        style="background: linear-gradient(90deg, #f97316, #fb923c);"
                        [style.width]="getBarWidth(m.revenue, maxRevenue()) + '%'"
                        [style.min-width]="m.revenue > 0 ? '40px' : '0'"
                      >
                        @if (m.revenue > 0) {
                          <span class="text-white text-xs font-semibold whitespace-nowrap">
                            Rs. {{ formatNum(m.revenue) }}
                          </span>
                        }
                      </div>
                    </div>
                    <span class="text-xs text-gray-400 w-12 flex-shrink-0">{{ m.orderCount }} orders</span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-400 text-center py-8">No order data yet</p>
            }
          </div>

          <!-- Orders by Status Donut -->
          <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="font-bold text-gray-800 mb-1">Orders by Status</h2>
            <p class="text-gray-400 text-xs mb-4">All time distribution</p>

            @if (data()!.ordersByStatus.length > 0) {
              <!-- SVG Donut chart -->
              <div class="flex justify-center mb-4">
                <svg viewBox="0 0 120 120" class="w-36 h-36">
                  @for (seg of donutSegments(); track seg.status; let i = $index) {
                    <circle
                      r="45" cx="60" cy="60"
                      fill="none"
                      [attr.stroke]="seg.color"
                      stroke-width="18"
                      [attr.stroke-dasharray]="seg.dash"
                      [attr.stroke-dashoffset]="seg.offset"
                      transform="rotate(-90 60 60)"
                    />
                  }
                  <!-- Center text -->
                  <text x="60" y="55" text-anchor="middle" font-size="14" font-weight="bold" fill="#1f2937">
                    {{ data()!.kpi.totalOrders }}
                  </text>
                  <text x="60" y="70" text-anchor="middle" font-size="7" fill="#9ca3af">Total Orders</text>
                </svg>
              </div>
              <!-- Legend -->
              <div class="space-y-1.5">
                @for (s of data()!.ordersByStatus; track s.status) {
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full flex-shrink-0"
                        [style.background]="getStatusColor(s.status)"></span>
                      <span class="text-xs text-gray-600">{{ s.status }}</span>
                    </div>
                    <span class="text-xs font-bold text-gray-800">{{ s.count }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-400 text-center py-8">No orders yet</p>
            }
          </div>
        </div>

        <!-- ── Row 2: Top Categories + Top Items ─────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 print-page">

          <!-- Top Categories -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="font-bold text-gray-800 mb-1">Top Categories Ordered</h2>
            <p class="text-gray-400 text-xs mb-5">By total quantity ordered</p>

            @if (data()!.topCategories.length > 0) {
              <div class="space-y-3">
                @for (cat of data()!.topCategories; track cat.category; let i = $index) {
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-medium text-gray-700 w-28 flex-shrink-0 truncate">
                      {{ cat.category }}
                    </span>
                    <div class="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-700"
                        [style.width]="getBarWidth(cat.count, maxCatCount()) + '%'"
                        [style.background]="BAR_COLORS[i % BAR_COLORS.length]"
                        [style.min-width]="cat.count > 0 ? '30px' : '0'">
                      </div>
                    </div>
                    <span class="text-xs font-bold text-gray-700 w-8 text-right flex-shrink-0">
                      {{ cat.count }}
                    </span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-400 text-center py-8">No order data yet</p>
            }
          </div>

          <!-- Top 5 Items -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="font-bold text-gray-800 mb-1">Top 5 Best-Selling Items</h2>
            <p class="text-gray-400 text-xs mb-5">By total quantity ordered</p>

            @if (data()!.topItems.length > 0) {
              <div class="space-y-3">
                @for (item of data()!.topItems; track item.name; let i = $index) {
                  <div class="flex items-center gap-3">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      [style.background]="i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : '#e5e7eb'"
                      [style.color]="i > 2 ? '#6b7280' : 'white'">
                      {{ i + 1 }}
                    </span>
                    <span class="flex-1 text-sm text-gray-700 font-medium truncate">{{ item.name }}</span>
                    <div class="flex items-center gap-2">
                      <div class="w-20 bg-gray-100 rounded-full h-2">
                        <div class="h-2 rounded-full bg-orange-400 transition-all duration-700"
                          [style.width]="getBarWidth(item.count, data()!.topItems[0]?.count || 1) + '%'">
                        </div>
                      </div>
                      <span class="text-xs font-bold text-orange-600 w-8 text-right">{{ item.count }}</span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-400 text-center py-8">No order data yet</p>
            }
          </div>
        </div>

        <!-- ── Row 3: Rating Distribution + Monthly Table ─────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 print-page">

          <!-- Rating Distribution -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="font-bold text-gray-800 mb-1">Review Rating Distribution</h2>
            <p class="text-gray-400 text-xs mb-5">
              Avg: <span class="text-yellow-500 font-bold">{{ data()!.kpi.avgRating }}★</span>
              from {{ data()!.kpi.totalReviews }} reviews
            </p>

            <div class="space-y-3">
              @for (r of data()!.ratingDist.slice().reverse(); track r.star) {
                <div class="flex items-center gap-3">
                  <span class="text-sm text-yellow-500 font-bold w-8 flex-shrink-0">{{ r.star }}★</span>
                  <div class="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div class="h-full rounded-full bg-yellow-400 transition-all duration-700"
                      [style.width]="getBarWidth(r.count, maxRatingCount()) + '%'"
                      [style.min-width]="r.count > 0 ? '28px' : '0'">
                    </div>
                  </div>
                  <span class="text-xs font-bold text-gray-600 w-8 text-right flex-shrink-0">
                    {{ r.count }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Monthly breakdown table -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="font-bold text-gray-800 mb-5">Monthly Breakdown</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-orange-50 text-orange-700 text-xs uppercase tracking-wider">
                    <th class="text-left px-3 py-2 rounded-l-lg">Month</th>
                    <th class="text-right px-3 py-2">Revenue</th>
                    <th class="text-right px-3 py-2">Orders</th>
                    <th class="text-right px-3 py-2">Delivered</th>
                    <th class="text-right px-3 py-2 rounded-r-lg">Cancelled</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of data()!.monthly; track m.month; let i = $index) {
                    <tr [class]="i % 2 === 0 ? 'bg-gray-50' : 'bg-white'">
                      <td class="px-3 py-2 font-medium text-gray-700 text-xs">{{ m.month }}</td>
                      <td class="px-3 py-2 text-right text-orange-600 font-bold text-xs">
                        Rs. {{ formatNum(m.revenue) }}
                      </td>
                      <td class="px-3 py-2 text-right text-gray-600 text-xs">{{ m.orderCount }}</td>
                      <td class="px-3 py-2 text-right text-green-600 text-xs">{{ m.delivered }}</td>
                      <td class="px-3 py-2 text-right text-red-500 text-xs">{{ m.cancelled }}</td>
                    </tr>
                  }
                  <!-- Totals row -->
                  <tr class="border-t-2 border-orange-200 bg-orange-50 font-bold text-xs">
                    <td class="px-3 py-2 text-orange-700">Total</td>
                    <td class="px-3 py-2 text-right text-orange-700">
                      Rs. {{ formatNum(data()!.monthly.reduce(totalRevFn, 0)) }}
                    </td>
                    <td class="px-3 py-2 text-right text-gray-700">
                      {{ data()!.monthly.reduce(totalOrderFn, 0) }}
                    </td>
                    <td class="px-3 py-2 text-right text-green-700">
                      {{ data()!.monthly.reduce(totalDelFn, 0) }}
                    </td>
                    <td class="px-3 py-2 text-right text-red-600">
                      {{ data()!.monthly.reduce(totalCanFn, 0) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ── Recent Orders Table ────────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 print-page">
          <h2 class="font-bold text-gray-800 mb-5">Recent 10 Orders</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th class="px-4 py-3 text-left">Order ID</th>
                  <th class="px-4 py-3 text-left">Customer</th>
                  <th class="px-4 py-3 text-right">Items</th>
                  <th class="px-4 py-3 text-right">Total</th>
                  <th class="px-4 py-3 text-left">Status</th>
                  <th class="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (order of data()!.recentOrders; track order.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-mono text-xs text-gray-500">
                      #{{ order.id.toString().slice(-8).toUpperCase() }}
                    </td>
                    <td class="px-4 py-3 font-medium text-gray-800 text-xs">{{ order.customer }}</td>
                    <td class="px-4 py-3 text-right text-gray-500 text-xs">{{ order.items }}</td>
                    <td class="px-4 py-3 text-right font-bold text-orange-500 text-xs">
                      Rs. {{ order.total }}
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-xs font-semibold px-2 py-1 rounded-full"
                        [style.background]="getStatusColor(order.status) + '22'"
                        [style.color]="getStatusColor(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-400 text-xs">
                      {{ formatDate(order.date) }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

      </div><!-- /report-content -->
    }
  `
})
export class ReportsComponent implements OnInit {
  reportService = inject(ReportService);

  data    = signal<ReportSummary | null>(null);
  loading = signal(true);

  readonly BAR_COLORS = BAR_COLORS;

  // Reduce functions (used in template — must be arrow functions)
  totalRevFn   = (s: number, m: MonthlyData) => s + m.revenue;
  totalOrderFn = (s: number, m: MonthlyData) => s + m.orderCount;
  totalDelFn   = (s: number, m: MonthlyData) => s + m.delivered;
  totalCanFn   = (s: number, m: MonthlyData) => s + m.cancelled;

  ngOnInit(): void {
    this.reportService.getSummary().subscribe({
      next:  (res) => { this.data.set(res); this.loading.set(false); },
      error: ()    => this.loading.set(false)
    });
  }

  // ── KPI cards ─────────────────────────────────────────────────────────────
  kpiCards() {
    const d = this.data();
    if (!d) return [];
    return [
      { label: 'Total Revenue',   value: 'Rs. ' + this.formatNum(d.kpi.totalRevenue),  color: '#f97316', sub: 'All orders' },
      { label: 'Total Orders',    value: d.kpi.totalOrders,                            color: '#3b82f6', sub: undefined },
      { label: 'Total Users',     value: d.kpi.totalUsers,                             color: '#8b5cf6', sub: 'Registered' },
      { label: 'Avg Rating',      value: d.kpi.avgRating + ' ★',                      color: '#f59e0b', sub: d.kpi.totalReviews + ' reviews' },
      { label: 'Menu Items',      value: d.kpi.totalMenuItems,                         color: '#22c55e', sub: 'Total items' },
      { label: 'Total Reviews',   value: d.kpi.totalReviews,                           color: '#ef4444', sub: undefined },
    ];
  }

  // ── SVG Donut segments ────────────────────────────────────────────────────
  donutSegments() {
    const d = this.data();
    if (!d) return [];
    const total = d.ordersByStatus.reduce((s, x) => s + x.count, 0);
    if (total === 0) return [];

    const circumference = 2 * Math.PI * 45; // r=45
    let cumulativePct = 0;
    return d.ordersByStatus.map(s => {
      const pct     = s.count / total;
      const dash    = (pct * circumference) + ' ' + ((1 - pct) * circumference);
      const offset  = -cumulativePct * circumference;
      cumulativePct += pct;
      return { ...s, dash, offset, color: STATUS_COLORS[s.status] || '#9ca3af' };
    });
  }

  // ── Computed max values for bar width scaling ─────────────────────────────
  maxRevenue(): number {
    const d = this.data();
    if (!d || !d.monthly.length) return 1;
    return Math.max(...d.monthly.map(m => m.revenue), 1);
  }

  maxCatCount(): number {
    const d = this.data();
    if (!d || !d.topCategories.length) return 1;
    return Math.max(...d.topCategories.map(c => c.count), 1);
  }

  maxRatingCount(): number {
    const d = this.data();
    if (!d || !d.ratingDist.length) return 1;
    return Math.max(...d.ratingDist.map(r => r.count), 1);
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  getBarWidth(val: number, max: number): number {
    return max > 0 ? Math.round((val / max) * 100) : 0;
  }

  getStatusColor(status: string): string {
    return STATUS_COLORS[status] || '#9ca3af';
  }

  formatNum(n: number): string {
    if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
    if (n >= 1000)   return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  }

  formatDate(dateStr: string): string {
    try { return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
  }

  // ── CSV Export ─────────────────────────────────────────────────────────────
  exportCSV(): void {
    const d = this.data();
    if (!d) return;

    let csv = 'BabaSai Restaurant Report\n\n';

    // KPI
    csv += 'KPI Summary\n';
    csv += 'Metric,Value\n';
    csv += `Total Revenue,Rs. ${d.kpi.totalRevenue}\n`;
    csv += `Total Orders,${d.kpi.totalOrders}\n`;
    csv += `Total Users,${d.kpi.totalUsers}\n`;
    csv += `Average Rating,${d.kpi.avgRating}\n`;
    csv += `Total Reviews,${d.kpi.totalReviews}\n`;
    csv += `Total Menu Items,${d.kpi.totalMenuItems}\n\n`;

    // Monthly
    csv += 'Monthly Breakdown\n';
    csv += 'Month,Revenue,Orders,Delivered,Cancelled\n';
    d.monthly.forEach(m => {
      csv += `${m.month},${m.revenue},${m.orderCount},${m.delivered},${m.cancelled}\n`;
    });
    csv += '\n';

    // Orders by status
    csv += 'Orders by Status\n';
    csv += 'Status,Count\n';
    d.ordersByStatus.forEach(s => { csv += `${s.status},${s.count}\n`; });
    csv += '\n';

    // Top items
    csv += 'Top Selling Items\n';
    csv += 'Item,Quantity Sold\n';
    d.topItems.forEach(i => { csv += `${i.name},${i.count}\n`; });
    csv += '\n';

    // Rating dist
    csv += 'Rating Distribution\n';
    csv += 'Stars,Count\n';
    d.ratingDist.forEach(r => { csv += `${r.star} Stars,${r.count}\n`; });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `BabaSai_Report_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Print / PDF ────────────────────────────────────────────────────────────
  printReport(): void {
    window.print();
  }
}
