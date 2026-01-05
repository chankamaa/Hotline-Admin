'use client';

import { PageHeader } from '@/components/ui/page-header';
import RepairHistory from '@/components/repairs/repair-history';

export default function RepairHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Repair History"
        description="Search and view customer repair history and device tracking"
      />
      <RepairHistory />
    </div>
  );
}
