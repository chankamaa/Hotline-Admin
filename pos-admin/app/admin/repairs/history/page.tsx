'use client';

import { PageHeader } from '@/components/ui/page-header';
import RepairHistory from '@/components/repairs/repair-history';
import RequirePerm from '@/components/RequirePerm';
import { PERMISSIONS } from '@/components/sidebar-config';

export default function RepairHistoryPage() {
  return (
    <RequirePerm perm={PERMISSIONS.REPAIR_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Repair History"
          description="Search and view customer repair history and device tracking"
        />
        <RepairHistory />
      </div>
    </RequirePerm>
  );
}
