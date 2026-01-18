




// src/components/content-feed.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { ContentCard } from "@/components/content-card";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/src/store/store";
import useAuth from "@/src/hooks/useAuth";
import {
  fetchContent,
  reactOnContent,
  toggleFavorite,
  applyOptimisticReaction,
  applyOptimisticFavorite,
  deleteContent,
} from "@/src/features/content";
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
import useViewBatcher from "@/src/hooks/useViewBatcher";
import { useLoading } from "@/app/providers/LoadingProvider";

interface ContentFeedProps {
  categoryId: string;
  type: string;
  sort: string;
  userName: string;
  search: string;
}

export function ContentFeed({
  categoryId,
  type,
  sort,
  userName,
  search,
}: ContentFeedProps) {
  const [OpenDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [contentIdDelete, setcontentIdDelete] = useState("");

  const { isAuth } = useAuth();
  const { setLoading } = useLoading();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useViewBatcher();

  const { items, loading, loadingMore, hasMore, skip } = useSelector(
    (s: RootState) => s.content
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // تحميل أول صفحة عند تغير الفلاتر
  useEffect(() => {
    dispatch(
      fetchContent({
        reset: true,
        categoryId: categoryId || undefined,
        type: type || undefined,
        sort,
        userName,
        search,
      })
    );
  }, [categoryId, type, sort, search]);

  // تحميل تلقائي عند الوصول للنهاية
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          dispatch(
            fetchContent({
              reset: false,
              categoryId: categoryId || undefined,
              type: type || undefined,
              sort,
              skip,
              userName,
              search,
            })
          );
        }
      },
      {
        rootMargin: "200px",
      }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, items]);

  const handleInteract = async (
    contentId: string,
    action: "like" | "notLike" | "save"
  ) => {
    if (!contentId) return;

    if (!isAuth) {
      setLoading(true);
      router.push(`/auth/start`);
      return;
    }

    try {
      if (action === "save") {
        dispatch(applyOptimisticFavorite({ contentId }));
        await dispatch(toggleFavorite({ contentId })).unwrap();
      } else {
        const reactionType = action === "like";
        dispatch(applyOptimisticReaction({ contentId, reactionType }));
        await dispatch(reactOnContent({ contentId, reactionType })).unwrap();
      }
    } catch (err) {
      console.error("Interaction error:", err);
    }
  };

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
          <p className="text-lg font-medium">لا توجد منشورات</p>
          <p className="text-sm">جرب تغيير الفلاتر أو إضافة محتوى جديد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item: any) => (
        <ContentCard
          key={item.content.id}
          content={item}
          onInteract={handleInteract}
          onDelete={onDelete}
        />
      ))}

      {/* مؤشر التحميل اللطيف */}
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">جاري تحميل المزيد...</span>
          </div>
        </div>
      )}

      {/* عنصر المراقبة للنهاية */}
      {hasMore && <div ref={loadMoreRef} className="h-10" />}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p>تم عرض جميع المنشورات المتاحة</p>
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
