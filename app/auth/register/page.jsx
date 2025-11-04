// app/auth/register/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { register, clearAuthError } from "../../../src/features/authSlice"; // عدّل المسار لو لزم
import { ArrowRight, Eye, EyeOff, Mail, Lock, User, Chrome, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const MAXS = {
  firstName: 50,
  lastName: 50,
  username: 30,
  email: 100,
  passwordMax: 128,
  passwordMin: 8,
  details: 1000,
  imageBytes: 2 * 1024 * 1024, // 2MB
};

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth || {});

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
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiGeneral, setApiGeneral] = useState(null);
  const [usernameOpen, setUsernameOpen] = useState(false); // يتحكم بعرض حقل اسم المستخدم
  const [glowPulse, setGlowPulse] = useState(false);

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (auth.registerSuccess) setSubmitting(false);
  }, [auth.registerSuccess]);

  // صورة دائرية (الأعلى)
  const handleImageChange = (file) => {
    setLocalErrors((e) => ({ ...e, image: null }));
    if (!file) {
      setPreviewUrl(null);
      setForm((p) => ({ ...p, image: null }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setLocalErrors((e) => ({ ...e, image: "الملف يجب أن يكون صورة." }));
      return;
    }
    if (file.size > MAXS.imageBytes) {
      setLocalErrors((e) => ({ ...e, image: "حجم الصورة أكبر من 2 ميجابايت." }));
      return;
    }
    setForm((p) => ({ ...p, image: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const emailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const phoneValid = (phone) => phone.trim() === "" || /^[0-9+\-\s()]{6,20}$/.test(phone);

  const validateLocal = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "الاسم الأول مطلوب";
    else if (form.firstName.length > MAXS.firstName) errs.firstName = `الحد الأقصى ${MAXS.firstName} حرفًا`;

    if (form.lastName && form.lastName.length > MAXS.lastName) errs.lastName = `الحد الأقصى ${MAXS.lastName} حرفًا`;

    if (form.username && form.username.length > MAXS.username) errs.username = `الحد الأقصى ${MAXS.username} حرفًا`;

    if (!form.email.trim()) errs.email = "البريد الإلكتروني مطلوب";
    else if (form.email.length > MAXS.email) errs.email = `الحد الأقصى ${MAXS.email} حرفًا`;
    else if (!emailValid(form.email)) errs.email = "صيغة البريد الإلكتروني غير صحيحة";

    if (!form.password) errs.password = "كلمة المرور مطلوبة";
    else if (form.password.length < MAXS.passwordMin) errs.password = `كلمة المرور يجب أن تكون على الأقل ${MAXS.passwordMin} أحرف`;
    else if (form.password.length > MAXS.passwordMax) errs.password = `الحد الأقصى لكلمة المرور ${MAXS.passwordMax} حرفًا`;

    if (form.password !== form.confirmPassword) errs.confirmPassword = "كلمات المرور غير متطابقة";

    if (!phoneValid(form.phone)) errs.phone = "صيغة رقم الهاتف غير صحيحة";

    if (form.details && form.details.length > MAXS.details) errs.details = `الحد الأقصى ${MAXS.details} حرفًا`;

    if (form.image && !form.image.type.startsWith("image/")) errs.image = "الملف يجب أن يكون صورة.";
    if (form.image && form.image.size > MAXS.imageBytes) errs.image = "حجم الصورة أكبر من 2 ميجابايت.";

    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const generateUsernameSuggestion = () => {
    const clean = (form.firstName.trim().toLowerCase().replace(/\s+/g, "_") || "user").replace(/[^a-z0-9_]/g, "");
    const rand = Math.floor(Math.random() * 900 + 100);
    return `${clean}${rand}`.slice(0, MAXS.username);
  };

  const guessMailClient = (email) => {
    if (!email) return "mailto:";
    const domain = (email.split("@")[1] || "").toLowerCase();
    const map = {
      "gmail.com": "https://mail.google.com/",
      "outlook.com": "https://outlook.live.com/mail/",
      "hotmail.com": "https://outlook.live.com/mail/",
      "yahoo.com": "https://mail.yahoo.com/",
    };
    return map[domain] || `mailto:${email}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiGeneral(null);
    if (!validateLocal()) return;

    setSubmitting(true);
    setGlowPulse(true);

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim() || undefined,
      username: form.username.trim() || undefined,
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      password: form.password,
      details: form.details.trim() || undefined,
      image: form.image || undefined,
    };

    try {
      await dispatch(register(payload)).unwrap();
      // نجاح: slice سيضبط registerSuccess لذا الrender سيتغير
    } catch (err) {
      const msg = typeof err === "string" ? err : (err && err.message) ? err.message : "حدث خطأ أثناء التسجيل";
      setApiGeneral(msg);
      const low = (msg || "").toLowerCase();
      const fieldErrs = {};
      if (low.includes("email")) fieldErrs.email = msg;
      else if (low.includes("user") || low.includes("username")) fieldErrs.username = msg;
      else if (low.includes("phone")) fieldErrs.phone = msg;
      else fieldErrs.general = msg;
      setLocalErrors((p) => ({ ...p, ...fieldErrs }));
    } finally {
      setSubmitting(false);
      setTimeout(() => setGlowPulse(false), 700);
    }
  };

  // شاشة النجاح
  if (auth.registerSuccess) {
    const openMailLink = guessMailClient(auth.registerEmail || form.email);
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white text-gray-900 dark:bg-[#061124] dark:text-white">
        <div className="max-w-xl w-full text-center p-8 bg-white shadow-xl dark:bg-[#071026] rounded-2xl border border-gray-200/20">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-gradient-to-tr from-indigo-100 to-violet-100 dark:from-indigo-600 dark:to-violet-500 shadow-md">
              <svg className="h-12 w-12 text-indigo-700 dark:text-white" viewBox="0 0 24 24" fill="none">
                <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h2 className="text-2xl font-semibold">تحقق من بريدك الإلكتروني</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[36rem]">
              لقد أرسلنا رسالة تحقق إلى <span className="font-medium">{auth.registerEmail}</span>. فضلاً افتح صندوق الوارد وانقر على رابط التأكيد للمتابعة.
            </p>

            <div className="flex gap-3 mt-4">
              <Button onClick={() => window.open(openMailLink, "_blank")} className="px-6 py-2">
                فتح البريد الإلكتروني
              </Button>
              <Button variant="outline" onClick={() => router.push("/auth/login")} className="px-5 py-2">
                تسجيل الدخول
              </Button>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">لم يصلك البريد؟ تحقق من مجلد الرسائل غير المرغوب بها أو انتظر بضع دقائق.</div>
          </div>
        </div>
      </div>
    );
  }

  // الصفحة الرئيسية للتسجيل
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-red text-gray-900 dark:bg-[#061124] dark:text-white">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="absolute left-4 top-4 gap-2 rounded-full bg-transparent hover:bg-gray-100/20 dark:hover:bg-white/6"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="hidden sm:inline">العودة للرئيسية</span>
          </Button>

          <div className="mx-auto inline-flex items-center gap-4 animate-fade-in">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-50 to-violet-50 dark:from-indigo-600 dark:to-violet-500 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-indigo-600 dark:text-white" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-2xl font-semibold">FutureSpace</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">منصة المستقبل — أدوات وخصائص متقدمة لك</div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mt-6 animate-fade-in">ابدأ رحلتك معنا</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">قم بإنشاء حساب جديد للوصول إلى كل الميزات وتجربة مخصصة.</p>
        </div>

        <Card className="rounded-2xl overflow-hidden bg-white shadow-lg dark:bg-[#071026] border border-gray-200/10">
          <CardContent className="p-8 space-y-6">
            {/* أعلى النموذج: الصورة الدائرية + زر Google */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full border-2 border-gray-200/40 dark:border-white/6 overflow-hidden bg-gray-50 dark:bg-transparent flex items-center justify-center shadow">
                    {previewUrl ? (
                      <img src={previewUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400 px-3 text-center">صورة الحساب</div>
                    )}
                  </div>

                  <label className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-50/40 dark:bg-white/6 cursor-pointer hover:opacity-90">
                    <Camera className="h-4 w-4 text-indigo-600 dark:text-white" />
                    <span className="text-sm">إضافة صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                    />
                  </label>

                  {localErrors.image && <p className="text-xs text-destructive mt-2">{localErrors.image}</p>}
                </div>

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-2">أو</div>
                  <Button onClick={() => alert("OAuth Google - طبق سيرفر OAuth")} className="px-4 py-2">
                    <Chrome className="mr-2 h-4 w-4" /> التسجيل عبر Google
                  </Button>
                </div>
              </div>

              <div className="flex-1 md:max-w-sm">
                {submitting && (
                  <div className="w-full bg-gray-100 dark:bg-white/6 rounded-full h-2 overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-progress" style={{ width: "100%" }} />
                  </div>
                )}
                <div className="text-xs text-gray-600 dark:text-gray-300">نحن نحمي خصوصيتك — لن نشارك بياناتك.</div>
              </div>
            </div>

            {apiGeneral && (
              <div className="p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-md">
                {apiGeneral}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">الاسم الأول *</Label>
                  <Input id="firstName" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="أحمد" />
                  {localErrors.firstName && <p className="text-xs text-red-600 mt-1">{localErrors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName">الاسم الأخير (اختياري)</Label>
                  <Input id="lastName" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="محمد" />
                  {localErrors.lastName && <p className="text-xs text-red-600 mt-1">{localErrors.lastName}</p>}
                </div>
              </div>

              {/* اسم المستخدم: زر يتحول إلى حقل */}
              <div>
                <Label>اسم المستخدم (اختياري)</Label>

                {!usernameOpen ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/6 text-sm text-gray-700 dark:text-gray-200 border border-gray-200/40">
                        {form.username ? form.username : "أدخل اسم مستخدم من عندي"}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUsernameOpen(true);
                          // إن لم يكن هناك username نقترح أحدها
                          if (!form.username) setForm((p) => ({ ...p, username: generateUsernameSuggestion() }));
                        }}
                        className="text-sm text-indigo-600 dark:text-indigo-300 hover:underline"
                      >
                        تحرير
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-300">الحد الأقصى {MAXS.username} حرفًا</div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Input
                      id="username"
                      value={form.username}
                      onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                      placeholder="مثال: ahmed_dev"
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!form.username) setForm((p) => ({ ...p, username: generateUsernameSuggestion() }));
                          setUsernameOpen(false);
                        }}
                        className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                      >
                        حفظ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // إلغاء والتحول للحالة الأولى (نترك القيمة كما هي)
                          setUsernameOpen(false);
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                {localErrors.username && <p className="text-xs text-red-600 mt-1">{localErrors.username}</p>}
              </div>

              <div>
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="example@domain.com" className="pr-10" />
                </div>
                {localErrors.email && <p className="text-xs text-red-600 mt-1">{localErrors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="password">كلمة المرور *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
                    <Input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" className="pr-10" />
                    <button type="button" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword((s) => !s)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {localErrors.password && <p className="text-xs text-red-600 mt-1">{localErrors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="••••••••" className="pr-10" />
                    <button type="button" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowConfirmPassword((s) => !s)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {localErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{localErrors.confirmPassword}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+967 7xx xxx xxx" />
                {localErrors.phone && <p className="text-xs text-red-600 mt-1">{localErrors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="details">نبذة عنك (اختياري)</Label>
                <textarea id="details" value={form.details} onChange={(e) => setForm((p) => ({ ...p, details: e.target.value }))} className="w-full p-3 rounded-md bg-transparent border border-gray-200/20 dark:border-white/6 min-h-[100px]" placeholder="اخبرنا شيئاً عنك..." />
                {localErrors.details && <p className="text-xs text-red-600 mt-1">{localErrors.details}</p>}
              </div>

              <div>
                <Button
                  type="submit"
                  className={`w-full py-3 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 ${glowPulse ? "scale-[1.01] shadow-[0_10px_30px_rgba(99,102,241,0.25)]" : "hover:scale-[1.01]"}`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/90" />
                      جاري إنشاء الحساب...
                    </div>
                  ) : (
                    <span className="relative">
                      <span className="absolute inset-0 rounded-xl -z-10 filter blur-xl opacity-30 bg-gradient-to-r from-indigo-500 to-violet-500 animate-pulse" />
                      إنشاء الحساب
                    </span>
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                لديك حساب بالفعل؟{" "}
                <Link href="/auth/login" className="text-indigo-600 dark:text-indigo-300 font-medium hover:underline">
                  تسجيل الدخول
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .animate-fade-in { animation: fadeIn 700ms ease both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .animate-progress { animation: progress 1.2s linear infinite; background-size: 200% 100%; }
        @keyframes progress { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }

        .animate-pulse { animation: pulse 2.4s ease-in-out infinite; }
        @keyframes pulse { 0% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.55; transform: scale(1.03); } 100% { opacity: 0.35; transform: scale(1); } }
      `}</style>
    </div>
  );
}
