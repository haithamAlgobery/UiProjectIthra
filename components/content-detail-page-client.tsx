

"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchContentFull, resetContent, applyInteractionUpdate } from "../src/features/viewContentSlice"
import {
  fetchCommentsByContent,
  postComment,
  clearComments,
  editComment,
  deleteComment,
} from "@/src/features/commentsSlice"
import useAuth from "@/src/hooks/useAuth"
import DOMPurify from "dompurify"
import { cn } from "@/lib/utils"
import {
  MessageCircle,
  Share2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  FileText,
  Loader2,
  Send,
  BookmarkCheck,
  Download,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Play,
  Globe,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  reactOnContent,
  toggleFavorite,
  applyOptimisticReaction,
  applyOptimisticFavorite,
} from "@/src/features/content"
import { sendViewsSingle } from "../src/features/viewSlice"

import { Navbar2 } from "@/components/Navbar2"

import { downloadFile } from "@/src/features/file"
import RelatedFeed from "@/components/related-feed"
import { useLoading } from "@/app/providers/LoadingProvider"
import useDataBasic from "@/src/hooks/useDataBasic"

// --- دوال مساعدة ---

function getRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return "الآن"
  if (diffMin < 60) return `منذ ${diffMin} ${diffMin === 1 ? "دقيقة" : "دقائق"}`
  if (diffHour < 24) return `منذ ${diffHour} ${diffHour === 1 ? "ساعة" : "ساعات"}`
  if (diffDay < 30) return `منذ ${diffDay} ${diffDay === 1 ? "يوم" : "أيام"}`
  if (diffMonth < 12) return `منذ ${diffMonth} ${diffMonth === 1 ? "شهر" : "أشهر"}`
  return `منذ ${diffYear} ${diffYear === 1 ? "سنة" : "سنوات"}`
}

function isVideoUrl(url = "") {
  if (!url) return false
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || ""
  return ["mp4", "webm", "ogg", "mov", "mkv"].includes(ext)
}

function MediaLightbox({ isOpen, onClose, mediaUrl, isVideo, title }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-10 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-200 hover:scale-110 shadow-2xl"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      <div className="relative max-w-7xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            controls
            autoPlay
            className="w-full h-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          >
            المتصفح لا يدعم تشغيل الفيديو.
          </video>
        ) : (
          <img
            src={mediaUrl || "/placeholder.svg"}
            alt={title}
            className="w-full h-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        )}
      </div>
    </div>
  )
}

// --- المكون الرئيسي ---

