import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getGame } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Image, Globe, Calendar, User } from "lucide-react";
import Link from "next/link";
import StickerRenderer from "@/components/sticker-renderer";
import LottieActionsClient from "@/components/lottie-actions-client";
import GameActionsClient from "@/components/game-actions-client";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}

export default async function GamePage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  const { id } = await params;
  const { from } = (await searchParams) ?? {};
  const game = await getGame(id);

  if (!game) {
    notFound();
  }

  const isOwner =
    (session?.user?.id && game.userId === session.user.id) ||
    game.user?.email === session?.user?.email;
  const isLottie = game.contentType === "lottie";
  const isAnimatedSvg = game.contentType === "svg-animated";
  const backHref = from === "public" ? "/games" : "/";
  const backLabel = from === "public" ? "Back to Public Stickers" : "Back to Home";



  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{game.title}</h1>
            <p className="text-muted-foreground">{game.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {game.isPublic && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                Public
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {game.user?.name || game.user?.email || "Anonymous"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(game.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            {isLottie ? "AI Animated Sticker" : isAnimatedSvg ? "AI Animated SVG Sticker" : "AI Sticker"}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sticker Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-muted p-6">
              <StickerRenderer
                content={game.htmlContent}
                contentType={
                  game.contentType === "lottie"
                    ? "lottie"
                    : game.contentType === "svg-animated"
                      ? "svg-animated"
                      : "svg"
                }
                title={game.title}
                className="w-full h-auto"
              />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sticker Details</CardTitle>
              <div>
                <h3 className="font-semibold mb-1">Sticker Type</h3>
                <p className="text-sm">
                  {isLottie ? "Animated (Lottie/GIF)" : isAnimatedSvg ? "Animated SVG" : "Static SVG"}
                </p>
              </div>

            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Original Prompt</h3>
                <p className="text-sm bg-muted p-3 rounded">{game.prompt}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Generated On</h3>
                <p className="text-sm">{new Date(game.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Visibility</h3>
                <p className="text-sm">{game.isPublic ? "Public (visible to everyone)" : "Private (only you can see)"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isOwner && !isLottie && (
                <Button className="w-full" asChild>
                  <Link href={`/game/${game.id}/edit`}>Edit Sticker</Link>
                </Button>
              )}
              {isLottie ? (
                <LottieActionsClient title={game.title} lottieJson={game.htmlContent} />
              ) : (
                <Button className="w-full" asChild>
                  <a
                    href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(game.htmlContent)}`}
                    download={`${game.title.replace(/\s+/g, "_")}.svg`}
                  >
                    Download SVG
                  </a>
                </Button>
              )}
              {isOwner && (
                <GameActionsClient gameId={game.id} isPublic={game.isPublic} />
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/?prompt=${encodeURIComponent(game.prompt)}`}>Create Similar Sticker</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}