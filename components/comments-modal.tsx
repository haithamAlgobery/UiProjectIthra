"use client"
import { MessageCircle } from "lucide-react" // Import MessageCircle here

import { useState, useEffect } from "react"
import { X, Send, Reply, MoreHorizontal, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
  dateCreated: string
  likes: number
  dislikes: number
  isLiked: boolean
  isDisliked: boolean
  replies: Comment[]
  isReply?: boolean
}

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  contentId: string
  commentCount: number
}

export function CommentsModal({ isOpen, onClose, contentId, commentCount }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [loading, setLoading] = useState(false)

  // Mock comments data
  useEffect(() => {
    if (isOpen) {
      // Simulate loading comments
      setLoading(true)
      setTimeout(() => {
        setComments([
          {
            id: "comment-1",
            content: "مقال رائع ومفيد جداً! شكراً لك على هذه المعلومات القيمة.",
            author: {
              id: "user-1",
              name: "أحمد محمد",
              username: "ahmed_dev",
              avatar: "/placeholder.svg",
            },
            dateCreated: "2025-09-20T10:30:00Z",
            likes: 12,
            dislikes: 0,
            isLiked: false,
            isDisliked: false,
            replies: [
              {
                id: "reply-1",
                content: "أتفق معك تماماً، المحتوى مفيد جداً",
                author: {
                  id: "user-2",
                  name: "فاطمة علي",
                  username: "fatima_tech",
                  avatar: "/placeholder.svg",
                },
                dateCreated: "2025-09-20T11:15:00Z",
                likes: 5,
                dislikes: 0,
                isLiked: true,
                isDisliked: false,
                replies: [],
                isReply: true,
              },
            ],
          },
          {
            id: "comment-2",
            content: "هل يمكنك إضافة المزيد من الأمثلة العملية؟ سيكون ذلك مفيداً جداً للمبتدئين.",
            author: {
              id: "user-3",
              name: "محمد الأحمد",
              username: "mohammed_learn",
              avatar: "/placeholder.svg",
            },
            dateCreated: "2025-09-20T09:45:00Z",
            likes: 8,
            dislikes: 1,
            isLiked: false,
            isDisliked: false,
            replies: [],
          },
          {
            id: "comment-3",
            content: "معلومات قيمة ومفيدة، أشكرك على الجهد المبذول في إعداد هذا المحتوى المميز.",
            author: {
              id: "user-4",
              name: "سارة خالد",
              username: "sara_researcher",
              avatar: "/placeholder.svg",
            },
            dateCreated: "2025-09-20T08:20:00Z",
            likes: 15,
            dislikes: 0,
            isLiked: true,
            isDisliked: false,
            replies: [],
          },
        ])
        setLoading(false)
      }, 1000)
    }
  }, [isOpen])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      content: newComment,
      author: {
        id: "current-user",
        name: "المستخدم الحالي",
        username: "current_user",
        avatar: "/placeholder.svg",
      },
      dateCreated: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
      replies: [],
    }

    setComments((prev) => [comment, ...prev])
    setNewComment("")
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    const reply: Comment = {
      id: `reply-${Date.now()}`,
      content: replyContent,
      author: {
        id: "current-user",
        name: "المستخدم الحالي",
        username: "current_user",
        avatar: "/placeholder.svg",
      },
      dateCreated: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
      replies: [],
      isReply: true,
    }

    setComments((prev) =>
      prev.map((comment) => (comment.id === parentId ? { ...comment, replies: [...comment.replies, reply] } : comment)),
    )
    setReplyContent("")
    setReplyingTo(null)
  }

  const handleCommentInteraction = (commentId: string, action: "like" | "dislike", isReply = false) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId && !isReply) {
          const newComment = { ...comment }
          if (action === "like") {
            if (newComment.isLiked) {
              newComment.likes--
              newComment.isLiked = false
            } else {
              newComment.likes++
              newComment.isLiked = true
              if (newComment.isDisliked) {
                newComment.dislikes--
                newComment.isDisliked = false
              }
            }
          } else {
            if (newComment.isDisliked) {
              newComment.dislikes--
              newComment.isDisliked = false
            } else {
              newComment.dislikes++
              newComment.isDisliked = true
              if (newComment.isLiked) {
                newComment.likes--
                newComment.isLiked = false
              }
            }
          }
          return newComment
        } else if (isReply) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                const newReply = { ...reply }
                if (action === "like") {
                  if (newReply.isLiked) {
                    newReply.likes--
                    newReply.isLiked = false
                  } else {
                    newReply.likes++
                    newReply.isLiked = true
                    if (newReply.isDisliked) {
                      newReply.dislikes--
                      newReply.isDisliked = false
                    }
                  }
                } else {
                  if (newReply.isDisliked) {
                    newReply.dislikes--
                    newReply.isDisliked = false
                  } else {
                    newReply.dislikes++
                    newReply.isDisliked = true
                    if (newReply.isLiked) {
                      newReply.likes--
                      newReply.isLiked = false
                    }
                  }
                }
                return newReply
              }
              return reply
            }),
          }
        }
        return comment
      }),
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "منذ قليل"
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    if (diffInHours < 48) return "منذ يوم"
    return `منذ ${Math.floor(diffInHours / 24)} أيام`
  }

  const CommentComponent = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <Card className={cn("border-border/30", isReply && "mr-8 bg-muted/20")}>
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
            <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">@{comment.author.username}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatDate(comment.dateCreated)}</span>
            </div>
            <p className="text-sm text-foreground mb-3 leading-relaxed">{comment.content}</p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCommentInteraction(comment.id, "like", isReply)}
                className={cn(
                  "h-8 px-2 gap-1 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400",
                  comment.isLiked && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                )}
              >
                <ThumbsUp className="h-3 w-3" />
                <span className="text-xs">{comment.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCommentInteraction(comment.id, "dislike", isReply)}
                className={cn(
                  "h-8 px-2 gap-1 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400",
                  comment.isDisliked && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                )}
              >
                <ThumbsDown className="h-3 w-3" />
                <span className="text-xs">{comment.dislikes}</span>
              </Button>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  className="h-8 px-2 gap-1 text-xs hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                >
                  <Reply className="h-3 w-3" />
                  رد
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem className="text-xs">إبلاغ</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs text-destructive">حذف</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  className="min-h-[80px] text-right text-sm resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSubmitReply(comment.id)} disabled={!replyContent.trim()}>
                    <Send className="h-3 w-3 mr-1" />
                    إرسال
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] mx-4 bg-background rounded-lg shadow-2xl border border-border/50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">التعليقات ({commentCount})</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Comment Form */}
        <div className="p-4 border-b border-border/50">
          <div className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="شارك رأيك أو تعليقك..."
              className="min-h-[100px] text-right resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{newComment.length}/500</span>
              <Button onClick={handleSubmitComment} disabled={!newComment.trim()} className="gap-2">
                <Send className="h-4 w-4" />
                نشر التعليق
              </Button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <CommentComponent comment={comment} />
                  {comment.replies.map((reply) => (
                    <CommentComponent key={reply.id} comment={reply} isReply />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد تعليقات بعد</p>
              <p className="text-sm">كن أول من يعلق على هذا المحتوى</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
