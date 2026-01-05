'use client';

import { PageHeader } from '@/components/ui/page-header';
import TechnicianDashboard from '@/components/repairs/technician-dashboard';

export default function RepairWorkloadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Technician Workload"
        description="Monitor technician performance and manage workload distribution"
      />
      <TechnicianDashboard />
    </div>
  );
}
