/**
 * Technician Dashboard Component
 * 
 * Repair-focused interface for technicians with job assignments and workflow.
 * Shows assigned repairs, pending work, and completed tasks.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  RefreshCw,
  Settings,
  Plus,
  X,
  Trash2,
  Search,
  BarChart3,
} from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import { repairApi } from "@/lib/api/repairApi";
import { fetchProducts } from "@/lib/api/productApi";

// Part item type for the complete form
interface PartItem {
  productId?: string; // Optional for manual entries
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  isManual?: boolean; // Flag for manually entered parts
}

// Helper function to format job number as 5 digits
const formatJobNumber = (jobId: string): string => {
  // Extract RJ prefix and numeric part from job numbers like "RJ-20260209-0008" to "RJ-00008"
  const match = jobId.match(/^([A-Z]+).*-(\d+)$/);
  if (match) {
    const prefix = match[1]; // Just "RJ"
    const numericPart = match[2];
    return `${prefix}-${numericPart.padStart(5, '0')}`;
  }
  // Fallback: if pattern doesn't match, return original
  return jobId;
};

export default function TechnicianDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  type ChangeType = "increase" | "decrease" | "neutral";
  const [stats, setStats] = useState({
    assignedToMe: { value: "0", change: "Active jobs", changeType: "neutral" as ChangeType },
    inProgress: { value: "0", change: "In progress", changeType: "increase" as ChangeType },
    completedToday: { value: "0", change: "Ready today", changeType: "increase" as ChangeType },
    pending: { value: "0", change: "Awaiting assignment", changeType: "neutral" as ChangeType },
  });

  const [myRepairs, setMyRepairs] = useState<any[]>([]);
  const [pendingRepairs, setPendingRepairs] = useState<any[]>([]);
  const [startingJobId, setStartingJobId] = useState<string | null>(null);
  const [completingJobId, setCompletingJobId] = useState<string | null>(null);
  const myActiveRepairsRef = React.useRef<HTMLDivElement>(null);

  // Complete Job Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [completeFormData, setCompleteFormData] = useState({
    laborCost: 0,
    diagnosisNotes: "",
    repairNotes: "",
  });
  const [submittingComplete, setSubmittingComplete] = useState(false);

  // Parts Used State
  const [partsUsed, setPartsUsed] = useState<PartItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  // Manual Part Entry State
  const [isManualEntryMode, setIsManualEntryMode] = useState(false);
  const [manualPartData, setManualPartData] = useState({
    name: "",
    quantity: 1,
    price: 0,
  });
  const [manualEntryErrors, setManualEntryErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Use getMyJobs for technician's own repairs - this uses VIEW_OWN_REPAIRS permission
      const [inProgressRepairsRes, receivedRepairsRes, readyRepairsRes] =
        await Promise.allSettled([
          repairApi.getMyJobs({ status: 'IN_PROGRESS', limit: 20 }),
          repairApi.getMyJobs({ status: 'RECEIVED', limit: 10 }),
          repairApi.getMyJobs({ status: 'READY', limit: 50 }),
        ]);

      // Process in-progress repairs (assigned to technician)
      let inProgressCount = 0;
      if (inProgressRepairsRes.status === "fulfilled") {
        const repairsData: any = inProgressRepairsRes.value;
        const repairs = repairsData.data?.repairs || [];
        inProgressCount = repairs.length;

        setMyRepairs(repairs.map((repair: any) => ({
          _id: repair._id, // Store MongoDB _id for API calls
          id: repair.jobNumber || repair._id,
          customer: repair.customer?.name || "Unknown",
          device: `${repair.device?.brand || ""} ${repair.device?.model || ""}`.trim() || "Unknown Device",
          issue: repair.problemDescription || "Not specified",
          priority: repair.priority || "normal",
          estimatedCost: repair.estimatedCost || 0,
          estimatedCostDisplay: repair.estimatedCost ? `${repair.estimatedCost}` : "N/A",
          status: repair.status || "IN_PROGRESS",
          createdAt: new Date(repair.createdAt).toLocaleDateString(),
        })));
      }

      // Process pending/received repairs
      let receivedCount = 0;
      if (receivedRepairsRes.status === "fulfilled") {
        const repairsData: any = receivedRepairsRes.value;
        const repairs = repairsData.data?.repairs || [];
        receivedCount = repairs.length;

        setPendingRepairs(repairs.slice(0, 5).map((repair: any) => ({
          _id: repair._id, // Store MongoDB _id for API calls
          id: repair.jobNumber || repair._id,
          customer: repair.customer?.name || "Unknown",
          device: `${repair.device?.brand || ""} ${repair.device?.model || ""}`.trim() || "Unknown Device",
          issue: repair.problemDescription || "Not specified",
          priority: repair.priority || "normal",
          createdAt: new Date(repair.createdAt).toLocaleDateString(),
        })));
      }

      // Process ready repairs (completed jobs ready for pickup)
      let readyCount = 0;
      if (readyRepairsRes.status === "fulfilled") {
        const repairsData: any = readyRepairsRes.value;
        const repairs = repairsData.data?.repairs || [];
        readyCount = repairs.length;
      }

      // Update stats based on fetched data
      setStats({
        assignedToMe: {
          value: (inProgressCount + receivedCount).toString(),
          change: "Active jobs",
          changeType: "neutral",
        },
        inProgress: {
          value: inProgressCount.toString(),
          change: "Currently working",
          changeType: inProgressCount > 0 ? "increase" : "neutral",
        },
        completedToday: {
          value: readyCount.toString(),
          change: "Ready",
          changeType: readyCount > 0 ? "increase" : "neutral",
        },
        pending: {
          value: receivedCount.toString(),
          change: "Awaiting start",
          changeType: "neutral",
        },
      });

    } catch (error) {
      console.error("Error loading technician dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle starting a repair job
   * Calls PUT /api/v1/repairs/:id/start to update status to IN_PROGRESS
   */
  const handleStartJob = async (repairId: string, jobNumber: string) => {
    setStartingJobId(repairId);
    try {
      // Call the backend API to start the repair
      await repairApi.start(repairId);

      // Show success message
      toast.success(`Started working on ${formatJobNumber(jobNumber)}. Status updated to IN_PROGRESS.`);

      // Reload dashboard data to reflect changes
      await loadDashboardData();

      // Scroll to My Active Repairs section after a brief delay
      setTimeout(() => {
        myActiveRepairsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);

    } catch (error: any) {
      console.error("Error starting repair job:", error);
      const errorMessage = error.response?.data?.message || "Failed to start repair job";
      toast.error(errorMessage);
    } finally {
      setStartingJobId(null);
    }
  };

  /**
   * Open the Complete Job modal
   */
  const handleOpenCompleteModal = (repair: any) => {
    setSelectedRepair(repair);
    setCompleteFormData({
      laborCost: 0,
      diagnosisNotes: "",
      repairNotes: "",
    });
    setShowCompleteModal(true);
  };

  /**
   * Close the Complete Job modal
   */
  const handleCloseCompleteModal = () => {
    setShowCompleteModal(false);
    setSelectedRepair(null);
    setCompleteFormData({
      laborCost: 0,
      diagnosisNotes: "",
      repairNotes: "",
    });
    // Reset parts state
    setPartsUsed([]);
    setProductSearch("");
    setProductSuggestions([]);
    setShowSuggestions(false);
    // Reset manual entry state
    setIsManualEntryMode(false);
    setManualPartData({ name: "", quantity: 1, price: 0 });
    setManualEntryErrors({});
  };

  /**
   * Search for products to add as parts
   */
  const handleProductSearch = async (searchTerm: string) => {
    setProductSearch(searchTerm);

    if (searchTerm.length < 2) {
      setProductSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingProducts(true);
    try {
      const response = await fetchProducts({ search: searchTerm, limit: 10 });
      setProductSuggestions(response.data.products || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching products:", error);
      setProductSuggestions([]);
    } finally {
      setSearchingProducts(false);
    }
  };

  /**
   * Add a product as a part used
   */
  const handleAddPart = (product: any) => {
    // Check if already added
    const existingIndex = partsUsed.findIndex(p => p.productId === product._id);
    if (existingIndex >= 0) {
      // Increment quantity
      const updated = [...partsUsed];
      updated[existingIndex].quantity += 1;
      setPartsUsed(updated);
    } else {
      // Add new part
      setPartsUsed([...partsUsed, {
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.sellingPrice || 0,
        isManual: false, // Explicitly mark as inventory part
      }]);
    }
    setProductSearch("");
    setProductSuggestions([]);
    setShowSuggestions(false);
  };

  /**
   * Update part quantity
   */
  const handleUpdatePartQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const updated = [...partsUsed];
    updated[index].quantity = quantity;
    setPartsUsed(updated);
  };

  /**
   * Remove a part
   */
  const handleRemovePart = (index: number) => {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  };

  /**
   * Validate manual part entry
   */
  const validateManualPart = (): boolean => {
    const errors: Record<string, string> = {};

    if (!manualPartData.name.trim()) {
      errors.name = "Part name is required";
    }
    if (manualPartData.quantity < 1) {
      errors.quantity = "Quantity must be at least 1";
    }
    if (manualPartData.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    setManualEntryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Add a manual part (not from inventory)
   */
  const handleAddManualPart = () => {
    if (!validateManualPart()) {
      return;
    }

    setPartsUsed([
      ...partsUsed,
      {
        productId: undefined, // No product ID for manual entries
        productName: manualPartData.name.trim(),
        sku: undefined,
        quantity: manualPartData.quantity,
        unitPrice: manualPartData.price,
        isManual: true,
      },
    ]);

    // Reset form
    setManualPartData({ name: "", quantity: 1, price: 0 });
    setManualEntryErrors({});
    toast.success("Manual part added");
  };

  /**
   * Toggle between search and manual entry modes
   */
  const handleToggleManualMode = () => {
    setIsManualEntryMode(!isManualEntryMode);
    // Reset form state when toggling
    setProductSearch("");
    setProductSuggestions([]);
    setShowSuggestions(false);
    setManualPartData({ name: "", quantity: 1, price: 0 });
    setManualEntryErrors({});
  };

  /**
   * Calculate parts total
   */
  const getPartsTotal = () => {
    return partsUsed.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);
  };

  /**
   * Handle completing a repair job
   * Calls PUT /api/v1/repairs/:id/complete to update status to READY
   */
  const handleCompleteJob = async () => {
    if (!selectedRepair) return;

    setSubmittingComplete(true);
    try {
      // Separate inventory parts from manual parts
      const inventoryParts = partsUsed.filter(p => p.isManual !== true && p.productId);
      const manualParts = partsUsed.filter(p => p.isManual === true || !p.productId);

      // Append manual parts info to repair notes so they're recorded
      let repairNotes = completeFormData.repairNotes.trim();
      if (manualParts.length > 0) {
        const manualPartsText = manualParts
          .map(p => `- ${p.productName} (Qty: ${p.quantity}, Price: ${p.unitPrice.toFixed(2)}, Total: ${(p.quantity * p.unitPrice).toFixed(2)})`)
          .join('\n');
        repairNotes += `\n\n[Manual Parts Used]\n${manualPartsText}`;
      }

      // Call the backend API to complete the repair
      await repairApi.complete(selectedRepair._id, {
        laborCost: completeFormData.laborCost,
        diagnosisNotes: completeFormData.diagnosisNotes.trim(),
        repairNotes,
        partsUsed: inventoryParts.map(p => ({
          productId: p.productId!,
          productName: p.productName,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          ...(p.sku ? { sku: p.sku } : {}),
        })),
      });

      // Show success message
      toast.success(`${formatJobNumber(selectedRepair.id)} marked as complete. Status updated to READY.`);

      // Close modal and reload dashboard
      handleCloseCompleteModal();
      await loadDashboardData();

    } catch (error: any) {
      console.error("Error completing repair job:", error);
      const errorMessage = error.response?.data?.message || "Failed to complete repair job";
      toast.error(errorMessage);
    } finally {
      setSubmittingComplete(false);
    }
  };


  if (loading && !myRepairs.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <RefreshCw className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600">Loading technician dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-3 sm:p-4 md:p-6 w-full min-h-screen">
      {/* Responsive Header Section - Stacks on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 sm:mb-6">
        <PageHeader
          title="Technician Dashboard"
          description="Your repair jobs and workflow"
        />
        {/* Action Buttons - Horizontal scroll on mobile, flex-wrap on tablet, flex on desktop */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => router.push('/admin/repairs/my-analytics')}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <BarChart3 size={16} className="flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">My Analytics</span>
          </button>
          <button
            onClick={() => router.push('/admin/repairs?tab=create')}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <Plus size={16} className="flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Create Job</span>
          </button>
          <Button
            onClick={loadDashboardData}
            disabled={loading}
            variant="danger"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid - Responsive breakpoints:
          - Mobile (< 640px): 1 column
          - Tablet (640px - 1024px): 2 columns
          - Desktop (>= 1024px): 3 columns
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <StatsCard
          title="Assigned to Me"
          value={stats.assignedToMe.value}
          change={stats.assignedToMe.change}
          changeType={stats.assignedToMe.changeType}
          icon={<Wrench size={20} />}
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress.value}
          change={stats.inProgress.change}
          changeType={stats.inProgress.changeType}
          icon={<Settings size={20} />}
        />
        <StatsCard
          title="Ready Today"
          value={stats.completedToday.value}
          change={stats.completedToday.change}
          changeType={stats.completedToday.changeType}
          icon={<CheckCircle size={20} />}
        />
      </div>

      {/* My Active Repairs - Mobile-friendly card layout */}
      <div ref={myActiveRepairsRef} className="mb-4 sm:mb-6 bg-white rounded-xl border border-blue-600 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Wrench size={18} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">My Active Repairs</h3>
          </div>
          {myRepairs.length > 0 && (
            <span className="text-xs sm:text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              {myRepairs.length} {myRepairs.length === 1 ? 'job' : 'jobs'}
            </span>
          )}
        </div>
        <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {myRepairs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Wrench className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-900 font-medium mb-1">No active repairs assigned</p>
              <p className="text-sm text-gray-500">Check pending repairs below</p>
            </div>
          ) : (
            myRepairs.map((repair) => (
              <div key={repair.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                      <div className="font-medium text-sm text-black">{formatJobNumber(repair.id)}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${repair.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : repair.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                        }`}>
                        {repair.priority}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{repair.customer}</div>
                    <div className="text-xs text-gray-500 truncate">{repair.device}</div>
                  </div>
                  <div className="text-left sm:text-right flex sm:flex-col justify-between sm:justify-start gap-1 sm:gap-0">
                    <div className="font-semibold text-sm text-black">{repair.estimatedCost}</div>
                    <div className="text-xs text-gray-500">{repair.createdAt}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Issue:</span> {repair.issue}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleOpenCompleteModal(repair)}
                    disabled={completingJobId === repair._id}
                    className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 bg-green-600 text-white rounded font-medium transition-all hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-1.5 w-full sm:w-auto ${completingJobId === repair._id ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                  >
                    <CheckCircle size={12} />
                    Complete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <a href="/admin/repairs" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1">
            View all my repairs 
            <span>→</span>
          </a>
        </div>
      </div>

      {/* Pending Repairs - Awaiting Assignment - Responsive card */}
      <div className="mb-4 sm:mb-6 bg-white rounded-xl border border-blue-600 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock size={18} className="text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Pending Repairs - Awaiting Assignment</h3>
          </div>
          {pendingRepairs.length > 0 && (
            <span className="text-xs sm:text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
              {pendingRepairs.length} pending
            </span>
          )}
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {pendingRepairs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Clock className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-900 font-medium mb-1">No pending repairs</p>
              <p className="text-sm text-gray-500">All jobs are assigned</p>
            </div>
          ) : (
            pendingRepairs.map((repair) => (
              <div key={repair.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-medium text-sm text-black">{formatJobNumber(repair.id)}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${repair.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : repair.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                        }`}>
                        {repair.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{repair.customer}</div>
                    <div className="text-xs text-gray-500 mb-2">{repair.device}</div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Issue:</span> {repair.issue}
                    </div>
                  </div>
                  <div className="w-full sm:w-auto sm:text-right flex flex-col gap-2">
                    <div className="text-xs text-gray-500 order-2 sm:order-1">{repair.createdAt}</div>
                    <button
                      onClick={() => handleStartJob(repair._id, repair.id)}
                      disabled={startingJobId === repair._id}
                      className={`text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-1.5 bg-green-600 text-white rounded font-medium transition-all hover:bg-green-700 active:bg-green-800 w-full sm:w-auto order-1 sm:order-2 ${startingJobId === repair._id ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                    >
                      {startingJobId === repair._id ? (
                        <span className="flex items-center gap-1.5">
                          <RefreshCw size={12} className="animate-spin" />
                          Starting...
                        </span>
                      ) : (
                        'Start'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <a href="/admin/repairs" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1">
            View all pending repairs
            <span>→</span>
          </a>
        </div>
      </div>

      {/* Workflow Reminder - Responsive grid layout */}
      <div className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Repair Workflow Reminder</h3>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">1</div>
            <span className="text-xs sm:text-sm font-medium">Receive Job</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">2</div>
            <span className="text-xs sm:text-sm font-medium">Diagnose Issue</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">3</div>
            <span className="text-xs sm:text-sm font-medium">Get Approval</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">4</div>
            <span className="text-xs sm:text-sm font-medium">Complete Repair</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">5</div>
            <span className="text-xs sm:text-sm font-medium">Quality Check</span>
          </div>
        </div>
      </div>

      {/* Complete Job Modal */}
      {showCompleteModal && selectedRepair && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Complete Repair Job</h3>
                <p className="text-sm text-gray-500">{formatJobNumber(selectedRepair.id)}</p>
              </div>
              <button
                onClick={handleCloseCompleteModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Job Summary */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Customer:</span>
                    <p className="font-medium text-gray-900">{selectedRepair.customer}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Device:</span>
                    <p className="font-medium text-gray-900">{selectedRepair.device}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Issue:</span>
                    <p className="font-medium text-gray-900">{selectedRepair.issue}</p>
                  </div>
                 
                </div>
              </div>

              {/* Labor Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Labor Cost (Optional)
                </label>
                <input
                  type="number"
                  value={completeFormData.laborCost === 0 ? '' : completeFormData.laborCost}
                  onChange={(e) => setCompleteFormData(prev => ({
                    ...prev,
                    laborCost: e.target.value === '' ? 0 : parseFloat(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter labor cost..."
                />
              </div>

              {/* Parts Used Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Parts Used (Optional)</label>
                  </div>
                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={handleToggleManualMode}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors ${isManualEntryMode
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                  >
                    {isManualEntryMode ? (
                      <>
                        <Search size={12} />
                        Search Mode
                      </>
                    ) : (
                      <>
                        <Plus size={12} />
                        Manual Entry
                      </>
                    )}
                  </button>
                </div>

                {/* Product Search Mode */}
                {!isManualEntryMode && (
                  <div className="relative mb-3" ref={suggestionsRef}>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => handleProductSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                        placeholder="Search products to add..."
                      />
                      {searchingProducts && (
                        <RefreshCw size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                      )}
                    </div>

                    {/* Product Suggestions Dropdown */}
                    {showSuggestions && productSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {productSuggestions.map((product) => (
                          <button
                            key={product._id}
                            type="button"
                            onClick={() => handleAddPart(product)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0 text-sm"
                          >
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 flex justify-between">
                              <span>{product.sku || 'No SKU'}</span>
                              <span className="font-medium">{product.sellingPrice?.toFixed(2) || '0.00'}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Entry Mode */}
                {isManualEntryMode && (
                  <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-2 text-orange-700">
                      <Plus size={12} />
                      <span className="text-xs font-medium">Manual Part Entry</span>
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5 text-gray-700">
                        <input
                          type="text"
                          value={manualPartData.name}
                          onChange={(e) => setManualPartData(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${manualEntryErrors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="Part name..."
                        />
                        {manualEntryErrors.name && (
                          <p className="text-red-500 text-xs mt-0.5">{manualEntryErrors.name}</p>
                        )}
                      </div>
                      <div className="col-span-2 text-gray-700">
                        <input
                          type="number"
                          value={manualPartData.quantity}
                          onChange={(e) => setManualPartData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                          className={`w-full px-2 py-1.5 border rounded-md text-sm text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${manualEntryErrors.quantity ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="Qty"
                          min={1}
                        />
                      </div>
                      <div className="col-span-3 text-gray-700">
                        <input
                          type="number"
                          value={manualPartData.price || ''}
                          onChange={(e) => setManualPartData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className={`w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${manualEntryErrors.price ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="Price"
                          min={0}
                          step={0.01}
                        />
                      </div>
                      <div className="col-span-2">
                        <button
                          type="button"
                          onClick={handleAddManualPart}
                          className="w-full h-full px-2 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-xs font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Parts List */}
                {partsUsed.length > 0 && (
                  <div className="border rounded-lg overflow-hidden mb-3">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Part</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-600 w-20">Qty</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600 w-24">Price</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600 w-24">Total</th>
                          <th className="px-3 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {partsUsed.map((part, index) => (
                          <tr key={part.productId || `manual-${index}`} className={part.isManual ? 'bg-orange-50' : ''}>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{part.productName}</span>
                                {part.isManual && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                                    Manual
                                  </span>
                                )}
                              </div>
                              {part.sku && <div className="text-xs text-gray-500">{part.sku}</div>}
                              {part.isManual && <div className="text-xs text-orange-600 italic">Not in inventory</div>}
                            </td>
                            <td className="px-3 py-2 text-gray-700">
                              <input
                                type="number"
                                value={part.quantity}
                                onChange={(e) => handleUpdatePartQuantity(index, parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                              />
                            </td>
                            <td className="px-3 py-2 text-right text-gray-700">
                              {part.unitPrice.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-gray-900">
                              {(part.quantity * part.unitPrice).toFixed(2)}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => handleRemovePart(index)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-3 py-2 text-right font-medium text-gray-700">
                            Parts Total:
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-900">
                            {getPartsTotal().toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {partsUsed.length === 0 && (
                  <div className="text-center py-3 text-sm text-gray-500 bg-gray-50 rounded-lg">
                    No parts added yet. Search above to add parts.
                  </div>
                )}

                {/* Total Cost Summary */}
                {(completeFormData.laborCost > 0 || partsUsed.length > 0) && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Labor Cost:</span>
                      <span className="text-gray-900">{completeFormData.laborCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Parts Total:</span>
                      <span className="text-gray-900">{getPartsTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                      <span className="text-gray-700">Total Cost:</span>
                      <span className="text-green-700">{(completeFormData.laborCost + getPartsTotal()).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/*
                DIAGNOSIS NOTES SECTION
                - Required field for completing a repair job
                - Technician documents their findings during the diagnostic phase
                - Explains what was wrong with the device
                - Helps justify the repair cost and parts used
                - Stored in the database for future reference and warranty claims
              */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                 Diagnosis Notes (Optional)
                </label>
                <textarea
                  value={completeFormData.diagnosisNotes}
                  onChange={(e) => setCompleteFormData(prev => ({
                    ...prev,
                    diagnosisNotes: e.target.value
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Describe the diagnosis findings..."
                />
              </div> }

              {/* 
                REPAIR NOTES SECTION
                - Required field documenting actual repair work performed
                - Records specific actions taken to fix the device
                - Documents any complications or special procedures used
                - Manual parts (not in inventory) are automatically appended to these notes
                - Important for quality control and future service history
                - Used for warranty documentation and customer communication*/
             }
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repair Notes (Optional)
                </label>
                <textarea
                  value={completeFormData.repairNotes}
                  onChange={(e) => setCompleteFormData(prev => ({
                    ...prev,
                    repairNotes: e.target.value
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Describe the repair work performed..."
                />
              </div>  

              {/* Info Note */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  After completion, the job status will change to <strong>READY</strong> for customer pickup and payment collection.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={handleCloseCompleteModal}
                disabled={submittingComplete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteJob}
                disabled={submittingComplete}
                className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 ${submittingComplete
                  ? 'opacity-60 cursor-not-allowed'
                  : ''
                  }`}
              >
                {submittingComplete ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Mark as Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
