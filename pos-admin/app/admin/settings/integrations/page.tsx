"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowLeft,
  HardDrive,
  CreditCard,
  Mail,
  MessageSquare,
  Cloud,
  ChevronRight,
  Printer,
  Barcode,
  Tag,
  DollarSign,
  Send,
  Database
} from "lucide-react";

export default function IntegrationsPage() {
  const integrationCategories = [
    {
      title: "Hardware Devices",
      description: "Configure physical devices and peripherals",
      items: [
        {
          title: "Hardware Configuration",
          description: "Receipt printers, barcode scanners, label printers, and cash drawers",
          icon: HardDrive,
          href: "/admin/settings/hardware",
          color: "red",
          status: "Connected"
        }
      ]
    },
    {
      title: "Payment Processing",
      description: "Payment gateways and processing services",
      items: [
        {
          title: "Payment Gateway",
          description: "Configure Stripe, PayPal, Square, and other payment processors",
          icon: CreditCard,
          href: "/admin/settings/payment",
          color: "green",
          status: "Active"
        }
      ]
    },
    {
      title: "Communication Services",
      description: "Email and SMS notification services",
      items: [
        {
          title: "Email & SMS Configuration",
          description: "SMTP, SendGrid, Twilio, and other communication services",
          icon: Mail,
          href: "/admin/settings/communication",
          color: "blue",
          status: "Configured"
        }
      ]
    },
    {
      title: "Cloud & Storage",
      description: "Cloud backup and synchronization",
      items: [
        {
          title: "Cloud Storage Sync",
          description: "AWS S3, Google Cloud, Azure, and backup services",
          icon: Cloud,
          href: "/admin/settings/cloud",
          color: "sky",
          status: "Syncing"
        }
      ]
    }
  ];

  const quickStats = [
    {
      label: "Active Integrations",
      value: "8",
      icon: HardDrive,
      color: "blue"
    },
    {
      label: "API Calls Today",
      value: "1,247",
      icon: Send,
      color: "green"
    },
    {
      label: "Success Rate",
      value: "99.2%",
      icon: Database,
      color: "purple"
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
      </div>
      
      <div className="mb-6">
        <PageHeader
          title="Integration Settings"
          description="Configure hardware devices, payment gateways, and third-party services"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-black">{stat.value}</div>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Categories */}
      <div className="space-y-6">
        {integrationCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-xl border p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-black">{category.title}</h2>
              <p className="text-sm text-gray-500">{category.description}</p>
            </div>

            <div className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <Link key={itemIndex} href={item.href}>
                  <div className="group border rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 bg-${item.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <item.icon className={`text-${item.color}-600`} size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-black group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </h3>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight 
                        size={20} 
                        className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold text-black mb-4">Recent Integration Activity</h2>
        <div className="space-y-3">
          {[
            { service: "Payment Gateway", action: "Transaction processed", time: "2 minutes ago", status: "success" },
            { service: "Email Service", action: "Order confirmation sent", time: "5 minutes ago", status: "success" },
            { service: "Cloud Sync", action: "Backup completed", time: "15 minutes ago", status: "success" },
            { service: "SMS Gateway", action: "Notification sent", time: "23 minutes ago", status: "success" },
            { service: "Receipt Printer", action: "Print job completed", time: "45 minutes ago", status: "success" }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === "success" ? "bg-green-500" : "bg-red-500"
                }`}></div>
                <div>
                  <div className="font-medium text-black text-sm">{activity.service}</div>
                  <div className="text-xs text-gray-500">{activity.action}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Health */}
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4">System Health</h3>
          <div className="space-y-3">
            {[
              { name: "Hardware Devices", status: 100 },
              { name: "Payment Gateway", status: 99 },
              { name: "Email Service", status: 98 },
              { name: "Cloud Storage", status: 100 }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-semibold text-black">{item.status}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${item.status}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <HardDrive size={16} className="mr-2" />
              Test All Connections
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Database size={16} className="mr-2" />
              View API Logs
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Send size={16} className="mr-2" />
              Resend Failed Requests
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
