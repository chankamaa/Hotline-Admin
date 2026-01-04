import "./globals.css";
import type { Metadata } from "next";

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
      <body className="bg-gray">
        {children}
      </body>
    </html>
  );
}
