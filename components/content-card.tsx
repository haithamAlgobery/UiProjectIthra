
"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Eye,
  ThumbsDown,
  Bookmark,
  MoreVertical,
  Share,
  Link,
  Flag,
  Calendar,
  Tag,
  Trash,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Content } from "@/lib/mock-data";
import useDataBasic from "@/src/hooks/useDataBasic";
import useAuth from "@/src/hooks/useAuth";
import { useDispatch } from "react-redux";
import { addView } from "../src/features/viewSlice";

interface ContentCardProps {
  content: Content;
  onInteract: (contentId: string, action: "like" | "notLike" | "save") => void;
  onEdit?: (contentId: string) => void; // optional callbacks for edit/delete
  onDelete?: (contentId: string) => void;
}

export function ContentCard({ content, onInteract, onDelete }: ContentCardProps) {
  const router = useRouter();
  const { urlRoot } = useDataBasic();
  const { isAuth, user } = useAuth();

  const item = (content as any).content ?? content;


  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);

  if(item.code !=="research"){
           
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
        
          if (entry.isIntersecting) {
            dispatch(addView(item.id)); // إضافة ID للمشاهدة
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 } // يظهر 50% من الكارت
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [item.id]);

  
  }


  // support wrapper or direct item

  const short =
    (content as any).shortDetailsUser ??
    item.shortDetailsUser ??
    {
      urlImage: "",
      firstName: "انا",
      lastName: "المنشور",
      userName: "user",
    };

  const interactiveCounts = (content as any).interactiveCounts ?? item.interactiveCounts ?? {};
  const myInterActive = (content as any).myInterActive ?? item.myInterActive ?? {};
  const category = (content as any).category ?? item.category ?? { title: "عام" };

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) return "منذ وقت قريب";
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ar });
    } catch {
      return "منذ وقت قريب";
    }
  };

  const getTypeLabel = (code?: string) => {
    return code === "research" ? "بحث" : "منشور";
  };

  const getTypeBadgeVariant = (code?: string) => {
    return code === "research" ? "default" : "secondary";
  };

  // Prevent card click when clicking inner controls
  const handleCardClick = (e?: React.MouseEvent) => {
    // If event passed, it's already handled; otherwise just navigate
    router.push(`/content/${item?.id}`);
  };

  // navigate to profile page (stop propagation so it won't trigger card click)
  const goToProfile = (e: React.MouseEvent, username?: string) => {
    e.stopPropagation();
    if (!username) return;
    router.push(`/profile/${username}`);
  };

  // copy link handler for menu or share
  const handleCopyLink = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const href = typeof window !== "undefined" ? window.location.href : "";
      await navigator.clipboard.writeText(href || `${location.origin}/content/${item?.id}`);
      // you can replace with toast or feedback if your UI has one
      // simple alert for now:
      // alert("تم نسخ الرابط");
    } catch {
      // ignore for now
    }
  };

  const handleShare = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    // fallback to copying link — or you can call Web Share API if available
    if (navigator.share) {
      navigator
        .share({
          title: item?.title,
          text: item?.details,
          url: typeof window !== "undefined" ? window.location.href : `${location.origin}/content/${item?.id}`,
        })
        .catch(() => {
          // fallback: copy
          handleCopyLink();
        });
    } else {
      handleCopyLink();
    }
  };

  const handleReport=(e: React.MouseEvent, username?: string) => {

    e.stopPropagation();
    if (!item?.id) return;
    router.push(`/report/${item.id}`);
  }
  const handleEdit=(e: React.MouseEvent, username?: string) => {

    e.stopPropagation();
    if (!item?.id) return;
    router.push(`/edit/${item.id}`);
  }
  

  // determine owner
  const isOwner = Boolean(isAuth && user && user.userName && short && user.userName === short.userName);

  // build media list: support item.media (array) or item.urlImage (string, possibly comma-separated)
  const buildMediaList = (): string[] => {
    if (!item) return [];
    if (Array.isArray(item.media) && item.media.length) return item.media;
    if (Array.isArray(item.mediaUrls) && item.mediaUrls.length) return item.mediaUrls;
    if (item.urlImage && typeof item.urlImage === "string") {
      // split by comma if it contains multiple files
      if (item.urlImage.includes(",")) {
        return item.urlImage.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      return [item.urlImage];
    }
    return [];
  };

  const mediaList = buildMediaList();

  // helper: is video by extension
  const isVideoFile = (file: string) => {
    const lower = file.toLowerCase();
    return lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".ogg") || lower.endsWith(".mov");
  };

  // avatar src handling (safe)
  const avatarSrc = short?.urlImage
    ? short.urlImage.startsWith("http")
      ? short.urlImage
      : `${urlRoot.replace(/\/$/, "")}/UploadFile/${encodeURIComponent(short.urlImage)}`
    : "/diverse-user-avatars.png";

  const initial1 = short?.firstName?.[0] ?? short?.userName?.[0] ?? "ا";
  const initial2 = short?.lastName?.[0] ?? "";

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-200 border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div  ref={ref} className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={(e) => goToProfile(e, short?.userName)}
              className="inline-flex items-center gap-3 min-w-0 p-0 bg-transparent border-0"
              aria-label="عرض الملف"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback>
                  {initial1}
                  {initial2}
                </AvatarFallback>
              </Avatar>
            </button>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={(e) => goToProfile(e, short?.userName)}
                  className="font-semibold text-sm truncate text-right bg-transparent border-0 p-0"
                  style={{ textAlign: "right" }}
                >
                  {short?.firstName ?? "انا"} {short?.lastName ?? "المنشور"}
                </button>
                <span className="text-muted-foreground text-xs hidden sm:inline">@{short?.userName ?? (short?.firstName ?? "user")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 shrink-0" />
                <span className="truncate">{formatDate(item?.dateCreate)}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {/* conditional owner actions */}
              {isOwner && (
                <>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    تعديل
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete && onDelete(item?.id)} className="text-destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    حذف
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem onClick={handleCopyLink}>
                <Link className="h-4 w-4 mr-2" />
                نسخ الرابط
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                مشاركة
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-destructive" onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                إبلاغ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Badge variant={getTypeBadgeVariant(item?.code)} className="text-xs shrink-0">
              {getTypeLabel(item?.code)}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
              <Tag className="h-3 w-3 shrink-0" />
              <span className="truncate">{category?.title ?? "عام"}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* media rendering: support images and videos and multiple files */}
        {mediaList.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden grid grid-cols-1 gap-2">
            {mediaList.map((m: string, idx: number) => {
              // compute src safely
              const src = m.startsWith("http") ? m : `${urlRoot.replace(/\/$/, "")}/UpLoadFileContent/${encodeURIComponent(m)}`;
              if (isVideoFile(m)) {
                return (
                  <div key={idx} className="w-full">
                    <video
                      controls
                      src={src}
                      className="w-full max-h-96 object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                );
              }
              return (
                <div key={idx} className="w-full">
                  <img
                    src={src}
                    alt={item?.title ?? ""}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-bold text-lg leading-tight text-balance">{item?.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{item?.details}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-4 gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1 text-xs h-8 px-2 min-w-0", myInterActive?.isLike && "text-red-500 hover:text-red-600")}
              onClick={(e) => {
                e.stopPropagation();
                onInteract(item?.id, "like");
              }}
            >
              <Heart className={cn("h-4 w-4 shrink-0", myInterActive?.isLike && "fill-current")} />
              <span className="hidden sm:inline">{interactiveCounts?.likeCount ?? 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1 text-xs h-8 px-2 min-w-0", myInterActive?.isNotLike && "text-blue-500 hover:text-blue-600")}
              onClick={(e) => {
                e.stopPropagation();
                onInteract(item?.id, "notLike");
              }}
            >
              <ThumbsDown className={cn("h-4 w-4 shrink-0", myInterActive?.isNotLike && "fill-current")} />
              <span className="hidden sm:inline">{interactiveCounts?.notLikeCount ?? 0}</span>
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* comments count (غير قابلة للضغط) */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground select-none">
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>{interactiveCounts?.commentCount ?? 0}</span>
            </div>

            {/* views count (غير قابلة للضغط) */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground select-none">
              <Eye className="h-4 w-4 shrink-0" />
              <span>{interactiveCounts?.showCount ?? 0}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1 text-xs h-8 px-2 min-w-0 transition-all duration-200", myInterActive?.isLove && "text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/20")}
              onClick={(e) => {
                e.stopPropagation();
                onInteract(item?.id, "save");
              }}
            >
              <Bookmark className={cn("h-4 w-4 shrink-0 transition-all duration-200", myInterActive?.isLove && "fill-current scale-110")} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
