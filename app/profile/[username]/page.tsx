"use client"

import React, { useEffect, useState } from "react"
import {
  ArrowRight,
  Settings,
  Share2,
  MessageCircle,
  Calendar,
  MapPin,
  Link2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, useParams } from "next/navigation"
import { Navbar2 } from "@/components/Navbar2"
import { ContentFeed } from "@/components/content-feed"
import { useDispatch, useSelector } from "react-redux"
import { fetchProfileByUserName, clearProfile } from "@/src/features/profileSlice"
import type { RootState, AppDispatch } from "@/src/store/store"
import useAuth from "@/src/hooks/useAuth";
import useDataBasic from "@/src/hooks/useDataBasic";

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const username = params.username as string
  const dispatch = useDispatch<AppDispatch>()
  const { isAuth, user } = useAuth()
  const { urlRoot } = useDataBasic();

  const profileState = useSelector((state: RootState) => state.profile)
  const filters = useSelector((state: RootState) => state.filters)

  const [copyMsg, setCopyMsg] = useState<string>("")

  useEffect(() => {
    if (!username) return
    dispatch(fetchProfileByUserName(username))

    return () => {
      dispatch(clearProfile())
    }
  }, [username, dispatch])

  const formatDateMiladi = (dateString: string | undefined) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-EG-u-ca-gregory", { year: "numeric", month: "long" }).format(date)
  }

  const isLoading = profileState.status === "loading"
  const isError = profileState.status === "failed"
  const profile = profileState.userData

  const isCurrentUser = Boolean(isAuth && user && user.userName && profile && user.userName === profile.userName)

  const handleShare = async () => {
    try {
      const href = typeof window !== "undefined" ? window.location.href : ""
      if (!href) throw new Error("الرابط غير متوفر")
      await navigator.clipboard.writeText(href)
      setCopyMsg("تم نسخ الرابط")
      setTimeout(() => setCopyMsg(""), 2000)
    } catch (e) {
      setCopyMsg("فشل في نسخ الرابط")
      setTimeout(() => setCopyMsg(""), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">حدث خطأ</h1>
          <p className="text-muted-foreground mb-4">{profileState.error || "لم نتمكن من جلب الملف"}</p>
          <Button onClick={() => dispatch(fetchProfileByUserName(username))}>أعد المحاولة</Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">المستخدم غير موجود</h1>
          <p className="text-muted-foreground mb-4">لم يتم العثور على المستخدم المطلوب</p>
          <Button onClick={() => router.push("/")} variant="outline">العودة للرئيسية</Button>
        </div>
      </div>
    )
  }

  // بناء رابط الصورة بشكل آمن: إن وُجد profile.urlImage نستخدمه، وإلا placeholder
  const avatarSrc = profile.urlImage
    ? `${urlRoot.replace(/\/$/, "")}/UploadFile/${encodeURIComponent(profile.urlImage)}`
    : "/placeholder.svg"

  return (
    <div className="min-h-screen bg-background/0">
      <Navbar2 />
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <Avatar className="h-28 w-28 sm:h-36 sm:w-36">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback className="text-2xl">
                {profile.firstName?.[0] || profile.userName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 w-full">
            <div className="flex justify-between items-start">
              <div className="text-right">
                <h1 className="text-2xl sm:text-3xl font-semibold">{profile.firstName} {profile.lastName}</h1>
                <p className="text-muted-foreground">@{profile.userName}</p>
              </div>

              <div className="flex items-center gap-2">
                {isCurrentUser ? (
                  <Button variant="ghost" className="flex items-center gap-2" onClick={() => router.push("/account")}>
                    <Settings className="h-4 w-4" />
                    حسابي
                  </Button>
                ) : (
                  <>
                    <Button className="flex items-center gap-2" onClick={handleShare}>
                      <Share2 className="h-4 w-4" /> مشاركة
                    </Button>
                  </>
                )}
              </div>
            </div>

            {profile.details ? (
              <p className="text-sm mt-3 text-right leading-relaxed">{profile.details}</p>
            ) : null}

            <div className="flex flex-wrap justify-end sm:justify-start gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>انضم في {formatDateMiladi(profile.dateCreated)}</span>

              </div>
            </div>
            <div className="flex flex-wrap justify-end sm:justify-start gap-4 mt-3 text-sm text-muted-foreground">
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    {profileState.isConnected ? (
      <div className="flex items-center gap-2 text-blue-500 font-medium">
        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
        <span>متصل</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-gray-400 font-medium">
        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
        <span>غير متصل</span>
      </div>
    )}
  </div>
</div>

            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <div className="font-bold">{profileState.contentCount ?? 0}</div>
                <div className="text-muted-foreground">المحتوى</div>
              </div>
            </div>

            {copyMsg ? <div className="mt-2 text-sm text-green-600">{copyMsg}</div> : null}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <ContentFeed
            categoryId={filters.categoryId}
            type={filters.type}
            sort={filters.sort}
            userName={profile.userName}
          />
        </div>
      </main>
    </div>
  )
}
