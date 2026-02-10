"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Grid2x2, Minus, Plus } from "lucide-react";
import Link from "next/link";
import JsBarcode from "jsbarcode";

/* --------------------------------------------------
   Preset options
-------------------------------------------------- */
const LABEL_PRESETS = [1, 2, 4, 6, 8, 12, 16, 24] as const;

/** Return CSS grid columns for a given label count */
function gridCols(count: number): number {
  if (count <= 1) return 1;
  if (count <= 2) return 2;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  if (count <= 9) return 3;
  return 4;
}

/* --------------------------------------------------
   Inner component that reads search params
-------------------------------------------------- */
function BarcodePrintContent() {
  const searchParams = useSearchParams();
  const productName = searchParams.get("name") || "Unknown Product";
  const barcode = searchParams.get("barcode") || "";

  const [labelsPerSheet, setLabelsPerSheet] = useState(1);
  const barcodeRefs = useRef<(SVGSVGElement | null)[]>([]);

  const renderBarcode = useCallback(() => {
    if (!barcode) return;
    barcodeRefs.current.forEach((svg) => {
      if (!svg) return;
      try {
        JsBarcode(svg, barcode, {
          format: "CODE128",
          width: labelsPerSheet >= 6 ? 1.5 : 2,
          height: labelsPerSheet >= 6 ? 50 : 80,
          displayValue: true,
          fontSize: labelsPerSheet >= 6 ? 12 : 16,
          margin: labelsPerSheet >= 6 ? 4 : 10,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch {
        // ignore
      }
    });
  }, [barcode, labelsPerSheet]);

  useEffect(() => {
    renderBarcode();
  }, [renderBarcode]);

  /* ---- Build the print-window HTML ---- */
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const cols = gridCols(labelsPerSheet);
    const isSmall = labelsPerSheet >= 6;
    const barcodeHeight = isSmall ? 50 : 80;
    const nameSize = isSmall ? 11 : 16;
    const cellPad = isSmall ? "8px" : "16px";

    const labelHtml = Array.from({ length: labelsPerSheet })
      .map(
        (_, i) => `
        <div class="cell">
          <div class="product-name">${productName}</div>
          <div id="bc-${i}"></div>
        </div>`
      )
      .join("");

    const barcodeScripts = Array.from({ length: labelsPerSheet })
      .map(
        (_, i) => `
        (function(){
          var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
          document.getElementById("bc-${i}").appendChild(svg);
          try {
            JsBarcode(svg, "${barcode}", {
              format:"CODE128", width:${isSmall ? 1.5 : 2}, height:${barcodeHeight},
              displayValue:true, fontSize:${isSmall ? 12 : 16},
              margin:${isSmall ? 4 : 10}, background:"#fff", lineColor:"#000"
            });
          } catch(e){ document.getElementById("bc-${i}").textContent="${barcode}"; }
        })();`
      )
      .join("\n");

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Barcode - ${productName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#fff}
.grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:12px;padding:16px;width:100%;max-width:210mm;margin:0 auto}
.cell{text-align:center;padding:${cellPad};border:1px dashed #ccc;border-radius:4px;break-inside:avoid}
.product-name{font-size:${nameSize}px;font-weight:600;margin-bottom:6px;color:#111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
svg{display:block;margin:0 auto;max-width:100%}
@media print{
  body{margin:0}
  .grid{padding:4mm;gap:2mm}
  .cell{border:1px dashed #ddd}
}
</style></head><body>
<div class="grid">${labelHtml}</div>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3/dist/JsBarcode.all.min.js"><\/script>
<script>${barcodeScripts}
window.onload=function(){window.print();};
<\/script></body></html>`);
    printWindow.document.close();
  };

  /* ---- No barcode guard ---- */
  if (!barcode) {
    return (
      <div className="p-6">
        <PageHeader title="Print Barcode" description="No barcode data provided" />
        <div className="mt-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
        <div className="mt-8 text-center text-gray-500">
          No barcode data was provided. Please add a product with a barcode first.
        </div>
      </div>
    );
  }

  /* ---- Main render ---- */
  const cols = gridCols(labelsPerSheet);

  return (
    <div className="p-6">
      <PageHeader
        title="Print Barcode"
        description={`Barcode label for "${productName}"`}
      />

      <div className="mt-4 mb-6 flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <Button onClick={handlePrint}>
          <Printer size={16} className="mr-2" />
          Print {labelsPerSheet} Label{labelsPerSheet > 1 ? "s" : ""}
        </Button>
      </div>

      {/* ---- Labels-per-sheet controls ---- */}
      <div className="max-w-2xl mx-auto mb-6 bg-white rounded-2xl shadow border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Grid2x2 size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Labels Per Sheet</h3>
        </div>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {LABEL_PRESETS.map((n) => (
            <button
              key={n}
              onClick={() => setLabelsPerSheet(n)}
              className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                labelsPerSheet === n
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Custom stepper */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Custom:</span>
          <button
            onClick={() => setLabelsPerSheet((v) => Math.max(1, v - 1))}
            className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-40 text-gray-600"
            disabled={labelsPerSheet <= 1}
          >
            <Minus size={14} />
          </button>
          <input
            type="number"
            min={1}
            max={50}
            value={labelsPerSheet}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 1 && v <= 50) setLabelsPerSheet(v);
            }}
            className="w-16 text-center text-sm border border-gray-300 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-black text-gray-600"
          />
          <button
            onClick={() => setLabelsPerSheet((v) => Math.min(50, v + 1))}
            className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-40 text-gray-600"
            disabled={labelsPerSheet >= 50}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* ---- Preview ---- */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Sheet Preview
          </h2>
          <span className="text-xs text-gray-500">
            {labelsPerSheet} label{labelsPerSheet > 1 ? "s" : ""} · {cols} column{cols > 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid preview */}
        <div
          className="p-6"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "12px",
          }}
        >
          {Array.from({ length: labelsPerSheet }).map((_, i) => (
            <div
              key={i}
              className="border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center gap-2 bg-white"
            >
              <p
                className="font-semibold text-gray-900 text-center truncate w-full"
                style={{ fontSize: labelsPerSheet >= 6 ? 11 : 14 }}
              >
                {productName}
              </p>
              <svg
                ref={(el) => {
                  barcodeRefs.current[i] = el;
                }}
                className="block max-w-full"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-center">
          <Button onClick={handlePrint} variant="primary">
            <Printer size={16} className="mr-2" />
            Print {labelsPerSheet} Label{labelsPerSheet > 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   Page wrapper with Suspense (required for useSearchParams)
-------------------------------------------------- */
export default function BarcodePrintPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-gray-500">Loading barcode…</div>
      }
    >
      <BarcodePrintContent />
    </Suspense>
  );
}
