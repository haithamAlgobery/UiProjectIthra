// src/components/favorites-feed.tsx
"use client";

import { useEffect,useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  rollbackFavoriteOptimistic,
  deleteContent
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
  // يمكنك إضافة فلتر أو فرز لاحقًا إذا أردت
}


export default function FavoritesFeed({ take }: FavoritesFeedProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, loadingMore, hasMore, spik } = useSelector((s: RootState) => s.favorites);

  const [OpenDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [contentIdDelete, setcontentIdDelete] = useState("");

  useViewBatcher();
  // load first page on mount
  useEffect(() => {
    dispatch(resetFavorites());
    dispatch(fetchFavorites({ reset: true, take }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    // نقترح إرسال current spik للحصول على الصفحة التالية
    dispatch(fetchFavorites({ reset: false, take, spik }));
  };


  const onDelete=( id?: string) => {

    if(id !==null){
      setOpenDeleteDialog(true)
      setcontentIdDelete(id);
    }
    
      }
    
      const actionDelete=()=>{
        dispatch(deleteContent(contentIdDelete))
        setOpenDeleteDialog(false)
      }

  const handleInteract = async (contentId: string, action: "like" | "notLike" | "save") => {
    if (!contentId) return;

    try {
      if (action === "save") {
        // هنا "save" يعني toggle favorite — في قائمة المفضلات غالبًا المستخدم يريد إزالة
        // تطبيق متفائل: إزالة العنصر محليًا فوراً
        dispatch(applyOptimisticRemoveFavorite({ contentId }));
        // إرسال الطلب للسيرفر
        await dispatch(toggleFavoriteOnFavoriteList({ contentId })).unwrap();
      } else {
        const reactionType = action === "like";
        // تحديث متفائل محلي للتفاعل
        dispatch(applyOptimisticReactionForFavorite({ contentId, reactionType }));
        // إرسال الطلب للسيرفر
        await dispatch(reactOnFavorite({ contentId, reactionType })).unwrap();
      }
    } catch (err: any) {
      // الـ slice يتعامل مع rollback في حالات الـ rejected بناءً على الحمولة
      // لكن نحتفظ بمرجع للاصلاح اليدوي عند الضرورة
      console.error("Favorites interaction error:", err);

      // في حالات نادرة نريد استدعاء rollback صراحةً
      // dispatch(rollbackFavoriteOptimistic({ contentId }));
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
          <p className="text-lg font-medium">لا توجد مفضلات</p>
          <p className="text-sm">يمكنك إضافة منشورات إلى مفضلاتك وستظهر هنا</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item: any) => {
        // دعم الشكل المحتمل: بعض الـ APIs تعطي { content: {...} } أو تعطي الكائن مباشرة
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
          <p>تم عرض جميع المفضلات</p>
        </div>
      )}


      
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
