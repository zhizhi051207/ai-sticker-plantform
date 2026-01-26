"use client";

import { useEffect, useMemo, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";

interface LottieStickerProps {
  animationData: string;
  className?: string;
  loop?: boolean;
}

const parseLottieData = (raw: string) => {
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse Lottie JSON", error);
    return null;
  }
};

export default function LottieSticker({ animationData, className, loop = true }: LottieStickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const parsedData = useMemo(() => parseLottieData(animationData), [animationData]);
  const containerClass = `w-full h-full ${className || ""}`.trim();

  useEffect(() => {
    if (!containerRef.current || !parsedData) return;

    animationRef.current?.destroy();
    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop,
      autoplay: true,
      animationData: parsedData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: true,
      },
    });

    return () => {
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, [parsedData, loop]);

  if (!parsedData) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className || ""}`}>
        Invalid animation
      </div>
    );
  }

  return <div ref={containerRef} className={containerClass} />;
}
