
"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/src/store/store"
import { fetchAccount, updateAccount, changePassword, updateImage } from "@/src/features/accountSlice"
import useAuth from "@/src/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// icons
import { Settings, LogOut, Edit2, Upload, Calendar, Mail, Phone, User, Shield } from "lucide-react"
import useDataBasic from "@/src/hooks/useDataBasic";

/*
  Notes:
  - This component uses some ui primitives: Avatar, Button, Card, Input, Textarea.
    If your project uses different components, adapt the import.
  - This component uses minimal custom modal/drawer implementation (simple overlay).
*/

export default function AccountPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { isAuth, status: caseStatus, logout } = useAuth() // useAuth assumed to provide logout() optionally
  const accountState = useSelector((s: RootState) => s.account)
  const { user, status } = accountState

  // local UI states
  const [editOpen, setEditOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"info" | "password" | "image">("info")

  // form states for edit info
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [details, setDetails] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  // password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordServerError, setPasswordServerError] = useState<string | null>(null)

  // image upload
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const { urlRoot } = useDataBasic();

  const avatarSrc = user?.urlImage
  ? `${urlRoot.replace(/\/$/, "")}/UploadFile/${encodeURIComponent(user.urlImage)}`
  : "/placeholder.svg"

  
  useEffect(() => {
    if (caseStatus == "failed") {
      if (!isAuth) {
        router.push("auth/login")
        return
      }
    }

    // fetch account data
    dispatch(fetchAccount())
  }, [isAuth, dispatch, caseStatus])

  useEffect(() => {
    // when user data arrives, populate edit form defaults (so fields are never empty on save)
    if (user) {
      setFirstName(user.firstName ?? "")
      setLastName(user.lastName ?? "")
      setPhoneNumber(user.phoneNumber ?? "")
      setDetails(user.details ?? "")
    }
  }, [user])

  // --- validation helpers ---
  const validateInfo = () => {
    const errs: Record<string, string> = {}
    if (!firstName || firstName.trim().length === 0) errs.firstName = "الاسم الأول مطلوب"
    // phone optional, details optional, lastName optional
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validatePassword = () => {
    const errs: Record<string, string> = {}
    if (!currentPassword) errs.currentPassword = "كلمة المرور الحالية مطلوبة"
    if (!newPassword) errs.newPassword = "كلمة المرور الجديدة مطلوبة"
    else if (newPassword.length < 6) errs.newPassword = "كلمة المرور جديدة يجب أن تكون على الأقل 6 أحرف"
    else if (newPassword.length > 64) errs.newPassword = "كلمة المرور طويلة جدًا"
    if (newPassword !== confirmPassword) errs.confirmPassword = "تأكيد كلمة المرور لا يطابق"
    setPasswordErrors(errs)
    return Object.keys(errs).length === 0
  }

  // --- handlers ---
  const handleOpenEdit = (tab: "info" | "password" | "image" = "info") => {
    setActiveTab(tab)
    setEditOpen(true)
    setFormErrors({})
    setServerError(null)
    setPasswordErrors({})
    setPasswordServerError(null)
    setImageError(null)
  }

  const handleSaveInfo = async () => {
    if (!validateInfo()) return
    setServerError(null)
    try {
      // payload must include current values even if unchanged
      const payload = {
        firstName: firstName,
        lastName: lastName ?? "",
        phoneNumber: phoneNumber ?? "",
        details: details ?? "",
      }
      const res = await dispatch(updateAccount(payload)).unwrap()
      // successful -> close modal and refresh is not necessary because slice updates user
      setEditOpen(false)
    } catch (err: any) {
      // err may be object or string
      const message = err?.message || err?.data?.message || JSON.stringify(err)
      setServerError(message)
    }
  }

  const handleChangePassword = async () => {
    if (!validatePassword()) return
    setPasswordServerError(null)
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap()
      // success -> clear fields and notify user
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setActiveTab("info") // optionally switch tab
      // could show toast here
    } catch (err: any) {
      const message = err?.message || err?.data?.message || JSON.stringify(err)
      setPasswordServerError(message)
    }
  }

  const handleImageSelect = (file?: File) => {
    setImageError(null)
    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }
    // validate type & size (example)
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!allowed.includes(file.type)) {
      setImageError("الملف يجب أن يكون صورة (jpg, png, webp)")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("حجم الملف أكبر من 5 ميجا")
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleUploadImage = async () => {
    if (!imageFile) {
      setImageError("اختر صورة أولاً")
      return
    }
    try {
      await dispatch(updateImage(imageFile)).unwrap()
      setImageFile(null)
      setImagePreview(null)
      setEditOpen(false)
    } catch (err: any) {
      setImageError(err?.message || "فشل في رفع الصورة")
    }
  }

  const handleLogout = async () => {
    dispatch(logout())
    router.push("auth/login")
  }

  if (status === "loading" || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-balance">إعدادات الحساب</h1>
            <p className="mt-2 text-muted-foreground text-pretty">إدارة معلومات ملفك الشخصي وتفضيلاتك</p>
          </div>
          <Button variant="outline" onClick={() => setLogoutOpen(true)} className="gap-2 self-start sm:self-auto">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>

        <Card className="mb-6 overflow-hidden border-border/50 shadow-lg">
          <CardHeader className="border-b border-border/50 bg-card/50">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:gap-6">
                <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                  <AvatarImage
                    src={
                      avatarSrc
                    }
                    alt={user.firstName || user.userName}
                  />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {(user.firstName ?? user.userName ?? "U").slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-center gap-2">
                  <CardTitle className="text-3xl text-balance">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <div className="flex flex-col gap-1.5">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />@{user.userName}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      انضم في{" "}
                      {new Date(user.dateCreated).toLocaleDateString("ar-EG-u-ca-gregory", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleOpenEdit("info")} className="gap-2 self-start sm:self-auto">
                <Edit2 className="h-4 w-4" />
                تعديل الملف الشخصي
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">نبذة</h3>
                <p className="text-foreground leading-relaxed text-pretty">{user.details || "لا يوجد وصف"}</p>
              </div>
              {user.phoneNumber && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">الهاتف</h3>
                  <p className="flex items-center gap-2 text-foreground">
                    <Phone className="h-4 w-4" />
                    {user.phoneNumber}
                  </p>
                </div>
              )}
              {user.roles && user.roles.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">الأدوار</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        <Shield className="h-3 w-3" />
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => handleOpenEdit("info")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                معلومات الملف الشخصي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">تحديث الاسم والبيانات الشخصية</p>
              <Button variant="outline" className="w-full bg-transparent">
                تحديث المعلومات
              </Button>
            </CardContent>
          </Card>

          <Card
            className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => handleOpenEdit("image")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-primary" />
                صورة الملف الشخصي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">تغيير صورة الحساب</p>
              <Button variant="outline" className="w-full bg-transparent">
                رفع صورة جديدة
              </Button>
            </CardContent>
          </Card>

          <Card
            className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => handleOpenEdit("password")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-primary" />
                كلمة المرور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">تغيير كلمة المرور الخاصة بك</p>
              <Button variant="outline" className="w-full bg-transparent">
                تحديث كلمة المرور
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* content feed area placeholder - you said you already have ContentFeed */}
        <div className="mt-6">{/* put ContentFeed component for user's content if needed */}</div>
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto" side="right">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">تعديل الحساب</SheetTitle>
            <SheetDescription>قم بإجراء تغييرات على معلومات ملفك الشخصي</SheetDescription>
          </SheetHeader>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "info" | "password" | "image")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="info">البيانات</TabsTrigger>
              <TabsTrigger value="image">الصورة</TabsTrigger>
              <TabsTrigger value="password">كلمة المرور</TabsTrigger>
            </TabsList>

            {/* Tab: Info */}
            <TabsContent value="info" className="space-y-4">
              {serverError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {typeof serverError === "string" ? serverError : JSON.stringify(serverError)}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="أدخل الاسم الأول"
                  />
                  {formErrors.firstName && <p className="text-xs text-destructive">{formErrors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">اسم العائلة</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="أدخل اسم العائلة"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">الهاتف</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber ?? ""}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">نبذة</Label>
                <Textarea
                  id="details"
                  value={details ?? ""}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="أخبرنا عن نفسك"
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveInfo} disabled={accountState.updating}>
                  {accountState.updating ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            </TabsContent>

            {/* Tab: Image */}
            <TabsContent value="image" className="space-y-4">
              {imageError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {imageError}
                </div>
              )}
              <div className="flex flex-col items-center gap-6">
                <Avatar className="h-32 w-32 border-4 border-border shadow-xl">
                  <AvatarImage
                    src={
                      imagePreview ||
                      avatarSrc
                    }
                    alt="avatar preview"
                  />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {(user.firstName ?? user.userName ?? "U").slice(0, 1)}
                  </AvatarFallback>
                </Avatar>

                <div className="w-full space-y-4">
                  <div className="rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <Label
                      htmlFor="avatar-upload"
                      className="cursor-pointer text-sm font-medium text-primary hover:underline"
                    >
                      انقر للرفع
                    </Label>
                    <p className="mt-2 text-xs text-muted-foreground">أنواع مقبولة: jpg, png, webp. الحد: 5MB</p>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageSelect(e.target.files?.[0] ?? undefined)}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={() => setEditOpen(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={handleUploadImage} disabled={accountState.imageStatus === "loading"}>
                      {accountState.imageStatus === "loading" ? "جاري الرفع..." : "رفع الصورة"}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Password */}
            <TabsContent value="password" className="space-y-4">
              {passwordServerError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {passwordServerError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الحالية"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.currentPassword}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                />
                {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أكد كلمة المرور الجديدة"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  يجب أن تكون كلمة المرور بين 6 و 64 حرفًا. تأكد من استخدام كلمة مرور قوية لحماية حسابك.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleChangePassword} disabled={accountState.passwordStatus === "loading"}>
                  {accountState.passwordStatus === "loading" ? "جاري التحديث..." : "تحديث كلمة المرور"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تسجيل الخروج</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              هل أنت متأكد أنك تريد تسجيل الخروج؟ ستحتاج إلى تسجيل الدخول مرة أخرى للوصول إلى حسابك.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              تسجيل الخروج
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

