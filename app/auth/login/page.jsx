'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { login ,loginWithGoogle} from '../../../src/features/authSlice' // تأكد أن المسار صحيح في مشروعك
import { ArrowRight, Eye, EyeOff, Mail, Lock, Github, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GoogleLogin } from "@react-oauth/google";
export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!formData.email || !formData.password) {
      setLocalError('الرجاء إدخال البريد وكلمة المرور')
      return
    }

    try {
      const res = await dispatch(login({ email: formData.email, password: formData.password }))

      if (res.meta?.requestStatus === 'fulfilled') {
        // تسجيل الدخول ناجح — توجيه للمسار الرئيسـي
        router.push('/')
      } else {
        // فشل تسجيل الدخول — عرض رسالة مناسبة
        const payloadError = res.payload || auth.error
        setLocalError(payloadError || 'فشل تسجيل الدخول')
      }
    } catch (err) {
      setLocalError(err?.message || 'حدث خطأ غير متوقع')
    }
  }

  const handleSocialLogin = (provider) => {
    // نقطة بداية للـ OAuth إن أردت التطبيق لاحقاً
    console.log('social login', provider)
  }
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const res = await dispatch(loginWithGoogle(token));
  
      if (res.meta?.requestStatus === "fulfilled") {
        router.push("/");
      } else {
        setLocalError(res.payload || "فشل تسجيل الدخول بـ Google");
      }
    } catch (err) {
      setLocalError(err.message || "حدث خطأ غير متوقع");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 relative">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="absolute top-0 left-0 gap-2 hover:bg-accent/50 rounded-full"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="hidden sm:inline">العودة</span>
          </Button>

          <h1 className="text-3xl font-extrabold mb-1">مرحباً بعودتك</h1>
          <p className="text-muted-foreground">سجل دخولك للمتابعة إلى تطبيقك</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">تسجيل الدخول</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {(localError || auth.error) && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {localError || auth.error}
              </div>
            )}

<div className="space-y-3">
  {/* زر Google */}
  <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => setLocalError("فشل تسجيل الدخول عبر Google")}
    useOneTap={false}
  />

  {/* زر GitHub - لم يتغير */}
  <Button
    variant="outline"
    className="w-full bg-background/50 border-border/50"
    onClick={() => handleSocialLogin("github")}
    type="button"
  >
    <Github className="h-4 w-4 mr-2" />
    المتابعة مع GitHub
  </Button>
</div>


            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="example@domain.com"
                    className="pr-10 text-left bg-background/50 border-border/50"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="pr-10 pl-10 bg-background/50 border-border/50"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                disabled={auth.status === 'loading'}
              >
                {auth.status === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{' '}
              <a href="/auth/register" className="text-primary hover:underline font-medium">
                إنشاء حساب جديد
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
