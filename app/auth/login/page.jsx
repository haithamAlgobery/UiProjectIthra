
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { login, loginWithGoogle } from "../../../src/features/authSlice"
import { ArrowRight, Eye, EyeOff, Mail, Lock, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleLogin } from "@react-oauth/google"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!formData.email || !formData.password) {
      setLocalError("الرجاء إدخال البريد وكلمة المرور")
      return
    }

    try {
      const res = await dispatch(login({ email: formData.email, password: formData.password }))

      if (res.meta?.requestStatus === "fulfilled") {
        router.push("/")
      } else {
        const payloadError = res.payload || auth.error
        setLocalError(payloadError || "فشل تسجيل الدخول")
      }
    } catch (err) {
      setLocalError(err?.message || "حدث خطأ غير متوقع")
    }
  }

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
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
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push("/auth/start")}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة</span>
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">مرحباً بعودتك</h1>
          <p className="text-slate-400">سجل دخولك للمتابعة إلى تطبيقك</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 space-y-6">
          {/* Error Message */}
          {(localError || auth.error) && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
              {localError || auth.error}
            </div>
          )}

          {/* Google Sign-in */}
          <div>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setLocalError("فشل تسجيل الدخول عبر Google")}
              useOneTap={false}
            />
          </div>

          {/* Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent" />
            <span className="text-slate-400 text-sm">أو</span>
            <div className="flex-1 h-px bg-gradient-to-l from-slate-700 to-transparent" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="example@domain.com"
                  className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-cyan-500/50"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="pr-10 pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-cyan-500/50"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition-all duration-300"
              disabled={auth.status === "loading"}
            >
              {auth.status === "loading" ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </div>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-slate-400">
            ليس لديك حساب؟{" "}
            <Link href="/auth/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

