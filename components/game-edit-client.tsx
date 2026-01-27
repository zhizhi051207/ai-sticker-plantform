"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Code2, Copy, Check } from "lucide-react";

interface GameEditClientProps {
  gameId: string;
  title: string;
  prompt: string;
  htmlContent: string;
}

export default function GameEditClient({ gameId, title, prompt, htmlContent }: GameEditClientProps) {
  const router = useRouter();
  const [instruction, setInstruction] = useState("");
  const [html, setHtml] = useState(htmlContent);
  const [loading, setLoading] = useState<"ai" | "svg" | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async () => {
    if (copyTimer.current) {
      clearTimeout(copyTimer.current);
      copyTimer.current = null;
    }
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      copyTimer.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      setError("复制失败，请重试");
    }
  };

  const handleEdit = async (mode: "ai" | "svg") => {
    setError("");
    if (mode === "ai" && !instruction.trim()) {
      setError("请输入修改指令");
      return;
    }
    if (mode === "svg" && !html.trim()) {
      setError("请输入完整的SVG源码");
      return;
    }

    setLoading(mode);
    try {
      const response = await fetch("/api/generate/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          mode,
          instruction: mode === "ai" ? instruction : undefined,
          svgContent: mode === "svg" ? html : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to edit sticker");
      }
      router.push(`/game/${data.gameId}`);
    } catch (err: any) {
      setError(err?.message || "Failed to edit sticker");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit: {title}</h1>
        <p className="text-muted-foreground">基于已有表情包进行二次编辑，保存为新版（不会覆盖原表情包）。</p>
      </div>

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI 修改指令
            </CardTitle>
            <CardDescription>描述你想要的改动，例如：换成更可爱的表情、调整配色、加上文字</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="输入修改指令..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="min-h-[160px]"
              disabled={loading === "ai"}
            />
            <div className="text-xs text-muted-foreground">原始提示词：{prompt}</div>
            <Button className="w-full" onClick={() => handleEdit("ai")} disabled={loading !== null}>
              {loading === "ai" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading === "ai" ? "正在生成新表情包..." : "用AI生成新表情包"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  直接编辑SVG
                </CardTitle>
                <CardDescription>你可以直接修改SVG源码，保存为新表情包</CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={loading !== null}
                aria-label="复制SVG源码"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="粘贴或编辑SVG源码..."
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="min-h-[320px] font-mono text-xs"
              disabled={loading !== null}
            />
            <Button className="w-full" variant="outline" onClick={() => handleEdit("svg")} disabled={loading !== null}>
              {loading === "svg" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading === "svg" ? "正在保存新表情包..." : "保存为新表情包"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
