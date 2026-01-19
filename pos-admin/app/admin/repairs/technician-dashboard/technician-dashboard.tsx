'use client';

import { useState } from 'react';
import { Users, Activity, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface Technician {
  id: string;
  name: string;
  photo?: string;
  specialization: string[];
  contact: string;
  status: 'available' | 'busy' | 'on-break' | 'off-duty';
  activeJobs: number;
  completedThisWeek: number;
  completedThisMonth: number;
  avgCompletionTime: number; // in hours
  customerRating: number;
  workloadCapacity: number; // percentage
}

export default function TechnicianDashboard() {
  const [technicians] = useState<Technician[]>([
    {
      id: 't1',
      name: 'Mike Johnson',
      specialization: ['Mobile Phones', 'Tablets'],
      contact: '+1234567890',
      status: 'busy',
      activeJobs: 5,
      completedThisWeek: 12,
      completedThisMonth: 48,
      avgCompletionTime: 2.5,
      customerRating: 4.8,
      workloadCapacity: 85,
    },
    {
      id: 't2',
      name: 'Alex Chen',
      specialization: ['Laptops', 'Desktops'],
      contact: '+1234567891',
      status: 'available',
      activeJobs: 2,
      completedThisWeek: 8,
      completedThisMonth: 35,
      avgCompletionTime: 3.2,
      customerRating: 4.9,
      workloadCapacity: 40,
    },
    {
      id: 't3',
      name: 'Emily Rodriguez',
      specialization: ['Mobile Phones', 'Smartwatches'],
      contact: '+1234567892',
      status: 'busy',
      activeJobs: 4,
      completedThisWeek: 15,
      completedThisMonth: 52,
      avgCompletionTime: 2.1,
      customerRating: 5.0,
      workloadCapacity: 70,
    },
    {
      id: 't4',
      name: 'David Kim',
      specialization: ['Gaming Consoles', 'Electronics'],
      contact: '+1234567893',
      status: 'on-break',
      activeJobs: 1,
      completedThisWeek: 6,
      completedThisMonth: 28,
      avgCompletionTime: 4.0,
      customerRating: 4.7,
      workloadCapacity: 20,
    },
  ]);

  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const badges = {
      available: 'bg-green-100 text-green-700',
      busy: 'bg-blue-100 text-blue-700',
      'on-break': 'bg-yellow-100 text-yellow-700',
      'off-duty': 'bg-gray-100 text-gray-700',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getWorkloadColor = (capacity: number) => {
    if (capacity >= 80) return 'bg-red-500';
    if (capacity >= 60) return 'bg-orange-500';
    if (capacity >= 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const selectedTechnician = technicians.find((t) => t.id === selectedTechnicianId);

  const totalActiveJobs = technicians.reduce((sum, t) => sum + t.activeJobs, 0);
  const totalCompletedThisWeek = technicians.reduce((sum, t) => sum + t.completedThisWeek, 0);
  const availableTechnicians = technicians.filter((t) => t.status === 'available').length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Total Technicians
          </div>
          <div className="text-2xl font-bold">{technicians.length}</div>
          <div className="text-xs text-green-600 mt-1">
            {availableTechnicians} available
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="text-sm text-blue-600 mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Active Jobs
          </div>
          <div className="text-2xl font-bold text-blue-700">{totalActiveJobs}</div>
          <div className="text-xs text-blue-600 mt-1">In progress</div>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm text-green-600 mb-1 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            This Week
          </div>
          <div className="text-2xl font-bold text-green-700">{totalCompletedThisWeek}</div>
          <div className="text-xs text-green-600 mt-1">Completed jobs</div>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <div className="text-sm text-purple-600 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Avg Rating
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {(technicians.reduce((sum, t) => sum + t.customerRating, 0) / technicians.length).toFixed(1)}
          </div>
          <div className="text-xs text-purple-600 mt-1">Customer satisfaction</div>
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {technicians.map((technician) => (
          <div
            key={technician.id}
            className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedTechnicianId === technician.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedTechnicianId(technician.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {technician.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{technician.name}</h3>
                  <p className="text-xs text-gray-500">{technician.contact}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                  technician.status
                )}`}
              >
                {technician.status.replace('-', ' ')}
              </span>
            </div>

            {/* Specialization */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Specialization:</p>
              <div className="flex flex-wrap gap-1">
                {technician.specialization.map((spec, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Workload Capacity */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Workload</span>
                <span className="text-xs font-semibold">{technician.workloadCapacity}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getWorkloadColor(
                    technician.workloadCapacity
                  )}`}
                  style={{ width: `${technician.workloadCapacity}%` }}
                ></div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t">
              <div>
                <div className="text-xs text-gray-600">Active</div>
                <div className="text-lg font-bold text-blue-600">{technician.activeJobs}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Week</div>
                <div className="text-lg font-bold text-green-600">
                  {technician.completedThisWeek}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Rating</div>
                <div className="text-lg font-bold text-yellow-600">
                  ⭐ {technician.customerRating}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Technician View */}
      {selectedTechnician && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-xl font-semibold mb-4">
            Performance Details: {selectedTechnician.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {selectedTechnician.activeJobs}
              </div>
              <div className="text-sm text-gray-600">Current Active Jobs</div>
              <div className="text-xs text-gray-500 mt-1">In queue and in-progress</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {selectedTechnician.completedThisWeek}
              </div>
              <div className="text-sm text-gray-600">Completed This Week</div>
              <div className="text-xs text-gray-500 mt-1">
                {selectedTechnician.completedThisMonth} this month
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">
                {selectedTechnician.avgCompletionTime}h
              </div>
              <div className="text-sm text-gray-600">Avg Completion Time</div>
              <div className="text-xs text-gray-500 mt-1">Per job average</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-700">
                ⭐ {selectedTechnician.customerRating}
              </div>
              <div className="text-sm text-gray-600">Customer Rating</div>
              <div className="text-xs text-gray-500 mt-1">Average satisfaction</div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Capacity Analysis</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getWorkloadColor(
                      selectedTechnician.workloadCapacity
                    )}`}
                    style={{ width: `${selectedTechnician.workloadCapacity}%` }}
                  >
                    {selectedTechnician.workloadCapacity}%
                  </div>
                </div>
              </div>
              <div className="text-sm">
                {selectedTechnician.workloadCapacity >= 80 ? (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    High workload
                  </span>
                ) : selectedTechnician.workloadCapacity >= 60 ? (
                  <span className="text-orange-600">Moderate workload</span>
                ) : (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Available capacity
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
