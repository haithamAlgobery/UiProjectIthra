// lib/axiosInstance.js
import axios from "axios";
import { refreshToken as refreshTokenAction, logout as logoutAction } from "../features/authSlice";
import { getAccessToken, setAccessToken } from "./tokenStorage";

// أنشئ instance مستقل بدون الاعتماد على store هنا
const api = axios.create({
  baseURL: "https://localhost:7021/api",
  timeout: 15000,
  withCredentials: true,
});

// Request interceptor عام (لا يعتمد على store مباشرة)
api.interceptors.request.use((config) => {
  try {
    const token = getAccessToken();
    if (!config.headers) config.headers = {};
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    console.warn("axios request interceptor error:", e);
  }
  return config;
});

// دالة لربط interceptors التي تحتاج store (نستدعيها بعد إنشاء store)
export function attachInterceptors(store) {
  if (!store) throw new Error("attachInterceptors requires a valid Redux store");

  // لمنع إضافة نفس interceptor مرتين
  if (attachInterceptors.attached) return;
  attachInterceptors.attached = true;

  // helper لمعرفة اذا كان هذا endpoint تابع لauth (لتفادي loops)
  const isAuthEndpoint = (url = "") => {
    if (!url) return false;
    return url.includes("/auth") || url.includes("/login") || url.includes("/revoke");
  };

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error?.config;
      if (!originalRequest) return Promise.reject(error);

      const status = error.response?.status;

      if (status === 401 && !originalRequest._retry) {
        const requestUrl = originalRequest.url || "";
        if (isAuthEndpoint(requestUrl)) return Promise.reject(error);

        // تحقق من حالة المصادقة من الstore
        const state = store.getState();
        const isAuth = !!(state && state.auth && state.auth.isAuth);

        if (!isAuth) {
          // غير مسجل -> اعد الخطأ
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const refreshAction = await store.dispatch(refreshTokenAction());

          if (refreshAction && refreshAction.meta && refreshAction.meta.requestStatus === "fulfilled") {
            const newToken = refreshAction.payload?.token;
            if (newToken) {
              try { setAccessToken(newToken); } catch(e){ console.warn("setAccessToken failed:", e); }
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = "Bearer " + newToken;
              return api(originalRequest);
            } else {
              // تم تجديد الجلسة على السيرفر (مثلاً باستخدام HttpOnly cookie)
              // نعيد الطلب الأصلي لأن الخادم قد يقبل الكوكي الآن
              return api(originalRequest);
            }
          } else {
            // فشل التجديد -> logout
            try { store.dispatch(logoutAction()); } catch(e){ console.warn("logout failed:", e); }
            const err = refreshAction?.payload || refreshAction?.error || new Error("Refresh failed");
            return Promise.reject(err);
          }
        } catch (err) {
          try { store.dispatch(logoutAction()); } catch(e){ console.warn("logout failed:", e); }
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
}

export default api;
