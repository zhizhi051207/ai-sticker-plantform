import { getServerSession } from "next-auth";
import { getUserGames } from "@/lib/db";

import { authOptions } from "@/lib/auth-options";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MyGamesClient from "@/components/my-games-client";

import { Image } from "lucide-react";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export default async function MyGamesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Stickers</h1>
          <p className="text-muted-foreground">
            Manage and view your AI-generated stickers. Sign in to view your stickers.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground mb-4">
              Please sign in to view and manage your stickers.
            </p>
            <Button asChild>
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const games = await getUserGames(session.user.id || session.user.email);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Stickers</h1>
        <p className="text-muted-foreground">
          Manage and view your AI-generated stickers.
        </p>
      </div>

      <MyGamesClient initialGames={games} />
    </div>
  );
}