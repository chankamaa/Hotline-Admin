'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import RepairJobList from '@/components/repairs/repair-job-list';
import RepairJobForm from '@/components/repairs/repair-job-form';
import TechnicianDashboard from '@/components/repairs/technician-dashboard';
import RepairHistory from '@/components/repairs/repair-history';
import { Plus } from 'lucide-react';
import RequirePerm from '@/components/RequirePerm';
import { PERMISSIONS } from '@/components/sidebar-config';

type TabType = 'jobs' | 'create' | 'technicians' | 'history';

export default function RepairsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleCreateNew = () => {
    setSelectedJobId(null);
    setActiveTab('create');
  };

  const handleEditJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setActiveTab('create');
  };

  const handleJobCreated = () => {
    setSelectedJobId(null);
    setActiveTab('jobs');
  };

  return (
    <RequirePerm perm={PERMISSIONS.REPAIR_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Repair & Service Management"
          description="Manage repair jobs, technician workload, and service history"
          action={
            activeTab === 'jobs' && (
              <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Repair Job
            </Button>
          )
        }
      />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            All Repair Jobs
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            {selectedJobId ? 'Edit Job' : 'Create Job'}
          </button>
          <button
            onClick={() => setActiveTab('technicians')}
            className={`${
              activeTab === 'technicians'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Technician Workload
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Repair History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'jobs' && (
          <RepairJobList onEditJob={handleEditJob} />
        )}
        {activeTab === 'create' && (
          <RepairJobForm
            jobId={selectedJobId}
            onSuccess={handleJobCreated}
            onCancel={() => setActiveTab('jobs')}
          />
        )}
        {activeTab === 'technicians' && <TechnicianDashboard />}
        {activeTab === 'history' && <RepairHistory />}
      </div>
      </div>
    </RequirePerm>
  );
}
