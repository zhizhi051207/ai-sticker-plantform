"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LottieActionsClientProps {
  title: string;
  lottieJson: string;
}

export default function LottieActionsClient({ title, lottieJson }: LottieActionsClientProps) {
  const [exporting, setExporting] = useState(false);

  const safeTitle = title.replace(/\s+/g, "_").replace(/[^\w-_]/g, "") || "sticker";

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    downloadFile(new Blob([lottieJson], { type: "application/json" }), `${safeTitle}.json`);
  };

  const handleDownloadGif = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const animationData = JSON.parse(lottieJson);
      const { default: lottie } = await import("lottie-web");
      const { default: GIF } = await import("gif.js");

      const width = Math.min(animationData.w || 512, 256);
      const height = Math.min(animationData.h || 512, 256);

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      document.body.appendChild(container);

      const animation = lottie.loadAnimation({
        container,
        renderer: "canvas",
        loop: false,
        autoplay: false,
        animationData,
      });

      await new Promise<void>((resolve) => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          animation.removeEventListener("DOMLoaded", done as any);
          animation.removeEventListener("data_ready", done as any);
          resolve();
        };

        animation.addEventListener("DOMLoaded", done as any);
        animation.addEventListener("data_ready", done as any);
        setTimeout(done, 1000);
      });

      const canvas = container.querySelector("canvas");
      if (!canvas) {
        throw new Error("Failed to render canvas");
      }

      console.log("GIF export canvas size", canvas.width, canvas.height);

      const totalFrameCount = Math.max(1, Math.round((animationData.op ?? 0) - (animationData.ip ?? 0)));
      const totalFrames = Math.min(24, Math.max(2, totalFrameCount));
      const frameStep = totalFrameCount / totalFrames;
      const durationSeconds = totalFrameCount && animationData.fr ? totalFrameCount / animationData.fr : 2;
      const frameDelay = Math.round((durationSeconds / totalFrames) * 1000);

      const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: "/gif.worker.js",
        width,
        height,
      });

      for (let frame = 0; frame < totalFrames; frame += 1) {
        animation.goToAndStop((animationData.ip ?? 0) + frame * frameStep, true);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        gif.addFrame(canvas, { copy: true, delay: frameDelay });
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("GIF export timed out"));
        }, 20000);

        gif.on("finished", (blob: Blob) => {
          clearTimeout(timeout);
          downloadFile(blob, `${safeTitle}.gif`);
          gif.removeAllListeners();
          animation.destroy();
          container.remove();
          setExporting(false);
          resolve();
        });

        gif.on("abort", () => {
          clearTimeout(timeout);
          reject(new Error("GIF export aborted"));
        });

        gif.render();
      });
    } catch (error) {
      console.error(error);
      alert("导出 GIF 失败，请重试");
      setExporting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={handleDownloadJson} disabled={exporting}>
        Download JSON
      </Button>
      <Button className="w-full" variant="outline" onClick={handleDownloadGif} disabled={exporting}>
        {exporting ? "Exporting GIF..." : "Download GIF"}
      </Button>
    </div>
  );
}
