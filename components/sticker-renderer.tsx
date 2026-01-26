"use client";

import StickerImage from "@/components/sticker-image";
import LottieSticker from "@/components/lottie-sticker";

interface StickerRendererProps {
  content: string | null | undefined;
  contentType: "svg" | "lottie" | "svg-animated";
  title?: string;
  className?: string;
}

export default function StickerRenderer({ content, contentType, title, className }: StickerRendererProps) {
  if (!content) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className || ""}`}>
        No sticker
      </div>
    );
  }

  if (contentType === "lottie") {
    return (
      <div className="w-full max-w-[640px] min-h-[320px] aspect-square mx-auto">
        <LottieSticker animationData={content} className="w-full h-full" />
      </div>
    );
  }

  if (contentType === "svg-animated") {
    const wrapperClass = `flex items-center justify-center w-full ${className || ""} [&_svg]:w-full [&_svg]:h-full [&_svg]:max-w-[420px] [&_svg]:max-h-[420px] [&_svg]:object-contain`;
    return (
      <div
        className={wrapperClass}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const wrapperClass = `flex items-center justify-center w-full ${className || ""}`;
  const svgClassName = "w-full h-full max-w-[420px] max-h-[420px] object-contain";

  return (
    <div className={wrapperClass}>
      <StickerImage svg={content} alt={title || "AI sticker"} className={svgClassName} />
    </div>
  );
}
