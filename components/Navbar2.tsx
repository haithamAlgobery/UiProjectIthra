
"use client";

import { useState,useRef } from "react";
import {

  Menu,

  Sun,
  Moon,
  LogIn,
  LogOut,

  Heart,
  Bell,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/src/store/store";

import { logout } from "@/src/features/authSlice";
import useAuth from "@/src/hooks/useAuth";
import useDataBasic from "@/src/hooks/useDataBasic";


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useNotifications from "@/src/hooks/useNotifications";
import { useLoading } from "@/app/providers/LoadingProvider";


export function Navbar2() {
  const { theme, setTheme } = useTheme();

  const { isAuth, user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { urlRoot, logo } = useDataBasic();
  const router = useRouter();
const {unreadCount}=useNotifications();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const handleLogin = () => {setLoading(true);router.push("/auth/start")};

  const { setLoading } = useLoading();


  const initial1 = user?.firstName?.[0] ?? user?.userName?.[0] ?? "ا";
  const initial2 = user?.lastName?.[0] ?? "";

  const performLogout = () => {
    if (isAuth) {
      dispatch(logout());
    }
    setOpenLogoutDialog(false);

  };

  return (
    <>
    <nav  className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="w-full px-4">
        <div className="flex h-16 items-center justify-between max-w-none">
          <div className="flex items-center gap-2 order-3">
            {isAuth ? (
              <>
                    {/* أيقونة الإشعارات */}
      <div className="relative">
        <button
          onClick={() =>{setLoading(true); router.push("/notifications")}}
          className="relative flex items-center justify-center p-2 rounded-full hover:bg-accent/50 transition-all duration-200"
          aria-label="الإشعارات"
        >
          <Bell className="h-5 w-5 text-foreground" />

          {/* النقطة المضيئة لعدد الإشعارات الجديدة */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse"></span>
          )}
        </button>

        {/* العدد يظهر فقط على الشاشات الكبيرة بجانب الأيقونة */}
        {unreadCount > 0 && (
          <span className="hidden sm:block absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-muted-foreground">
            {unreadCount}
          </span>
        )}
      </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 hover:bg-accent/50 rounded-full transition-all duration-200"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                      <AvatarImage src={urlRoot + "/UploadFile/" + user.urlImage} />
                      <AvatarFallback>
                        {initial1}
                        {initial2}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-xl border-border/50">
                  {/* الجزء العلوي - اضغط عليه للانتقال لصفحة البروفايل */}
                  <div
                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/10 rounded"
                    onClick={() =>{setLoading(true);
                       router.push(`/profile/${user.userName ?? user.id}`)}}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={urlRoot + "/UploadFile/" + user.urlImage} />
                      <AvatarFallback>
                        {initial1}
                        {initial2}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                      <span className="text-xs text-muted-foreground">@{user.userName}</span>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* تبديل الوضع */}
                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                    {theme === "dark" ? "الوضع الفاتح" : "الوضع المظلم"}
                  </DropdownMenuItem>

                  {/* خيارات إضافية بعد تغيير الوضع */}
                  <DropdownMenuItem onClick={() =>{setLoading(true); router.push("/favorites")}}>
                    <Heart className="h-4 w-4 mr-2" />
                    المفضلات
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() =>{setLoading(true); router.push("/notifications");}}>
                    <Bell className="h-4 w-4 mr-2" />
                    الإشعارات
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => {setLoading(true);router.push("/account")}}>
                    <Settings className="h-4 w-4 mr-2" />
                    حسابي
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* زر تسجيل الخروج يفتح نافذة التأكيد */}
                  <DropdownMenuItem onClick={() => setOpenLogoutDialog(true)}>
                    <LogOut className="h-4 w-4 mr-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
                 
              </>

            ) : (
              <Button variant="default" size="sm" className="rounded-full" onClick={() => handleLogin()}>
                <LogIn className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
              </Button>
            )}
          </div>

        
          <div className="flex items-center gap-4 order-1">
            
            <button
  style={{ cursor: "pointer" }}
  onClick={() => {
    setLoading(true);
    router.push("/view");
  }}
  className="flex justify-center items-center py-2"
>
  {/* شعار الموقع فقط كصورة بحجم متوسط */}
  <div className="w-28 sm:w-36 md:w-40">
    <img
      src={logo}
      alt="شعار منصة إثراء"
      className="w-full h-auto object-contain"
    />
  </div>
</button>


          </div>
        </div>
      </div>

      {/* AlertDialog لتأكيد تسجيل الخروج */}
      <AlertDialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تسجيل الخروج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد تسجيل الخروج؟ سيتم إنهاء جلستك.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenLogoutDialog(false)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction onClick={performLogout}>
              تسجيل الخروج
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
    <div style={{marginBottom:"60px"}}></div>
    </>
  );
}
