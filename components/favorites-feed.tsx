
"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { ContentCard } from "@/components/content-card";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/src/store/store";
import {
  fetchFavorites,
  resetFavorites,
  reactOnFavorite,
  toggleFavoriteOnFavoriteList,
  applyOptimisticReactionForFavorite,
  applyOptimisticRemoveFavorite,
  deleteContent,
} from "@/src/features/favoritesSlice";
import useViewBatcher from "@/src/hooks/useViewBatcher";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FavoritesFeedProps {
  take?: number; // افتراضي 3 في الـ slice
}

export default function FavoritesFeed({ take }: FavoritesFeedProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, loadingMore, hasMore, spik } = useSelector(
    (s: RootState) => s.favorites
  );

  const [OpenDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [contentIdDelete, setcontentIdDelete] = useState("");

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useViewBatcher();

  // load first page on mount
  useEffect(() => {
    dispatch(resetFavorites());
    dispatch(fetchFavorites({ reset: true, take }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تحميل تلقائي عند الوصول للنهاية
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          dispatch(fetchFavorites({ reset: false, take, spik }));
        }
      },
      {
        rootMargin: "200px",
      }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, items]);

  const onDelete = (id?: string) => {
    if (id) {
      setOpenDeleteDialog(true);
      setcontentIdDelete(id);
    }
  };

  const actionDelete = () => {
    dispatch(deleteContent(contentIdDelete));
    setOpenDeleteDialog(false);
  };

  const handleInteract = async (
    contentId: string,
    action: "like" | "notLike" | "save"
  ) => {
    if (!contentId) return;

    try {
      if (action === "save") {
        dispatch(applyOptimisticRemoveFavorite({ contentId }));
        await dispatch(toggleFavoriteOnFavoriteList({ contentId })).unwrap();
      } else {
        const reactionType = action === "like";
        dispatch(
          applyOptimisticReactionForFavorite({ contentId, reactionType })
        );
        await dispatch(reactOnFavorite({ contentId, reactionType })).unwrap();
      }
    } catch (err) {
      console.error("Favorites interaction error:", err);
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
          <p className="text-lg font-medium">لا توجد مفضلات</p>
          <p className="text-sm">
            يمكنك إضافة منشورات إلى مفضلاتك وستظهر هنا
          </p>
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
            onDelete={onDelete}
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
          <p>تم عرض جميع المفضلات</p>
        </div>
      )}

      {/* Dialog حذف */}
      <AlertDialog open={OpenDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف المحتوى</AlertDialogTitle>
            <AlertDialogDescription>
              هل انت متاكد من انك تريد حذف هذا المحتوى ؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDeleteDialog(false)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction onClick={actionDelete}>
              نعم, حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
