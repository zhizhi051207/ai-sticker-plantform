"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Eye, Copy, Trash2, Lock, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Game {
  id: string;
  title: string;
  description: string | null;
  prompt: string;
  isPublic: boolean;
  createdAt: string | Date;
}

export default function MyGamesClient({ initialGames }: { initialGames: Game[] }) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const router = useRouter();

  const toggleVisibility = async (id: string, nextPublic: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: nextPublic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update");
      setGames((prev) => prev.map((g) => (g.id === id ? { ...g, isPublic: nextPublic } : g)));
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to update");
    } finally {
      setLoadingId(null);
    }
  };
  const startRename = (game: Game) => {
    setRenamingId(game.id);
    setRenameValue(game.title);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const submitRename = async (id: string) => {
    if (!renameValue.trim()) {
      alert("Title cannot be empty");
      return;
    }
    setLoadingId(id);
    try {
      const res = await fetch(`/api/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to rename");
      setGames((prev) => prev.map((g) => (g.id === id ? { ...g, title: renameValue.trim() } : g)));
      setRenamingId(null);
      setRenameValue("");
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to rename");
    } finally {
      setLoadingId(null);
    }
  };



  const deleteGame = async (id: string) => {
    if (!confirm("确定删除该游戏？此操作不可撤销。")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/games/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete");
      setGames((prev) => prev.filter((g) => g.id !== id));
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to delete");
    } finally {
      setLoadingId(null);
    }
  };

  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-muted-foreground">No games yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <Card key={game.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="line-clamp-1">{game.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {game.description || "AI-generated game"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(game.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{game.isPublic ? "Public" : "Private"}</span>
              </div>
            </div>
          </CardContent>
          <CardContent className="border-t pt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button className="w-full" asChild>
                <Link href={`/game/${game.id}`}>Play</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/?prompt=${encodeURIComponent(game.prompt)}`}>
                  <Copy className="h-4 w-4 mr-2" />
                  Similar
                </Link>
              </Button>
            </div>
            <Button variant="secondary" className="w-full" asChild>
              <Link href={`/game/${game.id}/edit`}>Edit This Game</Link>
            </Button>
            {renamingId === game.id ? (
              <div className="space-y-2">
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="New game title"
                  disabled={loadingId === game.id}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="w-full"
                    onClick={() => submitRename(game.id)}
                    disabled={loadingId === game.id}
                  >
                    Save
                  </Button>
                  <Button variant="outline" className="w-full" onClick={cancelRename} disabled={loadingId === game.id}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => startRename(game)}>
                Rename
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => toggleVisibility(game.id, !game.isPublic)}
                disabled={loadingId === game.id}
              >
                {game.isPublic ? <Lock className="h-4 w-4 mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                {game.isPublic ? "Set Private" : "Set Public"}
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => deleteGame(game.id)}
                disabled={loadingId === game.id}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
