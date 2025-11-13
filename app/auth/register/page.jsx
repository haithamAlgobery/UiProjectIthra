

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { register, clearAuthError, loginWithGoogle } from "../../../src/features/authSlice"
import { ArrowRight, Eye, EyeOff, Mail, Lock, Camera, Loader, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleLogin } from "@react-oauth/google"
import Link from "next/link"

const MAXS = {
  firstName: 50,
  lastName: 50,
  username: 30,
  email: 100,
  passwordMax: 128,
  passwordMin: 4,
  details: 1000,
  imageBytes: 2 * 1024 * 1024,
}

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const auth = useSelector((s) => s.auth || {})

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    details: "",
    image: null,
  })

  const [previewUrl, setPreviewUrl] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localErrors, setLocalErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiGeneral, setApiGeneral] = useState(null)
  const [usernameOpen, setUsernameOpen] = useState(false)

  useEffect(() => {
    return () => dispatch(clearAuthError())
  }, [dispatch])

  const handleImageChange = (file) => {
    setLocalErrors((e) => ({ ...e, image: null }))
    if (!file) {
      setPreviewUrl(null)
      setForm((p) => ({ ...p, image: null }))
      return
    }
    if (!file.type.startsWith("image/")) {
      setLocalErrors((e) => ({ ...e, image: "الملف يجب أن يكون صورة." }))
      return
    }
    if (file.size > MAXS.imageBytes) {
      setLocalErrors((e) => ({ ...e, image: "حجم الصورة أكبر من 2 ميجابايت." }))
      return
    }
    setForm((p) => ({ ...p, image: file }))
    setPreviewUrl(URL.createObjectURL(file))
  }

  const emailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  const phoneValid = (phone) => phone.trim() === "" || /^[0-9+\-\s()]{6,20}$/.test(phone)

  const validateLocal = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = "الاسم الأول مطلوب"
    else if (form.firstName.length > MAXS.firstName) errs.firstName = `الحد الأقصى ${MAXS.firstName} حرفًا`

    if (form.lastName && form.lastName.length > MAXS.lastName) errs.lastName = `الحد الأقصى ${MAXS.lastName} حرفًا`

    if (form.username && form.username.length > MAXS.username) errs.username = `الحد الأقصى ${MAXS.username} حرفًا`

    if (!form.email.trim()) errs.email = "البريد الإلكتروني مطلوب"
    else if (form.email.length > MAXS.email) errs.email = `الحد الأقصى ${MAXS.email} حرفًا`
    else if (!emailValid(form.email)) errs.email = "صيغة البريد الإلكتروني غير صحيحة"

    if (!form.password) errs.password = "كلمة المرور مطلوبة"
    else if (form.password.length < MAXS.passwordMin)
      errs.password = `كلمة المرور يجب أن تكون على الأقل ${MAXS.passwordMin} أحرف`
    else if (form.password.length > MAXS.passwordMax)
      errs.password = `الحد الأقصى لكلمة المرور ${MAXS.passwordMax} حرفًا`

    if (form.password !== form.confirmPassword) errs.confirmPassword = "كلمات المرور غير متطابقة"

    if (!phoneValid(form.phone)) errs.phone = "صيغة رقم الهاتف غير صحيحة"

    if (form.details && form.details.length > MAXS.details) errs.details = `الحد الأقصى ${MAXS.details} حرفًا`

    if (form.image && !form.image.type.startsWith("image/")) errs.image = "الملف يجب أن يكون صورة."
    if (form.image && form.image.size > MAXS.imageBytes) errs.image = "حجم الصورة أكبر من 2 ميجابايت."

    setLocalErrors(errs)
    return Object.keys(errs).length === 0
  }

  const generateUsernameSuggestion = () => {
    const clean = (form.firstName.trim().toLowerCase().replace(/\s+/g, "_") || "user").replace(/[^a-z0-9_]/g, "")
    const rand = Math.floor(Math.random() * 900 + 100)
    return `${clean}${rand}`.slice(0, MAXS.username)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiGeneral(null)
    if (!validateLocal()) return

    setSubmitting(true)

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim() || undefined,
      username: form.username.trim() || undefined,
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      password: form.password,
      details: form.details.trim() || undefined,
      image: form.image || undefined,
    }

    try {
      await dispatch(register(payload)).unwrap()
    } catch (err) {
      const msg = typeof err === "string" ? err : err && err.message ? err.message : "حدث خطأ أثناء التسجيل"
      setApiGeneral(msg)
      const low = (msg || "").toLowerCase()
      const fieldErrs = {}
      if (low.includes("email")) fieldErrs.email = msg
      else if (low.includes("user") || low.includes("username")) fieldErrs.username = msg
      else if (low.includes("phone")) fieldErrs.phone = msg
      else fieldErrs.general = msg
      setLocalErrors((p) => ({ ...p, ...fieldErrs }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential
      const res = await dispatch(loginWithGoogle(token))

      if (res.meta?.requestStatus === "fulfilled") {
        router.push("/")
      } else {
        setApiGeneral(res.payload || "فشل تسجيل الدخول بـ Google")
      }
    } catch (err) {
      setApiGeneral(err.message || "حدث خطأ غير متوقع")
    }
  }

  // Success Screen
  if (auth.registerSuccess) {
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
        <div className="relative z-10 max-w-md w-full">
          <div className="text-center">
            <div className="mb-6 inline-block">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center backdrop-blur-xl">
                <svg
                  className="h-8 w-8 text-green-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">تحقق من بريدك الإلكتروني</h2>
            <p className="text-slate-300 mb-6">
              لقد أرسلنا رسالة تحقق إلى <span className="font-semibold">{auth.registerEmail}</span>. فضلاً افتح صندوق
              الوارد وانقر على رابط التأكيد.
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => router.push("/auth/login")}
                className="px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                تسجيل الدخول
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/auth/start")}
                className="px-6 border-slate-600 hover:bg-slate-900/50"
              >
                العودة للبداية
              </Button>
            </div>

            <p className="text-sm text-slate-400 mt-6">لم يصلك البريد؟ تحقق من مجلد الرسائل غير المرغوب بها</p>
          </div>
        </div>
      </div>
    )
  }

  // Main Form
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <button
              onClick={() => router.push("/auth/start")}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-8"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة</span>
            </button>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 text-balance">ابدأ رحلتك معنا</h1>
            <p className="text-slate-400 text-lg">قم بإنشاء حساب جديد للوصول إلى كل الميزات</p>
          </div>

          {/* Main Card */}
          <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 space-y-8">
            {/* Google Section and Image */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Image Upload - Left Side */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full border-2 border-cyan-500/30 overflow-hidden bg-white/5 flex items-center justify-center shadow-lg mb-4">
                  {previewUrl ? (
                    <img src={previewUrl || "/placeholder.svg"} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-sm text-slate-400">صورة الحساب</div>
                  )}
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/50 cursor-pointer transition-colors">
                  <Camera className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-slate-300">إضافة صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                  />
                </label>

                {localErrors.image && <p className="text-xs text-red-400 mt-2">{localErrors.image}</p>}
              </div>

              {/* Google Sign-up - Right Side */}
              <div className="flex flex-col justify-center">
                <div className="mb-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setApiGeneral("فشل تسجيل الدخول عبر Google")}
                    useOneTap={false}
                  />
                </div>
                <p className="text-xs text-slate-400 text-center">أو أكمل مع النموذج أدناه</p>
              </div>
            </div>

            {/* Error Message */}
            {apiGeneral && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                {apiGeneral}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-slate-300 mb-2 block">
                    الاسم الأول *
                  </Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="أحمد"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-cyan-500/50"
                  />
                  {localErrors.firstName && <p className="text-xs text-red-400 mt-1">{localErrors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-slate-300 mb-2 block">
                    الاسم الأخير (اختياري)
                  </Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="محمد"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-cyan-500/50"
                  />
                  {localErrors.lastName && <p className="text-xs text-red-400 mt-1">{localErrors.lastName}</p>}
                </div>
              </div>

              {/* Username Field - Toggle */}
              <div>
                <Label className="text-sm font-medium text-slate-300 mb-2 block">اسم المستخدم (اختياري)</Label>

                {!usernameOpen ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300">
                      {form.username || "اضغط للإدخال"}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUsernameOpen(true)
                        if (!form.username) setForm((p) => ({ ...p, username: generateUsernameSuggestion() }))
                      }}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10 transition-colors text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Input
                      id="username"
                      value={form.username}
                      onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                      placeholder="مثال: ahmed_dev"
                      className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-cyan-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setUsernameOpen(false)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors text-sm"
                    >
                      حفظ
                    </button>
                  </div>
                )}

                {localErrors.username && <p className="text-xs text-red-400 mt-1">{localErrors.username}</p>}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-300 mb-2 block">
                  البريد الإلكتروني *
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="example@domain.com"
                    className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-cyan-500/50"
                    dir="ltr"
                  />
                </div>
                {localErrors.email && <p className="text-xs text-red-400 mt-1">{localErrors.email}</p>}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-slate-300 mb-2 block">
                    كلمة المرور *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      className="pr-10 pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-cyan-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {localErrors.password && <p className="text-xs text-red-400 mt-1">{localErrors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300 mb-2 block">
                    تأكيد كلمة المرور *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="pr-10 pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-cyan-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {localErrors.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">{localErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-slate-300 mb-2 block">
                  رقم الهاتف (اختياري)
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+967 7xx xxx xxx"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-cyan-500/50"
                />
                {localErrors.phone && <p className="text-xs text-red-400 mt-1">{localErrors.phone}</p>}
              </div>

              {/* Details */}
              <div>
                <Label htmlFor="details" className="text-sm font-medium text-slate-300 mb-2 block">
                  نبذة عنك (اختياري)
                </Label>
                <textarea
                  id="details"
                  value={form.details}
                  onChange={(e) => setForm((p) => ({ ...p, details: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-cyan-500/50 min-h-[100px] resize-none"
                  placeholder="اخبرنا شيئاً عنك..."
                />
                {localErrors.details && <p className="text-xs text-red-400 mt-1">{localErrors.details}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full mt-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition-all duration-300"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  "إنشاء الحساب"
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center text-sm text-slate-400">
                لديك حساب بالفعل؟{" "}
                <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  تسجيل الدخول
                </Link>
              </div>
            </form>
          </div>

          <p className="text-center text-slate-400 text-sm mt-8">نحن نحمي خصوصيتك — لن نشارك بياناتك مع أحد</p>
        </div>
      </div>
    </div>
  )
}



