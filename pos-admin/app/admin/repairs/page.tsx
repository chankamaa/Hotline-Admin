'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import RepairJobList from '@/components/repairs/repair-job-list';
import RepairJobForm from '@/app/admin/repairs/create-job/repair-job-form';
import { Plus } from 'lucide-react';

type ViewType = 'list' | 'create';

export default function RepairsPage() {
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<ViewType>('list');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Handle URL query parameters on mount
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'create') {
      setActiveView('create');
      setSelectedJobId(null);
    }
  }, [searchParams]);

  const handleCreateNew = () => {
    setSelectedJobId(null);
    setActiveView('create');
  };

  const handleEditJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setActiveView('create');
  };

  const handleJobCreated = () => {
    setSelectedJobId(null);
    setActiveView('list');
  };

  const handleCancel = () => {
    setSelectedJobId(null);
    setActiveView('list');
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <PageHeader
          title={activeView === 'list' ? 'All Repair Jobs' : selectedJobId ? 'Edit Repair Job' : 'Create Repair Job'}
          description={activeView === 'list' ? 'Manage all repair jobs and service requests' : 'Fill in the details to create or edit a repair job'}
          action={
            activeView === 'list' && (
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Repair Job
              </Button>
            )
          }
        />

        {activeView === 'list' && (
          <RepairJobList onEditJob={handleEditJob} />
        )}
        
        {activeView === 'create' && (
          <RepairJobForm
            jobId={selectedJobId}
            onSuccess={handleJobCreated}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
