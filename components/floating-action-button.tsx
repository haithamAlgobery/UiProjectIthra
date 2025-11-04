"use client"

import { useState } from "react"
import { Plus, FileText, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  onCreatePost: () => void
  onCreateResearch: () => void
}

export function FloatingActionButton({ onCreatePost, onCreateResearch }: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handleCreatePost = () => {
    setIsExpanded(false)
    onCreatePost()
  }

  const handleCreateResearch = () => {
    setIsExpanded(false)
    onCreateResearch()
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Overlay */}
      {isExpanded && <div className="fixed inset-0 bg-black/20 -z-10" onClick={() => setIsExpanded(false)} />}

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-3 mb-3">
        {/* Research Button */}
        <div
          className={cn(
            "transition-all duration-300 ease-out",
            isExpanded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none",
          )}
        >
          <Button
            onClick={handleCreateResearch}
            className="h-12 px-4 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm sm:text-base"
          >
            <Search className="h-5 w-5 mr-2" />
            <span className="font-medium hidden sm:inline">بحث جديد</span>
            <span className="font-medium sm:hidden">بحث</span>
          </Button>
        </div>

        {/* Post Button */}
        <div
          className={cn(
            "transition-all duration-300 ease-out",
            isExpanded
              ? "opacity-100 translate-y-0 scale-100 delay-75"
              : "opacity-0 translate-y-4 scale-95 pointer-events-none",
          )}
        >
          <Button
            onClick={handleCreatePost}
            className="h-12 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm sm:text-base"
          >
            <FileText className="h-5 w-5 mr-2" />
            <span className="font-medium hidden sm:inline">منشور جديد</span>
            <span className="font-medium sm:hidden">منشور</span>
          </Button>
        </div>
      </div>

      {/* Main FAB */}
      <Button
        onClick={toggleExpanded}
        className={cn(
          "h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300",
          "animate-pulse hover:animate-none hover:scale-110",
          isExpanded && "rotate-45 bg-destructive hover:bg-destructive/90",
        )}
      >
        {isExpanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  )
}
