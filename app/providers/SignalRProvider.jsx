// app/providers/SignalRProvider.jsx
"use client";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initSignalR, forceReconnect, stopSignalR, getConnection } from "../../src/lib/signalrClient";
import { refreshToken } from "../../src/features/authSlice";
import { getAccessToken } from "../../src/lib/tokenStorage";
import toast from "react-hot-toast"; // استخدم ما لديك

export default function SignalRProvider({ children }) {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const initedRef = useRef(false);
  const lastIsAuthRef = useRef(!!auth?.isAuth);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    const hubUrl = "https://localhost:7021/hubs/notification";

    // دالة تحاول تجديد التوكن عبر Redux thunk ثم تُعيد النتيجة.
    const tryRefresh = async () => {
      
        return null;
    
    };

    // getToken بسيطة تقرأ من التخزين المحلي الذي لديك
    const getToken = () => {
      try {
        return getAccessToken(); // دالتك للقراءة
      } catch (e) {
        return null;
      }
    };

    const onNotification = ({ title, message, meta }) => {
      // عرض toast أو أي لوجيك لديك
      toast(`${title} — ${message}`);
      // يمكنك أيضاً عمل dispatch لإضافة الاشعار للقائمة
    };

    // نمرّر preWaitMs = 1500 (1.5s) — أي نجرب تجديد التوكن وننتظر حتى 1.5s فقط لكي لا نؤخر الواجهة
    initSignalR(hubUrl, { getToken, tryRefresh, onNotification, preWaitMs: 1500 })
      .then((conn) => {
        console.log("[SignalRProvider] init done", !!conn);
      })
      .catch((e) => {
        console.error("[SignalRProvider] init error", e);
      });

    // لا نوقف الاتصال عندUnmount بواسطة الافتراض، لكن يمكنك ذلك لو رغبت:
    return () => {
      // stopSignalR(); // لو أردت إغلاقه عند الخروج
    };
  }, [dispatch]);

  // نراقب auth changes: إذا صار login بعد ما بدأنا كـ anonymous -> نعيد الاتصال بصيغة auth
  useEffect(() => {
    const isAuth = !!auth?.isAuth;
    // تجاهل المرة الأولى لأنها داخل init
    if (lastIsAuthRef.current === undefined) {
      lastIsAuthRef.current = isAuth;
      return;
    }

    // إذا تغيّر من false => true (login) => forceReconnect prefer-auth
    if (!lastIsAuthRef.current && isAuth) {
      console.log("[SignalRProvider] auth detected -> reconnect with token");
      // قوة إعادة الربط؛ وضع default prefer-auth يعني سيستخدم getToken الموجودة
      forceReconnect({ mode: "prefer-auth" }).catch((e) => console.error(e));
    }

    // إذا تغيّر من true => false (logout) => إما نعيد بدون توكن أو نغلق الاتصال
    if (lastIsAuthRef.current && !isAuth) {
      console.log("[SignalRProvider] logout detected -> reconnect as anonymous");
      // إذا تريد إغلاق نهائي: stopSignalR()
      forceReconnect({ mode: "anonymous" }).catch((e) => console.error(e));
    }

    lastIsAuthRef.current = isAuth;
  }, [auth]);

  return <>{children}</>;
}
