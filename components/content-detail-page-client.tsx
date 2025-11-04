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
  Check,
  X,
  Play,
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
const urlRoot = "https://localhost:7021"
const IMG_BASE = urlRoot + "/UpLoadFileContent"

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

function MediaLightbox({
  isOpen,
  onClose,
  mediaUrl,
  isVideo,
  title,
}: {
  isOpen: boolean
  onClose: () => void
  mediaUrl: string
  isVideo: boolean
  title: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
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
      aria-label="عرض الوسائط بملء الشاشة"
    >
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-10 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-200 hover:scale-110 shadow-2xl"
        aria-label="إغلاق"
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
            aria-label={title}
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

export default function ContentDetailPageClient({ params }) {
  const contentId = params?.id
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const focus = searchParams?.get("focus") || null

  const { isAuth, user } = useAuth()

  const { content, loading, error } = useSelector(
    (s) => s.viewContent || { content: null, loading: false, error: null },
  )
  const commentsState = useSelector((s) => s.comments || { items: [], loading: false, posting: false, error: null })

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

  useEffect(() => {
    if (!contentId) return
    dispatch(fetchContentFull({ contentId }))
    if (fetchContentFull) dispatch(sendViewsSingle(contentId))

    return () => {
      dispatch(resetContent())
      dispatch(clearComments())
    }
  }, [contentId, dispatch])

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
      router.push(`/auth/login?returnTo=/content/${contentIdParam}`)
      return
    }

    try {
      if (action === "save") {
        dispatch(applyOptimisticFavorite({ contentId: contentIdParam }))
        await dispatch(toggleFavorite({ contentId: contentIdParam })).unwrap()

        const type = action
        const contId = contentIdParam
        dispatch(applyInteractionUpdate({ type, contId }))
      } else {
        const reactionType = action === "like"
        dispatch(applyOptimisticReaction({ contentId: contentIdParam, reactionType }))
        await dispatch(reactOnContent({ contentId: contentIdParam, reactionType })).unwrap()

        const type = action
        const contId = contentIdParam
        dispatch(applyInteractionUpdate({ type, contId }))
      }
    } catch (err) {
      console.error("Interaction error:", err)
      // لو فشل الطلب، يمكن إظهار رسالة أو إعادة fetch للمحتوى
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
      router.push(`/auth/login?returnTo=/content/${contentId}`)
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
      // لا حاجة لتعديل المصفوفة هنا يدوياً لأن commentsSlice يقوم بذلك في extraReducers
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
    // نافذة تأكيد أولية
    if (!confirm("هل تريد حذف هذا التعليق؟ هذا الإجراء لا يمكن التراجع عنه")) return

    try {
      await dispatch(deleteComment({ commentId })).unwrap()
      setToastMessage("تم حذف التعليق")
      // تحديث المصفوفة يتم في commentsSlice بعد نجاح الـ thunk
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

  const handleReport = async () => {
    if (!confirm("هل تريد الإبلاغ عن هذا المحتوى؟")) return
    setReporting(true)
    setTimeout(() => {
      setReporting(false)
      setToastMessage("تم إرسال البلاغ. شكرًا لتعاونك")
    }, 800)
  }

  const [downloading, setDownloading] = useState(false)

  const handleDownload = async (fileId, e) => {
    // لو الزر داخل عنصر قابل للنقر، امنع نشر الحدث للأب
    e?.stopPropagation()
    try {
      setDownloading(true)
      const result = await dispatch(downloadFile({ fileId })).unwrap()
      // result = { blob, filename, contentType }
      const { blob, filename, contentType } = result

      // انشئ URL وحمّل الملف
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
      // هنا ممكن تعرض خطأ للمستخدم
    } finally {
      setDownloading(false)
    }
  }

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
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-foreground">لم نتمكن من عرض المحتوى</h2>
          <p className="text-muted-foreground mb-6">{error || "ربما تمت إزالته أو الرابط غير صحيح."}</p>
          <Button onClick={() => router.push("/")} className="w-full">
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    )
  }

  // تحضير رابط الوسائط للـ hero: قد يكون صورة أو فيديو
  const heroUrl = c.urlImage ? `${IMG_BASE}/${c.urlImage}` : c.urlMedia ? `${IMG_BASE}/${c.urlMedia}` : null
  const heroIsVideo = isVideoUrl(heroUrl)

  return (
    <>
      <Navbar2 />
      <main
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/20"
        dir="rtl"
      >
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="overflow-hidden shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl mb-8 rounded-3xl ring-1 ring-white/20 dark:ring-slate-700/30">
            {/* Hero Image / Video */}
            {heroUrl && (
              <div className="relative w-full aspect-[21/9] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                <button
                  onClick={() => setIsMediaOpen(true)}
                  className="relative w-full h-full group cursor-pointer"
                  aria-label="عرض الوسائط بملء الشاشة"
                >
                  {heroIsVideo ? (
                    <>
                      <video src={heroUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                        <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                          <Play className="w-10 h-10 text-slate-900 mr-1" fill="currentColor" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={heroUrl || "/placeholder.svg"}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </>
                  )}
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                {content.category?.title && (
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-white/90 dark:bg-slate-900/90 text-foreground backdrop-blur-md shadow-xl px-5 py-2 text-sm font-semibold rounded-full ring-1 ring-white/20 dark:ring-slate-700/30">
                      {content.category.title}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-14 w-14 ring-2 ring-white/50 dark:ring-slate-700/50 shadow-lg">
                    <AvatarImage src={urlRoot + "/UploadFile/" + (userShort?.urlImage || "")} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg font-semibold">
                      {(userShort?.firstName?.[0] || "ا").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-foreground">
                      {userShort.firstName} {userShort.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">@{userShort.userName}</div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowMenu((s) => !s)}
                    className="p-2.5 rounded-full hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                    aria-label="المزيد"
                  >
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </button>
                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                      <div className="absolute left-0 mt-2 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                        <button
                          onClick={() => {
                            handleCopyLink()
                            setShowMenu(false)
                          }}
                          className="w-full text-right px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-3 text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                          نسخ الرابط
                        </button>
                        <button
                          onClick={() => {
                            handleReport()
                            setShowMenu(false)
                          }}
                          className="w-full text-right px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-3 text-foreground"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {reporting ? "جارٍ..." : "ابلاغ"}
                        </button>
                        {isAuth && user?.id === c.userId && (
                          <>
                            <div className="my-1 border-t border-border" />
                            <button
                              onClick={() => {
                                router.push(`/content/${c.id}/edit`)
                                setShowMenu(false)
                              }}
                              className="w-full text-right px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("حذف المحتوى؟")) {
                                  /* call delete API */
                                }
                                setShowMenu(false)
                              }}
                              className="w-full text-right px-4 py-2.5 text-sm hover:bg-destructive/10 text-destructive transition-colors"
                            >
                              حذف
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-balance text-foreground mb-4">
                {c.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <time dateTime={c.dateCreate} className="flex items-center gap-1.5 font-medium">
                    {getRelativeTime(c.dateCreate)}
                  </time>
                  {!c.urlImage && content.category?.title && (
                    <>
                      <span className="text-muted-foreground/40">•</span>
                      <Badge variant="secondary" className="font-medium rounded-full">
                        {content.category.title}
                      </Badge>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {c.dateUpdate && c.dateUpdate !== c.dateCreate && (
                    <span className="text-xs"> اخر تعديل {getRelativeTime(c.dateUpdate)}</span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{interactiveCounts.showCount ?? 0}</span>
                  </div>
                </div>
              </div>

              {c.details && (
                <p className="text-lg leading-relaxed text-muted-foreground text-pretty mb-8 pb-8 border-b border-border">
                  {c.details}
                </p>
              )}

              <article
                className="prose prose-lg max-w-none
                  prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                  prose-p:text-foreground prose-p:leading-relaxed prose-p:text-pretty
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                  prose-strong:text-foreground prose-strong:font-bold
                  prose-ul:text-foreground prose-ol:text-foreground
                  prose-li:text-foreground prose-li:leading-relaxed
                  prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
                  prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-muted prose-pre:border prose-pre:border-border
                  prose-img:rounded-lg prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: safeHtml }}
              />

              {Array.isArray(content.tags) && content.tags.length > 0 && (
                <div className="mt-6 mb-4 flex flex-wrap gap-2">
                  {content.tags.map((t) => (
                    <Badge
                      key={t}
                      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-foreground/90 rounded-full px-4 py-1.5 text-sm ring-1 ring-white/20 dark:ring-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                    >
                      #{t}
                    </Badge>
                  ))}
                </div>
              )}

              {(content.resources?.length > 0 || content.files?.length > 0) && (
                <div className="mt-12 pt-8 border-t border-border space-y-8">
                  {content.resources?.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </div>
                        المصادر
                      </h3>
                      <div className="grid gap-3">
                        {content.resources.map((r) => (
                          <a
                            key={r.id}
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                                  {r.title}
                                </div>
                                {r.details && (
                                  <div className="text-sm text-muted-foreground line-clamp-2">{r.details}</div>
                                )}
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {content.files?.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        الملفات المرفقة
                      </h3>
                      <div className="grid gap-3">
                        {content.files.map((f) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between gap-4 p-4 border border-border rounded-xl hover:bg-muted/50 transition-all duration-200 group"
                            // إذا كان الصف نفسه قابل للنقر وتريد أن لا ينفذ عند الضغط على الزر استخدم stopPropagation في الزر كما في handleDownload
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary uppercase">
                                  {f.type?.replace(".", "").slice(0, 4) || "FILE"}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-foreground mb-0.5 truncate">{f.title}</div>
                                {f.details && <div className="text-sm text-muted-foreground truncate">{f.details}</div>}
                              </div>
                            </div>

                            <button
                              onClick={(e) => handleDownload(f.id, e)} // مهم: مرّر دالة وليس استدعاء مباشر
                              disabled={downloading}
                              className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium flex-shrink-0"
                            >
                              <Download className="h-4 w-4" />
                              {downloading ? "جاري التحميل..." : "تحميل"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-6 py-4 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleInteractMy(c.id, "like")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 hover:scale-105 backdrop-blur-sm",
                      myInterActive.isLike
                        ? "bg-green-500/20 text-green-600 dark:text-green-400 ring-1 ring-green-500/30"
                        : "hover:bg-white/60 dark:hover:bg-slate-800/60 text-muted-foreground hover:text-foreground",
                    )}
                    aria-pressed={myInterActive.isLike}
                  >
                    <ThumbsUp
                      className={cn("h-5 w-5 transition-all duration-200", myInterActive.isLike && "fill-current")}
                    />
                    <span className="text-sm font-semibold">{interactiveCounts.likeCount ?? 0}</span>
                  </button>

                  <button
                    onClick={() => handleInteractMy(c.id, "notLike")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 hover:scale-105",
                      myInterActive.isNotLike
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                    aria-pressed={myInterActive.isNotLike}
                  >
                    <ThumbsDown
                      className={cn("h-5 w-5 transition-all duration-200", myInterActive.isNotLike && "fill-current")}
                    />
                    <span className="text-sm font-semibold">{interactiveCounts.notLikeCount ?? 0}</span>
                  </button>

                  <button
                    onClick={handleOpenComments}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 hover:scale-105 hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-semibold">{interactiveCounts.commentCount ?? 0}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleInteractMy(c.id, "save")}
                    className={cn(
                      "p-2.5 rounded-full transition-all duration-200 hover:scale-105",
                      myInterActive.isLove
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                    aria-label="حفظ"
                  >
                    {myInterActive.isLove ? (
                      <BookmarkCheck className="h-5 w-5 fill-current" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="p-2.5 rounded-full transition-all duration-200 hover:scale-105 hover:bg-muted text-muted-foreground hover:text-foreground"
                    aria-label="مشاركة"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {commentsLoaded && (
            <section ref={commentsRef} className="mb-8">
              <Card className="overflow-hidden shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl ring-1 ring-white/20 dark:ring-slate-700/30">
                <div className="p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    التعليقات ({commentsState.items.length || interactiveCounts.commentCount || 0})
                  </h2>

                  <div className="mb-8">
                    <div className="relative">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={isAuth ? "أضف تعليقك..." : "سجّل الدخول لإضافة تعليق"}
                        disabled={!isAuth}
                        className="w-full p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 focus:border-blue-400 dark:focus:border-blue-500 rounded-2xl resize-none focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-white/10 dark:ring-slate-700/20"
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground">
                        {isAuth ? "كن محترمًا ومهذبًا في تعليقك" : "يجب تسجيل الدخول للتعليق"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCommentText("")}
                          disabled={!commentText.trim()}
                        >
                          إلغاء
                        </Button>
                        <Button
                          size="sm"
                          onClick={handlePostComment}
                          disabled={commentsState.posting || !commentText.trim() || !isAuth}
                          className="gap-2 shadow-sm"
                        >
                          {commentsState.posting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          نشر
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                          className="flex gap-4 p-5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30 rounded-2xl hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200 ring-1 ring-white/10 dark:ring-slate-700/20"
                        >
                       

                   <Avatar className="h-11 w-11 ring-2 ring-border flex-shrink-0">
                    <AvatarImage src={urlRoot + "/UploadFile/" + (cm.shortDetailsUser?.urlImage || "")} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {(cm.shortDetailsUser?.firstName?.[0] || "ا").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="font-bold text-sm text-foreground truncate">
                                  {cm.shortDetailsUser?.firstName +" "+cm.shortDetailsUser?.lastName  }
                                </span>
                                <span className="text-muted-foreground/40">•</span>
                                <time className="text-xs text-muted-foreground flex-shrink-0">
                                  {getRelativeTime(cm.dateCreated)}
                                </time>
                              </div>

                              {/* صلاحيات: التعديل فقط لصاحب التعليق.
                              الحذف لصاحب التعليق أو صاحب المحتوى */}
                              <div className="flex items-center gap-1">
                                {isAuth && user?.id === cm.userId && (
                                  <button
                                    onClick={() => handleEditComment(cm.id, cm.commmentText)}
                                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                    aria-label="تعديل"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                {isAuth && (user?.id === cm.userId || user?.id === c.userId) && (
                                  <button
                                    onClick={() => handleDeleteComment(cm.id)}
                                    className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                                    aria-label="حذف"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

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
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    حفظ
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-md text-xs font-medium hover:bg-muted/80 transition-colors"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed text-foreground text-pretty">{cm.commmentText}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </section>
          )}

          {relatedLoaded && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">محتويات مشابهة</h2>
              <RelatedFeed contentId={contentId} take={4}></RelatedFeed>
            </section>
          )}
        </div>
      </main>

      <MediaLightbox
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        mediaUrl={heroUrl || ""}
        isVideo={heroIsVideo}
        title={c.title || ""}
      />

      {/* Toast بسيط للرسائل */}
      {toastMessage && (
        <div className="fixed left-1/2 bottom-8 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-3 rounded-2xl shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 text-sm font-medium ring-1 ring-black/5">
            {toastMessage}
          </div>
        </div>
      )}
    </>
  )
}

























































