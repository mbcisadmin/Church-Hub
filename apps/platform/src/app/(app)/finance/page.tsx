'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  FileText,
  CreditCard,
  Receipt,
  BarChart3,
  TrendingUp,
  Search,
  Plus,
  Rocket,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';

const BUDGET_SUMMARY = [
  { label: 'Annual Budget', value: '$3.2M', sublabel: 'FY 2026' },
  { label: 'YTD Spent', value: '$412k', sublabel: '13% of budget' },
  { label: 'Open Requests', value: '7', sublabel: 'Pending approval' },
  { label: 'P-Card Balance', value: '$1,847', sublabel: 'Current period' },
];

const RECENT_TRANSACTIONS = [
  {
    id: '1',
    description: 'Office Supplies - Staples',
    amount: '$127.43',
    date: 'Feb 9, 2026',
    category: 'P-Card',
    status: 'pending',
  },
  {
    id: '2',
    description: 'Curriculum Materials',
    amount: '$450.00',
    date: 'Feb 7, 2026',
    category: 'Budget Request',
    status: 'approved',
  },
  {
    id: '3',
    description: 'Catering - Leadership Retreat',
    amount: '$1,200.00',
    date: 'Feb 5, 2026',
    category: 'Invoice',
    status: 'paid',
  },
];

const FINANCE_APPS = [
  {
    id: 'budget-requests',
    name: 'Budget Requests',
    description: 'Submit and track budget requests',
    icon: ClipboardList,
    route: '/finance/budget-requests',
  },
  {
    id: 'invoices',
    name: 'Invoices',
    description: 'Submit invoices for payment',
    icon: Receipt,
    route: '/finance/invoices',
  },
  {
    id: 'p-card',
    name: 'P-Card',
    description: 'Log and reconcile purchases',
    icon: CreditCard,
    route: '/finance/p-card',
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Financial reports and statements',
    icon: BarChart3,
    route: '/finance/reports',
  },
];

export default function FinancePage() {
  const router = useRouter();
  const { accessLevel } = useTestingContext();
  const { buildUrl } = usePreserveParams();

  const pageActions = useMemo(
    () => [
      {
        key: 'reports',
        icon: Search,
        label: 'View reports',
        variant: 'secondary' as const,
        onAction: () => router.push(buildUrl('/finance/reports')),
      },
      {
        key: 'request',
        icon: Plus,
        label: 'New request',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/finance/request')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Finance | The Hub';
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionHeader
          title="Finance"
          subtitle="Church financial management"
          icon={Wallet}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* Budget Summary */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {BUDGET_SUMMARY.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border p-4 shadow-sm">
            <span className="text-muted-foreground text-xs font-medium uppercase">
              {stat.label}
            </span>
            <p className="text-foreground mt-1 text-2xl font-bold">{stat.value}</p>
            <span className="text-muted-foreground text-xs">{stat.sublabel}</span>
          </div>
        ))}
      </section>

      {/* Recent Activity */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle
          icon={FileText}
          title="Recent Activity"
          subtitle="Latest financial transactions"
        />
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
          {RECENT_TRANSACTIONS.map((tx) => (
            <button
              key={tx.id}
              onClick={() => router.push(buildUrl(`/finance/${tx.id}`))}
              className="hover:bg-muted/50 flex w-full items-center justify-between border-b p-4 text-left transition-colors last:border-b-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground text-sm font-medium">{tx.description}</span>
                <span className="text-muted-foreground text-xs">
                  {tx.category} · {tx.date}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-foreground text-sm font-bold">{tx.amount}</span>
                <span
                  className={`text-xs font-medium capitalize ${
                    tx.status === 'approved'
                      ? 'text-green-600'
                      : tx.status === 'paid'
                        ? 'text-blue-600'
                        : 'text-amber-600'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Apps */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Financial tools" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {FINANCE_APPS.map((app) => (
            <AppCard
              key={app.id}
              name={app.name}
              description={app.description}
              icon={app.icon}
              onClick={() => router.push(buildUrl(app.route))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
