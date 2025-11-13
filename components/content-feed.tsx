// src/components/content-feed.tsx
"use client";

import { useEffect,useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/content-card";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/src/store/store";

import { fetchContent, resetContent, reactOnContent, toggleFavorite, applyOptimisticReaction, applyOptimisticFavorite ,deleteContent} from "@/src/features/content";
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


interface ContentFeedProps {
  categoryId: string;
  type: string;
  sort: string;
  userName:string;
  search:string 

}

export function ContentFeed({ categoryId, type, sort,userName ,search}: ContentFeedProps) {

  const [OpenDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [contentIdDelete, setcontentIdDelete] = useState("");

  useViewBatcher();

  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, loadingMore, hasMore, skip } = useSelector((s: RootState) => s.content);

  // load first page whenever filters change
  useEffect(() => {

      dispatch(fetchContent({ reset: true, categoryId: categoryId || undefined, type: type || undefined, sort ,userName,search}));

  }, [categoryId, type, sort,search]);

 


  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    dispatch(fetchContent({ reset: false, categoryId: categoryId || undefined, type: type || undefined, sort, skip ,userName,search}));
  };

  const handleInteract = async (contentId: string, action: "like" | "notLike" | "save") => {
    if (!contentId) return;

    try {
      if (action === "save") {
        // optimistic toggle
        dispatch(applyOptimisticFavorite({ contentId }));
        // send request
        await dispatch(toggleFavorite({ contentId })).unwrap();
      } else {
        const reactionType = action === "like";
        // optimistic apply
        dispatch(applyOptimisticReaction({ contentId, reactionType }));
        // send request
        await dispatch(reactOnContent({ contentId, reactionType })).unwrap();
      }
    } catch (err: any) {
      // error handling: slice already handles rollback when possible, but log for dev
      if (err?.response) {
        console.error("Interaction error server:", err.response.data);
      } else {
        console.error("Interaction error:", err);
      }
    }
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
          <p className="text-lg font-medium">لا توجد منشورات</p>
          <p className="text-sm">جرب تغيير الفلاتر أو إضافة محتوى جديد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item: any) => (
        <ContentCard key={item.content.id} content={item} onInteract={handleInteract} onDelete={onDelete} />
      ))}

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
          <p>تم عرض جميع المنشورات المتاحة</p>
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
