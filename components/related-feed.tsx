// src/components/related-feed.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/content-card";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/src/store/store";
import {
  fetchRelated,
  resetRelated,
  reactOnRelated,
  toggleFavoriteOnRelatedList,
  applyOptimisticReactionForRelated,
  applyOptimisticToggleSaveForRelated,
  rollbackRelatedOptimistic,
} from "@/src/features/relatedSlice";
import useViewBatcher from "@/src/hooks/useViewBatcher";

interface RelatedFeedProps {
  contentId: string; // here we require the id to fetch suggestions
  take?: number;
}

export default function RelatedFeed({ contentId, take }: RelatedFeedProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, loadingMore, hasMore, spik } = useSelector((s: RootState) => s.related);

  useViewBatcher();

  useEffect(() => {
    if (!contentId) return;
    dispatch(resetRelated());
    dispatch(fetchRelated({ reset: true, take, contentId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    dispatch(fetchRelated({ reset: false, take, spik, contentId }));
  };

  const handleInteract = async (contentIdParam: string, action: "like" | "notLike" | "save") => {
    if (!contentIdParam) return;
    try {
      if (action === "save") {
        // IMPORTANT: in related feed we DON'T remove the item.
        // We do an optimistic toggle of the saved flag locally, then call server.
        dispatch(applyOptimisticToggleSaveForRelated({ contentId: contentIdParam }));
        await dispatch(toggleFavoriteOnRelatedList({ contentId: contentIdParam })).unwrap();
      } else {
        const reactionType = action === "like";
        dispatch(applyOptimisticReactionForRelated({ contentId: contentIdParam, reactionType }));
        await dispatch(reactOnRelated({ contentId: contentIdParam, reactionType })).unwrap();
      }
    } catch (err: any) {
      console.error("Related interaction error:", err);
      // rollback if needed
      dispatch(rollbackRelatedOptimistic({ contentId: contentIdParam }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">لا توجد محتويات مشابهة</p>
          <p className="text-sm">حاول محتوى آخر أو تحقق من الاتصال</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item: any) => {
        const keyId = item?.content?.id ?? item?.id;
        return (
          <ContentCard
            key={keyId}
            content={item}
            onInteract={handleInteract}
            // related feed لا يملك حذف افتراضي هنا
          />
        );
      })}

      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button onClick={loadMore} disabled={loadingMore} variant="outline" className="gap-2 bg-transparent">
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري التحميل...
              </>
            ) : (
              "تحميل المزيد"
            )}
          </Button>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p>تم عرض جميع المحتويات المشابهة</p>
        </div>
      )}
    </div>
  );
}
