// src/features/account/accountSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance"

// GET /users/me
export const fetchAccount = createAsyncThunk(
  "account/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users/me");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message || "خطأ في جلب بيانات الحساب" });
    }
  }
);

// PUT /users/me  -> body: { lastName, firstName, phoneNumber, details }
export const updateAccount = createAsyncThunk(
  "account/update",
  async (payload, { rejectWithValue }) => {
    try {
      // payload must contain the fields to send (firstName required by validation before dispatch)
      const res = await api.put("/users/me", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message || "خطأ في تعديل الحساب" });
    }
  }
);

// PUT /users/me/change-password  -> body: { currentPassword, newPassword }
export const changePassword = createAsyncThunk(
  "account/changePassword",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.put("/users/me/change-password", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message || "خطأ في تغيير كلمة المرور" });
    }
  }
);

// POST/PUT /users/me/update-image  -> FormData with FileIamge (field name assumed "FileIamge")
export const updateImage = createAsyncThunk(
  "account/updateImage",
  async (file, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("FileIamge", file); // backend expects this field name per spec
      const res = await api.put("/users/me/update-image", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data; // returns updated user object (with new urlImage)
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message || "خطأ في رفع الصورة" });
    }
  }
);

const initialState = {
  user: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
  updating: false,
  updateError: null,
  passwordStatus: "idle",
  passwordError: null,
  imageStatus: "idle",
  imageError: null,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    clearAccountState(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.updating = false;
      state.updateError = null;
      state.passwordStatus = "idle";
      state.passwordError = null;
      state.imageStatus = "idle";
      state.imageError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAccount.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error?.message;
      })

      // update account
      .addCase(updateAccount.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.updating = false;
        state.user = action.payload;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || action.error?.message || { message: "فشل في التحديث" };
      })

      // change password
      .addCase(changePassword.pending, (state) => {
        state.passwordStatus = "loading";
        state.passwordError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordStatus = "succeeded";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordStatus = "failed";
        state.passwordError = action.payload || action.error?.message || { message: "فشل في تغيير كلمة المرور" };
      })

      // update image
      .addCase(updateImage.pending, (state) => {
        state.imageStatus = "loading";
        state.imageError = null;
      })
      .addCase(updateImage.fulfilled, (state, action) => {
        state.imageStatus = "succeeded";
        state.user = action.payload; // backend returns updated user object
      })
      .addCase(updateImage.rejected, (state, action) => {
        state.imageStatus = "failed";
        state.imageError = action.payload || action.error?.message || { message: "فشل في رفع الصورة" };
      });
  },
});

export const { clearAccountState } = accountSlice.actions;
export default accountSlice.reducer;
