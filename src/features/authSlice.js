// features/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  setAccessToken,
  
  clearAccessToken,
  
  clearRefreshToken,
  setUserData,
  clearUserData,
} from "../lib/tokenStorage";

// axios مستقل لتجنّب circular import مع axiosInstance
const axiosPlain = axios.create({ baseURL: "https://localhost:7021/api", timeout: 15000 });

// ----------------- Thunks -----------------

// login: يستخدم api login endpoint. نتوقع res.data يحتوي token وربما refreshToken و بيانات المستخدم
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      // إذا كنت تستخدم axiosInstance مع withCredentials يمكن استخدامه هنا،
      // لكن لتجنّب circular import نستخدم axiosPlain. ستحتاج أن تُمرّر withCredentials
      // إن الخادم يضع Set-Cookie للـ refresh (HttpOnly)
      const res = await axiosPlain.post("/auth/login", credentials, { withCredentials: true });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "خطأ أثناء تسجيل الدخول";
      return rejectWithValue(message);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (googleToken, { rejectWithValue }) => {
    try {
      // نرسل token القادم من Google إلى الخادم للتحقق
      const res = await axiosPlain.post("/auth/google", { token: googleToken });

      // الخادم يفترض أن يرجع: token + user data
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "خطأ أثناء تسجيل الدخول بـ Google";
      return rejectWithValue(message);
    }
  }
);

// features/authSlice.js (استبدال تعريف refreshToken فقط)
// وضعه أعلى الملف على مستوى الموديول (مع axiosPlain الموجود)
let refreshInFlight = null;

export const refreshToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      // إذا هناك طلب جاري، أعد استخدام الوعد نفسه (dedupe)
      if (refreshInFlight) {
        return await refreshInFlight;
      }

      refreshInFlight = (async () => {
        try {
          // cookie-based refresh
          const res = await axiosPlain.post("/auth/refresh-token-cookie", null, { withCredentials: true });
          const data = res?.data || {};

          // لو عاد token في body خزّنه
          if (data.token) setAccessToken(data.token);

          // لاحقًا: لو عاد refresh token في body وتريد تخزينه (غير HttpOnly)
          // if (data.refreshToken) setRefreshToken(data.refreshToken);

          return data;
        } finally {
          // نضمن تفريغ الـ in-flight بعد الانتهاء (نجاحًا أو فشلًا)
          refreshInFlight = null;
        }
      })();

      const result = await refreshInFlight;
      return result;
    } catch (err) {
      // تفكيك رسالة الخطأ بطريقة آمنة
      const message = err.response?.data?.message || err.message || "خطأ في تجديد التوكن";
      return rejectWithValue(message);
    }
  }
);


export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    // ننادي الخادم لإلغاء الrefresh token (الخادم قد يفرغ cookie عبر Set-Cookie)
    await axiosPlain.post("/auth/revoke-token-cookie", null, { withCredentials: true });
  } catch (err) {
    // لا نرمي لأننا نريد تنظيف محليًا حتى لو فشل revoke
  }
});




export const register = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("FirstName", data.firstName);
      if (data.lastName) form.append("LastName", data.lastName);
      if (data.username) form.append("UserName", data.username);
      form.append("Email", data.email);
      if (data.phone) form.append("Phone", data.phone);
      form.append("Password", data.password);
      if (data.details) form.append("Details", data.details);
      if (data.image) form.append("Image", data.image);

      const res = await axiosPlain.post("/auth/register", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // نجاح التسجيل — الخادم يعيد 200 OK
      // لا نفترض أنه أعاد token أو user
      return { message: "تم إنشاء الحساب بنجاح", email: data.email };
    } catch (err) {
      // إذا الخادم رجع نصًا مباشرًا، نأخذه. وإلا نأخذ رسالة عامة
      const serverMsg =
        err?.response?.data && typeof err.response.data === "string"
          ? err.response.data
          : (err?.response?.data && err.response.data.message) ||
            err?.message ||
            "حدث خطأ غير متوقع أثناء التسجيل";

      return rejectWithValue(serverMsg);
    }
  }
);





// ----------------- Slice -----------------
const initialState = {
  user: null,
  token: null,
  isAuth: false,
  status: "idle",
  error: null,
  registerSuccess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Optional: setCredentials لعملية rehydrate محلي
    setCredentials(state, action) {
      const { token, user } = action.payload || {};
      state.token = token || null;
      state.user = user || null;
      state.isAuth = !!token;
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
     // register
     .addCase(register.pending, (state) => {
      state.status = "loading";
      state.error = null;
      state.registerSuccess = false;
      state.registerEmail = null;
    })
    .addCase(register.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      state.registerSuccess = true;
      state.registerEmail = (action.payload && action.payload.email) || null;
    })
    .addCase(register.rejected, (state, action) => {
      state.status = "failed";
      state.registerSuccess = false;
      // الرسالة قد تأتي عبر rejectWithValue أو من action.error
      state.error = action.payload || (action.error && action.error.message) || "فشل التسجيل";
    })

      // login
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        const payload = action.payload || {};
        // user data
        state.user = {
          id:payload.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          userName: payload.userName,
          email: payload.email,
          urlImage:payload.urlImage||state.user?.urlImage,
          roles: payload.roles,
        };
        state.token = payload.token || null;
        state.isAuth = !!payload.token;

        // خزّن الـ tokens إن أعادها الخادم
        if (payload.token) setAccessToken(payload.token);
        if (state.user) setUserData(state.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "فشل تسجيل الدخول";
      })

      // داخل extraReducers builder
.addCase(refreshToken.pending, (state) => {
  state.status = "refreshing";
  state.error = null;
})
.addCase(refreshToken.fulfilled, (state, action) => {
  state.status = "succeeded";
  const payload = action.payload || {};
  state.user = {
    id:payload.id,
    firstName: payload.firstName || state.user?.firstName,
    lastName: payload.lastName || state.user?.lastName,
    userName: payload.userName || state.user?.userName,
    email: payload.email || state.user?.email,
    urlImage:payload.urlImage||state.user?.urlImage,
    roles: payload.roles || state.user?.roles,
  };
  if (payload.token) {
    state.token = payload.token;
    state.isAuth = true;
    setAccessToken(payload.token);
  }
  if (state.user) setUserData(state.user);
})
.addCase(refreshToken.rejected,(state,action)=>{
  state.status = "failed";
})


// existing rejected case follows...

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuth = false;
        state.status = "idle";
        clearAccessToken();
        clearRefreshToken();
        clearUserData();
      })


      // loginWithGoogle
.addCase(loginWithGoogle.pending, (state) => {
  state.status = "loading";
  state.error = null;
})
.addCase(loginWithGoogle.fulfilled, (state, action) => {
  state.status = "succeeded";
  const payload = action.payload || {};

  state.user = {
    id: payload.id,
    firstName: payload.firstName,
    lastName: payload.lastName,
    userName: payload.userName,
    email: payload.email,
    urlImage: payload.urlImage,
    roles: payload.roles,
  };
  state.token = payload.token || null;
  state.isAuth = !!payload.token;

  if (payload.token) setAccessToken(payload.token);
  if (state.user) setUserData(state.user);
})
.addCase(loginWithGoogle.rejected, (state, action) => {
  state.status = "failed";
  state.error = action.payload || "فشل تسجيل الدخول بـ Google";
});


      
  },
});

export const { setCredentials ,clearAuthError} = authSlice.actions;
export default authSlice.reducer;
