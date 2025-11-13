

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { loginWithGoogle } from "../../../src/features/authSlice"
import { ChevronRight } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"
import Link from "next/link"

export default function StartPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)
  const [localError, setLocalError] = useState(null)
  const [hoveredButton, setHoveredButton] = useState(null)

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential
      const res = await dispatch(loginWithGoogle(token))

      if (res.meta?.requestStatus === "fulfilled") {
        router.push("/")
      } else {
        setLocalError(res.payload || "فشل تسجيل الدخول بـ Google")
      }
    } catch (err) {
      setLocalError(err.message || "حدث خطأ غير متوقع")
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 animate-pulse"
            style={{
              width: Math.random() * 2 + 0.5 + "px",
              height: Math.random() * 2 + 0.5 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animationDelay: Math.random() * 2 + "s",
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl">
          <div className="mb-6 inline-block">
           
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white text-balance leading-tight">ابدأ رحلتك معنا</h1>
          <p className="text-lg text-slate-300 text-balance">انضم إلى مجتمعنا واكتشف عالماً من المعرف اللانهائي</p>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm max-w-md">
            {localError}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-4 w-full max-w-sm">
          {/* Google Sign-in Button */}
          <div className="group">
            <div
              onMouseEnter={() => setHoveredButton("google")}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />

              {/* GoogleLogin Component */}
              <div className="relative">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setLocalError("فشل تسجيل الدخول عبر Google")}
                  useOneTap={false}
                />
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent" />
            <span className="text-slate-400 text-sm">أو</span>
            <div className="flex-1 h-px bg-gradient-to-l from-slate-700 to-transparent" />
          </div>

          {/* Login Button */}
          <Link href="/auth/login" className="group">
            <div
              onMouseEnter={() => setHoveredButton("login")}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              <button className="relative w-full px-6 py-4 rounded-xl border border-slate-600/50 bg-slate-950/50 hover:bg-slate-900/80 text-white font-semibold flex items-center justify-center gap-3 transition-all duration-300 backdrop-blur-xl group-hover:border-slate-500/70">
                تسجيل الدخول
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </Link>

          {/* Sign Up Button */}
          <Link href="/auth/register" className="group">
            <div
              onMouseEnter={() => setHoveredButton("signup")}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              <button className="relative w-full px-6 py-4 rounded-xl border border-purple-500/40 bg-slate-950/50 hover:bg-slate-900/80 text-white font-semibold flex items-center justify-center gap-3 transition-all duration-300 backdrop-blur-xl group-hover:border-purple-500/70">
                إنشاء حساب جديد
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </Link>
        </div>

        {/* Footer Text */}
        <p className="mt-12 text-slate-400 text-sm text-center">نحن نحمي خصوصيتك — لن نشارك بياناتك مع أحد</p>
      </div>
    </div>
  )
}

