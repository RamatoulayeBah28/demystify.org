"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "./Nav";
import UploadScreen from "./UploadScreen";
import ViewerScreen from "./ViewerScreen";

const ACCEPTED_TYPE = "application/pdf";

export default function TaxDocumentHelper() {
  const [screen, setScreen] = useState("upload");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const acceptFile = (candidate) => {
    if (!candidate || candidate.type !== ACCEPTED_TYPE) return;
    setFile(candidate);
    setScreen("viewer");
  };

  const goUpload = () => {
    setScreen("upload");
    setFile(null);
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

      {screen === "viewer" && <ViewerScreen fileName={file?.name} fileUrl={fileUrl} onBack={goUpload} />}
    </div>
  );
}
