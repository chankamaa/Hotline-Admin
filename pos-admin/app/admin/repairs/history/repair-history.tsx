'use client';

import { useState } from 'react';
import { Search, Phone, Smartphone, DollarSign, Clock, Calendar } from 'lucide-react';

interface RepairHistoryItem {
  id: string;
  jobNumber: string;
  deviceType: string;
  brand: string;
  model: string;
  imei?: string;
  issue: string;
  cost: number;
  status: string;
  technicianName: string;
  createdAt: Date;
  completedAt?: Date;
}

interface CustomerHistory {
  customerId: string;
  customerName: string;
  phone: string;
  totalRepairs: number;
  totalSpent: number;
  repairs: RepairHistoryItem[];
}

export default function RepairHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'customer' | 'imei'>('customer');
  const [searchResults, setSearchResults] = useState<CustomerHistory | null>(null);

  // Mock data - replace with actual API calls
  const mockCustomerData: CustomerHistory = {
    customerId: 'c1',
    customerName: 'John Doe',
    phone: '+1234567890',
    totalRepairs: 5,
    totalSpent: 1250.00,
    repairs: [
      {
        id: '1',
        jobNumber: 'REP-001',
        deviceType: 'Mobile Phone',
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        imei: '123456789012345',
        issue: 'Cracked screen replacement',
        cost: 250,
        status: 'completed',
        technicianName: 'Mike Johnson',
        createdAt: new Date('2025-12-10'),
        completedAt: new Date('2025-12-12'),
      },
      {
        id: '2',
        jobNumber: 'REP-045',
        deviceType: 'Mobile Phone',
        brand: 'Apple',
        model: 'iPhone 13',
        imei: '987654321098765',
        issue: 'Battery replacement',
        cost: 120,
        status: 'completed',
        technicianName: 'Alex Chen',
        createdAt: new Date('2025-10-15'),
        completedAt: new Date('2025-10-16'),
      },
      {
        id: '3',
        jobNumber: 'REP-089',
        deviceType: 'Tablet',
        brand: 'Apple',
        model: 'iPad Pro 12.9"',
        issue: 'Charging port repair',
        cost: 180,
        status: 'completed',
        technicianName: 'Emily Rodriguez',
        createdAt: new Date('2025-08-22'),
        completedAt: new Date('2025-08-24'),
      },
      {
        id: '4',
        jobNumber: 'REP-112',
        deviceType: 'Mobile Phone',
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        imei: '123456789012345',
        issue: 'Camera malfunction',
        cost: 300,
        status: 'completed',
        technicianName: 'Mike Johnson',
        createdAt: new Date('2025-06-05'),
        completedAt: new Date('2025-06-07'),
      },
      {
        id: '5',
        jobNumber: 'REP-156',
        deviceType: 'Smartwatch',
        brand: 'Apple',
        model: 'Apple Watch Series 8',
        issue: 'Screen replacement',
        cost: 400,
        status: 'completed',
        technicianName: 'Emily Rodriguez',
        createdAt: new Date('2025-04-18'),
        completedAt: new Date('2025-04-20'),
      },
    ],
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert('Please enter a search term');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      if (searchType === 'customer') {
        setSearchResults(mockCustomerData);
      } else {
        // Filter by IMEI
        const filteredRepairs = mockCustomerData.repairs.filter(
          (r) => r.imei && r.imei.includes(searchTerm)
        );
        setSearchResults({
          ...mockCustomerData,
          repairs: filteredRepairs,
          totalRepairs: filteredRepairs.length,
          totalSpent: filteredRepairs.reduce((sum, r) => sum + r.cost, 0),
        });
      }
    }, 300);
  };

  const getRepairFrequency = () => {
    if (!searchResults) return null;

    const deviceCounts: Record<string, number> = {};
    searchResults.repairs.forEach((repair) => {
      const key = `${repair.brand} ${repair.model}`;
      deviceCounts[key] = (deviceCounts[key] || 0) + 1;
    });

    return Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);
  };

  const deviceFrequency = getRepairFrequency();

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Search Repair History</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search By
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'customer' | 'imei')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="customer">Customer Phone Number</option>
              <option value="imei">Device IMEI</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {searchType === 'customer' ? 'Phone Number' : 'IMEI Number'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={
                    searchType === 'customer'
                      ? 'Enter phone number...'
                      : 'Enter device IMEI...'
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          {/* Customer Summary */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
                  <Phone className="w-4 h-4" />
                  Customer
                </div>
                <div className="text-xl font-semibold">{searchResults.customerName}</div>
                <div className="text-blue-100 text-sm">{searchResults.phone}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
                  <Smartphone className="w-4 h-4" />
                  Total Repairs
                </div>
                <div className="text-3xl font-bold">{searchResults.totalRepairs}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  Total Spent
                </div>
                <div className="text-3xl font-bold">${searchResults.totalSpent.toFixed(2)}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Customer Since
                </div>
                <div className="text-lg font-semibold">
                  {searchResults.repairs.length > 0
                    ? new Date(
                        Math.min(...searchResults.repairs.map((r) => r.createdAt.getTime()))
                      ).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Device Repair Frequency */}
          {deviceFrequency && deviceFrequency.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Device Repair Frequency</h3>
              <div className="space-y-3">
                {deviceFrequency.map(([device, count], index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium truncate" title={device}>
                      {device}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-blue-600 h-6 rounded-full flex items-center justify-end px-3 text-white text-xs font-semibold"
                          style={{
                            width: `${(count / searchResults.totalRepairs) * 100}%`,
                            minWidth: '40px',
                          }}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 w-16 text-right">
                      {((count / searchResults.totalRepairs) * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
              {deviceFrequency.some(([, count]) => count >= 3) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ High repair frequency detected. Consider recommending device replacement.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Repair History List */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">All Past Repairs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Job #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      IMEI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Issue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Technician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.repairs.map((repair) => (
                    <tr key={repair.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">
                          {repair.jobNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {repair.brand} {repair.model}
                        </div>
                        <div className="text-xs text-gray-500">{repair.deviceType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-500">
                          {repair.imei || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={repair.issue}>
                          {repair.issue}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {repair.technicianName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {repair.createdAt.toLocaleDateString()}
                        </div>
                        {repair.completedAt && (
                          <div className="text-xs text-gray-500">
                            Completed: {repair.completedAt.toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${repair.cost.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          {repair.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searchResults && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Search for Repair History
          </h3>
          <p className="text-gray-500">
            Enter a customer phone number or device IMEI to view repair history
          </p>
        </div>
      )}
    </div>
  );
}
