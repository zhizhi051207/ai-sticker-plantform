"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Lock, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GameActionsClient({
  gameId,
  isPublic,
}: {
  gameId: string;
  isPublic: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleVisibility = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update");
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const deleteGame = async () => {
    if (!confirm("确定删除该游戏？此操作不可撤销。")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/games/${gameId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete");
      router.push("/my-games");
    } catch (e: any) {
      alert(e?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button variant="secondary" className="w-full" onClick={toggleVisibility} disabled={loading}>
        {isPublic ? <Lock className="h-4 w-4 mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
        {isPublic ? "Set Private" : "Set Public"}
      </Button>
      <Button variant="destructive" className="w-full" onClick={deleteGame} disabled={loading}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Game
      </Button>
    </div>
  );
}
