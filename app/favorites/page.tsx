
"use client"
import FavoritesFeed from "@/components/favorites-feed"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User } from "lucide-react"

export default function FavoritesPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Back button on the left */}
          <Button variant="ghost" size="sm" asChild className="gap-2 hover:bg-accent/50">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">رجوع</span>
            </Link>
          </Button>

          {/* Centered title */}
          <h1 className="text-lg font-semibold absolute left-1/2 -translate-x-1/2">المفضلات</h1>

          {/* My Account icon on the right */}
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent/50">
            <Link href="/account" aria-label="My Account">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="pt-24 pb-8">
        <div className="max-w-2xl mx-auto px-4">
          <section>
            <FavoritesFeed />
          </section>
        </div>
      </div>
    </main>
  )
}
