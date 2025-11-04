"use client";
import {  Sun, Moon, LogIn, LogOut, X, Link } from "lucide-react";
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
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/src/store/store";
import { logout } from "@/src/features/authSlice";
import useAuth from "@/src/hooks/useAuth";
import useDataBasic from "@/src/hooks/useDataBasic";

export function Navbar2() {
  const { theme, setTheme } = useTheme();
 
  const { isAuth, user } = useAuth()
  const dispatch = useDispatch<AppDispatch>();

  const { urlRoot,logo,webName } = useDataBasic();
  const router = useRouter();
  const handleLogin = () => router.push("/auth/login");
  
  const initial1 = user?.firstName?.[0] ?? user?.userName?.[0] ?? "ا";
  const initial2 = user?.lastName?.[0] ?? "";
  const handleLogout = () => {
    if (isAuth) {
      dispatch(logout());
    }
  }

  return (
    <>
    <nav   className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="w-full px-4" >
        <div className="flex h-16 items-center justify-between max-w-none">
          <div className="flex items-center gap-2 order-3">
            {isAuth ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent/50 rounded-full transition-all duration-200">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                      <AvatarImage src={urlRoot + "/UploadFile/" + user.urlImage} />
                      <AvatarFallback>
                        {initial1}{initial2}

                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">{user.firstName}  {user.lastName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-xl border-border/50">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={urlRoot + "/UploadFile/" + user.urlImage} />
                      <AvatarFallback>
                        {initial1}{initial2}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.firstName}  {user.lastName}</span>
                      <span className="text-xs text-muted-foreground">@{user.userName}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                    {theme === "dark" ? "الوضع الفاتح" : "الوضع المظلم"}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleLogout()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (

              <Button variant="default" size="sm" className="rounded-full" onClick={() => handleLogin()}>

                <LogIn className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
              </Button>

            )}
          </div>

          <div className="flex items-center gap-4 order-1">
        
            <div className="flex items-center gap-3">
              {/* شعار الموقع كصورة */}
              <div className="h-8 w-8 rounded-lg overflow-hidden shadow-sm flex items-center justify-center bg-muted">
                <img
                  src={logo} // ← ضع هنا مسار شعارك
                  alt="شعار الموقع"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* اسم الموقع */}
              <span className="font-bold text-lg text-balance hidden sm:inline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {webName}
              </span>
            </div>
          </div>

        </div>
      </div>
     
    </nav>
    <div style={{ marginBottom: "60px" }}  ></div>
    </>
  );
}
