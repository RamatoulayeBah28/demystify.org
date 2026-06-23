"use client";

import { resolveFieldPositions, useAnnotationOverlay } from "./useAnnotationOverlay";
import FieldDot from "./FieldDot";
import AnnotationPopover from "./AnnotationPopover";

export default function ImagePreview({ fileUrl, documentType, fieldPositions = {} }) {
  const { containerRef, ...overlay } = useAnnotationOverlay();
  const fields = resolveFieldPositions(documentType, fieldPositions);

  return (
    <div className="rounded-md border border-dm-line bg-white p-4">
      <div ref={containerRef} className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary user-uploaded blob URL, not a static asset */}
        <img src={fileUrl} alt="Uploaded document" className="w-full" />

        {fields.map(({ fieldId, position, label }) => (
          <FieldDot
            key={fieldId}
            position={position}
            onClick={(e) => overlay.openField(e, fieldId)}
            label={label}
          />
        ))}

        {overlay.active && (
          <AnnotationPopover
            active={overlay.active}
            top={overlay.popTop}
            left={overlay.popLeft}
            side={overlay.popSide}
            playLang={overlay.playLang}
            progress={overlay.progress}
            onClose={overlay.closePopover}
            onPlaySomali={() => overlay.toggle("so")}
            onPlayEnglish={() => overlay.toggle("en")}
          />
        )}
      </div>
    </div>
  );
}
