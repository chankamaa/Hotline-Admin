'use client';

import { PageHeader } from '@/components/ui/page-header';
import TechnicianDashboard from '@/app/admin/repairs/technician-dashboard/technician-dashboard';
import RequirePerm from '@/components/RequirePerm';
import { PERMISSIONS } from '@/components/sidebar-config';

export default function RepairWorkloadPage() {
  return (
    <RequirePerm perm={PERMISSIONS.REPAIR_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Technician Workload"
          description="Monitor technician performance and manage workload distribution"
        />
        <TechnicianDashboard />
      </div>
    </RequirePerm>
  );
}
