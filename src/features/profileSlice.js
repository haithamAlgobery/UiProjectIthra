// src/features/profile/profileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/axiosInstance"

// fetch profile by userName
export const fetchProfileByUserName = createAsyncThunk(
  "profile/fetchByUserName",
  async (userName, { rejectWithValue }) => {
    try {
      // endpoint: /users/view/{userName}
      const res = await api.get(`/users/view/${encodeURIComponent(userName)}`);
      // حسب الـ API الذي اعطيت: النتائج في { userData, contentCount }
      return res.data;
    } catch (err) {
      // حاول إرجاع رسالة خطأ مفيدة
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue({ message: err.message || "خطأ في الشبكة" });
    }
  }
);

const initialState = {
  userData: null, // the API userData object
  contentCount: 0,
  isConnected:false,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile(state) {
      state.userData = null;
      state.contentCount = 0;
      state.isConnected=false;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileByUserName.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfileByUserName.fulfilled, (state, action) => {
        state.status = "succeeded";
        // API structure: { userData: {...}, contentCount: number }
        state.userData = action.payload.userData || null;
        state.contentCount = action.payload.contentCount || 0;
        state.isConnected =action.payload.isConnected || false;
      })
      .addCase(fetchProfileByUserName.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error?.message || "فشل في جلب الملف";
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
