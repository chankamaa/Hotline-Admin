import "./globals.css";
import type { Metadata } from "next";
import { AdminLayout } from "./app/(admin)/admin-layout";


export const metadata: Metadata = {
  title: "Hotline Admin",
  description: "POS Administration Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AdminLayout> {children}</AdminLayout>
      
    </body>
    </html>
  );
}
