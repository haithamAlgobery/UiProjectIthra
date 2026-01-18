// src/components/related-feed.tsx
"use client";

import { useEffect, useRef } from "react";
import { Loader2, RefreshCw } from "lucide-react";
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
  contentId: string;
  take?: number;
}

export default function RelatedFeed({ contentId, take }: RelatedFeedProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, loadingMore, hasMore, spik } = useSelector(
    (s: RootState) => s.related
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useViewBatcher();

  // تحميل أول دفعة عند تغير المحتوى
  useEffect(() => {
    if (!contentId) return;
    dispatch(resetRelated());
    dispatch(fetchRelated({ reset: true, take, contentId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  // تحميل تلقائي عند الوصول للنهاية
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          dispatch(fetchRelated({ reset: false, take, spik, contentId }));
        }
      },
      {
        rootMargin: "200px",
      }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, items, contentId]);

  const handleInteract = async (
    contentIdParam: string,
    action: "like" | "notLike" | "save"
  ) => {
    if (!contentIdParam) return;

    try {
      if (action === "save") {
        dispatch(
          applyOptimisticToggleSaveForRelated({
            contentId: contentIdParam,
          })
        );
        await dispatch(
          toggleFavoriteOnRelatedList({ contentId: contentIdParam })
        ).unwrap();
      } else {
        const reactionType = action === "like";
        dispatch(
          applyOptimisticReactionForRelated({
            contentId: contentIdParam,
            reactionType,
          })
        );
        await dispatch(
          reactOnRelated({ contentId: contentIdParam, reactionType })
        ).unwrap();
      }
    } catch (err) {
      console.error("Related interaction error:", err);
      dispatch(rollbackRelatedOptimistic({ contentId: contentIdParam }));
    }
  };

  // Loader أولي
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // لا توجد بيانات
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
          />
        );
      })}

      {/* أنيميشن تحميل جميل */}
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">جاري تحميل المزيد...</span>
          </div>
        </div>
      )}

      {/* عنصر مراقبة الوصول للنهاية */}
      {hasMore && <div ref={loadMoreRef} className="h-10" />}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p>تم عرض جميع المحتويات المشابهة</p>
        </div>
      )}
    </div>
  );
}
