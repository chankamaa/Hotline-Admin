/**
 * Technician My Analytics Page
 * 
 * Displays individual technician's repair performance metrics:
 * - Total repair income
 * - Parts cost
 * - Labor cost
 * - Total completed jobs
 * 
 * Filtered by daily, weekly, or monthly time ranges.
 */

import TechnicianAnalytics from "@/components/dashboard/technician-analytics";

export default function MyAnalyticsPage() {
    return <TechnicianAnalytics />;
}