export default function ContentDetailPageClient({ params }) {
  const contentId = params?.id
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const focus = searchParams?.get("focus") || null

  const { isAuth, user } = useAuth()
  const { urlRoot } = useDataBasic()
  const IMG_BASE = urlRoot + "/UpLoadFileContent"

  const { content, loading, error } = useSelector(
    (s) => s.viewContent || { content: null, loading: false, error: null },
  )
  // استدعاء الستيت بنفس الطريقة الأصلية لضمان عمل التعليقات
  const commentsState = useSelector(
    (s) => s.comments || { items: [], loading: false, posting: false, error: null },
  )

  const [commentText, setCommentText] = useState("")
  const commentsRef = useRef(null)
  const [showMenu, setShowMenu] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [relatedLoaded, setRelatedLoaded] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState("")
  const [toastMessage, setToastMessage] = useState(null)
  const [isMediaOpen, setIsMediaOpen] = useState(false)
  
  const { setLoading } = useLoading()

  // --- Effects ---

  useEffect(() => {
    if (!contentId) return
    dispatch(fetchContentFull({ contentId }))
    if (fetchContentFull) dispatch(sendViewsSingle(contentId))

    return () => {
      dispatch(resetContent())
      dispatch(clearComments())
    }
  }, [contentId, dispatch])

  // تحميل التعليقات عند الطلب أو التركيز
  useEffect(() => {
    if (focus === "comments" && !commentsLoaded) {
      dispatch(fetchCommentsByContent({ contentId })).then(() => {
        setCommentsLoaded(true)
        setTimeout(() => {
          commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 200)
      })
    }
  }, [focus, contentId, dispatch, commentsLoaded])

  useEffect(() => {
    if (relatedLoaded) return
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      if (scrollPosition >= documentHeight - 500) {
        setRelatedLoaded(true)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [contentId, dispatch, relatedLoaded])

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 2800)
    return () => clearTimeout(t)
  }, [toastMessage])

  // --- Logic & Handlers ---

  const safeHtml = useMemo(() => {
    const html = content?.content?.description || ""
    try {
      return DOMPurify.sanitize(html)
    } catch {
      return html
    }
  }, [content])

  const interactiveCounts = content?.interactiveCounts || {}
  const myInterActive = content?.myInterActive || {}
  const c = content?.content || {}
  const userShort = content?.shortDetailsUser || {}

  const handleInteractMy = async (contentIdParam, action) => {
    if (!contentIdParam) return
    if (!isAuth) {
      setLoading(true)
      router.push(`/auth/start?returnTo=/content/${contentIdParam}`)
      return
    }

    try {
      if (action === "save") {
        dispatch(applyOptimisticFavorite({ contentId: contentIdParam }))
        await dispatch(toggleFavorite({ contentId: contentIdParam })).unwrap()
        dispatch(applyInteractionUpdate({ type: action, contId: contentIdParam }))
      } else {
        const reactionType = action === "like"
        dispatch(applyOptimisticReaction({ contentId: contentIdParam, reactionType }))
        await dispatch(reactOnContent({ contentId: contentIdParam, reactionType })).unwrap()
        dispatch(applyInteractionUpdate({ type: action, contId: contentIdParam }))
      }
    } catch (err) {
      console.error("Interaction error:", err)
      setToastMessage("حصل خطأ أثناء تنفيذ التفاعل")
    }
  }

  const handleOpenComments = async () => {
    if (!commentsLoaded) {
      await dispatch(fetchCommentsByContent({ contentId }))
      setCommentsLoaded(true)
    }
    setTimeout(() => commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150)
  }

  const handlePostComment = async () => {
    if (!isAuth) {
      setLoading(true)
      router.push(`/auth/start?returnTo=/content/${contentId}`)
      return
    }
    const trimmed = (commentText || "").trim()
    if (!trimmed) return
    try {
      await dispatch(postComment({ contentId, commentText: trimmed })).unwrap()
      setCommentText("")
      setToastMessage("تم إضافة التعليق")
    } catch (err) {
      console.error("Post comment error:", err)
      setToastMessage(err?.message || "حدث خطأ أثناء إضافة التعليق")
    }
  }

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId)
    setEditCommentText(currentText)
  }

  const handleSaveEdit = async (commentId) => {
    const trimmed = editCommentText.trim()
    if (!trimmed) return
    try {
      await dispatch(editComment({ commentId, commentText: trimmed })).unwrap()
      setEditingCommentId(null)
      setEditCommentText("")
      setToastMessage("تم تعديل التعليق")
    } catch (err) {
      console.error("Edit comment error:", err)
      setToastMessage("حدث خطأ أثناء تعديل التعليق")
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditCommentText("")
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm("هل تريد حذف هذا التعليق؟")) return
    try {
      await dispatch(deleteComment({ commentId })).unwrap()
      setToastMessage("تم حذف التعليق")
    } catch (err) {
      console.error("Delete comment error:", err)
      setToastMessage("حدث خطأ أثناء حذف التعليق")
    }
  }

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href)
      setToastMessage("تم نسخ رابط المشاركة")
    } catch {
      prompt("انسخ الرابط يدوياً:", window.location.href)
    }
  }

  const [downloading, setDownloading] = useState(false)
  const handleDownload = async (fileId, e) => {
    e?.stopPropagation()
    try {
      setDownloading(true)
      const result = await dispatch(downloadFile({ fileId })).unwrap()
      const { blob, filename, contentType } = result
      const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: contentType }))
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename || "download"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error("Download error:", err)
    } finally {
      setDownloading(false)
    }
  }

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">جاري تحميل المحتوى...</p>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full p-8 text-center shadow-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-foreground">لم نتمكن من عرض المحتوى</h2>
          <Button onClick={() => router.push("/")} className="w-full">العودة للرئيسية</Button>
        </Card>
      </div>
    )
  }

  const heroUrl = c.urlImage ? `${IMG_BASE}/${c.urlImage}` : c.urlMedia ? `${IMG_BASE}/${c.urlMedia}` : null
  const heroIsVideo = isVideoUrl(heroUrl)

  return (
    <>
      <Navbar2 />
      {/* تعديل الهاتف:
         تم استخدام sm: قبل الكلاسات الخاصة بالإطار (rounded, border, shadow)
         هذا يعني أنه في الهاتف (أقل من sm) لن يكون هناك إطار ولا حواف دائرية
       */}
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 sm:py-6" dir="rtl">
        <div className="w-full sm:max-w-3xl sm:mx-auto sm:px-4">
          
          <Card className="w-full border-0 sm:border sm:rounded-xl shadow-none sm:shadow-sm bg-background overflow-hidden mb-6">
            
            {/* 1. رأس المنشور (Author) */}
            <div className="p-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onClick={() => { setLoading(true); router.push(`/profile/${userShort.userName}`); }}
                >
                  <Avatar className="h-11 w-11 border border-border">
                    <AvatarImage src={urlRoot + "/UploadFile/" + (userShort?.urlImage || "")} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {(userShort?.firstName?.[0] || "A").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className="flex flex-col">
                  <button
                    onClick={() => { setLoading(true); router.push(`/profile/${userShort.userName}`); }}
                    className="font-bold text-base text-foreground hover:underline text-right"
                  >
                    {userShort.firstName} {userShort.lastName}
                  </button>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="ltr:font-mono">@{userShort.userName}</span>
                    <span>•</span>
                    <time dateTime={c.dateCreate}>{getRelativeTime(c.dateCreate)}</time>
                  </div>
                </div>
              </div>

              {/* القائمة */}
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute left-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-md z-20 py-1">
                      <button onClick={handleCopyLink} className="w-full text-right px-4 py-2 text-sm hover:bg-muted flex gap-2">
                        <ExternalLink className="h-4 w-4" /> نسخ الرابط
                      </button>
                      <button
                          onClick={() => {
                           setLoading(true);

                            router.push(`/report/${c.id}`);
                            setShowMenu(false)
                          }}
                          className="w-full text-right px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-3 text-foreground"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {reporting ? "جارٍ..." : "ابلاغ"}
                        </button>
                      {isAuth && user?.id === c.userId && (
                        <>
                          <button onClick={() => router.push(`/edit/${c.id}`)} className="w-full text-right px-4 py-2 text-sm hover:bg-muted flex gap-2">
                            <Edit2 className="h-4 w-4" /> تعديل
                          </button>
                          <button className="w-full text-right px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex gap-2">
                            <Trash2 className="h-4 w-4" /> حذف
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 2. جسم المنشور */}
            <div className="px-4 pb-2">
              {/* العنوان */}
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3 leading-tight">
                {c.title}
              </h1>
{/* الوسوم والمشاهدات */}
<div className="flex items-center flex-wrap gap-2 mb-4">

  {content.category?.title && (
    <Badge variant="secondary" className="font-normal">
      {content.category.title}
    </Badge>
  )}

  {/* المشاهدات */}
  <Badge
    variant="outline"
    className="flex items-center gap-1 text-xs font-normal px-2 py-0.5
               text-muted-foreground border-muted/40"
  >
    <Eye className="h-3.5 w-3.5" />
    <span>{interactiveCounts.showCount ?? 0}</span>
  </Badge>

</div>



              
              {/* === تعديل 1: الصورة هنا (فوق البحث/النص) === */}
              {heroUrl && (
                <div className="mb-5 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden rounded-lg border border-border/50">
                  <button onClick={() => setIsMediaOpen(true)} className="w-full block relative group cursor-zoom-in">
                     {heroIsVideo ? (
                      <div className="relative aspect-video w-full bg-black">
                        <video src={heroUrl} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30">
                          <Play className="w-10 h-10 text-white fill-white" />
                        </div>
                      </div>
                     ) : (
                      <img src={heroUrl} alt={c.title} className="w-full h-auto max-h-[500px] object-cover mx-auto" loading="lazy" />
                     )}
                  </button>
                </div>
              )}

             
<div className="mb-4">
  {c.details && (
    <p className="text-sm sm:text-base text-foreground mb-4 leading-relaxed text-justify font-normal">
      {c.details}
    </p>
  )}


  {safeHtml && safeHtml.trim() !== "" && (
    <div className="my-4">
      <div className="h-[1px] w-full bg-slate-200/30 dark:bg-slate-800/30 rounded-sm" />
    </div>
  )}

  <article
    className="prose prose-slate dark:prose-invert max-w-none
               prose-p:text-justify prose-p:text-sm sm:prose-p:text-base prose-p:leading-loose prose-p:my-3
               prose-headings:font-bold prose-headings:text-lg prose-a:text-primary"
    dangerouslySetInnerHTML={{ __html: safeHtml }}
  />
</div>


              {/* الوسوم */}
              {Array.isArray(content.tags) && content.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {content.tags.map((t) => (
                    <span key={t} className="text-blue-600 dark:text-blue-400 text-sm hover:underline cursor-pointer">#{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* الملفات والمصادر */}
            {(content.resources?.length > 0 || content.files?.length > 0) && (
              <div className="px-4 py-3 space-y-3 bg-muted/30 border-t border-border mt-2">
                {content.resources?.map((r) => (
                  <a key={r.id} href={r.url} target="_blank" className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{r.title}</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                ))}
                {content.files?.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                     <FileText className="h-4 w-4 text-orange-500" />
                     <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{f.title}</p>
                     </div>
                     <Button variant="ghost" size="icon" onClick={(e) => handleDownload(f.id, e)} disabled={downloading}>
                        <Download className="h-4 w-4" />
                     </Button>
                  </div>
                ))}
              </div>
            )}

            {/* إحصائيات التفاعل */}
            <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border mt-2">
                <div className="flex gap-2">
                    {interactiveCounts.likeCount > 0 && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                            <ThumbsUp className="h-3 w-3 fill-current" /> {interactiveCounts.likeCount}
                        </span>
                    )}
                </div>
                <div>{interactiveCounts.commentCount || 0} تعليق</div>
            </div>

            {/* أزرار التفاعل */}
            <div className="grid grid-cols-4 gap-1 p-2 border-t border-border">
                <Button variant="ghost" onClick={() => handleInteractMy(c.id, "like")} className={cn("h-10 gap-2", myInterActive.isLike && "text-blue-600")}>
                    <ThumbsUp className={cn("h-5 w-5", myInterActive.isLike && "fill-current")} />
                    <span className="hidden sm:inline">أعجبني</span>
                </Button>

                {/* === تعديل 3: إضافة عداد الدس لايك === */}
                <Button variant="ghost" onClick={() => handleInteractMy(c.id, "notLike")} className={cn("h-10 gap-2", myInterActive.isNotLike && "text-red-600")}>
                    <ThumbsDown className={cn("h-5 w-5", myInterActive.isNotLike && "fill-current")} />
                    <span className="text-xs font-normal opacity-70">{interactiveCounts.notLikeCount ?? 0}</span>
                </Button>

                <Button variant="ghost" onClick={handleOpenComments} className="h-10 gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span className="hidden sm:inline">تعليق</span>
                </Button>

                <Button variant="ghost" onClick={() => handleInteractMy(c.id, "save")} className={cn("h-10 gap-2", myInterActive.isLove && "text-amber-600")}>
                    {myInterActive.isLove ? <BookmarkCheck className="h-5 w-5 fill-current"/> : <Bookmark className="h-5 w-5"/>}
                    <span className="hidden sm:inline">حفظ</span>
                </Button>
            </div>
          </Card>

        

{/* ===== تعديل: قسم التعليقات — نسخة أكثر احترافية واستجابة (استبدال القسم الكامل للتعليقات) */}
<div ref={commentsRef} className="bg-transparent mb-8 px-0 sm:px-0">
  {commentsLoaded ? (
    <section aria-labelledby="comments-heading" className="mb-8">
      <Card className="overflow-hidden border-0 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg ring-1 ring-white/10 dark:ring-slate-700/20">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="comments-heading" className="text-lg sm:text-2xl font-semibold text-foreground">
              التعليقات ({commentsState.items.length || interactiveCounts.commentCount || 0})
            </h2>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                العودة للأعلى
              </Button>
            </div>
          </div>

          {/* محرر التعليق */}
          <div className="mt-4 mb-6">
            <label htmlFor="comment-textarea" className="sr-only">أضف تعليق</label>
            <textarea
              id="comment-textarea"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={isAuth ? "أضف تعليقك..." : "سجّل الدخول لإضافة تعليق"}
              disabled={!isAuth}
              className="w-full p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-border/40 dark:border-slate-700/50 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl resize-none focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              rows={4}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {isAuth ? "كن محترماً. راجع قواعد المجتمع قبل النشر." : "يجب تسجيل الدخول للتعليق"}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCommentText("")}
                  disabled={!commentText.trim()}
                >
                  إلغاء
                </Button>
                <Button
                  size="sm"
                  onClick={handlePostComment}
                  disabled={commentsState.posting || !commentText.trim() || !isAuth}
                  className="gap-2"
                >
                  {commentsState.posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  نشر
                </Button>
              </div>
            </div>
          </div>

          {/* قائمة التعليقات */}
          <div className="space-y-4 max-h-[38rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted/60">
            {commentsState.loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">جاري تحميل التعليقات...</p>
              </div>
            ) : commentsState.items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">لا توجد تعليقات بعد</p>
                <p className="text-sm text-muted-foreground mt-1">كن أول من يعلق على هذا المحتوى!</p>
              </div>
            ) : (
              commentsState.items.map((cm) => (
                <div
                  key={cm.id}
                  className="flex items-start gap-4 p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-border/30 dark:border-slate-700/30 rounded-xl hover:shadow-md transition"
                  role="article"
                  aria-label={`تعليق من ${cm.shortDetailsUser?.firstName || 'مستخدم'}`}
                >
                  <button
                    aria-label={`اذهب لصفحة ${cm.shortDetailsUser?.userName}`}
                    onClick={() => { setLoading(true); router.push(`/profile/${cm.shortDetailsUser?.userName}`); }}
                    className="flex-shrink-0"
                    style={{ cursor: "pointer" }}
                  >
                    <Avatar className="h-11 w-11 ring-2 ring-border">
                      <AvatarImage src={urlRoot + "/UploadFile/" + (cm.shortDetailsUser?.urlImage || "")} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {(cm.shortDetailsUser?.firstName?.[0] || "ا").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {cm.shortDetailsUser?.firstName} {cm.shortDetailsUser?.lastName}
                        </span>
                        <span className="text-muted-foreground/40">•</span>
                        <time className="text-xs text-muted-foreground flex-shrink-0">
                          {getRelativeTime(cm.dateCreated)}
                        </time>
                      </div>

                      <div className="flex items-center gap-1">
                        {isAuth && user?.id === cm.userId && (
                          <button
                            onClick={() => handleEditComment(cm.id, cm.commmentText)}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="تعديل التعليق"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {isAuth && (user?.id === cm.userId || user?.id === c.userId) && (
                          <button
                            onClick={() => handleDeleteComment(cm.id)}
                            className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            aria-label="حذف التعليق"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2">
                      {editingCommentId === cm.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full p-3 bg-background border-2 border-primary rounded-lg resize-none focus:outline-none text-sm text-foreground"
                            rows={3}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(cm.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition"
                            >
                              <Check className="h-4 w-4" /> حفظ
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-md text-xs font-medium hover:bg-muted/80 transition"
                            >
                              <X className="h-4 w-4" /> إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-foreground break-words whitespace-pre-wrap">
                          {cm.commmentText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </section>
  ) : (
    <div className="text-center py-4">
      <Button variant="outline" onClick={handleOpenComments} className="w-full sm:w-auto">
        عرض التعليقات
      </Button>
    </div>
  )}
</div>




          {toastMessage && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2 rounded-full text-sm">
              {toastMessage}
            </div>
          )}

        
             {relatedLoaded && (
           <section className="text-center my-8">
           <h2 className="text-2xl font-bold mb-6 text-foreground">
             محتويات مشابهة
           </h2>
         
           <div className="mx-auto max-w-2xl">
           
               <RelatedFeed contentId={contentId} take={4} />
         
           </div>
         </section>
         
          )}



        </div>
      </main>

      <MediaLightbox
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        mediaUrl={heroUrl}
        isVideo={heroIsVideo}
        title={c.title}
      />
    </>
  )
}