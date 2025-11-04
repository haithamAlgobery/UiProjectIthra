
"use client"
import { useEffect, useState } from "react"
import useNotifications from "@/src/hooks/useNotifications"
import useAuth from "@/src/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { ArrowRight, User, Bell, CheckCircle2 } from "lucide-react"
import Link from "next/link"


export default function NotificationsPage() {
  const { items, unreadCount, totalCount, loading, error, loadNotifications, markAllRead,markOneRead } = useNotifications()
  const { isAuth } = useAuth()
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    if (!isAuth) return
    loadNotifications()
  }, [isAuth, loadNotifications])

  
const markAsRead = (id) => {
markOneRead(id);
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20" dir="rtl">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Account Icon - Left */}
            <Link href="/account" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <User className="w-6 h-6 text-slate-700" />
            </Link>

            {/* Title - Center */}
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800">الإشعارات</h1>
            </div>

            {/* Back Button - Right */}
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowRight className="w-6 h-6 text-slate-700" />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl px-5 py-3 border border-slate-200/60 shadow-sm">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{totalCount}</span> إشعار
              {unreadCount > 0 && (
                <>
                  {" • "}
                  <span className="font-semibold text-blue-600">{unreadCount}</span> غير مقروء
                </>
              )}
            </p>
          </div>

          {/* Mark all as read button - only show if there are unread notifications */}
          {unreadCount > 0 && (
            <Button
              onClick={() => {
                setMarking(true)
                markAllRead().finally(() => setMarking(false))
              }}
              disabled={marking}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              size="sm"
            >
              {marking ? "جارٍ التحويل..." : "وضع الكل كمقروء"}
            </Button>
          )}
        </div>

        {loading === "pending" && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">جاري تحميل الإشعارات...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">حدث خطأ: {String(error)}</div>
        )}

        <div className="space-y-4">
          {items.length === 0 && loading !== "pending" && (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">لا توجد إشعارات</p>
            </div>
          )}

          {items.map((n) => (
            <article
              key={n.id}
              className={`
                relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg
                ${
                  n.isRead
                    ? "bg-white/40 backdrop-blur-sm border-slate-200/60"
                    : "bg-white/70 backdrop-blur-md border-blue-200/60 shadow-md"
                }
              `}
            >
              {/* Unread indicator stripe */}
              {!n.isRead && (
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
              )}

              <div className="p-5 pr-7">
                {/* Header with unread icon and date */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    {!n.isRead && (
                      <div className="flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                      </div>
                    )}
                    <h3 className="font-semibold text-slate-800 text-lg leading-tight">{n.title}</h3>
                  </div>
                  <time className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(n.dateCreated).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>

                {/* Details */}
                <p className="text-slate-600 leading-relaxed mb-4">{n.details}</p>

                {/* Mark as read button for unread notifications */}
                {!n.isRead && (
                  <Button
                    onClick={() => markAsRead(n.id)}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">اعتبر هذه الرسالة مقروءة</span>
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

