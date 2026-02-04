"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Building2,
  Store,
  Bell,
  Globe,
  Database,
  Download,
  HardDrive,
  CreditCard,
  Mail,
  Cloud,
  Settings as SettingsIcon,
  ChevronRight,
  Shield,
  Clock
} from "lucide-react";

export default function SettingsPage() {
  const settingsSections = [
    {
      category: "General Settings",
      description: "Configure company information and store settings",
      items: [
        {
          title: "Company Information",
          description: "Company name, logo, address, contact details, and tax information",
          icon: Building2,
          href: "/admin/settings/company",
          color: "blue"
        },
        {
          title: "Store Settings",
          description: "Store locations, currency, tax configuration, and receipt customization",
          icon: Store,
          href: "/admin/settings/store",
          color: "green"
        }
      ]
    },
    {
      category: "User Preferences",
      description: "Customize notifications and display preferences",
      items: [
        {
          title: "Notification Settings",
          description: "Email alerts, low stock notifications, reports, and warranty expiry alerts",
          icon: Bell,
          href: "/admin/settings/notifications",
          color: "orange"
        },
        {
          title: "Display Settings",
          description: "Date/time formats, number formatting, and language preferences",
          icon: Globe,
          href: "/admin/settings/display",
          color: "purple"
        }
      ]
    },
    {
      category: "Backup & Data Management",
      description: "Manage data backups, exports, and restoration",
      items: [
        {
          title: "Backup Configuration",
          description: "Automated backups, retention policies, and restore options",
          icon: Database,
          href: "/admin/settings/backup",
          color: "indigo"
        },
        {
          title: "Data Export",
          description: "Export database, select tables, schedule exports",
          icon: Download,
          href: "/admin/settings/export",
          color: "cyan"
        }
      ]
    },
    {
      category: "Integration Settings",
      description: "Configure hardware devices and third-party services",
      items: [
        {
          title: "Hardware Configuration",
          description: "Receipt printers, barcode scanners, label printers, cash drawers",
          icon: HardDrive,
          href: "/admin/settings/hardware",
          color: "red"
        },
        {
          title: "Payment Gateway",
          description: "Configure payment processing and gateway settings",
          icon: CreditCard,
          href: "/admin/settings/payment",
          color: "green"
        },
        {
          title: "Email & SMS",
          description: "Email service configuration and SMS gateway setup",
          icon: Mail,
          href: "/admin/settings/communication",
          color: "blue"
        },
        {
          title: "Cloud Storage",
          description: "Cloud storage sync settings and backup integration",
          icon: Cloud,
          href: "/admin/settings/cloud",
          color: "sky"
        }
      ]
    }
  ];

  const quickActions = [
    {
      title: "System Status",
      description: "Check system health",
      icon: Shield,
      action: "View Status"
    },
    {
      title: "Activity Logs",
      description: "View recent changes",
      icon: Clock,
      action: "View Logs"
    },
    {
      title: "Backup Now",
      description: "Create manual backup",
      icon: Database,
      action: "Start Backup"
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="System Configuration"
        description="Configure and manage all system settings, integrations, and preferences"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {quickActions.map((action, index) => (
          <div key={index} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <action.icon className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-black text-sm">{action.title}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost">
                {action.action}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-xl border p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-black">{section.category}</h2>
              <p className="text-sm text-gray-500">{section.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {section.items.map((item, itemIndex) => (
                <Link key={itemIndex} href={item.href}>
                  <div className="group border rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-12 h-12 bg-${item.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <item.icon className={`text-${item.color}-600`} size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-black mb-1 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight 
                        size={20} 
                        className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-3"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* System Information */}
      <div className="mt-6 bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
          <SettingsIcon size={20} />
          System Information
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Version</div>
            <div className="font-semibold text-black">v2.5.0</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Last Backup</div>
            <div className="font-semibold text-black">2026-01-07 02:30 AM</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Database Size</div>
            <div className="font-semibold text-black">1.2 GB</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Active Users</div>
            <div className="font-semibold text-black">12</div>
          </div>
        </div>
      </div>
    </div>
  );
}
