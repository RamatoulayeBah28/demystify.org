"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const PAGE_WIDTH = 944;

export default function PdfPreview({ fileUrl }) {
  const [numPages, setNumPages] = useState(0);

  return (
    <div className="rounded-md border border-dm-line bg-white p-4">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages: count }) => setNumPages(count)}
        loading={<div className="py-20 text-center text-dm-muted">Loading…</div>}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={PAGE_WIDTH}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className={i > 0 ? "mt-4" : undefined}
          />
        ))}
      </Document>
    </div>
  );
}
