import React from "react";

interface StickerImageProps {
  svg: string | null | undefined;
  className?: string;
  alt?: string;
}

const toDataUri = (svg: string) => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export default function StickerImage({ svg, className, alt }: StickerImageProps) {
  if (!svg) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className || ""}`}
      >
        No sticker
      </div>
    );
  }

  return (
    <img
      src={toDataUri(svg)}
      alt={alt || "AI sticker"}
      className={className}
    />
  );
}
