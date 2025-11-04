// src/components/sidebar.tsx
"use client";

import type React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { ChevronRight, Hash, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/mock-data";
import { setCategory } from "@/src/features/filters";
import type { RootState, AppDispatch } from "@/src/store/store";
import { Loader2 } from "lucide-react";
interface SidebarProps {
  isOpen: boolean;
  selectedCategory: string;
}

export function Sidebar({ isOpen, selectedCategory }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { data: categories, loading, error } = useSelector((state: RootState) => state.category);
  const dispatch = useDispatch<AppDispatch>();

  const toggleCategory = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) newExpanded.delete(categoryId);
    else newExpanded.add(categoryId);
    setExpandedCategories(newExpanded);
  };

  const selectCategory = (categoryId: string) => {
    dispatch(setCategory(categoryId));
  };

  const renderCategory = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.has(category.meCategory.id);
    const hasChildren = category.children.length > 0;
    const isSelected = selectedCategory === category.meCategory.id;

    return (
      <div key={category.meCategory.id} className="w-full">
        <Button
          variant={isSelected ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start text-right h-auto py-2 px-3 mb-1 relative",
            level > 0 && "ml-4",
            isSelected && "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm"
          )}
          onClick={() => selectCategory(category.meCategory.id)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Folder className="h-4 w-4 flex-shrink-0" />
                )
              ) : (
                <Hash className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="truncate text-sm font-medium">{category.meCategory.title}</span>
            </div>
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 hover:bg-accent/50 flex-shrink-0"
                onClick={(e) => toggleCategory(category.meCategory.id, e)}
              >
                <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
              </Button>
            )}
          </div>
        </Button>

        {hasChildren && isExpanded && <div className="ml-2 border-l border-border pl-2">{category.children.map((child) => renderCategory(child, level + 1))}</div>}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-40 w-80 bg-sidebar border-l border-sidebar-border transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div style={{ marginTop: "60px" }} className="flex h-full flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-1">
            <Button
              variant={selectedCategory === "" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-right h-auto py-2 px-3 mb-3",
                selectedCategory === "" && "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm"
              )}
              onClick={() => dispatch(setCategory(""))}
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm font-medium">عرض الكل</span>
              </div>
            </Button>

            {loading ? <Loader2 className="h-8 w-8 animate-spin text-primary " />: error ? <p className="text-red-500">حدث خطأ: {error}</p> : categories?.map((category: Category) => renderCategory(category))}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
