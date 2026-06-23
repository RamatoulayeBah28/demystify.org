"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "./Nav";
import UploadScreen from "./UploadScreen";
import DetectingScreen from "./DetectingScreen";
import UnmatchedScreen from "./UnmatchedScreen";
import ViewerScreen from "./ViewerScreen";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export default function TaxDocumentHelper() {
  const [screen, setScreen] = useState("upload");
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [fieldPositions, setFieldPositions] = useState({});
  const [dragOver, setDragOver] = useState(false);

  const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const acceptFile = async (candidate) => {
    if (!candidate || !ACCEPTED_TYPES.includes(candidate.type)) return;
    setFile(candidate);
    setScreen("detecting");
    const { analyzeDocument } = await import("@/lib/ocr/analyzeDocument");
    const { documentType: detected, pageNumber: detectedPage, fieldPositions: positions } =
      await analyzeDocument(candidate);
    setDocumentType(detected);
    setPageNumber(detectedPage ?? 1);
    setFieldPositions(positions);
    setScreen(detected ? "viewer" : "unmatched");
  };

  const goUpload = () => {
    setScreen("upload");
    setFile(null);
    setDocumentType(null);
    setPageNumber(1);
    setFieldPositions({});
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="relative min-h-screen bg-dm-bg text-dm-ink">
      <Nav />

      {screen === "upload" && (
        <UploadScreen
          dragOver={dragOver}
          onFileSelected={acceptFile}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
      )}

      {screen === "detecting" && <DetectingScreen />}

      {screen === "unmatched" && <UnmatchedScreen onBack={goUpload} />}

      {screen === "viewer" && (
        <ViewerScreen
          fileName={file?.name}
          fileType={file?.type}
          fileUrl={fileUrl}
          documentType={documentType}
          pageNumber={pageNumber}
          fieldPositions={fieldPositions}
          onBack={goUpload}
        />
      )}
    </div>
  );
}
