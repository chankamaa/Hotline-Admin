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

export default function TechnicianDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  type ChangeType = "increase" | "decrease" | "neutral";
  const [stats, setStats] = useState({
    assignedToMe: { value: "0", change: "Active jobs", changeType: "neutral" as ChangeType },
    inProgress: { value: "0", change: "In progress", changeType: "increase" as ChangeType },
    completedToday: { value: "0", change: "Finished today", changeType: "increase" as ChangeType },
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
      const [inProgressRepairsRes, receivedRepairsRes] =
        await Promise.allSettled([
          repairApi.getMyJobs({ status: 'IN_PROGRESS', limit: 20 }),
          repairApi.getMyJobs({ status: 'RECEIVED', limit: 10 }),
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
          value: "0", // Would need a separate API call with completedAt filter
          change: "Finished today",
          changeType: "neutral",
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
      toast.success(`Started working on ${jobNumber}. Status updated to IN_PROGRESS.`);

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

    // Validate form
    if (!completeFormData.diagnosisNotes.trim()) {
      toast.error("Please enter diagnosis notes");
      return;
    }
    if (!completeFormData.repairNotes.trim()) {
      toast.error("Please enter repair notes");
      return;
    }

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
      toast.success(`${selectedRepair.id} marked as complete. Status updated to READY.`);

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
    <div className="bg-gray-100 p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Technician Dashboard"
          description="Your repair jobs and workflow"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/repairs/my-analytics')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <BarChart3 size={16} />
            <span className="text-sm font-medium">My Analytics</span>
          </button>
          <button
            onClick={() => router.push('/admin/repairs?tab=create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Create Job</span>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          title="Completed Today"
          value={stats.completedToday.value}
          change={stats.completedToday.change}
          changeType={stats.completedToday.changeType}
          icon={<CheckCircle size={20} />}
        />
        <StatsCard
          title="Pending Assignment"
          value={stats.pending.value}
          change={stats.pending.change}
          changeType="neutral"
          icon={<Clock size={20} />}
        />
      </div>

      {/* My Active Repairs */}
      <div ref={myActiveRepairsRef} className="mb-6 bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">My Active Repairs</h3>
          </div>
          {myRepairs.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {myRepairs.length} jobs
            </span>
          )}
        </div>
        <div className="divide-y">
          {myRepairs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Wrench className="mx-auto mb-2 opacity-50" size={32} />
              <p>No active repairs assigned</p>
              <p className="text-xs mt-1">Check pending repairs below</p>
            </div>
          ) : (
            myRepairs.map((repair) => (
              <div key={repair.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-medium text-sm text-black">{repair.id}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${repair.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : repair.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                        }`}>
                        {repair.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{repair.customer}</div>
                    <div className="text-xs text-gray-500">{repair.device}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-black">{repair.estimatedCost}</div>
                    <div className="text-xs text-gray-500">{repair.createdAt}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Issue:</span> {repair.issue}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenCompleteModal(repair)}
                    disabled={completingJobId === repair._id}
                    className={`text-xs px-4 py-1.5 bg-green-600 text-white rounded font-medium transition-all hover:bg-green-700 flex items-center gap-1.5 ${completingJobId === repair._id ? 'opacity-60 cursor-not-allowed' : ''
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
        <div className="p-4 border-t">
          <a href="/admin/repairs" className="text-sm text-blue-600 hover:text-blue-700">
            View all my repairs →
          </a>
        </div>
      </div>

      {/* Pending Repairs - Awaiting Assignment */}
      <div className="mb-6 bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900">Pending Repairs - Awaiting Assignment</h3>
          </div>
          {pendingRepairs.length > 0 && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
              {pendingRepairs.length} pending
            </span>
          )}
        </div>
        <div className="divide-y">
          {pendingRepairs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="mx-auto mb-2 opacity-50" size={32} />
              <p>No pending repairs</p>
              <p className="text-xs mt-1">All jobs are assigned</p>
            </div>
          ) : (
            pendingRepairs.map((repair) => (
              <div key={repair.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-medium text-sm text-black">{repair.id}</div>
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
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-2">{repair.createdAt}</div>
                    <button
                      onClick={() => handleStartJob(repair._id, repair.id)}
                      disabled={startingJobId === repair._id}
                      className={`text-xs px-4 py-1.5 bg-green-600 text-white rounded font-medium transition-all hover:bg-green-700 ${startingJobId === repair._id ? 'opacity-60 cursor-not-allowed' : ''
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
        <div className="p-4 border-t">
          <a href="/admin/repairs" className="text-sm text-blue-600 hover:text-blue-700">
            View all pending repairs →
          </a>
        </div>
      </div>

      {/* Quick Actions & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Today's Progress</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {stats.completedToday.value} repairs completed
          </p>
          <p className="text-xs text-gray-500">Great job! Keep it up!</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package size={20} className="text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Parts Needed</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">3 jobs awaiting parts</p>
          <a href="/admin/stock" className="text-xs text-blue-600 hover:text-blue-700">
            Check inventory →
          </a>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <AlertCircle size={20} className="text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Urgent Jobs</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">2 urgent repairs pending</p>
          <p className="text-xs text-gray-500">Check priority queue</p>
        </div>
      </div>

      {/* Workflow Reminder */}
      <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Repair Workflow Reminder</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">1</div>
            <span>Receive Job</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">2</div>
            <span>Diagnose Issue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">3</div>
            <span>Get Approval</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">4</div>
            <span>Complete Repair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">5</div>
            <span>Quality Check</span>
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
                <p className="text-sm text-gray-500">{selectedRepair.id}</p>
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
                  <div>
                    <span className="text-gray-500">Estimated Cost:</span>
                    <p className="font-medium text-gray-900">{selectedRepair.estimatedCost}</p>
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
                  value={completeFormData.laborCost}
                  onChange={(e) => setCompleteFormData(prev => ({
                    ...prev,
                    laborCost: parseFloat(e.target.value) || 0
                  }))}
                  min="0"
                  step="0.01"
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
                      <div className="col-span-5">
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
                      <div className="col-span-2">
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
                      <div className="col-span-3">
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
                            <td className="px-3 py-2">
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

              {/* Diagnosis Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis Notes <span className="text-red-500">*</span>
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
              </div>

              {/* Repair Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repair Notes <span className="text-red-500">*</span>
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
                disabled={submittingComplete || !completeFormData.diagnosisNotes.trim() || !completeFormData.repairNotes.trim()}
                className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 ${submittingComplete || !completeFormData.diagnosisNotes.trim() || !completeFormData.repairNotes.trim()
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
